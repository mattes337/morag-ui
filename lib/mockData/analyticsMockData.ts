// Comprehensive analytics mock data for the MoRAG platform

export interface ChartDataPoint {
  timestamp: Date
  value: number
  label?: string
  category?: string
}

export interface TimeSeriesData {
  id: string
  name: string
  color: string
  data: ChartDataPoint[]
}

export interface BarChartData {
  category: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface PieChartData {
  name: string
  value: number
  color: string
  percentage: number
}

export interface MetricCard {
  id: string
  title: string
  value: number | string
  previousValue?: number | string
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  format: 'number' | 'currency' | 'percentage' | 'duration' | 'bytes'
  description?: string
  trend?: 'up' | 'down' | 'flat'
  icon?: string
}

export interface ResourceUtilization {
  resource: string
  used: number
  total: number
  percentage: number
  status: 'healthy' | 'warning' | 'critical'
  trend: TimeSeriesData[]
}

export interface PerformanceMetrics {
  averageProcessingTime: number
  successRate: number
  errorRate: number
  throughput: number
  peakUsage: Date
  bottlenecks: string[]
}

export interface UsageTrend {
  period: '7d' | '30d' | '90d' | '1y'
  documentsProcessed: TimeSeriesData
  searchQueries: TimeSeriesData
  apiRequests: TimeSeriesData
  activeUsers: TimeSeriesData
  storageUsage: TimeSeriesData
}

export interface UserEngagementData {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  averageSessionTime: number
  topFeatures: BarChartData[]
  userRetention: {
    day1: number
    day7: number
    day30: number
  }
}

export interface DocumentAnalytics {
  totalDocuments: number
  processingStats: {
    completed: number
    failed: number
    inProgress: number
    queued: number
  }
  documentTypes: PieChartData[]
  processingStageTimes: BarChartData[]
  errorAnalysis: {
    category: string
    count: number
    percentage: number
  }[]
}

export interface SearchAnalytics {
  totalQueries: number
  averageResponseTime: number
  topQueries: {
    query: string
    count: number
    averageRelevance: number
  }[]
  noResultsQueries: string[]
  searchTrends: TimeSeriesData
  popularFilters: BarChartData[]
}

export interface RealmAnalytics {
  realmId: string
  realmName: string
  metrics: MetricCard[]
  usage: UsageTrend
  performance: PerformanceMetrics
  users: UserEngagementData
  documents: DocumentAnalytics
  search: SearchAnalytics
  resources: ResourceUtilization[]
}

// Helper function to generate time series data
const generateTimeSeriesData = (
  days: number,
  baseValue: number,
  variance: number = 0.2,
  trend: number = 0
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const trendValue = baseValue + (trend * (days - i))
    const noise = (Math.random() - 0.5) * 2 * variance * baseValue
    const value = Math.max(0, Math.round(trendValue + noise))
    
    data.push({
      timestamp,
      value,
    })
  }
  
  return data
}

// Generate hourly data for recent performance
const generateHourlyData = (hours: number, baseValue: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  const now = new Date()
  
  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    const value = Math.max(0, baseValue + (Math.random() - 0.5) * baseValue * 0.3)
    
    data.push({
      timestamp,
      value: Math.round(value),
    })
  }
  
  return data
}

// Generate document type distribution
const generateDocumentTypes = (): PieChartData[] => {
  const types = [
    { name: 'PDF', baseCount: 45, color: '#ef4444' },
    { name: 'Word Documents', baseCount: 25, color: '#3b82f6' },
    { name: 'Text Files', baseCount: 15, color: '#10b981' },
    { name: 'Markdown', baseCount: 10, color: '#8b5cf6' },
    { name: 'HTML', baseCount: 3, color: '#f59e0b' },
    { name: 'Other', baseCount: 2, color: '#6b7280' },
  ]
  
  const total = types.reduce((sum, type) => sum + type.baseCount, 0)
  
  return types.map(type => ({
    name: type.name,
    value: type.baseCount + Math.floor(Math.random() * 10),
    color: type.color,
    percentage: Math.round((type.baseCount / total) * 100),
  }))
}

// Generate processing stage times
const generateProcessingStageTimes = (): BarChartData[] => {
  return [
    {
      category: 'Markdown Conversion',
      value: Math.floor(Math.random() * 5000) + 2000,
      color: '#3b82f6',
      metadata: { stage: 'markdown-conversion' },
    },
    {
      category: 'Markdown Optimizer',
      value: Math.floor(Math.random() * 15000) + 8000,
      color: '#10b981',
      metadata: { stage: 'markdown-optimizer' },
    },
    {
      category: 'Chunker',
      value: Math.floor(Math.random() * 3000) + 1000,
      color: '#f59e0b',
      metadata: { stage: 'chunker' },
    },
    {
      category: 'Fact Generator',
      value: Math.floor(Math.random() * 20000) + 10000,
      color: '#8b5cf6',
      metadata: { stage: 'fact-generator' },
    },
    {
      category: 'Ingestor',
      value: Math.floor(Math.random() * 5000) + 2000,
      color: '#ef4444',
      metadata: { stage: 'ingestor' },
    },
  ]
}

// Generate top search queries
const generateTopQueries = (): SearchAnalytics['topQueries'] => {
  const queries = [
    'customer analytics',
    'quarterly report',
    'market research',
    'user engagement',
    'revenue growth',
    'product roadmap',
    'competitor analysis',
    'sales forecast',
    'user feedback',
    'performance metrics',
  ]
  
  return queries.slice(0, 7).map(query => ({
    query,
    count: Math.floor(Math.random() * 150) + 20,
    averageRelevance: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
  }))
}

// Generate resource utilization data
const generateResourceUtilization = (): ResourceUtilization[] => {
  const resources = [
    { name: 'CPU Usage', used: 45, total: 100, status: 'healthy' as const },
    { name: 'Memory Usage', used: 78, total: 100, status: 'warning' as const },
    { name: 'Storage Usage', used: 62, total: 100, status: 'healthy' as const },
    { name: 'API Rate Limit', used: 35, total: 1000, status: 'healthy' as const },
    { name: 'Vector DB Connections', used: 8, total: 20, status: 'healthy' as const },
    { name: 'Processing Queue', used: 42, total: 50, status: 'critical' as const },
  ]
  
  return resources.map((resource, index) => ({
    resource: resource.name,
    used: resource.used + Math.floor(Math.random() * 10) - 5,
    total: resource.total,
    percentage: Math.round(((resource.used + Math.floor(Math.random() * 10) - 5) / resource.total) * 100),
    status: resource.status,
    trend: [{
      id: `resource-${index}`,
      name: resource.name,
      color: resource.status === 'critical' ? '#ef4444' : resource.status === 'warning' ? '#f59e0b' : '#10b981',
      data: generateHourlyData(24, resource.used),
    }],
  }))
}

// Generate analytics for each realm
export const mockRealmAnalytics: RealmAnalytics[] = [
  {
    realmId: '1',
    realmName: 'Marketing Realm',
    metrics: [
      {
        id: 'total-documents',
        title: 'Total Documents',
        value: 1247,
        previousValue: 1189,
        change: 4.9,
        changeType: 'positive',
        format: 'number',
        description: 'Documents uploaded this month',
        trend: 'up',
        icon: 'file-text',
      },
      {
        id: 'processing-time',
        title: 'Avg Processing Time',
        value: '2.3 min',
        previousValue: '2.8 min',
        change: -17.9,
        changeType: 'positive',
        format: 'duration',
        description: 'Average document processing time',
        trend: 'down',
        icon: 'clock',
      },
      {
        id: 'search-queries',
        title: 'Search Queries',
        value: 5832,
        previousValue: 5203,
        change: 12.1,
        changeType: 'positive',
        format: 'number',
        description: 'Searches performed this month',
        trend: 'up',
        icon: 'search',
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: 18,
        previousValue: 15,
        change: 20.0,
        changeType: 'positive',
        format: 'number',
        description: 'Monthly active users',
        trend: 'up',
        icon: 'users',
      },
      {
        id: 'success-rate',
        title: 'Success Rate',
        value: '97.8%',
        previousValue: '96.2%',
        change: 1.6,
        changeType: 'positive',
        format: 'percentage',
        description: 'Document processing success rate',
        trend: 'up',
        icon: 'check-circle',
      },
      {
        id: 'storage-used',
        title: 'Storage Used',
        value: '47.3 GB',
        previousValue: '44.1 GB',
        change: 7.3,
        changeType: 'neutral',
        format: 'bytes',
        description: 'Total storage consumed',
        trend: 'up',
        icon: 'hard-drive',
      },
    ],
    usage: {
      period: '30d',
      documentsProcessed: {
        id: 'documents-processed',
        name: 'Documents Processed',
        color: '#3b82f6',
        data: generateTimeSeriesData(30, 45, 0.3, 0.5),
      },
      searchQueries: {
        id: 'search-queries',
        name: 'Search Queries',
        color: '#10b981',
        data: generateTimeSeriesData(30, 180, 0.4, 1.0),
      },
      apiRequests: {
        id: 'api-requests',
        name: 'API Requests',
        color: '#8b5cf6',
        data: generateTimeSeriesData(30, 1200, 0.3, 2.0),
      },
      activeUsers: {
        id: 'active-users',
        name: 'Active Users',
        color: '#f59e0b',
        data: generateTimeSeriesData(30, 16, 0.25, 0.1),
      },
      storageUsage: {
        id: 'storage-usage',
        name: 'Storage Usage (GB)',
        color: '#ef4444',
        data: generateTimeSeriesData(30, 45, 0.1, 0.3),
      },
    },
    performance: {
      averageProcessingTime: 138000, // 2.3 minutes in ms
      successRate: 97.8,
      errorRate: 2.2,
      throughput: 45.2, // documents per day
      peakUsage: new Date('2024-01-05T14:30:00Z'),
      bottlenecks: ['LLM API rate limits', 'Vector database indexing'],
    },
    users: {
      dailyActiveUsers: 12,
      weeklyActiveUsers: 18,
      monthlyActiveUsers: 22,
      averageSessionTime: 45, // minutes
      topFeatures: [
        { category: 'Document Upload', value: 342, color: '#3b82f6' },
        { category: 'Search', value: 298, color: '#10b981' },
        { category: 'Analytics Dashboard', value: 156, color: '#8b5cf6' },
        { category: 'User Management', value: 89, color: '#f59e0b' },
        { category: 'Settings', value: 67, color: '#ef4444' },
      ],
      userRetention: {
        day1: 85.5,
        day7: 72.3,
        day30: 56.8,
      },
    },
    documents: {
      totalDocuments: 1247,
      processingStats: {
        completed: 1218,
        failed: 29,
        inProgress: 8,
        queued: 3,
      },
      documentTypes: generateDocumentTypes(),
      processingStageTimes: generateProcessingStageTimes(),
      errorAnalysis: [
        { category: 'File Format Error', count: 12, percentage: 41.4 },
        { category: 'Size Limit Exceeded', count: 8, percentage: 27.6 },
        { category: 'Network Timeout', count: 5, percentage: 17.2 },
        { category: 'LLM API Error', count: 4, percentage: 13.8 },
      ],
    },
    search: {
      totalQueries: 5832,
      averageResponseTime: 245, // ms
      topQueries: generateTopQueries(),
      noResultsQueries: [
        'internal metrics 2019',
        'confidential board meeting',
        'archived project alpha',
      ],
      searchTrends: {
        id: 'search-trends',
        name: 'Search Volume',
        color: '#10b981',
        data: generateTimeSeriesData(7, 180, 0.3, 0),
      },
      popularFilters: [
        { category: 'Document Type', value: 1284, color: '#3b82f6' },
        { category: 'Date Range', value: 967, color: '#10b981' },
        { category: 'Relevance Score', value: 543, color: '#8b5cf6' },
        { category: 'File Size', value: 321, color: '#f59e0b' },
      ],
    },
    resources: generateResourceUtilization(),
  },
  {
    realmId: '2',
    realmName: 'Sales Realm',
    metrics: [
      {
        id: 'total-documents',
        title: 'Total Documents',
        value: 834,
        previousValue: 798,
        change: 4.5,
        changeType: 'positive',
        format: 'number',
        description: 'Documents uploaded this month',
        trend: 'up',
        icon: 'file-text',
      },
      {
        id: 'processing-time',
        title: 'Avg Processing Time',
        value: '1.8 min',
        previousValue: '2.1 min',
        change: -14.3,
        changeType: 'positive',
        format: 'duration',
        description: 'Average document processing time',
        trend: 'down',
        icon: 'clock',
      },
      {
        id: 'search-queries',
        title: 'Search Queries',
        value: 3421,
        previousValue: 3156,
        change: 8.4,
        changeType: 'positive',
        format: 'number',
        description: 'Searches performed this month',
        trend: 'up',
        icon: 'search',
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: 12,
        previousValue: 11,
        change: 9.1,
        changeType: 'positive',
        format: 'number',
        description: 'Monthly active users',
        trend: 'up',
        icon: 'users',
      },
      {
        id: 'success-rate',
        title: 'Success Rate',
        value: '95.2%',
        previousValue: '94.8%',
        change: 0.4,
        changeType: 'positive',
        format: 'percentage',
        description: 'Document processing success rate',
        trend: 'up',
        icon: 'check-circle',
      },
      {
        id: 'storage-used',
        title: 'Storage Used',
        value: '28.7 GB',
        previousValue: '26.4 GB',
        change: 8.7,
        changeType: 'neutral',
        format: 'bytes',
        description: 'Total storage consumed',
        trend: 'up',
        icon: 'hard-drive',
      },
    ],
    usage: {
      period: '30d',
      documentsProcessed: {
        id: 'documents-processed',
        name: 'Documents Processed',
        color: '#3b82f6',
        data: generateTimeSeriesData(30, 28, 0.3, 0.2),
      },
      searchQueries: {
        id: 'search-queries',
        name: 'Search Queries',
        color: '#10b981',
        data: generateTimeSeriesData(30, 110, 0.4, 0.5),
      },
      apiRequests: {
        id: 'api-requests',
        name: 'API Requests',
        color: '#8b5cf6',
        data: generateTimeSeriesData(30, 850, 0.3, 1.2),
      },
      activeUsers: {
        id: 'active-users',
        name: 'Active Users',
        color: '#f59e0b',
        data: generateTimeSeriesData(30, 11, 0.25, 0.05),
      },
      storageUsage: {
        id: 'storage-usage',
        name: 'Storage Usage (GB)',
        color: '#ef4444',
        data: generateTimeSeriesData(30, 27, 0.1, 0.2),
      },
    },
    performance: {
      averageProcessingTime: 108000, // 1.8 minutes in ms
      successRate: 95.2,
      errorRate: 4.8,
      throughput: 28.3, // documents per day
      peakUsage: new Date('2024-01-03T16:45:00Z'),
      bottlenecks: ['File validation processing', 'CRM integration delays'],
    },
    users: {
      dailyActiveUsers: 8,
      weeklyActiveUsers: 12,
      monthlyActiveUsers: 15,
      averageSessionTime: 52, // minutes
      topFeatures: [
        { category: 'Document Upload', value: 198, color: '#3b82f6' },
        { category: 'Search', value: 176, color: '#10b981' },
        { category: 'CRM Integration', value: 134, color: '#8b5cf6' },
        { category: 'Proposal Templates', value: 89, color: '#f59e0b' },
        { category: 'Analytics Dashboard', value: 67, color: '#ef4444' },
      ],
      userRetention: {
        day1: 92.1,
        day7: 78.4,
        day30: 61.2,
      },
    },
    documents: {
      totalDocuments: 834,
      processingStats: {
        completed: 794,
        failed: 40,
        inProgress: 5,
        queued: 1,
      },
      documentTypes: generateDocumentTypes(),
      processingStageTimes: generateProcessingStageTimes(),
      errorAnalysis: [
        { category: 'CRM Integration Error', count: 18, percentage: 45.0 },
        { category: 'File Format Error', count: 12, percentage: 30.0 },
        { category: 'Network Timeout', count: 6, percentage: 15.0 },
        { category: 'Size Limit Exceeded', count: 4, percentage: 10.0 },
      ],
    },
    search: {
      totalQueries: 3421,
      averageResponseTime: 198, // ms
      topQueries: generateTopQueries(),
      noResultsQueries: [
        'competitor pricing 2019',
        'legacy customer data',
        'old proposal templates',
      ],
      searchTrends: {
        id: 'search-trends',
        name: 'Search Volume',
        color: '#10b981',
        data: generateTimeSeriesData(7, 110, 0.3, 0),
      },
      popularFilters: [
        { category: 'Customer Type', value: 892, color: '#3b82f6' },
        { category: 'Deal Stage', value: 567, color: '#10b981' },
        { category: 'Date Range', value: 434, color: '#8b5cf6' },
        { category: 'Document Type', value: 298, color: '#f59e0b' },
      ],
    },
    resources: generateResourceUtilization(),
  },
  // Add more realms as needed...
]

// Global analytics aggregating all realms
export const globalAnalytics = {
  totalRealms: 5,
  totalUsers: 28,
  totalDocuments: 3847,
  totalSearches: 12459,
  averageProcessingTime: 156000, // 2.6 minutes
  overallSuccessRate: 96.2,
  metrics: [
    {
      id: 'global-documents',
      title: 'Total Documents',
      value: 3847,
      previousValue: 3654,
      change: 5.3,
      changeType: 'positive' as const,
      format: 'number' as const,
      description: 'Documents across all realms',
      trend: 'up' as const,
      icon: 'file-text',
    },
    {
      id: 'global-realms',
      title: 'Active Realms',
      value: 5,
      previousValue: 5,
      change: 0,
      changeType: 'neutral' as const,
      format: 'number' as const,
      description: 'Currently active realms',
      trend: 'flat' as const,
      icon: 'layers',
    },
    {
      id: 'global-users',
      title: 'Total Users',
      value: 28,
      previousValue: 26,
      change: 7.7,
      changeType: 'positive' as const,
      format: 'number' as const,
      description: 'Registered users across platform',
      trend: 'up' as const,
      icon: 'users',
    },
    {
      id: 'global-success-rate',
      title: 'Success Rate',
      value: '96.2%',
      previousValue: '95.8%',
      change: 0.4,
      changeType: 'positive' as const,
      format: 'percentage' as const,
      description: 'Overall processing success rate',
      trend: 'up' as const,
      icon: 'check-circle',
    },
  ],
  realmComparison: {
    documentsProcessed: [
      { category: 'Marketing Realm', value: 1247, color: '#3b82f6' },
      { category: 'Sales Realm', value: 834, color: '#10b981' },
      { category: 'Engineering Realm', value: 1234, color: '#8b5cf6' },
      { category: 'Executive Realm', value: 298, color: '#f59e0b' },
      { category: 'Customer Support', value: 234, color: '#ef4444' },
    ],
    userActivity: [
      { category: 'Marketing Realm', value: 22, color: '#3b82f6' },
      { category: 'Sales Realm', value: 15, color: '#10b981' },
      { category: 'Engineering Realm', value: 18, color: '#8b5cf6' },
      { category: 'Executive Realm', value: 8, color: '#f59e0b' },
      { category: 'Customer Support', value: 12, color: '#ef4444' },
    ],
  },
  trends: {
    documentsOverTime: {
      id: 'global-documents-trend',
      name: 'Documents Processed',
      color: '#3b82f6',
      data: generateTimeSeriesData(90, 120, 0.3, 1.2),
    },
    usersOverTime: {
      id: 'global-users-trend',
      name: 'Active Users',
      color: '#10b981',
      data: generateTimeSeriesData(90, 25, 0.2, 0.1),
    },
    searchesOverTime: {
      id: 'global-searches-trend',
      name: 'Search Queries',
      color: '#8b5cf6',
      data: generateTimeSeriesData(90, 380, 0.4, 2.5),
    },
  },
}

// Helper functions
export const getAnalyticsByRealm = (realmId: string): RealmAnalytics | undefined => {
  return mockRealmAnalytics.find(analytics => analytics.realmId === realmId)
}

export const getMetricsByRealm = (realmId: string): MetricCard[] => {
  const analytics = getAnalyticsByRealm(realmId)
  return analytics ? analytics.metrics : []
}

export const getUsageTrendsByRealm = (realmId: string, period: UsageTrend['period']): UsageTrend | null => {
  const analytics = getAnalyticsByRealm(realmId)
  if (!analytics) return null
  
  // In a real implementation, you would filter data based on the period
  return analytics.usage
}

export const getTopPerformingRealms = (metric: 'documents' | 'users' | 'searches'): { realmId: string; realmName: string; value: number }[] => {
  return mockRealmAnalytics
    .map(analytics => ({
      realmId: analytics.realmId,
      realmName: analytics.realmName,
      value: metric === 'documents' 
        ? analytics.documents.totalDocuments
        : metric === 'users'
        ? analytics.users.monthlyActiveUsers
        : analytics.search.totalQueries,
    }))
    .sort((a, b) => b.value - a.value)
}

export const getSystemHealthMetrics = () => {
  const allResources = mockRealmAnalytics.flatMap(analytics => analytics.resources)
  const criticalResources = allResources.filter(r => r.status === 'critical').length
  const warningResources = allResources.filter(r => r.status === 'warning').length
  const healthyResources = allResources.filter(r => r.status === 'healthy').length
  
  return {
    overall: criticalResources > 0 ? 'critical' : warningResources > 0 ? 'warning' : 'healthy',
    critical: criticalResources,
    warning: warningResources,
    healthy: healthyResources,
    total: allResources.length,
  }
}

export const getDashboardSummary = () => {
  const totalDocuments = mockRealmAnalytics.reduce((sum, analytics) => sum + analytics.documents.totalDocuments, 0)
  const totalUsers = mockRealmAnalytics.reduce((sum, analytics) => sum + analytics.users.monthlyActiveUsers, 0)
  const totalSearches = mockRealmAnalytics.reduce((sum, analytics) => sum + analytics.search.totalQueries, 0)
  const avgProcessingTime = mockRealmAnalytics.reduce((sum, analytics) => sum + analytics.performance.averageProcessingTime, 0) / mockRealmAnalytics.length
  
  return {
    totalDocuments,
    totalUsers,
    totalSearches,
    averageProcessingTime: Math.round(avgProcessingTime),
    totalRealms: mockRealmAnalytics.length,
    systemHealth: getSystemHealthMetrics(),
  }
}