// Comprehensive realm mock data for the MoRAG platform

export type RealmStatus = 'active' | 'inactive' | 'maintenance' | 'archived'
export type RealmTier = 'basic' | 'professional' | 'enterprise' | 'custom'
export type ProcessingMode = 'manual' | 'automatic' | 'hybrid'
export type StorageProvider = 'local' | 'aws-s3' | 'google-cloud' | 'azure-blob'
export type VectorDatabase = 'qdrant' | 'pinecone' | 'weaviate' | 'chromadb'
export type GraphDatabase = 'neo4j' | 'arangodb' | 'amazon-neptune' | 'none'

export interface RealmConfiguration {
  processing: {
    mode: ProcessingMode
    autoProcessOnUpload: boolean
    enableMarkdownOptimizer: boolean
    chunkingStrategy: 'semantic' | 'fixed' | 'hybrid'
    chunkSize: number
    chunkOverlap: number
    enableFactGeneration: boolean
    enableEntityExtraction: boolean
  }
  storage: {
    provider: StorageProvider
    maxFileSize: number // in MB
    allowedFileTypes: string[]
    retentionPolicyDays: number
    enableEncryption: boolean
  }
  vectorDb: {
    provider: VectorDatabase
    dimension: number
    indexType: string
    similarityMetric: 'cosine' | 'euclidean' | 'dot_product'
    enableFiltering: boolean
  }
  graphDb: {
    provider: GraphDatabase
    enableRelationshipExtraction: boolean
    maxRelationshipDepth: number
  }
  api: {
    rateLimitPerMinute: number
    enableWebhooks: boolean
    webhookEndpoints: string[]
    apiKeyRotationDays: number
  }
  security: {
    enableSso: boolean
    ssoProvider?: string
    mfaRequired: boolean
    sessionTimeoutMinutes: number
    enableAuditLog: boolean
    ipWhitelist: string[]
  }
}

export interface RealmQuotas {
  documentsPerMonth: number
  storageGb: number
  apiRequestsPerMonth: number
  usersLimit: number
  concurrentProcessing: number
  retentionDays: number
}

export interface RealmUsageStatistics {
  currentPeriodStart: Date
  documentsUploaded: number
  documentsProcessed: number
  totalStorageUsedMb: number
  apiRequestsThisMonth: number
  activeUsers: number
  totalUsers: number
  averageProcessingTimeMs: number
  searchQueriesThisMonth: number
  factsGenerated: number
  entitiesExtracted: number
}

export interface RealmMembership {
  userId: string
  role: 'admin' | 'user' | 'viewer'
  joinedAt: Date
  lastAccessAt: Date
  permissions: string[]
  invitedBy?: string
  status: 'active' | 'pending' | 'suspended'
}

export interface RealmIntegration {
  id: string
  name: string
  type: 'webhook' | 'api' | 'sso' | 'storage' | 'notification'
  status: 'active' | 'inactive' | 'error'
  configuredAt: Date
  lastUsedAt?: Date
  configuration: Record<string, any>
}

export interface RealmActivity {
  id: string
  type: 'user_joined' | 'user_left' | 'document_uploaded' | 'settings_changed' | 'integration_added' | 'processing_completed'
  description: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

export interface MockRealm {
  id: string
  name: string
  description: string
  status: RealmStatus
  tier: RealmTier
  createdAt: Date
  updatedAt: Date
  createdBy: string
  configuration: RealmConfiguration
  quotas: RealmQuotas
  usage: RealmUsageStatistics
  memberships: RealmMembership[]
  integrations: RealmIntegration[]
  recentActivity: RealmActivity[]
  tags: string[]
  customFields: Record<string, any>
  billingInfo?: {
    planId: string
    billingCycle: 'monthly' | 'annual'
    nextBillingDate: Date
    estimatedCost: number
  }
}

// Helper function to generate realm activity
const generateRealmActivity = (realmId: string, count: number = 10): RealmActivity[] => {
  const activities: RealmActivity[] = []
  const types: RealmActivity['type'][] = ['user_joined', 'document_uploaded', 'settings_changed', 'processing_completed', 'integration_added']
  const userIds = ['1', '2', '3', '4', '5', '6', '7', '8']
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]!
    const hoursAgo = Math.floor(Math.random() * 168) // Last week
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    
    let description = ''
    let metadata = {}
    
    switch (type) {
      case 'user_joined':
        description = 'New user joined the realm'
        metadata = { invitedBy: userIds[Math.floor(Math.random() * userIds.length)] }
        break
      case 'document_uploaded':
        description = `Document "${['Annual Report.pdf', 'Project Plan.docx', 'User Manual.md'][Math.floor(Math.random() * 3)]}" was uploaded`
        metadata = { fileSize: Math.floor(Math.random() * 50000000), processingStatus: 'completed' }
        break
      case 'settings_changed':
        description = 'Realm configuration was updated'
        metadata = { changedFields: ['processing.mode', 'security.mfaRequired'] }
        break
      case 'processing_completed':
        description = 'Document processing pipeline completed successfully'
        metadata = { documentsProcessed: Math.floor(Math.random() * 5) + 1, processingTimeMs: Math.floor(Math.random() * 30000) + 5000 }
        break
      case 'integration_added':
        description = `New integration "${['Slack', 'Microsoft Teams', 'Webhook'][Math.floor(Math.random() * 3)]}" was configured`
        metadata = { integrationType: 'notification' }
        break
    }
    
    activities.push({
      id: `activity-${realmId}-${i}`,
      type,
      description,
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      userId: type !== 'processing_completed' ? userId : undefined,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    })
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Generate realm memberships
const generateMemberships = (realmId: string, userIds: string[]): RealmMembership[] => {
  return userIds.map((userId, index) => {
    const roles: RealmMembership['role'][] = ['admin', 'user', 'viewer']
    const role = index === 0 ? 'admin' : roles[Math.floor(Math.random() * roles.length)]!
    
    return {
      userId,
      role,
      joinedAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date in last year
      lastAccessAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date in last week
      permissions: role === 'admin' 
        ? ['read', 'write', 'delete', 'manage_users', 'manage_settings']
        : role === 'user'
        ? ['read', 'write']
        : ['read'],
      invitedBy: index === 0 ? undefined : userIds[0],
      status: Math.random() > 0.1 ? 'active' : 'pending',
    }
  })
}

// Generate realm integrations
const generateIntegrations = (realmId: string): RealmIntegration[] => {
  const integrations = [
    {
      id: `int-${realmId}-slack`,
      name: 'Slack Notifications',
      type: 'notification' as const,
      status: 'active' as const,
      configuredAt: new Date('2023-11-15T10:00:00Z'),
      lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      configuration: {
        webhookUrl: 'https://hooks.slack.com/services/xxx',
        channel: '#document-alerts',
        events: ['document_processed', 'processing_failed'],
      },
    },
    {
      id: `int-${realmId}-sso`,
      name: 'Azure AD SSO',
      type: 'sso' as const,
      status: 'active' as const,
      configuredAt: new Date('2023-10-20T14:30:00Z'),
      lastUsedAt: new Date(Date.now() - 30 * 60 * 1000),
      configuration: {
        tenantId: 'xxxx-xxxx-xxxx-xxxx',
        clientId: 'yyyy-yyyy-yyyy-yyyy',
        domain: 'company.onmicrosoft.com',
      },
    },
    {
      id: `int-${realmId}-webhook`,
      name: 'Custom Webhook',
      type: 'webhook' as const,
      status: 'inactive' as const,
      configuredAt: new Date('2023-12-01T09:15:00Z'),
      configuration: {
        url: 'https://api.company.com/morag-webhook',
        secret: 'webhook-secret-key',
        events: ['document_uploaded', 'processing_completed'],
      },
    },
  ]
  
  return Math.random() > 0.3 ? integrations : integrations.slice(0, 2)
}

// Generate usage statistics
const generateUsageStats = (): RealmUsageStatistics => {
  const documentsUploaded = Math.floor(Math.random() * 500) + 50
  const documentsProcessed = Math.floor(documentsUploaded * 0.95) // 95% processing rate
  
  return {
    currentPeriodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    documentsUploaded,
    documentsProcessed,
    totalStorageUsedMb: Math.floor(Math.random() * 10000) + 1000,
    apiRequestsThisMonth: Math.floor(Math.random() * 50000) + 5000,
    activeUsers: Math.floor(Math.random() * 20) + 5,
    totalUsers: Math.floor(Math.random() * 30) + 10,
    averageProcessingTimeMs: Math.floor(Math.random() * 15000) + 5000,
    searchQueriesThisMonth: Math.floor(Math.random() * 1000) + 100,
    factsGenerated: documentsProcessed * Math.floor(Math.random() * 50) + 25,
    entitiesExtracted: documentsProcessed * Math.floor(Math.random() * 100) + 50,
  }
}

// Mock realms data
export const mockRealms: MockRealm[] = [
  {
    id: '1',
    name: 'Marketing Realm',
    description: 'Marketing team workspace with comprehensive campaign and content analysis',
    status: 'active',
    tier: 'professional',
    createdAt: new Date('2023-08-15T10:00:00Z'),
    updatedAt: new Date('2024-01-05T14:30:00Z'),
    createdBy: '1',
    configuration: {
      processing: {
        mode: 'automatic',
        autoProcessOnUpload: true,
        enableMarkdownOptimizer: true,
        chunkingStrategy: 'semantic',
        chunkSize: 1000,
        chunkOverlap: 200,
        enableFactGeneration: true,
        enableEntityExtraction: true,
      },
      storage: {
        provider: 'aws-s3',
        maxFileSize: 100,
        allowedFileTypes: ['pdf', 'docx', 'txt', 'md', 'html', 'jpg', 'png'],
        retentionPolicyDays: 730,
        enableEncryption: true,
      },
      vectorDb: {
        provider: 'qdrant',
        dimension: 1536,
        indexType: 'HNSW',
        similarityMetric: 'cosine',
        enableFiltering: true,
      },
      graphDb: {
        provider: 'neo4j',
        enableRelationshipExtraction: true,
        maxRelationshipDepth: 5,
      },
      api: {
        rateLimitPerMinute: 1000,
        enableWebhooks: true,
        webhookEndpoints: ['https://marketing.company.com/webhook'],
        apiKeyRotationDays: 90,
      },
      security: {
        enableSso: true,
        ssoProvider: 'azure-ad',
        mfaRequired: false,
        sessionTimeoutMinutes: 480,
        enableAuditLog: true,
        ipWhitelist: [],
      },
    },
    quotas: {
      documentsPerMonth: 1000,
      storageGb: 100,
      apiRequestsPerMonth: 100000,
      usersLimit: 25,
      concurrentProcessing: 5,
      retentionDays: 730,
    },
    usage: generateUsageStats(),
    memberships: generateMemberships('1', ['1', '2', '3', '6']),
    integrations: generateIntegrations('1'),
    recentActivity: generateRealmActivity('1', 15),
    tags: ['marketing', 'campaigns', 'content', 'analytics'],
    customFields: {
      primaryContact: 'sarah.wilson@company.com',
      businessUnit: 'Growth',
      costCenter: 'MKT-001',
    },
    billingInfo: {
      planId: 'prof-monthly',
      billingCycle: 'monthly',
      nextBillingDate: new Date('2024-02-01T00:00:00Z'),
      estimatedCost: 299.99,
    },
  },
  {
    id: '2',
    name: 'Sales Realm',
    description: 'Sales team collaboration space for customer data and proposal management',
    status: 'active',
    tier: 'professional',
    createdAt: new Date('2023-09-01T12:00:00Z'),
    updatedAt: new Date('2024-01-03T16:45:00Z'),
    createdBy: '2',
    configuration: {
      processing: {
        mode: 'hybrid',
        autoProcessOnUpload: false,
        enableMarkdownOptimizer: false,
        chunkingStrategy: 'fixed',
        chunkSize: 800,
        chunkOverlap: 100,
        enableFactGeneration: true,
        enableEntityExtraction: true,
      },
      storage: {
        provider: 'google-cloud',
        maxFileSize: 50,
        allowedFileTypes: ['pdf', 'docx', 'xlsx', 'pptx', 'txt'],
        retentionPolicyDays: 365,
        enableEncryption: true,
      },
      vectorDb: {
        provider: 'pinecone',
        dimension: 1536,
        indexType: 'default',
        similarityMetric: 'cosine',
        enableFiltering: true,
      },
      graphDb: {
        provider: 'none',
        enableRelationshipExtraction: false,
        maxRelationshipDepth: 0,
      },
      api: {
        rateLimitPerMinute: 500,
        enableWebhooks: false,
        webhookEndpoints: [],
        apiKeyRotationDays: 60,
      },
      security: {
        enableSso: true,
        ssoProvider: 'azure-ad',
        mfaRequired: true,
        sessionTimeoutMinutes: 240,
        enableAuditLog: true,
        ipWhitelist: ['192.168.1.0/24'],
      },
    },
    quotas: {
      documentsPerMonth: 500,
      storageGb: 50,
      apiRequestsPerMonth: 50000,
      usersLimit: 15,
      concurrentProcessing: 3,
      retentionDays: 365,
    },
    usage: generateUsageStats(),
    memberships: generateMemberships('2', ['2', '3', '7']),
    integrations: generateIntegrations('2').filter(i => i.type !== 'webhook'),
    recentActivity: generateRealmActivity('2', 12),
    tags: ['sales', 'crm', 'proposals', 'customer-data'],
    customFields: {
      primaryContact: 'michael.chen@company.com',
      businessUnit: 'Revenue',
      costCenter: 'SAL-001',
      crmIntegration: 'salesforce',
    },
    billingInfo: {
      planId: 'prof-annual',
      billingCycle: 'annual',
      nextBillingDate: new Date('2024-09-01T00:00:00Z'),
      estimatedCost: 2999.99,
    },
  },
  {
    id: '3',
    name: 'Engineering Realm',
    description: 'Engineering documentation and technical knowledge base',
    status: 'active',
    tier: 'enterprise',
    createdAt: new Date('2023-07-10T08:30:00Z'),
    updatedAt: new Date('2024-01-08T11:20:00Z'),
    createdBy: '8',
    configuration: {
      processing: {
        mode: 'manual',
        autoProcessOnUpload: false,
        enableMarkdownOptimizer: true,
        chunkingStrategy: 'semantic',
        chunkSize: 1500,
        chunkOverlap: 300,
        enableFactGeneration: true,
        enableEntityExtraction: true,
      },
      storage: {
        provider: 'aws-s3',
        maxFileSize: 200,
        allowedFileTypes: ['pdf', 'md', 'txt', 'docx', 'html', 'json', 'yaml', 'xml'],
        retentionPolicyDays: 1095, // 3 years
        enableEncryption: true,
      },
      vectorDb: {
        provider: 'weaviate',
        dimension: 1536,
        indexType: 'HNSW',
        similarityMetric: 'cosine',
        enableFiltering: true,
      },
      graphDb: {
        provider: 'neo4j',
        enableRelationshipExtraction: true,
        maxRelationshipDepth: 8,
      },
      api: {
        rateLimitPerMinute: 2000,
        enableWebhooks: true,
        webhookEndpoints: ['https://eng.company.com/morag-webhook', 'https://ci.company.com/webhook'],
        apiKeyRotationDays: 30,
      },
      security: {
        enableSso: true,
        ssoProvider: 'okta',
        mfaRequired: true,
        sessionTimeoutMinutes: 120,
        enableAuditLog: true,
        ipWhitelist: ['10.0.0.0/8', '172.16.0.0/12'],
      },
    },
    quotas: {
      documentsPerMonth: 2000,
      storageGb: 500,
      apiRequestsPerMonth: 200000,
      usersLimit: 50,
      concurrentProcessing: 10,
      retentionDays: 1095,
    },
    usage: generateUsageStats(),
    memberships: generateMemberships('3', ['1', '4', '8']),
    integrations: generateIntegrations('3'),
    recentActivity: generateRealmActivity('3', 20),
    tags: ['engineering', 'documentation', 'apis', 'technical', 'architecture'],
    customFields: {
      primaryContact: 'maria.garcia@company.com',
      businessUnit: 'Technology',
      costCenter: 'ENG-001',
      gitlabIntegration: true,
      jiraIntegration: true,
    },
    billingInfo: {
      planId: 'ent-annual',
      billingCycle: 'annual',
      nextBillingDate: new Date('2024-07-10T00:00:00Z'),
      estimatedCost: 9999.99,
    },
  },
  {
    id: '4',
    name: 'Executive Realm',
    description: 'Executive team strategic planning and high-level analytics',
    status: 'active',
    tier: 'enterprise',
    createdAt: new Date('2023-06-01T15:00:00Z'),
    updatedAt: new Date('2023-12-20T09:30:00Z'),
    createdBy: '1',
    configuration: {
      processing: {
        mode: 'automatic',
        autoProcessOnUpload: true,
        enableMarkdownOptimizer: false,
        chunkingStrategy: 'hybrid',
        chunkSize: 1200,
        chunkOverlap: 150,
        enableFactGeneration: true,
        enableEntityExtraction: true,
      },
      storage: {
        provider: 'azure-blob',
        maxFileSize: 150,
        allowedFileTypes: ['pdf', 'docx', 'pptx', 'xlsx'],
        retentionPolicyDays: 2190, // 6 years
        enableEncryption: true,
      },
      vectorDb: {
        provider: 'qdrant',
        dimension: 1536,
        indexType: 'HNSW',
        similarityMetric: 'cosine',
        enableFiltering: true,
      },
      graphDb: {
        provider: 'amazon-neptune',
        enableRelationshipExtraction: true,
        maxRelationshipDepth: 3,
      },
      api: {
        rateLimitPerMinute: 200,
        enableWebhooks: false,
        webhookEndpoints: [],
        apiKeyRotationDays: 14,
      },
      security: {
        enableSso: true,
        ssoProvider: 'azure-ad',
        mfaRequired: true,
        sessionTimeoutMinutes: 60,
        enableAuditLog: true,
        ipWhitelist: ['203.0.113.0/24'],
      },
    },
    quotas: {
      documentsPerMonth: 200,
      storageGb: 100,
      apiRequestsPerMonth: 10000,
      usersLimit: 10,
      concurrentProcessing: 2,
      retentionDays: 2190,
    },
    usage: generateUsageStats(),
    memberships: generateMemberships('4', ['1', '5']),
    integrations: generateIntegrations('4').filter(i => i.type === 'sso'),
    recentActivity: generateRealmActivity('4', 8),
    tags: ['executive', 'strategy', 'confidential', 'board'],
    customFields: {
      primaryContact: 'john.doe@company.com',
      businessUnit: 'Executive',
      costCenter: 'EXE-001',
      confidentialityLevel: 'high',
    },
    billingInfo: {
      planId: 'ent-custom',
      billingCycle: 'annual',
      nextBillingDate: new Date('2024-06-01T00:00:00Z'),
      estimatedCost: 15999.99,
    },
  },
  {
    id: '5',
    name: 'Customer Support',
    description: 'Support team knowledge base and customer interaction data',
    status: 'active',
    tier: 'basic',
    createdAt: new Date('2023-10-15T13:45:00Z'),
    updatedAt: new Date('2024-01-02T10:15:00Z'),
    createdBy: '6',
    configuration: {
      processing: {
        mode: 'automatic',
        autoProcessOnUpload: true,
        enableMarkdownOptimizer: false,
        chunkingStrategy: 'fixed',
        chunkSize: 600,
        chunkOverlap: 50,
        enableFactGeneration: false,
        enableEntityExtraction: true,
      },
      storage: {
        provider: 'local',
        maxFileSize: 25,
        allowedFileTypes: ['pdf', 'txt', 'docx', 'html'],
        retentionPolicyDays: 180,
        enableEncryption: false,
      },
      vectorDb: {
        provider: 'chromadb',
        dimension: 768,
        indexType: 'default',
        similarityMetric: 'cosine',
        enableFiltering: false,
      },
      graphDb: {
        provider: 'none',
        enableRelationshipExtraction: false,
        maxRelationshipDepth: 0,
      },
      api: {
        rateLimitPerMinute: 100,
        enableWebhooks: false,
        webhookEndpoints: [],
        apiKeyRotationDays: 180,
      },
      security: {
        enableSso: false,
        mfaRequired: false,
        sessionTimeoutMinutes: 360,
        enableAuditLog: false,
        ipWhitelist: [],
      },
    },
    quotas: {
      documentsPerMonth: 100,
      storageGb: 10,
      apiRequestsPerMonth: 5000,
      usersLimit: 8,
      concurrentProcessing: 1,
      retentionDays: 180,
    },
    usage: generateUsageStats(),
    memberships: generateMemberships('5', ['6', '8']),
    integrations: [],
    recentActivity: generateRealmActivity('5', 6),
    tags: ['support', 'customer-service', 'knowledge-base'],
    customFields: {
      primaryContact: 'lisa.thompson@company.com',
      businessUnit: 'Customer Success',
      costCenter: 'SUP-001',
      ticketSystemIntegration: 'zendesk',
    },
    billingInfo: {
      planId: 'basic-monthly',
      billingCycle: 'monthly',
      nextBillingDate: new Date('2024-02-15T00:00:00Z'),
      estimatedCost: 99.99,
    },
  },
]

// Helper functions
export const getRealmById = (id: string): MockRealm | undefined => {
  return mockRealms.find(realm => realm.id === id)
}

export const getRealmsByStatus = (status: RealmStatus): MockRealm[] => {
  return mockRealms.filter(realm => realm.status === status)
}

export const getRealmsByTier = (tier: RealmTier): MockRealm[] => {
  return mockRealms.filter(realm => realm.tier === tier)
}

export const getRealmsByUser = (userId: string): MockRealm[] => {
  return mockRealms.filter(realm => 
    realm.memberships.some(membership => 
      membership.userId === userId && membership.status === 'active'
    )
  )
}

export const getUserRoleInRealm = (realmId: string, userId: string): string | null => {
  const realm = getRealmById(realmId)
  if (!realm) return null
  
  const membership = realm.memberships.find(m => m.userId === userId && m.status === 'active')
  return membership ? membership.role : null
}

export const getActiveRealms = (): MockRealm[] => {
  return mockRealms.filter(realm => realm.status === 'active')
}

export const getRealmActivity = (realmId: string, limit: number = 20): RealmActivity[] => {
  const realm = getRealmById(realmId)
  return realm ? realm.recentActivity.slice(0, limit) : []
}

export const getRealmUsageSummary = (realmId: string) => {
  const realm = getRealmById(realmId)
  if (!realm) return null
  
  const usage = realm.usage
  const quotas = realm.quotas
  
  return {
    documentsUsage: {
      used: usage.documentsUploaded,
      limit: quotas.documentsPerMonth,
      percentage: Math.round((usage.documentsUploaded / quotas.documentsPerMonth) * 100),
    },
    storageUsage: {
      used: Math.round(usage.totalStorageUsedMb / 1024 * 100) / 100, // Convert to GB
      limit: quotas.storageGb,
      percentage: Math.round((usage.totalStorageUsedMb / 1024 / quotas.storageGb) * 100),
    },
    apiUsage: {
      used: usage.apiRequestsThisMonth,
      limit: quotas.apiRequestsPerMonth,
      percentage: Math.round((usage.apiRequestsThisMonth / quotas.apiRequestsPerMonth) * 100),
    },
    usersUsage: {
      used: usage.totalUsers,
      limit: quotas.usersLimit,
      percentage: Math.round((usage.totalUsers / quotas.usersLimit) * 100),
    },
  }
}

export const getRealmIntegrationsByType = (realmId: string, type: RealmIntegration['type']): RealmIntegration[] => {
  const realm = getRealmById(realmId)
  return realm ? realm.integrations.filter(integration => integration.type === type) : []
}

export const getRealmMembershipStats = (realmId: string) => {
  const realm = getRealmById(realmId)
  if (!realm) return null
  
  const memberships = realm.memberships
  const activeMembers = memberships.filter(m => m.status === 'active')
  const pendingMembers = memberships.filter(m => m.status === 'pending')
  
  return {
    total: memberships.length,
    active: activeMembers.length,
    pending: pendingMembers.length,
    suspended: memberships.filter(m => m.status === 'suspended').length,
    adminCount: activeMembers.filter(m => m.role === 'admin').length,
    userCount: activeMembers.filter(m => m.role === 'user').length,
    viewerCount: activeMembers.filter(m => m.role === 'viewer').length,
  }
}

// Current active realm (matches existing mockCurrentRealm)
export const currentRealm: MockRealm = mockRealms[0]!