// Centralized mock data exports for the MoRAG platform

// User mock data exports
export * from './userMockData'
export type {
  UserRole,
  UserStatus,
  UserPreferences,
  UserActivity,
  UserStatistics,
  UserPermission,
  MockUser,
} from './userMockData'

// Realm mock data exports
export * from './realmMockData'
export type {
  RealmStatus,
  RealmTier,
  ProcessingMode,
  StorageProvider,
  VectorDatabase,
  GraphDatabase,
  RealmConfiguration,
  RealmQuotas,
  RealmUsageStatistics,
  RealmMembership,
  RealmIntegration,
  RealmActivity,
  MockRealm,
} from './realmMockData'

// Analytics mock data exports
export * from './analyticsMockData'
export type {
  ChartDataPoint,
  TimeSeriesData,
  BarChartData,
  PieChartData,
  MetricCard,
  ResourceUtilization,
  PerformanceMetrics,
  UsageTrend,
  UserEngagementData,
  DocumentAnalytics,
  SearchAnalytics,
  RealmAnalytics,
} from './analyticsMockData'

// Job mock data exports
export * from './jobMockData'
export type {
  JobType,
  JobStatus,
  JobPriority,
  JobMetrics,
  JobStep,
  JobError,
  JobDependency,
  JobNotification,
  JobConfiguration,
  JobLog,
  MockJob,
} from './jobMockData'

// Document mock data exports
export * from './documentMockData'
export type {
  DocumentMetadata,
  UploadProgress,
} from './documentMockData'

// Search mock data exports
export * from './searchMockData'
export type {
  SearchResult,
  SearchFilters,
} from './searchMockData'

// Advanced Documents mock data exports (Task C1)
export * from './advancedDocuments'
export type {
  AdvancedDocumentMetadata,
  DocumentVersion,
  DocumentPermission,
  DocumentRelationship,
  CustomMetadata,
  ProcessingMetrics,
  StageMetric,
  ContentAnalysis,
  Topic,
  SearchIndexData,
  Entity,
  AuditLogEntry,
} from './advancedDocuments'

// Team Members mock data exports (Task C1)
export * from './teamMembers'
export type {
  TeamMember,
  TeamRole,
  UserStatus,
  Language,
  UserPreferences,
  SocialProfile,
  RealmMembership,
  TeamPermission,
  ActivityMetrics,
  ProjectAssignment,
  CommunicationPreferences,
  TimeSlot,
  WorkSchedule,
  EmergencyContact,
} from './teamMembers'

// Notifications mock data exports (Task C1)
export * from './notifications'
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationSource,
  NotificationMetadata,
  DeliveryStatus,
  NotificationPreferences,
  NotificationTemplate,
} from './notifications'

// API Keys mock data exports (Task C1)
export * from './apiKeys'
export type {
  ApiKey,
  ApiKeyStatus,
  ApiPermission,
  RateLimit,
  UsageStatistics,
  EndpointUsage,
  ErrorBreakdown,
  ResponseTimeStats,
  DailyUsage,
  MonthlyUsage,
  RecentActivity,
  SecuritySettings,
  ApiKeyMetadata,
  ApiKeyTemplate,
} from './apiKeys'

// Activity Logs mock data exports (Task C1)
export * from './activityLogs'
export type {
  ActivityLog,
  ActivityAction,
  ActivityCategory,
  ActivityResource,
  ActivitySource,
  ActivitySeverity,
  ActivityStatus,
  ActivityDetails,
  ActivityMetadata,
  GeoLocation,
  ActivityPattern,
  AuditTrail,
  SecurityEvent,
  ComplianceEvent,
} from './activityLogs'

// Re-export legacy types for backward compatibility
export type {
  NavigationItem,
  NavigationSubItem,
  Realm,
  User,
  Notification,
  NotificationType,
  BreadcrumbItem,
  Role,
  SidebarState,
  Theme,
  LayoutState,
} from '../../components/layout/types'

// Unified data access helpers
export const mockData = {
  // Document data
  documents: {
    all: () => import('./documentMockData').then(m => m.mockDocuments),
    byId: (id: string) => import('./documentMockData').then(m => m.getDocumentById(id)),
    byStatus: (status: string) => import('./documentMockData').then(m => m.getDocumentsByStatus(status as any)),
    byTag: (tag: string) => import('./documentMockData').then(m => m.getDocumentsByTag(tag)),
    search: (query: string) => import('./documentMockData').then(m => m.searchDocuments(query)),
    stats: () => import('./documentMockData').then(m => m.getMockDocumentStats()),
  },

  // User data
  users: {
    all: () => import('./userMockData').then(m => m.mockUsers),
    current: () => import('./userMockData').then(m => m.currentUser),
    byId: (id: string) => import('./userMockData').then(m => m.getUserById(id)),
    byRealm: (realmId: string) => import('./userMockData').then(m => m.getUsersByRealm(realmId)),
    byRole: (role: string) => import('./userMockData').then(m => m.getUsersByRole(role as any)),
    active: () => import('./userMockData').then(m => m.getActiveUsers()),
    recent: (hours?: number) => import('./userMockData').then(m => m.getRecentlyActiveUsers(hours)),
  },
  
  // Realm data
  realms: {
    all: () => import('./realmMockData').then(m => m.mockRealms),
    current: () => import('./realmMockData').then(m => m.currentRealm),
    byId: (id: string) => import('./realmMockData').then(m => m.getRealmById(id)),
    byStatus: (status: string) => import('./realmMockData').then(m => m.getRealmsByStatus(status as any)),
    byTier: (tier: string) => import('./realmMockData').then(m => m.getRealmsByTier(tier as any)),
    byUser: (userId: string) => import('./realmMockData').then(m => m.getRealmsByUser(userId)),
    active: () => import('./realmMockData').then(m => m.getActiveRealms()),
  },
  
  // Analytics data
  analytics: {
    byRealm: (realmId: string) => import('./analyticsMockData').then(m => m.getAnalyticsByRealm(realmId)),
    global: () => import('./analyticsMockData').then(m => m.globalAnalytics),
    metrics: (realmId: string) => import('./analyticsMockData').then(m => m.getMetricsByRealm(realmId)),
    dashboard: () => import('./analyticsMockData').then(m => m.getDashboardSummary()),
    systemHealth: () => import('./analyticsMockData').then(m => m.getSystemHealthMetrics()),
  },
  
  // Job data
  jobs: {
    all: () => import('./jobMockData').then(m => m.mockJobs),
    byId: (id: string) => import('./jobMockData').then(m => m.getJobById(id)),
    byStatus: (status: string) => import('./jobMockData').then(m => m.getJobsByStatus(status as any)),
    byType: (type: string) => import('./jobMockData').then(m => m.getJobsByType(type as any)),
    byRealm: (realmId: string) => import('./jobMockData').then(m => m.getJobsByRealm(realmId)),
    byUser: (userId: string) => import('./jobMockData').then(m => m.getJobsByUser(userId)),
    active: () => import('./jobMockData').then(m => m.getActiveJobs()),
    queue: () => import('./jobMockData').then(m => m.getJobQueue()),
    statistics: () => import('./jobMockData').then(m => m.getJobStatistics()),
  },

  // Search data
  search: {
    all: () => import('./searchMockData').then(m => m.mockSearchResults),
    filter: (results: any[], query: string, filters: any) => 
      import('./searchMockData').then(m => m.filterSearchResults(results, query, filters)),
    paginate: (results: any[], page: number, limit?: number) => 
      import('./searchMockData').then(m => m.paginateResults(results, page, limit)),
    simulate: (query: string, filters: any, page?: number, limit?: number) => 
      import('./searchMockData').then(m => m.simulateSearchApi(query, filters, page, limit)),
    facets: () => import('./searchMockData').then(m => m.searchFacets),
  },

  // Advanced Documents data (Task C1)
  advancedDocuments: {
    all: () => import('./advancedDocuments').then(m => m.advancedDocuments),
    byId: (id: string) => import('./advancedDocuments').then(m => m.getAdvancedDocumentById(id)),
    byStatus: (status: string) => import('./advancedDocuments').then(m => m.getAdvancedDocumentsByStatus(status as any)),
    byRealm: (realmId: string) => import('./advancedDocuments').then(m => m.getAdvancedDocumentsByRealm(realmId)),
    byCategory: (category: string) => import('./advancedDocuments').then(m => m.getAdvancedDocumentsByCategory(category)),
    byDepartment: (department: string) => import('./advancedDocuments').then(m => m.getAdvancedDocumentsByDepartment(department)),
    byIndustry: (industry: string) => import('./advancedDocuments').then(m => m.getAdvancedDocumentsByIndustry(industry)),
    search: (query: string) => import('./advancedDocuments').then(m => m.searchAdvancedDocuments(query)),
    stats: () => import('./advancedDocuments').then(m => m.getAdvancedDocumentStats()),
  },

  // Team Members data (Task C1)
  teamMembers: {
    all: () => import('./teamMembers').then(m => m.teamMembers),
    byId: (id: string) => import('./teamMembers').then(m => m.getTeamMemberById(id)),
    byRealm: (realmId: string) => import('./teamMembers').then(m => m.getTeamMembersByRealm(realmId)),
    byRole: (role: string) => import('./teamMembers').then(m => m.getTeamMembersByRole(role as any)),
    byDepartment: (department: string) => import('./teamMembers').then(m => m.getTeamMembersByDepartment(department)),
    active: () => import('./teamMembers').then(m => m.getActiveTeamMembers()),
    online: () => import('./teamMembers').then(m => m.getOnlineTeamMembers()),
    search: (query: string) => import('./teamMembers').then(m => m.searchTeamMembers(query)),
    stats: () => import('./teamMembers').then(m => m.getTeamMemberStats()),
  },

  // Notifications data (Task C1)
  notifications: {
    all: () => import('./notifications').then(m => m.notifications),
    byId: (id: string) => import('./notifications').then(m => m.getNotificationById(id)),
    byUser: (userId: string) => import('./notifications').then(m => m.getNotificationsByUser(userId)),
    unread: (userId?: string) => import('./notifications').then(m => m.getUnreadNotifications(userId)),
    byType: (type: string) => import('./notifications').then(m => m.getNotificationsByType(type as any)),
    byPriority: (priority: string) => import('./notifications').then(m => m.getNotificationsByPriority(priority as any)),
    byRealm: (realmId: string) => import('./notifications').then(m => m.getNotificationsByRealm(realmId)),
    recent: (userId?: string, hours?: number) => import('./notifications').then(m => m.getRecentNotifications(userId, hours)),
    markAsRead: (id: string) => import('./notifications').then(m => m.markNotificationAsRead(id)),
    markAllAsRead: (userId: string) => import('./notifications').then(m => m.markAllAsRead(userId)),
    dismiss: (id: string) => import('./notifications').then(m => m.dismissNotification(id)),
    stats: (userId?: string) => import('./notifications').then(m => m.getNotificationStats(userId)),
  },

  // API Keys data (Task C1)
  apiKeys: {
    all: () => import('./apiKeys').then(m => m.apiKeys),
    byId: (id: string) => import('./apiKeys').then(m => m.getApiKeyById(id)),
    byUser: (userId: string) => import('./apiKeys').then(m => m.getApiKeysByUser(userId)),
    active: () => import('./apiKeys').then(m => m.getActiveApiKeys()),
    byStatus: (status: string) => import('./apiKeys').then(m => m.getApiKeysByStatus(status as any)),
    byEnvironment: (environment: string) => import('./apiKeys').then(m => m.getApiKeysByEnvironment(environment as any)),
    byType: (type: string) => import('./apiKeys').then(m => m.getApiKeysByType(type as any)),
    search: (query: string) => import('./apiKeys').then(m => m.searchApiKeys(query)),
    validate: (key: string) => import('./apiKeys').then(m => m.validateApiKey(key)),
    checkRateLimit: (keyId: string) => import('./apiKeys').then(m => m.checkRateLimit(keyId)),
    stats: () => import('./apiKeys').then(m => m.getApiKeyStats()),
    templates: () => import('./apiKeys').then(m => m.apiKeyTemplates),
  },

  // Activity Logs data (Task C1)
  activityLogs: {
    all: () => import('./activityLogs').then(m => m.activityLogs),
    byId: (id: string) => import('./activityLogs').then(m => m.getActivityLogById(id)),
    byUser: (userId: string) => import('./activityLogs').then(m => m.getActivityLogsByUser(userId)),
    byRealm: (realmId: string) => import('./activityLogs').then(m => m.getActivityLogsByRealm(realmId)),
    byAction: (action: string) => import('./activityLogs').then(m => m.getActivityLogsByAction(action as any)),
    byCategory: (category: string) => import('./activityLogs').then(m => m.getActivityLogsByCategory(category as any)),
    byResource: (resource: string) => import('./activityLogs').then(m => m.getActivityLogsByResource(resource as any)),
    byStatus: (status: string) => import('./activityLogs').then(m => m.getActivityLogsByStatus(status as any)),
    bySeverity: (severity: string) => import('./activityLogs').then(m => m.getActivityLogsBySeverity(severity as any)),
    recent: (hours?: number) => import('./activityLogs').then(m => m.getRecentActivityLogs(hours)),
    byDateRange: (startDate: Date, endDate: Date) => import('./activityLogs').then(m => m.getActivityLogsByDateRange(startDate, endDate)),
    search: (query: string) => import('./activityLogs').then(m => m.searchActivityLogs(query)),
    auditTrail: (resourceType: string, resourceId: string) => import('./activityLogs').then(m => m.getAuditTrail(resourceType as any, resourceId)),
    securityEvents: () => import('./activityLogs').then(m => m.getSecurityEvents()),
    complianceEvents: () => import('./activityLogs').then(m => m.getComplianceEvents()),
    userPattern: (userId: string) => import('./activityLogs').then(m => m.getUserActivityPattern(userId)),
    stats: () => import('./activityLogs').then(m => m.getActivityLogStats()),
    commonQueries: () => import('./activityLogs').then(m => m.commonQueries),
  },
}

// Data validation helpers
export const validateMockData = {
  document: (document: any): boolean => {
    return document && 
           typeof document.id === 'string' && 
           typeof document.name === 'string' && 
           typeof document.filename === 'string' &&
           typeof document.type === 'string' &&
           typeof document.size === 'number' &&
           typeof document.realmId === 'string' &&
           Array.isArray(document.tags)
  },
  
  user: (user: any): boolean => {
    return user && 
           typeof user.id === 'string' && 
           typeof user.name === 'string' && 
           typeof user.email === 'string' &&
           Array.isArray(user.realms)
  },
  
  realm: (realm: any): boolean => {
    return realm && 
           typeof realm.id === 'string' && 
           typeof realm.name === 'string' && 
           typeof realm.description === 'string' &&
           realm.configuration &&
           realm.quotas &&
           realm.usage
  },
  
  job: (job: any): boolean => {
    return job && 
           typeof job.id === 'string' && 
           typeof job.name === 'string' && 
           typeof job.type === 'string' &&
           typeof job.status === 'string' &&
           Array.isArray(job.steps) &&
           Array.isArray(job.logs)
  },

  // Task C1 validation helpers
  advancedDocument: (doc: any): boolean => {
    return doc &&
           typeof doc.id === 'string' &&
           typeof doc.name === 'string' &&
           typeof doc.filename === 'string' &&
           typeof doc.mimeType === 'string' &&
           typeof doc.size === 'number' &&
           Array.isArray(doc.versionHistory) &&
           Array.isArray(doc.permissions) &&
           doc.metadata &&
           doc.processingMetrics &&
           doc.contentAnalysis &&
           doc.searchIndex
  },

  teamMember: (member: any): boolean => {
    return member &&
           typeof member.id === 'string' &&
           typeof member.email === 'string' &&
           typeof member.name === 'string' &&
           typeof member.role === 'string' &&
           typeof member.status === 'string' &&
           typeof member.department === 'string' &&
           Array.isArray(member.skills) &&
           Array.isArray(member.realmMemberships) &&
           member.preferences
  },

  notification: (notification: any): boolean => {
    return notification &&
           typeof notification.id === 'string' &&
           typeof notification.userId === 'string' &&
           typeof notification.type === 'string' &&
           typeof notification.category === 'string' &&
           typeof notification.title === 'string' &&
           typeof notification.message === 'string' &&
           typeof notification.priority === 'string' &&
           typeof notification.status === 'string' &&
           notification.createdAt instanceof Date &&
           Array.isArray(notification.channels)
  },

  apiKey: (apiKey: any): boolean => {
    return apiKey &&
           typeof apiKey.id === 'string' &&
           typeof apiKey.key === 'string' &&
           typeof apiKey.keyPreview === 'string' &&
           typeof apiKey.userId === 'string' &&
           typeof apiKey.status === 'string' &&
           Array.isArray(apiKey.permissions) &&
           Array.isArray(apiKey.scopes) &&
           apiKey.rateLimit &&
           apiKey.usage &&
           apiKey.metadata
  },

  activityLog: (log: any): boolean => {
    return log &&
           typeof log.id === 'string' &&
           typeof log.action === 'string' &&
           typeof log.category === 'string' &&
           typeof log.resource === 'string' &&
           typeof log.description === 'string' &&
           typeof log.source === 'string' &&
           typeof log.severity === 'string' &&
           typeof log.status === 'string' &&
           log.timestamp instanceof Date &&
           log.details &&
           log.metadata
  },
}

// Mock data statistics for debugging and monitoring
export const getMockDataStats = async () => {
  const [
    documents, users, realms, jobs, 
    advancedDocs, teamMembers, notifications, apiKeys, activityLogs
  ] = await Promise.all([
    mockData.documents.all(),
    mockData.users.all(),
    mockData.realms.all(),
    mockData.jobs.all(),
    mockData.advancedDocuments.all(),
    mockData.teamMembers.all(),
    mockData.notifications.all(),
    mockData.apiKeys.all(),
    mockData.activityLogs.all(),
  ])
  
  return {
    documents: {
      total: documents.length,
      byStatus: {
        pending: documents.filter(d => d.status === 'pending').length,
        processing: documents.filter(d => d.status === 'processing').length,
        completed: documents.filter(d => d.status === 'completed').length,
        failed: documents.filter(d => d.status === 'failed').length,
      },
      totalSize: documents.reduce((sum, d) => sum + d.size, 0),
      totalChunks: documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0),
      totalFacts: documents.reduce((sum, d) => sum + (d.factCount || 0), 0),
    },
    users: {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      byRole: {
        'system-admin': users.filter(u => u.role === 'system-admin').length,
        'realm-admin': users.filter(u => u.role === 'realm-admin').length,
        'user': users.filter(u => u.role === 'user').length,
        'viewer': users.filter(u => u.role === 'viewer').length,
      },
    },
    realms: {
      total: realms.length,
      active: realms.filter(r => r.status === 'active').length,
      byTier: {
        basic: realms.filter(r => r.tier === 'basic').length,
        professional: realms.filter(r => r.tier === 'professional').length,
        enterprise: realms.filter(r => r.tier === 'enterprise').length,
        custom: realms.filter(r => r.tier === 'custom').length,
      },
    },
    jobs: {
      total: jobs.length,
      byStatus: {
        pending: jobs.filter(j => j.status === 'pending').length,
        running: jobs.filter(j => j.status === 'running').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
        cancelled: jobs.filter(j => j.status === 'cancelled').length,
        paused: jobs.filter(j => j.status === 'paused').length,
      },
    },
    // Task C1 enhanced data statistics
    advancedDocuments: {
      total: advancedDocs.length,
      totalSize: advancedDocs.reduce((sum, d) => sum + d.size, 0),
      avgQualityScore: advancedDocs.reduce((sum, d) => sum + d.processingMetrics.qualityScore, 0) / advancedDocs.length,
      totalVersions: advancedDocs.reduce((sum, d) => sum + d.versionHistory.length, 0),
      languageDistribution: advancedDocs.reduce((acc, d) => {
        acc[d.contentAnalysis.language] = (acc[d.contentAnalysis.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    teamMembers: {
      total: teamMembers.length,
      active: teamMembers.filter(m => m.status === 'active').length,
      online: teamMembers.filter(m => m.isOnline).length,
      byDepartment: teamMembers.reduce((acc, m) => {
        acc[m.department] = (acc[m.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgRealmMemberships: teamMembers.reduce((sum, m) => sum + m.realmMemberships.length, 0) / teamMembers.length,
    },
    notifications: {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      byPriority: notifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    apiKeys: {
      total: apiKeys.length,
      active: apiKeys.filter(k => k.status === 'active').length,
      totalRequests: apiKeys.reduce((sum, k) => sum + k.usage.totalRequests, 0),
      avgErrorRate: apiKeys.reduce((sum, k) => {
        const total = k.usage.totalRequests;
        const errors = k.usage.failedRequests;
        return sum + (total > 0 ? (errors / total) * 100 : 0);
      }, 0) / apiKeys.length,
      byEnvironment: apiKeys.reduce((acc, k) => {
        acc[k.metadata.environment] = (acc[k.metadata.environment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    activityLogs: {
      total: activityLogs.length,
      last24Hours: activityLogs.filter(l => l.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
      byCategory: activityLogs.reduce((acc, l) => {
        acc[l.category] = (acc[l.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: activityLogs.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      uniqueUsers: new Set(activityLogs.map(l => l.userId).filter(Boolean)).size,
    },
    lastUpdated: new Date().toISOString(),
  }
}

// Development helpers
export const devHelpers = {
  // Reset all mock data to initial state
  reset: () => {
    console.log('Mock data reset - reloading modules...')
    // In a real implementation, this would clear caches and reload data
  },
  
  // Generate additional mock data
  generateUsers: (count: number) => {
    console.log(`Generating ${count} additional mock users...`)
    // Implementation would generate and add new users
  },
  
  generateJobs: (count: number) => {
    console.log(`Generating ${count} additional mock jobs...`)
    // Implementation would generate and add new jobs
  },
  
  // Export mock data for external use
  exportData: async () => {
    const stats = await getMockDataStats()
    console.log('Mock data export:', stats)
    return stats
  },
}