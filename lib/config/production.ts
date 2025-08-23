import { logger } from '../logging';

export interface ProductionConfig {
  // Database
  database: {
    url: string;
    maxConnections: number;
    connectionTimeout: number;
    queryTimeout: number;
    ssl: boolean;
  };
  
  // Security
  security: {
    jwtSecret: string;
    sessionSecret: string;
    corsOrigins: string[];
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    fileUpload: {
      maxSize: number;
      allowedTypes: string[];
      virusScanning: boolean;
    };
  };
  
  // Logging
  logging: {
    level: string;
    structured: boolean;
    auditEnabled: boolean;
    performanceTracking: boolean;
  };
  
  // Monitoring
  monitoring: {
    healthCheckInterval: number;
    metricsEnabled: boolean;
    alerting: {
      enabled: boolean;
      webhookUrl?: string;
      emailRecipients: string[];
    };
  };
  
  // External Services
  services: {
    vectorDatabase?: {
      provider: 'qdrant' | 'pinecone' | 'weaviate';
      url: string;
      apiKey?: string;
    };
    storage?: {
      provider: 's3' | 'gcs' | 'azure' | 'local';
      bucket?: string;
      region?: string;
      credentials?: Record<string, string>;
    };
    email?: {
      provider: 'smtp' | 'sendgrid' | 'ses';
      config: Record<string, string>;
    };
  };
}

/**
 * Validate required environment variables
 */
function validateRequiredEnvVars(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validate database URL format
  const dbUrl = process.env.DATABASE_URL!;
  if (!dbUrl.startsWith('mysql://') && !dbUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid MySQL or PostgreSQL connection string');
  }
}

/**
 * Parse CORS origins from environment variable
 */
function parseCorsOrigins(): string[] {
  const origins = process.env.CORS_ORIGINS;
  if (!origins) {
    return process.env.NODE_ENV === 'production' 
      ? [process.env.NEXTAUTH_URL || 'https://morag.drydev.de']
      : ['http://localhost:3000'];
  }
  
  return origins.split(',').map(origin => origin.trim());
}

/**
 * Parse email recipients from environment variable
 */
function parseEmailRecipients(): string[] {
  const recipients = process.env.ALERT_EMAIL_RECIPIENTS;
  return recipients ? recipients.split(',').map(email => email.trim()) : [];
}

/**
 * Load and validate production configuration
 */
export function loadProductionConfig(): ProductionConfig {
  // Validate required environment variables first
  validateRequiredEnvVars();
  
  const config: ProductionConfig = {
    database: {
      url: process.env.DATABASE_URL!,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'),
      ssl: process.env.DB_SSL === 'true',
    },
    
    security: {
      jwtSecret: process.env.JWT_SECRET!,
      sessionSecret: process.env.NEXTAUTH_SECRET!,
      corsOrigins: parseCorsOrigins(),
      rateLimiting: {
        enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      },
      fileUpload: {
        maxSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || '').split(',').filter(Boolean),
        virusScanning: process.env.VIRUS_SCANNING_ENABLED === 'true',
      },
    },
    
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      structured: process.env.STRUCTURED_LOGGING !== 'false',
      auditEnabled: process.env.AUDIT_LOGGING !== 'false',
      performanceTracking: process.env.PERFORMANCE_TRACKING !== 'false',
    },
    
    monitoring: {
      healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
      metricsEnabled: process.env.METRICS_ENABLED !== 'false',
      alerting: {
        enabled: process.env.ALERTING_ENABLED === 'true',
        webhookUrl: process.env.ALERT_WEBHOOK_URL,
        emailRecipients: parseEmailRecipients(),
      },
    },
    
    services: {
      vectorDatabase: process.env.VECTOR_DB_URL ? {
        provider: (process.env.VECTOR_DB_PROVIDER as any) || 'qdrant',
        url: process.env.VECTOR_DB_URL,
        apiKey: process.env.VECTOR_DB_API_KEY,
      } : undefined,
      
      storage: process.env.STORAGE_PROVIDER ? {
        provider: (process.env.STORAGE_PROVIDER as any) || 'local',
        bucket: process.env.STORAGE_BUCKET,
        region: process.env.STORAGE_REGION,
        credentials: {
          accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
        },
      } : undefined,
      
      email: process.env.EMAIL_PROVIDER ? {
        provider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
        config: {
          host: process.env.EMAIL_HOST || '',
          port: process.env.EMAIL_PORT || '587',
          user: process.env.EMAIL_USER || '',
          password: process.env.EMAIL_PASSWORD || '',
          from: process.env.EMAIL_FROM || '',
        },
      } : undefined,
    },
  };
  
  // Log configuration (without sensitive data)
  logger.info('Production configuration loaded', {
    database: {
      maxConnections: config.database.maxConnections,
      ssl: config.database.ssl,
    },
    security: {
      corsOrigins: config.security.corsOrigins,
      rateLimiting: config.security.rateLimiting,
      fileUpload: {
        maxSize: config.security.fileUpload.maxSize,
        virusScanning: config.security.fileUpload.virusScanning,
      },
    },
    logging: config.logging,
    monitoring: {
      healthCheckInterval: config.monitoring.healthCheckInterval,
      metricsEnabled: config.monitoring.metricsEnabled,
      alertingEnabled: config.monitoring.alerting.enabled,
    },
    services: {
      vectorDatabase: !!config.services.vectorDatabase,
      storage: !!config.services.storage,
      email: !!config.services.email,
    },
  });
  
  return config;
}

/**
 * Get current production configuration
 */
let cachedConfig: ProductionConfig | null = null;

export function getProductionConfig(): ProductionConfig {
  if (!cachedConfig) {
    cachedConfig = loadProductionConfig();
  }
  return cachedConfig;
}

/**
 * Validate production readiness
 */
export function validateProductionReadiness(): { ready: boolean; issues: string[] } {
  const issues: string[] = [];
  
  try {
    const config = getProductionConfig();
    
    // Check critical configurations
    if (!config.security.jwtSecret || config.security.jwtSecret.length < 32) {
      issues.push('JWT secret is too weak');
    }
    
    if (config.security.corsOrigins.includes('*') || config.security.corsOrigins.includes('http://localhost:3000')) {
      issues.push('CORS origins include development values');
    }
    
    if (!config.database.ssl && process.env.NODE_ENV === 'production') {
      issues.push('Database SSL is not enabled in production');
    }
    
    if (!config.security.rateLimiting.enabled) {
      issues.push('Rate limiting is disabled');
    }
    
    if (!config.logging.auditEnabled) {
      issues.push('Audit logging is disabled');
    }
    
    if (!config.monitoring.metricsEnabled) {
      issues.push('Metrics collection is disabled');
    }
    
    // Check for development environment variables
    const devEnvVars = [
      'DISABLE_AUTH',
      'SKIP_VALIDATION',
      'DEBUG_MODE',
      'MOCK_SERVICES',
    ];
    
    for (const envVar of devEnvVars) {
      if (process.env[envVar] === 'true') {
        issues.push(`Development environment variable ${envVar} is enabled`);
      }
    }
    
  } catch (error) {
    issues.push(`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    ready: issues.length === 0,
    issues,
  };
}

/**
 * Environment-specific configuration
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Feature flags for production
 */
export const featureFlags = {
  vectorSearch: process.env.FEATURE_VECTOR_SEARCH === 'true',
  advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
  realtimeUpdates: process.env.FEATURE_REALTIME_UPDATES === 'true',
  experimentalFeatures: process.env.FEATURE_EXPERIMENTAL === 'true' && !isProduction,
};
