/**
 * Activity logs mock data with user action tracking and system event logging
 * Task C1: Advanced Mock Data Expansion
 */

export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  userEmail?: string;
  realmId?: string;
  realmName?: string;
  sessionId?: string;
  action: ActivityAction;
  category: ActivityCategory;
  resource: ActivityResource;
  resourceId?: string;
  resourceName?: string;
  description: string;
  details: ActivityDetails;
  metadata: ActivityMetadata;
  source: ActivitySource;
  severity: ActivitySeverity;
  status: ActivityStatus;
  duration?: number; // milliseconds
  ipAddress?: string;
  userAgent?: string;
  geolocation?: GeoLocation;
  tags: string[];
  relatedActivityIds?: string[];
}

export type ActivityAction = 
  | 'create' | 'read' | 'update' | 'delete' 
  | 'upload' | 'download' | 'share' | 'unshare'
  | 'login' | 'logout' | 'authenticate' | 'authorize'
  | 'process' | 'execute' | 'cancel' | 'retry'
  | 'search' | 'filter' | 'sort' | 'export'
  | 'invite' | 'accept' | 'reject' | 'remove'
  | 'configure' | 'install' | 'uninstall' | 'backup'
  | 'migrate' | 'sync' | 'validate' | 'audit';

export type ActivityCategory = 
  | 'authentication' | 'authorization' | 'user-management'
  | 'document-management' | 'file-operations' | 'search'
  | 'collaboration' | 'sharing' | 'communication'
  | 'system' | 'configuration' | 'maintenance'
  | 'integration' | 'api' | 'webhook'
  | 'processing' | 'job-management' | 'pipeline'
  | 'analytics' | 'reporting' | 'audit'
  | 'security' | 'compliance' | 'privacy'
  | 'billing' | 'subscription' | 'usage';

export type ActivityResource = 
  | 'user' | 'realm' | 'document' | 'job' | 'api-key'
  | 'notification' | 'webhook' | 'integration'
  | 'team' | 'role' | 'permission' | 'setting'
  | 'session' | 'audit-log' | 'backup'
  | 'pipeline' | 'stage' | 'workflow'
  | 'search-index' | 'analytics' | 'report'
  | 'billing' | 'subscription' | 'invoice';

export type ActivitySource = 
  | 'web-ui' | 'mobile-app' | 'api' | 'cli' | 'webhook'
  | 'system' | 'scheduler' | 'integration' | 'migration'
  | 'admin-panel' | 'service' | 'background-job';

export type ActivitySeverity = 
  | 'info' | 'low' | 'medium' | 'high' | 'critical';

export type ActivityStatus = 
  | 'success' | 'failure' | 'warning' | 'pending' | 'cancelled';

export interface ActivityDetails {
  before?: Record<string, any>;
  after?: Record<string, any>;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration: number;
    memoryUsage: number;
    cpuTime: number;
  };
  context?: Record<string, any>;
}

export interface ActivityMetadata {
  version: string;
  requestId?: string;
  traceId?: string;
  parentActivityId?: string;
  childActivityIds?: string[];
  batchId?: string;
  correlationId?: string;
  feature?: string;
  experiment?: string;
  customFields: Record<string, any>;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface ActivityPattern {
  userId: string;
  patterns: {
    loginTimes: number[]; // hours of day
    activeHours: number[]; // hours of day
    commonActions: string[];
    peakDays: string[]; // days of week
    deviceTypes: string[];
    locations: string[];
  };
}

export interface AuditTrail {
  resourceType: ActivityResource;
  resourceId: string;
  activities: ActivityLog[];
  summary: {
    totalActivities: number;
    uniqueUsers: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    actionBreakdown: Record<ActivityAction, number>;
  };
}

export interface SecurityEvent extends ActivityLog {
  riskScore: number; // 0-100
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  mitigated: boolean;
  mitigationActions?: string[];
}

export interface ComplianceEvent extends ActivityLog {
  complianceFramework: string[]; // GDPR, HIPAA, SOX, etc.
  dataTypes: string[];
  retentionPeriod: number; // days
  isPersonalData: boolean;
  consentStatus?: 'granted' | 'denied' | 'pending' | 'withdrawn';
}

// Generate comprehensive activity logs dataset
function generateActivityLogs(): ActivityLog[] {
  const logs: ActivityLog[] = [];
  
  // Sample data
  const userIds = Array.from({ length: 60 }, (_, i) => `user-${(i + 1).toString().padStart(3, '0')}`);
  const userNames = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Chen',
    'Emily Davis', 'Robert Taylor', 'Lisa Anderson', 'Maria Garcia', 'Tom Brown',
    'Alice White', 'Bob Jones', 'Carol Miller', 'Daniel Lee', 'Emma Clark'
  ];
  const realmIds = ['realm-1', 'realm-2', 'realm-3', 'realm-4', 'realm-5', 'realm-6', 'realm-7', 'realm-8'];
  const realmNames = [
    'Engineering Platform', 'Product Documentation', 'Marketing Hub', 'Sales Enablement',
    'HR Knowledge Base', 'Finance Operations', 'Customer Support', 'Legal & Compliance'
  ];
  
  const actions: ActivityAction[] = [
    'create', 'read', 'update', 'delete', 'upload', 'download', 'share', 'unshare',
    'login', 'logout', 'authenticate', 'authorize', 'process', 'execute', 'cancel',
    'retry', 'search', 'filter', 'sort', 'export', 'invite', 'accept', 'reject',
    'remove', 'configure', 'install', 'uninstall', 'backup', 'migrate', 'sync',
    'validate', 'audit'
  ];
  
  const categories: ActivityCategory[] = [
    'authentication', 'authorization', 'user-management', 'document-management',
    'file-operations', 'search', 'collaboration', 'sharing', 'communication',
    'system', 'configuration', 'maintenance', 'integration', 'api', 'webhook',
    'processing', 'job-management', 'pipeline', 'analytics', 'reporting',
    'audit', 'security', 'compliance', 'privacy', 'billing', 'subscription'
  ];
  
  const resources: ActivityResource[] = [
    'user', 'realm', 'document', 'job', 'api-key', 'notification', 'webhook',
    'integration', 'team', 'role', 'permission', 'setting', 'session',
    'audit-log', 'backup', 'pipeline', 'stage', 'workflow', 'search-index',
    'analytics', 'report', 'billing', 'subscription'
  ];
  
  const sources: ActivitySource[] = [
    'web-ui', 'mobile-app', 'api', 'cli', 'webhook', 'system', 'scheduler',
    'integration', 'migration', 'admin-panel', 'service', 'background-job'
  ];
  
  const severities: ActivitySeverity[] = ['info', 'low', 'medium', 'high', 'critical'];
  const statuses: ActivityStatus[] = ['success', 'failure', 'warning', 'pending', 'cancelled'];
  
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'MoRAG-Mobile-App/1.0 (iOS)',
    'MoRAG-CLI/2.1.0',
    'Python-requests/2.28.1',
    'curl/7.68.0'
  ];
  
  const countries = ['US', 'UK', 'CA', 'DE', 'FR', 'JP', 'AU', 'IN', 'BR', 'SG'];
  const cities = {
    'US': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston'],
    'UK': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol'],
    'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
    'DE': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
    'FR': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    'JP': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
    'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
    'SG': ['Singapore']
  };
  
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
  
  const generateIpAddress = (): string => {
    return `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`;
  };
  
  const generateSessionId = (): string => {
    return `sess_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };
  
  const generateGeoLocation = (): GeoLocation => {
    const country = randomChoice(countries);
    const cityList = cities[country as keyof typeof cities] || ['Unknown City'];
    const city = randomChoice(cityList);
    
    return {
      country,
      region: country === 'US' ? randomChoice(['CA', 'NY', 'TX', 'FL', 'IL']) : undefined,
      city,
      latitude: randomFloat(-90, 90),
      longitude: randomFloat(-180, 180),
      timezone: randomChoice([
        'America/New_York', 'America/Los_Angeles', 'Europe/London',
        'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'
      ])
    };
  };
  
  const generateActivityDescription = (action: ActivityAction, resource: ActivityResource, resourceName?: string): string => {
    const resourceDisplay = resourceName || `${resource} ${randomInt(1, 1000)}`;
    
    const descriptions: Record<string, string> = {
      'create': `Created ${resource}: ${resourceDisplay}`,
      'read': `Viewed ${resource}: ${resourceDisplay}`,
      'update': `Updated ${resource}: ${resourceDisplay}`,
      'delete': `Deleted ${resource}: ${resourceDisplay}`,
      'upload': `Uploaded ${resource}: ${resourceDisplay}`,
      'download': `Downloaded ${resource}: ${resourceDisplay}`,
      'share': `Shared ${resource}: ${resourceDisplay}`,
      'unshare': `Unshared ${resource}: ${resourceDisplay}`,
      'login': `User logged in`,
      'logout': `User logged out`,
      'authenticate': `User authenticated`,
      'authorize': `User authorized for ${resource}`,
      'process': `Started processing ${resource}: ${resourceDisplay}`,
      'execute': `Executed ${resource}: ${resourceDisplay}`,
      'cancel': `Cancelled ${resource}: ${resourceDisplay}`,
      'retry': `Retried ${resource}: ${resourceDisplay}`,
      'search': `Searched for ${resource}`,
      'filter': `Filtered ${resource} list`,
      'sort': `Sorted ${resource} list`,
      'export': `Exported ${resource} data`,
      'invite': `Invited user to ${resource}`,
      'accept': `Accepted invitation to ${resource}`,
      'reject': `Rejected invitation to ${resource}`,
      'remove': `Removed ${resource}: ${resourceDisplay}`,
      'configure': `Configured ${resource} settings`,
      'install': `Installed ${resource} integration`,
      'uninstall': `Uninstalled ${resource} integration`,
      'backup': `Created backup of ${resource}`,
      'migrate': `Migrated ${resource} data`,
      'sync': `Synchronized ${resource} data`,
      'validate': `Validated ${resource} data`,
      'audit': `Audited ${resource} access`
    };
    
    return descriptions[action] || `Performed ${action} on ${resource}`;
  };
  
  const generateActivityDetails = (action: ActivityAction, resource: ActivityResource, status: ActivityStatus): ActivityDetails => {
    const details: ActivityDetails = {};
    
    // Add before/after data for update actions
    if (action === 'update') {
      details.before = {
        name: `Old ${resource} name`,
        status: 'active',
        updated_at: new Date(Date.now() - 60 * 1000).toISOString()
      };
      details.after = {
        name: `New ${resource} name`,
        status: 'active',
        updated_at: new Date().toISOString()
      };
      details.changes = [
        {
          field: 'name',
          oldValue: details.before.name,
          newValue: details.after.name
        }
      ];
    }
    
    // Add error details for failed actions
    if (status === 'failure') {
      details.error = {
        code: randomChoice(['E001', 'E002', 'E003', 'TIMEOUT', 'UNAUTHORIZED', 'NOT_FOUND']),
        message: randomChoice([
          'Operation failed due to insufficient permissions',
          'Resource not found or has been deleted',
          'Request timeout after 30 seconds',
          'Invalid input parameters provided',
          'Service temporarily unavailable'
        ]),
        stack: Math.random() > 0.7 ? 'Error stack trace would be here...' : undefined
      };
    }
    
    // Add performance metrics for processing actions
    if (['process', 'execute', 'sync', 'backup'].includes(action)) {
      details.performance = {
        duration: randomInt(100, 10000),
        memoryUsage: randomInt(50, 500) * 1024 * 1024, // bytes
        cpuTime: randomInt(10, 1000)
      };
    }
    
    // Add context information
    details.context = {
      feature: randomChoice(['search', 'upload', 'processing', 'analytics', 'collaboration']),
      page: randomChoice(['/dashboard', '/documents', '/search', '/analytics', '/settings']),
      referrer: Math.random() > 0.5 ? 'https://morag.com/dashboard' : undefined
    };
    
    return details;
  };
  
  // Generate 1500+ activity log entries
  for (let i = 1; i <= 1500; i++) {
    const userId = Math.random() > 0.1 ? randomChoice(userIds) : undefined; // Some system activities
    const userName = userId ? randomChoice(userNames) : undefined;
    const userEmail = userId ? `${userName?.toLowerCase().replace(' ', '.')}@morag.com` : undefined;
    const realmIndex = randomInt(0, realmIds.length - 1);
    const realmId = Math.random() > 0.2 ? realmIds[realmIndex] : undefined;
    const realmName = realmId ? realmNames[realmIndex] : undefined;
    const sessionId = userId ? generateSessionId() : undefined;
    
    const action = randomChoice(actions);
    const category = randomChoice(categories);
    const resource = randomChoice(resources);
    const source = randomChoice(sources);
    const severity = randomChoice(severities);
    const status = randomChoice(statuses);
    
    const timestamp = randomDate(new Date('2024-01-01'), new Date());
    const duration = ['process', 'execute', 'upload', 'download', 'sync'].includes(action) ? randomInt(100, 30000) : undefined;
    
    const resourceName = resource === 'document' ? `Document_${randomInt(1, 1000)}.pdf` :
                        resource === 'user' ? randomChoice(userNames) :
                        resource === 'job' ? `Processing Job ${randomInt(1, 100)}` :
                        undefined;
    
    const description = generateActivityDescription(action, resource, resourceName);
    const details = generateActivityDetails(action, resource, status);
    const geoLocation = userId ? generateGeoLocation() : undefined;
    const ipAddress = userId ? generateIpAddress() : undefined;
    const userAgent = userId ? randomChoice(userAgents) : undefined;
    
    const activityLog: ActivityLog = {
      id: `activity-${i.toString().padStart(4, '0')}`,
      timestamp,
      userId,
      userName,
      userEmail,
      realmId,
      realmName,
      sessionId,
      action,
      category,
      resource,
      resourceId: `${resource}-${randomInt(1, 1000)}`,
      resourceName,
      description,
      details,
      metadata: {
        version: 'v1',
        requestId: `req_${Math.random().toString(36).substring(2, 15)}`,
        traceId: `trace_${Math.random().toString(36).substring(2, 15)}`,
        parentActivityId: Math.random() > 0.8 ? `activity-${randomInt(1, i).toString().padStart(4, '0')}` : undefined,
        correlationId: `corr_${Math.random().toString(36).substring(2, 15)}`,
        feature: details.context?.feature,
        customFields: {
          buildVersion: `v1.${randomInt(0, 9)}.${randomInt(0, 9)}`,
          environment: randomChoice(['production', 'staging', 'development']),
          datacenter: randomChoice(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'])
        }
      },
      source,
      severity,
      status,
      duration,
      ipAddress,
      userAgent,
      geolocation: geoLocation,
      tags: randomChoices([
        'user-action', 'system-event', 'automated', 'manual', 'critical-path',
        'security', 'compliance', 'performance', 'integration', 'audit'
      ], randomInt(1, 3)),
      relatedActivityIds: Math.random() > 0.9 ? [
        `activity-${randomInt(1, i).toString().padStart(4, '0')}`
      ] : undefined
    };
    
    logs.push(activityLog);
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate the activity logs dataset
export const activityLogs: ActivityLog[] = generateActivityLogs();

// Helper functions for accessing activity log data
export const getActivityLogById = (id: string): ActivityLog | undefined => {
  return activityLogs.find(log => log.id === id);
};

export const getActivityLogsByUser = (userId: string): ActivityLog[] => {
  return activityLogs.filter(log => log.userId === userId);
};

export const getActivityLogsByRealm = (realmId: string): ActivityLog[] => {
  return activityLogs.filter(log => log.realmId === realmId);
};

export const getActivityLogsByAction = (action: ActivityAction): ActivityLog[] => {
  return activityLogs.filter(log => log.action === action);
};

export const getActivityLogsByCategory = (category: ActivityCategory): ActivityLog[] => {
  return activityLogs.filter(log => log.category === category);
};

export const getActivityLogsByResource = (resource: ActivityResource): ActivityLog[] => {
  return activityLogs.filter(log => log.resource === resource);
};

export const getActivityLogsByStatus = (status: ActivityStatus): ActivityLog[] => {
  return activityLogs.filter(log => log.status === status);
};

export const getActivityLogsBySeverity = (severity: ActivitySeverity): ActivityLog[] => {
  return activityLogs.filter(log => log.severity === severity);
};

export const getRecentActivityLogs = (hours: number = 24): ActivityLog[] => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return activityLogs.filter(log => log.timestamp >= cutoff);
};

export const getActivityLogsByDateRange = (startDate: Date, endDate: Date): ActivityLog[] => {
  return activityLogs.filter(log => 
    log.timestamp >= startDate && log.timestamp <= endDate
  );
};

export const searchActivityLogs = (query: string): ActivityLog[] => {
  const lowerQuery = query.toLowerCase();
  return activityLogs.filter(log =>
    log.description.toLowerCase().includes(lowerQuery) ||
    log.userName?.toLowerCase().includes(lowerQuery) ||
    log.resourceName?.toLowerCase().includes(lowerQuery) ||
    log.action.toLowerCase().includes(lowerQuery) ||
    log.category.toLowerCase().includes(lowerQuery) ||
    log.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getAuditTrail = (resourceType: ActivityResource, resourceId: string): AuditTrail => {
  const activities = activityLogs.filter(log => 
    log.resource === resourceType && log.resourceId === resourceId
  );
  
  const uniqueUsers = new Set(activities.map(log => log.userId).filter(Boolean)).size;
  const actionBreakdown = activities.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<ActivityAction, number>);
  
  const timestamps = activities.map(log => log.timestamp);
  
  return {
    resourceType,
    resourceId,
    activities,
    summary: {
      totalActivities: activities.length,
      uniqueUsers,
      dateRange: {
        start: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(d => d.getTime()))) : new Date(),
        end: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(d => d.getTime()))) : new Date()
      },
      actionBreakdown
    }
  };
};

export const getSecurityEvents = (): SecurityEvent[] => {
  const securityLogs = activityLogs.filter(log => 
    log.category === 'security' || 
    log.category === 'authentication' || 
    log.category === 'authorization' ||
    log.severity === 'critical' ||
    log.severity === 'high'
  );
  
  return securityLogs.map(log => ({
    ...log,
    riskScore: randomInt(1, 100),
    threatLevel: randomChoice(['low', 'medium', 'high', 'critical'] as const),
    indicators: randomChoices([
      'Multiple failed login attempts',
      'Login from new location',
      'Unusual access pattern',
      'Privilege escalation attempt',
      'Data exfiltration attempt',
      'Suspicious API usage'
    ], randomInt(1, 3)),
    mitigated: Math.random() > 0.3,
    mitigationActions: Math.random() > 0.5 ? [
      'Account temporarily locked',
      'Security alert sent',
      'Additional authentication required'
    ] : undefined
  })) as SecurityEvent[];
};

export const getComplianceEvents = (): ComplianceEvent[] => {
  const complianceLogs = activityLogs.filter(log => 
    log.category === 'compliance' || 
    log.category === 'privacy' ||
    log.category === 'audit' ||
    ['read', 'download', 'export', 'share'].includes(log.action)
  );
  
  return complianceLogs.map(log => ({
    ...log,
    complianceFramework: randomChoices(['GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'CCPA'], randomInt(1, 3)),
    dataTypes: randomChoices(['PII', 'PHI', 'Financial', 'Confidential', 'Public'], randomInt(1, 2)),
    retentionPeriod: randomChoice([365, 1825, 2555, 3650]), // 1, 5, 7, 10 years
    isPersonalData: Math.random() > 0.6,
    consentStatus: Math.random() > 0.7 ? randomChoice(['granted', 'denied', 'pending', 'withdrawn'] as const) : undefined
  })) as ComplianceEvent[];
};

export const getUserActivityPattern = (userId: string): ActivityPattern | null => {
  const userLogs = getActivityLogsByUser(userId);
  if (userLogs.length === 0) return null;
  
  const loginTimes = userLogs
    .filter(log => log.action === 'login')
    .map(log => log.timestamp.getHours());
    
  const activeHours = userLogs.map(log => log.timestamp.getHours());
  const commonActions = Array.from(
    userLogs.reduce((acc, log) => {
      acc.set(log.action, (acc.get(log.action) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([action]) => action);
  
  const peakDays = userLogs.map(log => 
    log.timestamp.toLocaleDateString('en-US', { weekday: 'long' })
  );
  
  return {
    userId,
    patterns: {
      loginTimes: [...new Set(loginTimes)],
      activeHours: [...new Set(activeHours)],
      commonActions,
      peakDays: [...new Set(peakDays)],
      deviceTypes: [...new Set(userLogs.map(log => log.source))],
      locations: [...new Set(userLogs.map(log => log.geolocation?.city).filter(Boolean))]
    }
  };
};

export const getActivityLogStats = () => {
  const total = activityLogs.length;
  const last24Hours = getRecentActivityLogs(24).length;
  const lastWeek = getRecentActivityLogs(168).length;
  const failures = activityLogs.filter(log => log.status === 'failure').length;
  const securityEvents = activityLogs.filter(log => log.category === 'security').length;
  
  const actionDistribution = activityLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryDistribution = activityLogs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sourceDistribution = activityLogs.reduce((acc, log) => {
    acc[log.source] = (acc[log.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueUsers = new Set(activityLogs.map(log => log.userId).filter(Boolean)).size;
  const avgActivitiesPerUser = uniqueUsers > 0 ? Math.round(total / uniqueUsers) : 0;
  
  return {
    total,
    last24Hours,
    lastWeek,
    failures,
    failureRate: total > 0 ? Math.round((failures / total) * 10000) / 100 : 0,
    securityEvents,
    uniqueUsers,
    avgActivitiesPerUser,
    actionDistribution,
    categoryDistribution,
    sourceDistribution,
    lastUpdated: new Date().toISOString()
  };
};

// Export common activity log queries
export const commonQueries = {
  getFailedLogins: (hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return activityLogs.filter(log => 
      log.action === 'login' && 
      log.status === 'failure' && 
      log.timestamp >= cutoff
    );
  },
  
  getDataExports: (userId?: string) => {
    const filtered = userId ? getActivityLogsByUser(userId) : activityLogs;
    return filtered.filter(log => 
      ['export', 'download'].includes(log.action) &&
      log.status === 'success'
    );
  },
  
  getAdminActions: (hours: number = 168) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return activityLogs.filter(log => 
      ['delete', 'configure', 'audit', 'backup'].includes(log.action) &&
      log.timestamp >= cutoff
    );
  },
  
  getSuspiciousActivity: () => {
    return activityLogs.filter(log => 
      log.severity === 'critical' || 
      log.severity === 'high' ||
      (log.status === 'failure' && ['login', 'authenticate', 'authorize'].includes(log.action))
    );
  }
};

// Export for use in other components
export default activityLogs;