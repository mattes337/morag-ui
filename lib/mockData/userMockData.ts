// Comprehensive user mock data for the MoRAG platform

export type UserRole = 'system-admin' | 'realm-admin' | 'user' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type UserPreferences = {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notificationSettings: {
    email: boolean
    push: boolean
    inApp: boolean
    digest: 'daily' | 'weekly' | 'monthly' | 'never'
  }
  dashboardLayout: string[]
}

export interface UserActivity {
  id: string
  type: 'login' | 'logout' | 'document_upload' | 'search' | 'realm_switch' | 'settings_change'
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface UserStatistics {
  documentsUploaded: number
  searchesPerformed: number
  realmsAccessed: number
  lastLoginAt: Date
  totalLoginTime: number // in minutes
  averageSessionTime: number // in minutes
  documentsProcessed: number
  factsGenerated: number
}

export interface UserPermission {
  resource: string
  actions: string[]
  realmId?: string
}

export interface MockUser {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  lastLoginAt: Date
  preferences: UserPreferences
  statistics: UserStatistics
  permissions: UserPermission[]
  realms: string[] // Array of realm IDs
  recentActivity: UserActivity[]
  tags: string[]
  department?: string
  manager?: string
  bio?: string
}

// Mock user avatars from Unsplash
const avatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=64&h=64&fit=crop&crop=face',
]

// Helper function to generate recent activity
const generateRecentActivity = (userId: string, count: number = 10): UserActivity[] => {
  const activities: UserActivity[] = []
  const types: UserActivity['type'][] = ['login', 'logout', 'document_upload', 'search', 'realm_switch', 'settings_change']
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]!
    const hoursAgo = Math.floor(Math.random() * 168) // Last week
    
    let description = ''
    let metadata = {}
    
    switch (type) {
      case 'login':
        description = 'Logged into the platform'
        metadata = { device: Math.random() > 0.5 ? 'Desktop' : 'Mobile', ip: '192.168.1.' + Math.floor(Math.random() * 255) }
        break
      case 'logout':
        description = 'Logged out of the platform'
        break
      case 'document_upload':
        description = `Uploaded document "${['Marketing Report.pdf', 'Q4 Analysis.docx', 'User Guide.md', 'Sales Data.xlsx'][Math.floor(Math.random() * 4)]}"`
        metadata = { fileSize: Math.floor(Math.random() * 5000000), processingTime: Math.floor(Math.random() * 30) + 1 }
        break
      case 'search':
        description = `Searched for "${['customer analytics', 'quarterly results', 'user engagement', 'market trends'][Math.floor(Math.random() * 4)]}"`
        metadata = { resultsCount: Math.floor(Math.random() * 50) + 1, queryTime: Math.floor(Math.random() * 500) + 50 }
        break
      case 'realm_switch':
        description = `Switched to "${['Marketing Realm', 'Sales Realm', 'Engineering Realm'][Math.floor(Math.random() * 3)]}" realm`
        break
      case 'settings_change':
        description = `Updated ${['notification preferences', 'theme settings', 'language settings'][Math.floor(Math.random() * 3)]}`
        break
    }
    
    activities.push({
      id: `activity-${userId}-${i}`,
      type,
      description,
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      ...(Object.keys(metadata).length > 0 && { metadata }),
    })
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Generate comprehensive user statistics
const generateUserStatistics = (): UserStatistics => {
  const documentsUploaded = Math.floor(Math.random() * 200) + 10
  const searchesPerformed = Math.floor(Math.random() * 500) + 50
  const totalLoginTime = Math.floor(Math.random() * 10000) + 1000
  const loginSessions = Math.floor(Math.random() * 100) + 20
  
  return {
    documentsUploaded,
    searchesPerformed,
    realmsAccessed: Math.floor(Math.random() * 5) + 1,
    lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
    totalLoginTime,
    averageSessionTime: Math.floor(totalLoginTime / loginSessions),
    documentsProcessed: documentsUploaded + Math.floor(Math.random() * 50),
    factsGenerated: documentsUploaded * Math.floor(Math.random() * 100) + 50,
  }
}

// Generate user permissions based on role
const generateUserPermissions = (role: UserRole, realmIds: string[]): UserPermission[] => {
  const basePermissions: UserPermission[] = [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'search', actions: ['read', 'execute'] },
    { resource: 'profile', actions: ['read', 'update'] },
  ]
  
  if (role === 'system-admin') {
    return [
      ...basePermissions,
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'realms', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'system', actions: ['read', 'update', 'configure'] },
      { resource: 'analytics', actions: ['read', 'export'] },
      { resource: 'jobs', actions: ['read', 'cancel', 'retry'] },
    ]
  }
  
  if (role === 'realm-admin') {
    const realmPermissions = realmIds.flatMap(realmId => [
      { resource: 'documents', actions: ['create', 'read', 'update', 'delete'], realmId },
      { resource: 'users', actions: ['read', 'invite', 'remove'], realmId },
      { resource: 'settings', actions: ['read', 'update'], realmId },
      { resource: 'analytics', actions: ['read'], realmId },
    ])
    
    return [...basePermissions, ...realmPermissions]
  }
  
  if (role === 'user') {
    const realmPermissions = realmIds.flatMap(realmId => [
      { resource: 'documents', actions: ['create', 'read', 'update'], realmId },
      { resource: 'analytics', actions: ['read'], realmId },
    ])
    
    return [...basePermissions, ...realmPermissions]
  }
  
  // viewer role
  const realmPermissions = realmIds.flatMap(realmId => [
    { resource: 'documents', actions: ['read'], realmId },
  ])
  
  return [...basePermissions, ...realmPermissions]
}

// Mock users data
export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar: avatars[0],
    role: 'system-admin',
    status: 'active',
    createdAt: new Date('2023-01-15T10:00:00Z'),
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    preferences: {
      theme: 'dark',
      language: 'en-US',
      timezone: 'America/New_York',
      notificationSettings: {
        email: true,
        push: true,
        inApp: true,
        digest: 'daily',
      },
      dashboardLayout: ['stats', 'recent-documents', 'activity', 'analytics'],
    },
    statistics: {
      documentsUploaded: 150,
      searchesPerformed: 420,
      realmsAccessed: 5,
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      totalLoginTime: 8400, // 140 hours
      averageSessionTime: 84, // 1.4 hours
      documentsProcessed: 180,
      factsGenerated: 12500,
    },
    permissions: generateUserPermissions('system-admin', ['1', '2', '3', '4', '5']),
    realms: ['1', '2', '3', '4', '5'],
    recentActivity: generateRecentActivity('1', 15),
    tags: ['admin', 'technical', 'analytics'],
    department: 'Information Technology',
    manager: undefined,
    bio: 'System Administrator with 8+ years of experience in enterprise platforms and data management.',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    avatar: avatars[1]!,
    role: 'realm-admin',
    status: 'active',
    createdAt: new Date('2023-02-20T14:30:00Z'),
    lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    preferences: {
      theme: 'light',
      language: 'en-US',
      timezone: 'America/Los_Angeles',
      notificationSettings: {
        email: true,
        push: false,
        inApp: true,
        digest: 'weekly',
      },
      dashboardLayout: ['recent-documents', 'stats', 'team-activity', 'notifications'],
    },
    statistics: generateUserStatistics(),
    permissions: generateUserPermissions('realm-admin', ['1', '2']),
    realms: ['1', '2'],
    recentActivity: generateRecentActivity('2', 12),
    tags: ['marketing', 'content', 'strategy'],
    department: 'Marketing',
    manager: 'john.doe@company.com',
    bio: 'Marketing team lead focused on content strategy and customer engagement analytics.',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    avatar: avatars[2]!,
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-03-10T09:15:00Z'),
    lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    preferences: {
      theme: 'system',
      language: 'en-US',
      timezone: 'America/Chicago',
      notificationSettings: {
        email: true,
        push: true,
        inApp: true,
        digest: 'daily',
      },
      dashboardLayout: ['recent-documents', 'search', 'stats'],
    },
    statistics: generateUserStatistics(),
    permissions: generateUserPermissions('user', ['2', '3']),
    realms: ['2', '3'],
    recentActivity: generateRecentActivity('3', 8),
    tags: ['sales', 'customer-relations', 'reports'],
    department: 'Sales',
    manager: 'sarah.wilson@company.com',
    bio: 'Sales representative specializing in enterprise accounts and customer relationship management.',
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    avatar: avatars[3]!,
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-04-05T11:45:00Z'),
    lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    preferences: {
      theme: 'light',
      language: 'es-ES',
      timezone: 'Europe/Madrid',
      notificationSettings: {
        email: false,
        push: true,
        inApp: true,
        digest: 'weekly',
      },
      dashboardLayout: ['analytics', 'recent-documents', 'team-activity'],
    },
    statistics: generateUserStatistics(),
    permissions: generateUserPermissions('user', ['3', '4']),
    realms: ['3', '4'],
    recentActivity: generateRecentActivity('4', 10),
    tags: ['engineering', 'documentation', 'apis'],
    department: 'Engineering',
    manager: 'michael.chen@company.com',
    bio: 'Software engineer focused on API development and technical documentation.',
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@company.com',
    avatar: avatars[4]!,
    role: 'viewer',
    status: 'active',
    createdAt: new Date('2023-05-12T16:20:00Z'),
    lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    preferences: {
      theme: 'dark',
      language: 'ko-KR',
      timezone: 'Asia/Seoul',
      notificationSettings: {
        email: true,
        push: false,
        inApp: false,
        digest: 'monthly',
      },
      dashboardLayout: ['recent-documents', 'search'],
    },
    statistics: generateUserStatistics(),
    permissions: generateUserPermissions('viewer', ['1', '4', '5']),
    realms: ['1', '4', '5'],
    recentActivity: generateRecentActivity('5', 6),
    tags: ['executive', 'strategy', 'reports'],
    department: 'Executive',
    manager: undefined,
    bio: 'Executive team member focused on strategic planning and high-level analytics.',
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    avatar: avatars[5]!,
    role: 'user',
    status: 'pending',
    createdAt: new Date('2024-01-08T13:10:00Z'),
    lastLoginAt: new Date('2024-01-08T13:15:00Z'),
    preferences: {
      theme: 'system',
      language: 'en-US',
      timezone: 'America/Denver',
      notificationSettings: {
        email: true,
        push: true,
        inApp: true,
        digest: 'daily',
      },
      dashboardLayout: ['stats', 'recent-documents'],
    },
    statistics: {
      documentsUploaded: 0,
      searchesPerformed: 2,
      realmsAccessed: 1,
      lastLoginAt: new Date('2024-01-08T13:15:00Z'),
      totalLoginTime: 15,
      averageSessionTime: 15,
      documentsProcessed: 0,
      factsGenerated: 0,
    },
    permissions: generateUserPermissions('user', ['5']),
    realms: ['5'],
    recentActivity: generateRecentActivity('6', 3),
    tags: ['support', 'customer-service', 'new-hire'],
    department: 'Customer Support',
    manager: 'sarah.wilson@company.com',
    bio: 'New customer support representative, currently in onboarding process.',
  },
  {
    id: '7',
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    avatar: avatars[6]!,
    role: 'user',
    status: 'inactive',
    createdAt: new Date('2023-06-18T08:30:00Z'),
    lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    preferences: {
      theme: 'light',
      language: 'en-US',
      timezone: 'America/New_York',
      notificationSettings: {
        email: false,
        push: false,
        inApp: false,
        digest: 'never',
      },
      dashboardLayout: ['recent-documents', 'analytics'],
    },
    statistics: generateUserStatistics(),
    permissions: generateUserPermissions('user', ['2']),
    realms: ['2'],
    recentActivity: generateRecentActivity('7', 5),
    tags: ['former-employee', 'marketing'],
    department: 'Marketing',
    manager: 'sarah.wilson@company.com',
    bio: 'Former marketing team member, account currently inactive.',
  },
  {
    id: '8',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    avatar: avatars[7]!,
    role: 'realm-admin',
    status: 'active',
    createdAt: new Date('2023-07-22T12:00:00Z'),
    lastLoginAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    preferences: {
      theme: 'dark',
      language: 'es-ES',
      timezone: 'Europe/Madrid',
      notificationSettings: {
        email: true,
        push: true,
        inApp: true,
        digest: 'daily',
      },
      dashboardLayout: ['team-activity', 'analytics', 'recent-documents', 'notifications'],
    },
    statistics: generateUserStatistics(),
    permissions: generateUserPermissions('realm-admin', ['3', '5']),
    realms: ['3', '5'],
    recentActivity: generateRecentActivity('8', 14),
    tags: ['engineering', 'team-lead', 'architecture'],
    department: 'Engineering',
    manager: 'john.doe@company.com',
    bio: 'Engineering team lead responsible for technical architecture and development processes.',
  },
]

// Current logged-in user (matches existing mockUser)
export const currentUser: MockUser = mockUsers[0]!

// Helper functions
export const getUserById = (id: string): MockUser | undefined => {
  return mockUsers.find(user => user.id === id)
}

export const getUsersByRealm = (realmId: string): MockUser[] => {
  return mockUsers.filter(user => user.realms.includes(realmId) && user.status === 'active')
}

export const getUsersByRole = (role: UserRole): MockUser[] => {
  return mockUsers.filter(user => user.role === role)
}

export const getUsersByStatus = (status: UserStatus): MockUser[] => {
  return mockUsers.filter(user => user.status === status)
}

export const getUsersByDepartment = (department: string): MockUser[] => {
  return mockUsers.filter(user => user.department === department)
}

export const getActiveUsers = (): MockUser[] => {
  return mockUsers.filter(user => user.status === 'active')
}

export const getPendingUsers = (): MockUser[] => {
  return mockUsers.filter(user => user.status === 'pending')
}

export const getRecentlyActiveUsers = (hours: number = 24): MockUser[] => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
  return mockUsers.filter(user => user.lastLoginAt > cutoff)
}

export const getUserActivityHistory = (userId: string, limit: number = 50): UserActivity[] => {
  const user = getUserById(userId)
  return user ? user.recentActivity.slice(0, limit) : []
}

export const getUserStatsByTimeRange = (userId: string, days: number = 30) => {
  const user = getUserById(userId)
  if (!user) return null
  
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const recentActivity = user.recentActivity.filter(activity => activity.timestamp > cutoff)
  
  return {
    totalActivities: recentActivity.length,
    documentsUploaded: recentActivity.filter(a => a.type === 'document_upload').length,
    searchesPerformed: recentActivity.filter(a => a.type === 'search').length,
    loginSessions: recentActivity.filter(a => a.type === 'login').length,
    settingsChanges: recentActivity.filter(a => a.type === 'settings_change').length,
  }
}