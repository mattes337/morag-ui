/**
 * User Settings Mock Data
 * Provides realistic mock data for user profile, account settings, 
 * notifications, and API key management
 */

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  avatar: string;
  timezone: string;
  language: string;
  activityStatus: 'online' | 'away' | 'busy' | 'offline';
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  location: string;
  jobTitle: string;
  department: string;
  phoneNumber: string;
  createdAt: string;
  lastLoginAt: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface AccountSecurity {
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  backupCodesGenerated: boolean;
  loginAttempts: Array<{
    id: string;
    timestamp: string;
    ipAddress: string;
    location: string;
    device: string;
    browser: string;
    successful: boolean;
  }>;
  activeSessions: Array<{
    id: string;
    device: string;
    browser: string;
    ipAddress: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
  recoveryEmail?: string;
  securityQuestions: Array<{
    question: string;
    answered: boolean;
  }>;
}

export interface NotificationPreferences {
  email: {
    documentProcessingComplete: boolean;
    documentProcessingFailed: boolean;
    newDocumentShared: boolean;
    realmInvitations: boolean;
    systemMaintenance: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
    monthlyReport: boolean;
  };
  inApp: {
    documentUpdates: boolean;
    collaborationRequests: boolean;
    systemNotifications: boolean;
    jobStatusUpdates: boolean;
    errorAlerts: boolean;
  };
  push: {
    enabled: boolean;
    criticalOnly: boolean;
  };
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
}

export interface APIKey {
  id: string;
  name: string;
  key: string; // Usually masked in display
  keyPreview: string; // First few and last few chars
  permissions: string[];
  usageStats: {
    totalRequests: number;
    requestsThisMonth: number;
    lastUsed: string | null;
    averageRequestsPerDay: number;
  };
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
    currentHourlyUsage: number;
    currentDailyUsage: number;
  };
  createdAt: string;
  expiresAt: string | null;
  status: 'active' | 'expired' | 'revoked';
  ipRestrictions: string[];
  scopes: string[];
}

export interface UserDataExport {
  requestedAt: string;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  downloadUrl?: string;
  expiresAt?: string;
  format: 'json' | 'csv' | 'xml';
  includeDocuments: boolean;
  includeAnalytics: boolean;
  includeActivityLogs: boolean;
  fileSizeEstimate: string;
}

// Mock user profile data
export const mockUserProfile: UserProfile = {
  id: 'user_001',
  email: 'sarah.johnson@company.com',
  username: 'sarah.johnson',
  firstName: 'Sarah',
  lastName: 'Johnson',
  displayName: 'Sarah Johnson',
  bio: 'Senior Technical Writer specializing in AI and machine learning documentation. Passionate about making complex technical concepts accessible.',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e2c8?w=100&h=100&fit=crop&crop=face',
  timezone: 'America/New_York',
  language: 'en-US',
  activityStatus: 'online',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    github: 'https://github.com/sarahj',
    twitter: 'https://twitter.com/sarahj_writes',
    website: 'https://sarahjohnson.dev'
  },
  location: 'New York, NY',
  jobTitle: 'Senior Technical Writer',
  department: 'Documentation Team',
  phoneNumber: '+1 (555) 123-4567',
  createdAt: '2023-01-15T10:30:00Z',
  lastLoginAt: '2024-01-10T14:22:00Z',
  isEmailVerified: true,
  isPhoneVerified: false
};

// Mock account security data
export const mockAccountSecurity: AccountSecurity = {
  lastPasswordChange: '2024-01-05T09:15:00Z',
  twoFactorEnabled: true,
  backupCodesGenerated: true,
  recoveryEmail: 's.johnson.recovery@gmail.com',
  securityQuestions: [
    { question: 'What was the name of your first pet?', answered: true },
    { question: 'In what city were you born?', answered: true },
    { question: 'What is your mother\'s maiden name?', answered: false }
  ],
  loginAttempts: [
    {
      id: 'attempt_001',
      timestamp: '2024-01-10T14:22:00Z',
      ipAddress: '192.168.1.100',
      location: 'New York, NY, US',
      device: 'Desktop',
      browser: 'Chrome 120.0',
      successful: true
    },
    {
      id: 'attempt_002',
      timestamp: '2024-01-10T09:45:00Z',
      ipAddress: '10.0.1.50',
      location: 'New York, NY, US',
      device: 'Mobile',
      browser: 'Safari 17.1',
      successful: true
    },
    {
      id: 'attempt_003',
      timestamp: '2024-01-09T16:30:00Z',
      ipAddress: '203.0.113.0',
      location: 'Unknown',
      device: 'Desktop',
      browser: 'Firefox 121.0',
      successful: false
    }
  ],
  activeSessions: [
    {
      id: 'session_001',
      device: 'Desktop - Windows 11',
      browser: 'Chrome 120.0.6099.234',
      ipAddress: '192.168.1.100',
      location: 'New York, NY, US',
      lastActive: '2024-01-10T14:22:00Z',
      current: true
    },
    {
      id: 'session_002',
      device: 'iPhone 15 Pro',
      browser: 'Safari 17.1.2',
      ipAddress: '10.0.1.50',
      location: 'New York, NY, US',
      lastActive: '2024-01-10T09:45:00Z',
      current: false
    }
  ]
};

// Mock notification preferences
export const mockNotificationPreferences: NotificationPreferences = {
  email: {
    documentProcessingComplete: true,
    documentProcessingFailed: true,
    newDocumentShared: true,
    realmInvitations: true,
    systemMaintenance: false,
    securityAlerts: true,
    weeklyDigest: true,
    monthlyReport: false
  },
  inApp: {
    documentUpdates: true,
    collaborationRequests: true,
    systemNotifications: true,
    jobStatusUpdates: true,
    errorAlerts: true
  },
  push: {
    enabled: true,
    criticalOnly: false
  },
  digestFrequency: 'weekly',
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York'
  }
};

// Mock API keys
export const mockApiKeys: APIKey[] = [
  {
    id: 'key_001',
    name: 'Production Integration',
    key: 'mk_live_1234567890abcdef1234567890abcdef',
    keyPreview: 'mk_live_12...cdef',
    permissions: ['documents:read', 'documents:write', 'analytics:read'],
    usageStats: {
      totalRequests: 15420,
      requestsThisMonth: 2103,
      lastUsed: '2024-01-10T13:45:00Z',
      averageRequestsPerDay: 68
    },
    rateLimit: {
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      currentHourlyUsage: 45,
      currentDailyUsage: 532
    },
    createdAt: '2023-06-15T10:30:00Z',
    expiresAt: '2024-06-15T10:30:00Z',
    status: 'active',
    ipRestrictions: ['192.168.1.0/24', '10.0.0.0/8'],
    scopes: ['read', 'write']
  },
  {
    id: 'key_002',
    name: 'Development Testing',
    key: 'mk_test_abcdef1234567890abcdef1234567890',
    keyPreview: 'mk_test_ab...7890',
    permissions: ['documents:read', 'analytics:read'],
    usageStats: {
      totalRequests: 892,
      requestsThisMonth: 156,
      lastUsed: '2024-01-09T16:22:00Z',
      averageRequestsPerDay: 5
    },
    rateLimit: {
      requestsPerHour: 100,
      requestsPerDay: 1000,
      currentHourlyUsage: 3,
      currentDailyUsage: 12
    },
    createdAt: '2023-12-01T14:20:00Z',
    expiresAt: null,
    status: 'active',
    ipRestrictions: [],
    scopes: ['read']
  },
  {
    id: 'key_003',
    name: 'Legacy Analytics',
    key: 'mk_live_xyz789xyz789xyz789xyz789xyz789',
    keyPreview: 'mk_live_xy...x789',
    permissions: ['analytics:read'],
    usageStats: {
      totalRequests: 45823,
      requestsThisMonth: 0,
      lastUsed: '2023-11-30T23:59:00Z',
      averageRequestsPerDay: 0
    },
    rateLimit: {
      requestsPerHour: 500,
      requestsPerDay: 5000,
      currentHourlyUsage: 0,
      currentDailyUsage: 0
    },
    createdAt: '2023-03-10T08:15:00Z',
    expiresAt: '2023-12-31T23:59:59Z',
    status: 'expired',
    ipRestrictions: [],
    scopes: ['read']
  }
];

// Mock data export requests
export const mockDataExports: UserDataExport[] = [
  {
    requestedAt: '2024-01-05T10:30:00Z',
    status: 'ready',
    downloadUrl: '/api/exports/user-data-20240105.json',
    expiresAt: '2024-01-12T10:30:00Z',
    format: 'json',
    includeDocuments: true,
    includeAnalytics: true,
    includeActivityLogs: false,
    fileSizeEstimate: '2.4 MB'
  },
  {
    requestedAt: '2024-01-08T14:22:00Z',
    status: 'processing',
    format: 'csv',
    includeDocuments: false,
    includeAnalytics: true,
    includeActivityLogs: true,
    fileSizeEstimate: '850 KB'
  }
];

// Password validation rules
export const passwordValidationRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  commonPasswords: [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ]
};

// Available timezones
export const availableTimezones = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London, Dublin' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Madrid' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Seoul' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
  { value: 'Asia/Kolkata', label: 'Mumbai, Delhi, Kolkata' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne' },
  { value: 'Pacific/Auckland', label: 'Auckland' }
];

// Available languages
export const availableLanguages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'it-IT', label: 'Italiano' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'ru-RU', label: 'Русский' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'ko-KR', label: '한국어' },
  { value: 'zh-CN', label: '中文 (简体)' },
  { value: 'zh-TW', label: '中文 (繁體)' }
];

// Available API permissions
export const availableApiPermissions = [
  { value: 'documents:read', label: 'Read Documents', description: 'View and search documents' },
  { value: 'documents:write', label: 'Write Documents', description: 'Create, update, and delete documents' },
  { value: 'documents:process', label: 'Process Documents', description: 'Execute processing pipelines' },
  { value: 'analytics:read', label: 'Read Analytics', description: 'View analytics and reports' },
  { value: 'realms:read', label: 'Read Realms', description: 'View realm information' },
  { value: 'realms:write', label: 'Manage Realms', description: 'Create and manage realms' },
  { value: 'users:read', label: 'Read Users', description: 'View user information' },
  { value: 'admin:all', label: 'Admin Access', description: 'Full administrative access' }
];