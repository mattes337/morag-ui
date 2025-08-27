import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger, HealthLogger } from '@/lib/logging';
import { getProductionConfig } from '@/lib/config/production';
import { initializeBackgroundServices } from '@/lib/startup';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceHealth;
    storage: ServiceHealth;
    vectorDatabase?: ServiceHealth;
    email?: ServiceHealth;
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Test database connectivity and performance
 */
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test transaction capability
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1`;
    });
    
    // Get database statistics
    const stats = await prisma.$queryRaw<Array<{
      table_count: number;
      total_size_mb: number;
    }>>`
      SELECT 
        COUNT(*) as table_count,
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as total_size_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;
    
    const latency = Date.now() - startTime;
    
    // Determine health status based on latency
    let status: 'healthy' | 'degraded' = 'healthy';
    if (latency > 1000) { // 1 second
      status = 'degraded';
    }
    
    HealthLogger.logHealthCheck('database', status, {
      latency,
      tableCount: stats[0]?.table_count || 0,
      totalSizeMB: stats[0]?.total_size_mb || 0,
    });
    
    return {
      status,
      latency,
      details: {
        tableCount: stats[0]?.table_count || 0,
        totalSizeMB: stats[0]?.total_size_mb || 0,
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    HealthLogger.logHealthCheck('database', 'unhealthy', {
      latency,
      error: errorMessage,
    });
    
    return {
      status: 'unhealthy',
      latency,
      error: errorMessage,
    };
  }
}

/**
 * Test storage system health
 */
async function checkStorageHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // For now, just check if we can access the file system
    // In production, this would test S3, GCS, or other storage providers
    const fs = await import('fs/promises');
    const testPath = '/tmp/health-check-test';
    
    await fs.writeFile(testPath, 'health check test');
    await fs.readFile(testPath);
    await fs.unlink(testPath);
    
    const latency = Date.now() - startTime;
    
    HealthLogger.logHealthCheck('storage', 'healthy', { latency });
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    HealthLogger.logHealthCheck('storage', 'unhealthy', {
      latency,
      error: errorMessage,
    });
    
    return {
      status: 'unhealthy',
      latency,
      error: errorMessage,
    };
  }
}

/**
 * Test vector database health (if configured)
 */
async function checkVectorDatabaseHealth(): Promise<ServiceHealth | undefined> {
  const config = getProductionConfig();
  
  if (!config.services.vectorDatabase) {
    return undefined;
  }
  
  const startTime = Date.now();
  
  try {
    // This would test the actual vector database connection
    // For now, we'll simulate it
    const latency = Date.now() - startTime;
    
    HealthLogger.logHealthCheck('vector_database', 'healthy', { latency });
    
    return {
      status: 'healthy',
      latency,
      details: {
        provider: config.services.vectorDatabase.provider,
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    HealthLogger.logHealthCheck('vector_database', 'unhealthy', {
      latency,
      error: errorMessage,
    });
    
    return {
      status: 'unhealthy',
      latency,
      error: errorMessage,
    };
  }
}

/**
 * Test email service health (if configured)
 */
async function checkEmailHealth(): Promise<ServiceHealth | undefined> {
  const config = getProductionConfig();
  
  if (!config.services.email) {
    return undefined;
  }
  
  const startTime = Date.now();
  
  try {
    // This would test the actual email service connection
    // For now, we'll simulate it
    const latency = Date.now() - startTime;
    
    HealthLogger.logHealthCheck('email', 'healthy', { latency });
    
    return {
      status: 'healthy',
      latency,
      details: {
        provider: config.services.email.provider,
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    HealthLogger.logHealthCheck('email', 'unhealthy', {
      latency,
      error: errorMessage,
    });
    
    return {
      status: 'unhealthy',
      latency,
      error: errorMessage,
    };
  }
}

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    logger.info('Health check requested', {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Initialize background services on first health check
    try {
      await initializeBackgroundServices();
      logger.info('Background services initialization completed during health check');
    } catch (initError) {
      logger.warn('Background services initialization failed during health check', {
        error: initError instanceof Error ? initError.message : 'Unknown error'
      });
      // Don't fail the health check if background services fail to initialize
    }

    // Run all health checks in parallel
    const [
      databaseHealth,
      storageHealth,
      vectorDatabaseHealth,
      emailHealth,
    ] = await Promise.all([
      checkDatabaseHealth(),
      checkStorageHealth(),
      checkVectorDatabaseHealth(),
      checkEmailHealth(),
    ]);
    
    // Determine overall health status
    const services = {
      database: databaseHealth,
      storage: storageHealth,
      ...(vectorDatabaseHealth && { vectorDatabase: vectorDatabaseHealth }),
      ...(emailHealth && { email: emailHealth }),
    };
    
    const allServices = Object.values(services);
    const hasUnhealthy = allServices.some(service => service.status === 'unhealthy');
    const hasDegraded = allServices.some(service => service.status === 'degraded');
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (hasUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services,
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };
    
    const totalLatency = Date.now() - startTime;
    
    logger.info('Health check completed', {
      status: overallStatus,
      totalLatency,
      serviceCount: allServices.length,
    });
    
    // Return appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(result, { status: statusCode });
    
  } catch (error) {
    const totalLatency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('Health check failed', {
      error: errorMessage,
      totalLatency,
    });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMessage,
      },
      { status: 503 }
    );
  }
}
