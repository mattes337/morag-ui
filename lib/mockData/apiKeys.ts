/**
 * API Keys mock data with realistic generation and usage statistics
 * Task C1: Advanced Mock Data Expansion
 */

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key: string;
  keyPreview: string; // First 8 chars + ... + last 4 chars
  userId: string;
  realmId?: string;
  status: ApiKeyStatus;
  permissions: ApiPermission[];
  scopes: string[];
  rateLimit: RateLimit;
  usage: UsageStatistics;
  security: SecuritySettings;
  metadata: ApiKeyMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: string;
  revokedReason?: string;
}

export type ApiKeyStatus = 
  | 'active' 
  | 'inactive' 
  | 'expired' 
  | 'revoked' 
  | 'suspended';

export interface ApiPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  current: {
    minute: number;
    hour: number;
    day: number;
    resetAt: Date;
  };
}

export interface UsageStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastWeekRequests: number;
  lastMonthRequests: number;
  topEndpoints: EndpointUsage[];
  errorBreakdown: ErrorBreakdown;
  responseTimeStats: ResponseTimeStats;
  dailyUsage: DailyUsage[];
  monthlyUsage: MonthlyUsage[];
  recentActivity: RecentActivity[];
}

export interface EndpointUsage {
  endpoint: string;
  method: string;
  count: number;
  avgResponseTime: number;
  errorRate: number;
  lastUsed: Date;
}

export interface ErrorBreakdown {
  '400': number; // Bad Request
  '401': number; // Unauthorized
  '403': number; // Forbidden
  '404': number; // Not Found
  '429': number; // Too Many Requests
  '500': number; // Internal Server Error
  '502': number; // Bad Gateway
  '503': number; // Service Unavailable
}

export interface ResponseTimeStats {
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  requests: number;
  errors: number;
  avgResponseTime: number;
}

export interface MonthlyUsage {
  month: string; // YYYY-MM
  requests: number;
  errors: number;
  avgResponseTime: number;
  costEstimate: number;
}

export interface RecentActivity {
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ipAddress?: string;
  errorMessage?: string;
}

export interface SecuritySettings {
  ipWhitelist: string[];
  allowedDomains: string[];
  requireHttps: boolean;
  rateLimitStrict: boolean;
  loggingEnabled: boolean;
  alertsEnabled: boolean;
  encryptionLevel: 'standard' | 'high' | 'maximum';
}

export interface ApiKeyMetadata {
  version: string;
  type: 'user' | 'service' | 'integration' | 'webhook';
  environment: 'development' | 'staging' | 'production';
  integration?: string;
  application?: string;
  team?: string;
  costCenter?: string;
  tags: string[];
  customFields: Record<string, any>;
}

export interface ApiKeyTemplate {
  id: string;
  name: string;
  description: string;
  permissions: ApiPermission[];
  scopes: string[];
  rateLimit: Partial<RateLimit>;
  isDefault: boolean;
  category: string;
}

// Generate comprehensive API keys dataset
function generateApiKeys(): ApiKey[] {
  const keys: ApiKey[] = [];
  
  // Sample users and realms
  const userIds = Array.from({ length: 60 }, (_, i) => `user-${(i + 1).toString().padStart(3, '0')}`);
  const realmIds = ['realm-1', 'realm-2', 'realm-3', 'realm-4', 'realm-5', 'realm-6', 'realm-7', 'realm-8'];
  
  const keyNames = [
    'Production API Key', 'Development Key', 'CI/CD Pipeline', 'Mobile App Integration',
    'Web Dashboard', 'Analytics Service', 'Backup Service', 'Monitoring Tool',
    'Third-party Integration', 'Data Export Service', 'Webhook Handler', 'Search Service',
    'Document Processor', 'User Management', 'Billing Integration', 'Notification Service',
    'File Upload Service', 'Report Generator', 'Security Scanner', 'Performance Monitor'
  ];
  
  const applications = [
    'Web Dashboard', 'Mobile App', 'Desktop Client', 'CLI Tool', 'Backup Service',
    'Analytics Platform', 'Monitoring System', 'CI/CD Pipeline', 'Data Pipeline',
    'Integration Service', 'Webhook Service', 'Notification Service', 'Report Service'
  ];
  
  const integrations = [
    'Slack', 'Microsoft Teams', 'Salesforce', 'HubSpot', 'Google Drive', 'Dropbox',
    'Zapier', 'IFTTT', 'GitHub', 'Jira', 'Confluence', 'Notion', 'Airtable'
  ];
  
  const endpoints = [
    { path: '/api/v1/documents', method: 'GET' },
    { path: '/api/v1/documents', method: 'POST' },
    { path: '/api/v1/documents/{id}', method: 'GET' },
    { path: '/api/v1/documents/{id}', method: 'PUT' },
    { path: '/api/v1/documents/{id}', method: 'DELETE' },
    { path: '/api/v1/search', method: 'POST' },
    { path: '/api/v1/users', method: 'GET' },
    { path: '/api/v1/users/{id}', method: 'GET' },
    { path: '/api/v1/realms', method: 'GET' },
    { path: '/api/v1/realms/{id}', method: 'GET' },
    { path: '/api/v1/jobs', method: 'GET' },
    { path: '/api/v1/jobs', method: 'POST' },
    { path: '/api/v1/jobs/{id}', method: 'GET' },
    { path: '/api/v1/analytics', method: 'GET' },
    { path: '/api/v1/upload', method: 'POST' },
    { path: '/api/v1/webhooks', method: 'POST' }
  ];
  
  const resources = [
    'documents', 'users', 'realms', 'jobs', 'analytics', 'search', 
    'upload', 'download', 'webhooks', 'notifications', 'billing', 'admin'
  ];
  
  const actions = ['read', 'write', 'delete', 'admin', 'execute', 'share'];
  const statuses: ApiKeyStatus[] = ['active', 'inactive', 'expired', 'revoked', 'suspended'];
  const keyTypes: ApiKeyMetadata['type'][] = ['user', 'service', 'integration', 'webhook'];
  const environments: ApiKeyMetadata['environment'][] = ['development', 'staging', 'production'];
  
  // Helper functions
  const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomChoices = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
  };
  const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
  const randomDate = (start: Date, end: Date): Date => 
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  const generateApiKey = (): string => {
    const prefix = 'mk_';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const generateKeyPreview = (key: string): string => {
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };
  
  const generateIpAddress = (): string => {
    return `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`;
  };
  
  const generateDailyUsage = (days: number): DailyUsage[] => {
    const usage: DailyUsage[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      usage.push({
        date: date.toISOString().split('T')[0],
        requests: randomInt(0, 1000),
        errors: randomInt(0, 50),
        avgResponseTime: randomInt(50, 500)
      });
    }
    return usage;
  };
  
  const generateMonthlyUsage = (months: number): MonthlyUsage[] => {
    const usage: MonthlyUsage[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const requests = randomInt(1000, 50000);
      usage.push({
        month: monthStr,
        requests,
        errors: randomInt(10, 500),
        avgResponseTime: randomInt(100, 800),
        costEstimate: Math.round(requests * 0.001 * 100) / 100 // $0.001 per request
      });
    }
    return usage;
  };
  
  const generateRecentActivity = (count: number): RecentActivity[] => {
    const activity: RecentActivity[] = [];
    const userAgents = [
      'Mozilla/5.0 (compatible; MoRAG-Client/1.0)',
      'Python-requests/2.28.1',
      'curl/7.68.0',
      'PostmanRuntime/7.29.0',
      'axios/0.27.2'
    ];
    
    for (let i = 0; i < count; i++) {
      const endpoint = randomChoice(endpoints);
      const statusCode = Math.random() > 0.1 ? 200 : randomChoice([400, 401, 403, 404, 429, 500]);
      activity.push({
        timestamp: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        endpoint: endpoint.path,
        method: endpoint.method,
        statusCode,
        responseTime: randomInt(20, 2000),
        userAgent: randomChoice(userAgents),
        ipAddress: generateIpAddress(),
        errorMessage: statusCode >= 400 ? randomChoice([
          'Invalid API key', 'Rate limit exceeded', 'Resource not found', 
          'Insufficient permissions', 'Internal server error'
        ]) : undefined
      });
    }
    
    return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };
  
  // Generate 50 API keys
  for (let i = 1; i <= 50; i++) {
    const userId = randomChoice(userIds);
    const status = randomChoice(statuses);
    const keyType = randomChoice(keyTypes);
    const environment = randomChoice(environments);
    const createdAt = randomDate(new Date('2023-01-01'), new Date());
    const key = generateApiKey();
    const totalRequests = randomInt(100, 100000);
    const successfulRequests = Math.floor(totalRequests * randomFloat(0.85, 0.98));
    const failedRequests = totalRequests - successfulRequests;
    
    // Generate permissions
    const permissionCount = randomInt(2, 6);
    const keyResources = randomChoices(resources, permissionCount);
    const permissions: ApiPermission[] = keyResources.map(resource => ({
      resource,
      actions: randomChoices(actions, randomInt(1, 3)),
      conditions: Math.random() > 0.7 ? {
        realmIds: randomChoices(realmIds, randomInt(1, 3))
      } : undefined
    }));
    
    // Generate scopes
    const scopes = keyResources.map(resource => `${resource}:read`).concat(
      randomChoices(keyResources, randomInt(1, 3)).map(resource => `${resource}:write`)
    );
    
    // Generate endpoint usage statistics
    const endpointUsages = randomChoices(endpoints, randomInt(3, 8)).map(endpoint => ({
      endpoint: endpoint.path,
      method: endpoint.method,
      count: randomInt(10, 1000),
      avgResponseTime: randomInt(50, 500),
      errorRate: randomFloat(0.01, 0.1),
      lastUsed: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    }));
    
    // Generate error breakdown
    const errorBreakdown: ErrorBreakdown = {
      '400': randomInt(0, Math.floor(failedRequests * 0.3)),
      '401': randomInt(0, Math.floor(failedRequests * 0.2)),
      '403': randomInt(0, Math.floor(failedRequests * 0.15)),
      '404': randomInt(0, Math.floor(failedRequests * 0.1)),
      '429': randomInt(0, Math.floor(failedRequests * 0.1)),
      '500': randomInt(0, Math.floor(failedRequests * 0.1)),
      '502': randomInt(0, Math.floor(failedRequests * 0.05)),
      '503': randomInt(0, Math.floor(failedRequests * 0.05))
    };
    
    // Generate rate limits based on environment and type
    let baseRateLimit = 1000; // requests per hour
    if (environment === 'production') baseRateLimit *= 5;
    if (keyType === 'service') baseRateLimit *= 3;
    if (keyType === 'integration') baseRateLimit *= 2;
    
    const rateLimit: RateLimit = {
      requestsPerMinute: Math.floor(baseRateLimit / 60),
      requestsPerHour: baseRateLimit,
      requestsPerDay: baseRateLimit * 24,
      burstLimit: Math.floor(baseRateLimit / 30),
      current: {
        minute: randomInt(0, Math.floor(baseRateLimit / 60)),
        hour: randomInt(0, baseRateLimit),
        day: randomInt(0, baseRateLimit * 24),
        resetAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      }
    };
    
    const apiKey: ApiKey = {
      id: `key-${i.toString().padStart(3, '0')}`,
      name: Math.random() > 0.3 ? randomChoice(keyNames) : `API Key ${i}`,
      description: Math.random() > 0.4 ? `API key for ${randomChoice(applications)} in ${environment} environment` : undefined,
      key,
      keyPreview: generateKeyPreview(key),
      userId,
      realmId: Math.random() > 0.4 ? randomChoice(realmIds) : undefined,
      status,
      permissions,
      scopes,
      rateLimit,
      usage: {
        totalRequests,
        successfulRequests,
        failedRequests,
        lastWeekRequests: randomInt(50, 5000),
        lastMonthRequests: randomInt(200, 20000),
        topEndpoints: endpointUsages,
        errorBreakdown,
        responseTimeStats: {
          avg: randomInt(100, 500),
          min: randomInt(10, 50),
          max: randomInt(1000, 5000),
          p50: randomInt(80, 300),
          p95: randomInt(400, 1000),
          p99: randomInt(800, 2000)
        },
        dailyUsage: generateDailyUsage(30),
        monthlyUsage: generateMonthlyUsage(12),
        recentActivity: generateRecentActivity(randomInt(10, 50))
      },
      security: {
        ipWhitelist: Math.random() > 0.7 ? Array.from({ length: randomInt(1, 5) }, () => generateIpAddress()) : [],
        allowedDomains: Math.random() > 0.6 ? randomChoices(['*.example.com', 'app.morag.com', 'api.morag.com'], randomInt(1, 3)) : [],
        requireHttps: Math.random() > 0.2,
        rateLimitStrict: Math.random() > 0.5,
        loggingEnabled: Math.random() > 0.3,
        alertsEnabled: Math.random() > 0.4,
        encryptionLevel: randomChoice(['standard', 'high', 'maximum'] as const)
      },
      metadata: {
        version: 'v1',
        type: keyType,
        environment,
        integration: keyType === 'integration' ? randomChoice(integrations) : undefined,
        application: randomChoice(applications),
        team: randomChoice(['Engineering', 'Product', 'Marketing', 'Sales', 'DevOps']),
        costCenter: `CC-${randomInt(100, 999)}`,
        tags: randomChoices(['production', 'development', 'internal', 'external', 'automated', 'manual'], randomInt(1, 3)),
        customFields: {
          owner: randomChoice(['John Doe', 'Jane Smith', 'Engineering Team']),
          project: `Project ${randomChoice(['Alpha', 'Beta', 'Gamma'])}`,
          createdBy: 'system'
        }
      },
      createdAt,
      updatedAt: randomDate(createdAt, new Date()),
      lastUsedAt: status === 'active' ? randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()) : undefined,
      expiresAt: Math.random() > 0.7 ? randomDate(new Date(), new Date('2025-12-31')) : undefined,
      revokedAt: status === 'revoked' ? randomDate(createdAt, new Date()) : undefined,
      revokedBy: status === 'revoked' ? randomChoice(userIds) : undefined,
      revokedReason: status === 'revoked' ? randomChoice([
        'Security compromise', 'No longer needed', 'User left organization', 'Policy violation', 'Replaced by new key'
      ]) : undefined
    };
    
    keys.push(apiKey);
  }
  
  return keys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Generate the API keys dataset
export const apiKeys: ApiKey[] = generateApiKeys();

// Helper functions for accessing API key data
export const getApiKeyById = (id: string): ApiKey | undefined => {
  return apiKeys.find(key => key.id === id);
};

export const getApiKeysByUser = (userId: string): ApiKey[] => {
  return apiKeys.filter(key => key.userId === userId);
};

export const getActiveApiKeys = (): ApiKey[] => {
  return apiKeys.filter(key => key.status === 'active');
};

export const getApiKeysByStatus = (status: ApiKeyStatus): ApiKey[] => {
  return apiKeys.filter(key => key.status === status);
};

export const getApiKeysByEnvironment = (environment: ApiKeyMetadata['environment']): ApiKey[] => {
  return apiKeys.filter(key => key.metadata.environment === environment);
};

export const getApiKeysByType = (type: ApiKeyMetadata['type']): ApiKey[] => {
  return apiKeys.filter(key => key.metadata.type === type);
};

export const searchApiKeys = (query: string): ApiKey[] => {
  const lowerQuery = query.toLowerCase();
  return apiKeys.filter(key =>
    key.name.toLowerCase().includes(lowerQuery) ||
    key.description?.toLowerCase().includes(lowerQuery) ||
    key.metadata.application?.toLowerCase().includes(lowerQuery) ||
    key.metadata.integration?.toLowerCase().includes(lowerQuery) ||
    key.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const validateApiKey = (keyValue: string): ApiKey | null => {
  const key = apiKeys.find(k => k.key === keyValue);
  if (!key) return null;
  if (key.status !== 'active') return null;
  if (key.expiresAt && key.expiresAt < new Date()) {
    key.status = 'expired';
    return null;
  }
  return key;
};

export const incrementUsage = (keyId: string, endpoint: string, method: string, statusCode: number, responseTime: number): boolean => {
  const key = getApiKeyById(keyId);
  if (!key) return false;
  
  key.usage.totalRequests++;
  if (statusCode >= 200 && statusCode < 400) {
    key.usage.successfulRequests++;
  } else {
    key.usage.failedRequests++;
    const errorKey = statusCode.toString() as keyof ErrorBreakdown;
    if (errorKey in key.usage.errorBreakdown) {
      key.usage.errorBreakdown[errorKey]++;
    }
  }
  
  key.lastUsedAt = new Date();
  key.rateLimit.current.minute++;
  key.rateLimit.current.hour++;
  key.rateLimit.current.day++;
  
  // Add to recent activity
  key.usage.recentActivity.unshift({
    timestamp: new Date(),
    endpoint,
    method,
    statusCode,
    responseTime,
    userAgent: 'API Client',
    ipAddress: '192.168.1.100'
  });
  
  // Keep only last 50 activities
  key.usage.recentActivity = key.usage.recentActivity.slice(0, 50);
  
  return true;
};

export const checkRateLimit = (keyId: string): { allowed: boolean; resetAt: Date; remaining: number } => {
  const key = getApiKeyById(keyId);
  if (!key) return { allowed: false, resetAt: new Date(), remaining: 0 };
  
  const now = new Date();
  if (now > key.rateLimit.current.resetAt) {
    // Reset counters
    key.rateLimit.current.minute = 0;
    key.rateLimit.current.hour = 0;
    key.rateLimit.current.day = 0;
    key.rateLimit.current.resetAt = new Date(now.getTime() + 60 * 60 * 1000);
  }
  
  const allowed = key.rateLimit.current.hour < key.rateLimit.requestsPerHour;
  const remaining = Math.max(0, key.rateLimit.requestsPerHour - key.rateLimit.current.hour);
  
  return {
    allowed,
    resetAt: key.rateLimit.current.resetAt,
    remaining
  };
};

export const getApiKeyStats = () => {
  const total = apiKeys.length;
  const active = apiKeys.filter(k => k.status === 'active').length;
  const expired = apiKeys.filter(k => k.status === 'expired').length;
  const revoked = apiKeys.filter(k => k.status === 'revoked').length;
  
  const totalRequests = apiKeys.reduce((sum, key) => sum + key.usage.totalRequests, 0);
  const totalErrors = apiKeys.reduce((sum, key) => sum + key.usage.failedRequests, 0);
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  
  const typeDistribution = apiKeys.reduce((acc, key) => {
    acc[key.metadata.type] = (acc[key.metadata.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const environmentDistribution = apiKeys.reduce((acc, key) => {
    acc[key.metadata.environment] = (acc[key.metadata.environment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    active,
    expired,
    revoked,
    totalRequests,
    totalErrors,
    errorRate: Math.round(errorRate * 100) / 100,
    typeDistribution,
    environmentDistribution,
    lastUpdated: new Date().toISOString()
  };
};

// API key templates for common use cases
export const apiKeyTemplates: ApiKeyTemplate[] = [
  {
    id: 'web-dashboard',
    name: 'Web Dashboard',
    description: 'Standard permissions for web dashboard applications',
    permissions: [
      { resource: 'documents', actions: ['read', 'write'] },
      { resource: 'search', actions: ['read'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] }
    ],
    scopes: ['documents:read', 'documents:write', 'search:read', 'users:read', 'analytics:read'],
    rateLimit: { requestsPerHour: 5000 },
    isDefault: true,
    category: 'web'
  },
  {
    id: 'service-integration',
    name: 'Service Integration',
    description: 'High-throughput permissions for service integrations',
    permissions: [
      { resource: 'documents', actions: ['read', 'write', 'delete'] },
      { resource: 'jobs', actions: ['read', 'write'] },
      { resource: 'webhooks', actions: ['write'] }
    ],
    scopes: ['documents:*', 'jobs:*', 'webhooks:write'],
    rateLimit: { requestsPerHour: 15000 },
    isDefault: false,
    category: 'service'
  },
  {
    id: 'readonly-analytics',
    name: 'Read-Only Analytics',
    description: 'Read-only access for analytics and reporting tools',
    permissions: [
      { resource: 'documents', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'users', actions: ['read'] }
    ],
    scopes: ['documents:read', 'analytics:read', 'users:read'],
    rateLimit: { requestsPerHour: 2000 },
    isDefault: false,
    category: 'analytics'
  }
];

// Export for use in other components
export default apiKeys;