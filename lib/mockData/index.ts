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

// Search mock data exports (if it exists)
export * from './searchMockData'

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
}

// Data validation helpers
export const validateMockData = {
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
}

// Mock data statistics for debugging and monitoring
export const getMockDataStats = async () => {
  const [users, realms, jobs] = await Promise.all([
    mockData.users.all(),
    mockData.realms.all(),
    mockData.jobs.all(),
  ])
  
  return {
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