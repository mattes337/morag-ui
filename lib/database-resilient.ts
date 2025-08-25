import { PrismaClient } from '@prisma/client';

/**
 * Resilient Database Connection for MoRAG UI
 * 
 * This module provides a database connection that handles the intermittent
 * connectivity issues with morag.drydev.de:3306 by implementing:
 * - Connection retry logic
 * - Connection pooling optimization
 * - Timeout handling
 * - Graceful degradation
 */

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Connection configuration optimized for the firewall/rate limiting issues
const connectionConfig = {
    // Reduce connection pool size to avoid overwhelming the firewall
    connectionLimit: 5,
    
    // Increase timeouts to handle slow firewall responses
    connectTimeout: 30000, // 30 seconds
    acquireTimeout: 60000, // 60 seconds
    timeout: 60000, // 60 seconds
    
    // Disable SSL since it seems to cause issues with the firewall
    sslmode: 'disable',
    
    // Connection pool settings
    poolTimeout: 60000,
    idleTimeout: 600000, // 10 minutes
    maxLifetime: 1800000, // 30 minutes
};

// Build optimized connection string
function buildConnectionString(): string {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const url = new URL(baseUrl);
    
    // Apply connection optimizations
    Object.entries(connectionConfig).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
    });
    
    return url.toString();
}

// Create Prisma client with resilient configuration
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: buildConnectionString()
            }
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        errorFormat: 'pretty',
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Retry configuration for database operations
 */
interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
};

/**
 * Execute a database operation with retry logic
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
): Promise<T> {
    const retryConfig = { ...defaultRetryConfig, ...config };
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            
            // Don't retry on the last attempt
            if (attempt === retryConfig.maxRetries) {
                break;
            }
            
            // Check if error is retryable
            if (!isRetryableError(error)) {
                throw error;
            }
            
            // Calculate delay with exponential backoff
            const delay = Math.min(
                retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
                retryConfig.maxDelay
            );
            
            console.warn(`Database operation failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
    const retryableErrors = [
        'Can\'t reach database server',
        'Connection timeout',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'Connection lost',
        'Server has gone away',
        'Too many connections',
        'Lock wait timeout exceeded',
    ];
    
    const errorMessage = error.message || '';
    return retryableErrors.some(retryableError => 
        errorMessage.includes(retryableError)
    );
}

/**
 * Database connection helper with retry logic
 */
export async function connectDatabase(): Promise<void> {
    await withRetry(async () => {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    }, { maxRetries: 5, baseDelay: 2000 });
}

/**
 * Database disconnection helper
 */
export async function disconnectDatabase(): Promise<void> {
    try {
        await prisma.$disconnect();
        console.log('✅ Database disconnected successfully');
    } catch (error) {
        console.error('❌ Database disconnection failed:', error);
        throw error;
    }
}

/**
 * Enhanced health check with retry logic
 */
export async function checkDatabaseHealth(): Promise<{
    healthy: boolean;
    latency: number;
    details?: any;
    error?: string;
}> {
    const startTime = Date.now();
    
    try {
        await withRetry(async () => {
            await prisma.$queryRaw`SELECT 1 as test`;
        }, { maxRetries: 2, baseDelay: 1000 });
        
        // Get additional database info
        const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`SELECT VERSION() as version`;
        const version = versionResult[0]?.version || 'Unknown';
        
        const latency = Date.now() - startTime;
        
        return {
            healthy: true,
            latency,
            details: {
                version,
                connectionPool: 'optimized',
                retryLogic: 'enabled'
            }
        };
    } catch (error: any) {
        const latency = Date.now() - startTime;
        console.error('❌ Database health check failed:', error);
        
        return {
            healthy: false,
            latency,
            error: error.message
        };
    }
}

/**
 * Execute a query with automatic retry
 */
export async function executeQuery<T>(query: () => Promise<T>): Promise<T> {
    return withRetry(query, { maxRetries: 3, baseDelay: 1000 });
}

/**
 * Execute a transaction with automatic retry
 */
export async function executeTransaction<T>(
    transaction: (prisma: any) => Promise<T>
): Promise<T> {
    return withRetry(async () => {
        return await prisma.$transaction(transaction, {
            timeout: 60000, // 60 seconds
            maxWait: 30000, // 30 seconds
        });
    }, { maxRetries: 2, baseDelay: 2000 });
}

/**
 * Graceful shutdown handler
 */
export async function gracefulShutdown(): Promise<void> {
    console.log('🛑 Initiating graceful database shutdown...');
    
    try {
        await disconnectDatabase();
        console.log('✅ Database shutdown completed');
    } catch (error) {
        console.error('❌ Error during database shutdown:', error);
    }
}

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

export default prisma;
