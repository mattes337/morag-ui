import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Connection configuration optimized for database connectivity issues
const connectionConfig = {
    connectionLimit: 5,
    connectTimeout: 30000,
    acquireTimeout: 60000,
    timeout: 60000,
    sslmode: 'disable',
    poolTimeout: 60000,
    idleTimeout: 600000,
    maxLifetime: 1800000,
};

// Build optimized connection string
function buildConnectionString(): string {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
        return baseUrl || '';
    }

    try {
        const url = new URL(baseUrl);
        Object.entries(connectionConfig).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
        });
        return url.toString();
    } catch {
        return baseUrl;
    }
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: process.env.DATABASE_URL ? {
            db: { url: buildConnectionString() }
        } : undefined,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        errorFormat: 'pretty',
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Retry configuration
interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
};

// Check if an error is retryable
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

// Execute a database operation with retry logic
export async function withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
): Promise<T> {
    const retryConfig = { ...defaultRetryConfig, ...config };
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;

            if (attempt === retryConfig.maxRetries) {
                break;
            }

            if (!isRetryableError(error)) {
                throw error;
            }

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

// Database connection helper with retry logic
export async function connectDatabase(): Promise<void> {
    await withRetry(async () => {
        await prisma.$connect();
        console.log('Database connected successfully');
    }, { maxRetries: 5, baseDelay: 2000 });
}

// Database disconnection helper
export async function disconnectDatabase(): Promise<void> {
    try {
        await prisma.$disconnect();
        console.log('Database disconnected successfully');
    } catch (error) {
        console.error('Database disconnection failed:', error);
        throw error;
    }
}

// Enhanced health check with retry logic
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
        console.error('Database health check failed:', error);

        return {
            healthy: false,
            latency,
            error: error.message
        };
    }
}
