/**
 * Query Key Management for Data Fetching
 * Centralized query key definitions for cache invalidation and management
 */

export const queryKeys = {
  // Document query keys
  documents: {
    all: ['documents'],
    byRealm: (realmId: string) => ['documents', 'realm', realmId],
    byId: (id: string) => ['documents', 'byId', id],
    stats: (realmId?: string) => realmId ? ['documents', 'stats', realmId] : ['documents', 'stats'],
    search: (query: string, filters?: Record<string, any>) => [
      'documents', 
      'search', 
      query, 
      ...(filters ? [JSON.stringify(filters)] : [])
    ],
    uploads: ['documents', 'uploads'],
    processing: (documentId: string) => ['documents', 'processing', documentId],
  },

  // Realm query keys
  realms: {
    all: ['realms'],
    current: ['realms', 'current'],
    byId: (id: string) => ['realms', 'byId', id],
    members: (realmId: string) => ['realms', 'members', realmId],
    settings: (realmId: string) => ['realms', 'settings', realmId],
    usage: (realmId: string) => ['realms', 'usage', realmId],
  },

  // Job query keys
  jobs: {
    all: ['jobs'],
    queue: ['jobs', 'queue'],
    byId: (id: string) => ['jobs', 'byId', id],
    byType: (type: string) => ['jobs', 'byType', type],
    byStatus: (status: string) => ['jobs', 'byStatus', status],
    byRealm: (realmId: string) => ['jobs', 'byRealm', realmId],
    statistics: ['jobs', 'statistics'],
    running: ['jobs', 'running'],
    recent: (limit?: number) => ['jobs', 'recent', ...(limit ? [limit.toString()] : [])],
  },

  // Analytics query keys
  analytics: {
    dashboard: (realmId?: string) => realmId ? ['analytics', 'dashboard', realmId] : ['analytics', 'dashboard'],
    global: ['analytics', 'global'],
    byRealm: (realmId: string) => ['analytics', 'realm', realmId],
    usage: (realmId: string, period?: string) => ['analytics', 'usage', realmId, ...(period ? [period] : [])],
    performance: (realmId: string) => ['analytics', 'performance', realmId],
    trends: (realmId: string, metric: string) => ['analytics', 'trends', realmId, metric],
    systemHealth: ['analytics', 'health'],
    userEngagement: (realmId?: string) => realmId ? ['analytics', 'engagement', realmId] : ['analytics', 'engagement'],
  },

  // Search query keys (for caching search results)
  search: {
    results: (query: string, filters?: Record<string, any>) => [
      'search', 
      'results', 
      query, 
      ...(filters ? [JSON.stringify(filters)] : [])
    ],
    facets: (realmId?: string) => realmId ? ['search', 'facets', realmId] : ['search', 'facets'],
    suggestions: (query: string) => ['search', 'suggestions', query],
  },
};

// Helper function to invalidate related queries
export const getInvalidationKeys = {
  // When a document is uploaded/deleted, invalidate related queries
  onDocumentChange: (realmId: string, documentId?: string) => [
    queryKeys.documents.all,
    queryKeys.documents.byRealm(realmId),
    queryKeys.documents.stats(realmId),
    queryKeys.analytics.byRealm(realmId),
    queryKeys.analytics.dashboard(realmId),
    ...(documentId ? [queryKeys.documents.byId(documentId)] : [])
  ],

  // When a realm is created/updated, invalidate related queries
  onRealmChange: (realmId?: string) => [
    queryKeys.realms.all,
    queryKeys.realms.current,
    ...(realmId ? [
      queryKeys.realms.byId(realmId),
      queryKeys.documents.byRealm(realmId),
      queryKeys.jobs.byRealm(realmId),
      queryKeys.analytics.byRealm(realmId)
    ] : [])
  ],

  // When a job status changes, invalidate related queries
  onJobChange: (jobId: string, jobType?: string, realmId?: string) => [
    queryKeys.jobs.all,
    queryKeys.jobs.queue,
    queryKeys.jobs.byId(jobId),
    queryKeys.jobs.statistics,
    queryKeys.jobs.running,
    queryKeys.jobs.recent(),
    ...(jobType ? [queryKeys.jobs.byType(jobType)] : []),
    ...(realmId ? [queryKeys.jobs.byRealm(realmId)] : [])
  ],

  // When analytics data needs refresh, invalidate related queries
  onAnalyticsRefresh: (realmId?: string) => [
    queryKeys.analytics.global,
    queryKeys.analytics.systemHealth,
    ...(realmId ? [
      queryKeys.analytics.byRealm(realmId),
      queryKeys.analytics.dashboard(realmId),
      queryKeys.analytics.performance(realmId),
      queryKeys.analytics.userEngagement(realmId)
    ] : [queryKeys.analytics.userEngagement()])
  ],

  // When switching realms, invalidate all realm-specific data
  onRealmSwitch: (newRealmId: string, oldRealmId?: string) => [
    queryKeys.realms.current,
    queryKeys.documents.byRealm(newRealmId),
    queryKeys.jobs.byRealm(newRealmId),
    queryKeys.analytics.byRealm(newRealmId),
    queryKeys.analytics.dashboard(newRealmId),
    ...(oldRealmId ? [
      queryKeys.documents.byRealm(oldRealmId),
      queryKeys.jobs.byRealm(oldRealmId),
      queryKeys.analytics.byRealm(oldRealmId),
      queryKeys.analytics.dashboard(oldRealmId)
    ] : [])
  ]
};

// Helper type to extract query key array type
export type QueryKey = typeof queryKeys[keyof typeof queryKeys];
export type InvalidationKey = ReturnType<typeof getInvalidationKeys[keyof typeof getInvalidationKeys]>[number];