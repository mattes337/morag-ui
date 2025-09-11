/**
 * Notifications mock data with 200+ entries with different types and priorities
 * Task C1: Advanced Mock Data Expansion
 */

export interface Notification {
  id: string;
  userId: string;
  realmId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata: NotificationMetadata;
  relatedEntityType?: string;
  relatedEntityId?: string;
  channels: NotificationChannel[];
  isSticky: boolean;
  groupId?: string;
  tags: string[];
  source: NotificationSource;
  recipientCount?: number;
  deliveryStatus: DeliveryStatus[];
}

export type NotificationType = 
  | 'system'
  | 'processing'
  | 'collaboration'
  | 'security'
  | 'maintenance'
  | 'reminder'
  | 'warning'
  | 'error'
  | 'success'
  | 'info'
  | 'marketing'
  | 'update';

export type NotificationCategory = 
  | 'document'
  | 'job'
  | 'user'
  | 'realm'
  | 'system'
  | 'integration'
  | 'billing'
  | 'compliance'
  | 'performance'
  | 'feature';

export type NotificationPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'urgent' 
  | 'critical';

export type NotificationStatus = 
  | 'unread' 
  | 'read' 
  | 'dismissed' 
  | 'archived' 
  | 'failed';

export type NotificationChannel = 
  | 'in-app' 
  | 'email' 
  | 'push' 
  | 'sms' 
  | 'webhook' 
  | 'slack' 
  | 'teams';

export type NotificationSource = 
  | 'system' 
  | 'user' 
  | 'api' 
  | 'webhook' 
  | 'scheduled' 
  | 'external';

export interface NotificationMetadata {
  icon?: string;
  color?: string;
  image?: string;
  data?: Record<string, any>;
  template?: string;
  variables?: Record<string, string>;
  tracking?: {
    campaignId?: string;
    source?: string;
    medium?: string;
  };
}

export interface DeliveryStatus {
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  timestamp: Date;
  error?: string;
  attempts: number;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    [K in NotificationChannel]: {
      enabled: boolean;
      types: NotificationType[];
      priorities: NotificationPriority[];
      quietHours?: {
        start: string;
        end: string;
        timezone: string;
      };
    };
  };
  frequency: {
    immediate: NotificationType[];
    hourly: NotificationType[];
    daily: NotificationType[];
    weekly: NotificationType[];
    never: NotificationType[];
  };
  grouping: boolean;
  autoMarkAsRead: boolean;
  maxRetentionDays: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  variables: string[];
  channels: NotificationChannel[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generate comprehensive notifications dataset
function generateNotifications(): Notification[] {
  const notifications: Notification[] = [];
  
  // Sample users (should match team members)
  const userIds = Array.from({ length: 60 }, (_, i) => `user-${(i + 1).toString().padStart(3, '0')}`);
  const realmIds = ['realm-1', 'realm-2', 'realm-3', 'realm-4', 'realm-5', 'realm-6', 'realm-7', 'realm-8'];
  
  const notificationTypes: NotificationType[] = [
    'system', 'processing', 'collaboration', 'security', 'maintenance', 
    'reminder', 'warning', 'error', 'success', 'info', 'marketing', 'update'
  ];
  
  const categories: NotificationCategory[] = [
    'document', 'job', 'user', 'realm', 'system', 'integration', 
    'billing', 'compliance', 'performance', 'feature'
  ];
  
  const priorities: NotificationPriority[] = ['low', 'medium', 'high', 'urgent', 'critical'];
  const statuses: NotificationStatus[] = ['unread', 'read', 'dismissed', 'archived'];
  const channels: NotificationChannel[] = ['in-app', 'email', 'push', 'sms', 'webhook', 'slack', 'teams'];
  const sources: NotificationSource[] = ['system', 'user', 'api', 'webhook', 'scheduled', 'external'];
  
  // Notification templates by type and category
  const notificationTemplates = {
    system: {
      system: [
        { title: 'System Maintenance Scheduled', message: 'Scheduled maintenance will occur on {date} from {startTime} to {endTime}. Service may be temporarily unavailable.' },
        { title: 'System Update Available', message: 'A new system update (v{version}) is available with new features and improvements.' },
        { title: 'Database Backup Completed', message: 'Automated database backup completed successfully at {timestamp}.' },
        { title: 'Storage Limit Warning', message: 'Your realm storage is {percentage}% full. Consider archiving old documents or upgrading your plan.' }
      ],
      performance: [
        { title: 'High CPU Usage Detected', message: 'System CPU usage has exceeded {threshold}% for the past {duration} minutes.' },
        { title: 'Memory Usage Alert', message: 'Memory usage is at {percentage}% capacity. System performance may be affected.' },
        { title: 'Response Time Degradation', message: 'Average response time has increased to {responseTime}ms over the past hour.' }
      ]
    },
    processing: {
      document: [
        { title: 'Document Processing Complete', message: 'Document "{documentName}" has been successfully processed and is now available for search.' },
        { title: 'Document Processing Failed', message: 'Processing failed for document "{documentName}". Error: {errorMessage}' },
        { title: 'Large Document Queue', message: 'You have {count} documents queued for processing. Estimated completion time: {eta}' },
        { title: 'Processing Stage Update', message: 'Document "{documentName}" is now in {stage} stage ({progress}% complete).' }
      ],
      job: [
        { title: 'Bulk Processing Started', message: 'Bulk processing job for {count} documents has been initiated. Job ID: {jobId}' },
        { title: 'Job Completed Successfully', message: 'Job "{jobName}" completed successfully. Processed {count} items in {duration}.' },
        { title: 'Job Failed', message: 'Job "{jobName}" failed after {attempts} attempts. Last error: {error}' },
        { title: 'Long Running Job', message: 'Job "{jobName}" has been running for {duration}. Expected completion: {eta}' }
      ]
    },
    collaboration: {
      document: [
        { title: 'Document Shared With You', message: '{userName} shared document "{documentName}" with you.' },
        { title: 'New Comment on Document', message: '{userName} added a comment to "{documentName}": {comment}' },
        { title: 'Document Version Updated', message: '{userName} uploaded a new version of "{documentName}".' },
        { title: 'Permission Changed', message: 'Your permission level for "{documentName}" has been changed to {permission}.' }
      ],
      user: [
        { title: 'New Team Member', message: '{userName} has joined the {realmName} realm as a {role}.' },
        { title: 'User Mention', message: '{userName} mentioned you in a comment on "{documentName}".' },
        { title: 'Collaboration Invitation', message: 'You\'ve been invited to collaborate on project "{projectName}" by {userName}.' }
      ]
    },
    security: {
      user: [
        { title: 'New Login Detected', message: 'New login from {location} at {timestamp}. IP: {ipAddress}' },
        { title: 'Suspicious Activity', message: 'Unusual access pattern detected on your account. Please review your recent activity.' },
        { title: 'Password Changed', message: 'Your password was successfully changed at {timestamp}.' },
        { title: 'API Key Created', message: 'New API key "{keyName}" was created for your account.' }
      ],
      system: [
        { title: 'Security Scan Complete', message: 'Automated security scan completed. {issuesCount} issues found and resolved.' },
        { title: 'Failed Login Attempts', message: '{attempts} failed login attempts detected for user {userName} from {ipAddress}.' }
      ]
    },
    reminder: {
      document: [
        { title: 'Document Review Due', message: 'Document "{documentName}" is due for review on {dueDate}.' },
        { title: 'Document Expiry Warning', message: 'Document "{documentName}" will expire on {expiryDate}.' },
        { title: 'Unused Documents', message: 'You have {count} documents that haven\'t been accessed in {days} days.' }
      ],
      compliance: [
        { title: 'Compliance Report Due', message: 'Monthly compliance report for {realmName} is due on {dueDate}.' },
        { title: 'Audit Trail Review', message: 'Quarterly audit trail review is scheduled for {date}.' }
      ]
    },
    success: {
      integration: [
        { title: 'Integration Connected', message: 'Successfully connected to {serviceName}. Data sync is now active.' },
        { title: 'API Sync Complete', message: 'Synchronization with {serviceName} completed successfully. {count} items updated.' }
      ],
      billing: [
        { title: 'Payment Successful', message: 'Your payment of ${amount} for {planName} has been processed successfully.' },
        { title: 'Plan Upgraded', message: 'Your plan has been successfully upgraded to {planName}.' }
      ]
    },
    warning: {
      billing: [
        { title: 'Usage Limit Approaching', message: 'You\'ve used {percentage}% of your monthly {resource} limit.' },
        { title: 'Payment Due Soon', message: 'Your payment of ${amount} is due on {dueDate}.' }
      ],
      system: [
        { title: 'Deprecated Feature Warning', message: 'Feature "{featureName}" will be deprecated on {date}. Please migrate to the new version.' },
        { title: 'API Rate Limit Warning', message: 'You\'ve reached {percentage}% of your API rate limit for this hour.' }
      ]
    },
    error: {
      integration: [
        { title: 'Integration Error', message: 'Failed to sync with {serviceName}: {errorMessage}' },
        { title: 'API Connection Failed', message: 'Unable to connect to {serviceName} API. Retrying in {retryTime} minutes.' }
      ],
      billing: [
        { title: 'Payment Failed', message: 'Your payment of ${amount} could not be processed. Please update your payment method.' },
        { title: 'Subscription Cancelled', message: 'Your subscription has been cancelled due to failed payment attempts.' }
      ]
    },
    info: {
      feature: [
        { title: 'New Feature Available', message: 'Check out the new {featureName} feature! {description}' },
        { title: 'Feature Update', message: '{featureName} has been improved with new capabilities: {improvements}' },
        { title: 'Upcoming Webinar', message: 'Join our webinar on {date} at {time}: "{topic}"' }
      ]
    },
    marketing: {
      feature: [
        { title: 'Product Newsletter', message: 'This month\'s highlights: {highlights}. Read our latest newsletter!' },
        { title: 'Customer Success Story', message: 'See how {customerName} improved their workflow by {improvement} using our platform.' },
        { title: 'Limited Time Offer', message: 'Upgrade to {planName} and save {discount}% for the first 3 months!' }
      ]
    }
  };
  
  // Helper functions
  const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomChoices = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
  };
  const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomDate = (start: Date, end: Date): Date => 
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  const replaceVariables = (text: string, variables: Record<string, string>): string => {
    return text.replace(/{(\w+)}/g, (match, key) => variables[key] || match);
  };
  
  const generateVariables = (type: NotificationType, _category: NotificationCategory): Record<string, string> => {
    const variables: Record<string, string> = {};
    
    // Common variables
    variables.userName = randomChoice(['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Chen']);
    variables.documentName = randomChoice(['Q3 Report.pdf', 'Marketing Strategy.docx', 'User Manual.md', 'Financial Analysis.xlsx']);
    variables.realmName = randomChoice(['Engineering Platform', 'Marketing Hub', 'Sales Enablement', 'HR Knowledge Base']);
    variables.timestamp = new Date().toLocaleString();
    variables.date = new Date(Date.now() + randomInt(1, 30) * 24 * 60 * 60 * 1000).toLocaleDateString();
    variables.count = randomInt(1, 100).toString();
    
    // Type-specific variables
    switch (type) {
      case 'processing':
        variables.stage = randomChoice(['markdown-conversion', 'chunker', 'fact-generator', 'ingestor']);
        variables.progress = randomInt(10, 90).toString();
        variables.jobId = `job-${randomInt(1000, 9999)}`;
        variables.jobName = `Processing Job ${randomInt(1, 100)}`;
        variables.duration = `${randomInt(1, 60)} minutes`;
        variables.eta = `${randomInt(5, 120)} minutes`;
        variables.error = randomChoice(['Timeout error', 'Memory limit exceeded', 'Invalid format', 'Network error']);
        variables.attempts = randomInt(1, 5).toString();
        break;
        
      case 'security':
        variables.location = randomChoice(['New York, NY', 'San Francisco, CA', 'London, UK', 'Tokyo, JP']);
        variables.ipAddress = `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`;
        variables.keyName = `API Key ${randomInt(1, 10)}`;
        variables.issuesCount = randomInt(0, 5).toString();
        break;
        
      case 'system':
        variables.version = `${randomInt(1, 5)}.${randomInt(0, 9)}.${randomInt(0, 9)}`;
        variables.percentage = randomInt(50, 95).toString();
        variables.threshold = randomInt(80, 95).toString();
        variables.responseTime = randomInt(200, 2000).toString();
        variables.startTime = '02:00 AM';
        variables.endTime = '06:00 AM';
        break;
        
      case 'success':
        variables.serviceName = randomChoice(['Slack', 'Microsoft Teams', 'Google Drive', 'Dropbox', 'Salesforce']);
        variables.planName = randomChoice(['Professional', 'Enterprise', 'Premium']);
        variables.amount = randomInt(50, 500).toString();
        break;
        
      case 'warning':
        variables.resource = randomChoice(['storage', 'API calls', 'users', 'documents']);
        variables.dueDate = new Date(Date.now() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toLocaleDateString();
        variables.featureName = randomChoice(['Legacy Search', 'Old Dashboard', 'Classic Editor']);
        variables.retryTime = randomInt(5, 30).toString();
        break;
        
      case 'error':
        variables.errorMessage = randomChoice(['Connection timeout', 'Authentication failed', 'Service unavailable', 'Rate limit exceeded']);
        break;
        
      case 'info':
        variables.featureName = randomChoice(['Smart Search', 'Auto-tagging', 'Collaboration Tools', 'Advanced Analytics']);
        variables.description = 'Enhanced productivity and better insights for your team.';
        variables.improvements = 'Better performance, new UI, and enhanced functionality';
        variables.topic = randomChoice(['Best Practices', 'New Features Overview', 'Advanced Tips']);
        variables.time = randomChoice(['2:00 PM EST', '10:00 AM PST', '3:00 PM GMT']);
        break;
        
      case 'marketing':
        variables.highlights = 'New features, customer stories, and product updates';
        variables.customerName = randomChoice(['Acme Corp', 'Tech Solutions Inc', 'Global Enterprises', 'Innovation Labs']);
        variables.improvement = randomChoice(['50% faster processing', '30% better accuracy', '40% time savings']);
        variables.discount = randomInt(15, 50).toString();
        break;
    }
    
    return variables;
  };
  
  // Generate 250 notifications
  for (let i = 1; i <= 250; i++) {
    const type = randomChoice(notificationTypes);
    const category = randomChoice(categories);
    const priority = randomChoice(priorities);
    const status = randomChoice(statuses);
    const source = randomChoice(sources);
    const userId = randomChoice(userIds);
    const realmId = Math.random() > 0.3 ? randomChoice(realmIds) : undefined;
    const createdAt = randomDate(new Date('2024-01-01'), new Date());
    
    // Get template for this type/category combination
    const typeTemplates = notificationTemplates[type as keyof typeof notificationTemplates];
    const categoryTemplates = typeTemplates?.[category as keyof typeof typeTemplates] as Array<{title: string, message: string}>;
    const template = categoryTemplates ? randomChoice(categoryTemplates) : {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      message: `This is a ${type} notification about ${category}.`
    };
    
    // Generate variables and apply them to template
    const variables = generateVariables(type, category);
    const title = replaceVariables(template.title, variables);
    const message = replaceVariables(template.message, variables);
    
    // Generate notification channels
    const notificationChannels = randomChoices(channels, randomInt(1, 3));
    
    // Generate delivery status
    const deliveryStatus: DeliveryStatus[] = notificationChannels.map(channel => ({
      channel,
      status: randomChoice(['pending', 'sent', 'delivered', 'read'] as const),
      timestamp: randomDate(createdAt, new Date()),
      attempts: randomInt(1, 3)
    }));
    
    // Generate metadata
    const metadata: NotificationMetadata = {
      icon: type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle' : 
            type === 'warning' ? 'alert-triangle' : type === 'info' ? 'info' : 'bell',
      color: priority === 'critical' ? '#ef4444' : priority === 'urgent' ? '#f97316' : 
             priority === 'high' ? '#eab308' : priority === 'medium' ? '#3b82f6' : '#6b7280',
      data: variables,
      template: `${type}-${category}`,
      variables,
      ...(source === 'marketing' && {
        tracking: {
          campaignId: `campaign-${randomInt(100, 999)}`,
          source: 'email',
          medium: 'newsletter'
        }
      })
    };
    
    const notification: Notification = {
      id: `notif-${i.toString().padStart(4, '0')}`,
      userId,
      ...(realmId && { realmId }),
      type,
      category,
      title,
      message,
      priority,
      status,
      createdAt,
      ...(status === 'read' && { readAt: randomDate(createdAt, new Date()) }),
      ...(status === 'dismissed' && { dismissedAt: randomDate(createdAt, new Date()) }),
      ...(Math.random() > 0.8 && { expiresAt: randomDate(new Date(), new Date('2024-12-31')) }),
      ...(Math.random() > 0.6 && { actionUrl: `/dashboard/${category}s` }),
      ...(Math.random() > 0.6 && { actionLabel: randomChoice(['View Details', 'Take Action', 'Learn More', 'Fix Now']) }),
      metadata,
      relatedEntityType: category,
      relatedEntityId: `${category}-${randomInt(1, 100)}`,
      channels: notificationChannels,
      isSticky: priority === 'critical' || priority === 'urgent',
      ...(Math.random() > 0.7 && { groupId: `group-${randomInt(1, 20)}` }),
      tags: randomChoices([
        'automated', 'user-triggered', 'scheduled', 'alert', 'update', 
        'reminder', 'collaboration', 'system', 'urgent', 'info'
      ], randomInt(1, 3)),
      source,
      recipientCount: source === 'system' && Math.random() > 0.8 ? randomInt(10, 100) : 1,
      deliveryStatus
    };
    
    notifications.push(notification);
  }
  
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Generate the notifications dataset
export const notifications: Notification[] = generateNotifications();

// Helper functions for accessing notification data
export const getNotificationById = (id: string): Notification | undefined => {
  return notifications.find(notification => notification.id === id);
};

export const getNotificationsByUser = (userId: string): Notification[] => {
  return notifications.filter(notification => notification.userId === userId);
};

export const getUnreadNotifications = (userId?: string): Notification[] => {
  const filtered = userId ? getNotificationsByUser(userId) : notifications;
  return filtered.filter(notification => notification.status === 'unread');
};

export const getNotificationsByType = (type: NotificationType): Notification[] => {
  return notifications.filter(notification => notification.type === type);
};

export const getNotificationsByPriority = (priority: NotificationPriority): Notification[] => {
  return notifications.filter(notification => notification.priority === priority);
};

export const getNotificationsByRealm = (realmId: string): Notification[] => {
  return notifications.filter(notification => notification.realmId === realmId);
};

export const getRecentNotifications = (userId?: string, hours: number = 24): Notification[] => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const filtered = userId ? getNotificationsByUser(userId) : notifications;
  return filtered.filter(notification => notification.createdAt >= cutoff);
};

export const markNotificationAsRead = (id: string): boolean => {
  const notification = getNotificationById(id);
  if (notification && notification.status === 'unread') {
    notification.status = 'read';
    notification.readAt = new Date();
    return true;
  }
  return false;
};

export const markAllAsRead = (userId: string): number => {
  const userNotifications = getUnreadNotifications(userId);
  const count = userNotifications.length;
  userNotifications.forEach(notification => {
    notification.status = 'read';
    notification.readAt = new Date();
  });
  return count;
};

export const dismissNotification = (id: string): boolean => {
  const notification = getNotificationById(id);
  if (notification) {
    notification.status = 'dismissed';
    notification.dismissedAt = new Date();
    return true;
  }
  return false;
};

export const getNotificationStats = (userId?: string) => {
  const filtered = userId ? getNotificationsByUser(userId) : notifications;
  const total = filtered.length;
  const unread = filtered.filter(n => n.status === 'unread').length;
  const critical = filtered.filter(n => n.priority === 'critical').length;
  const urgent = filtered.filter(n => n.priority === 'urgent').length;
  
  const typeDistribution = filtered.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const priorityDistribution = filtered.reduce((acc, notification) => {
    acc[notification.priority] = (acc[notification.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    unread,
    critical,
    urgent,
    typeDistribution,
    priorityDistribution,
    lastUpdated: new Date().toISOString()
  };
};

// Notification templates for different scenarios
export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'doc-processing-complete',
    name: 'Document Processing Complete',
    type: 'processing',
    category: 'document',
    title: 'Document Processing Complete',
    message: 'Document "{documentName}" has been successfully processed and is now available.',
    variables: ['documentName', 'processingTime', 'chunkCount'],
    channels: ['in-app', 'email'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'security-login-alert',
    name: 'Security Login Alert',
    type: 'security',
    category: 'user',
    title: 'New Login Detected',
    message: 'New login from {location} at {timestamp}. IP: {ipAddress}',
    variables: ['location', 'timestamp', 'ipAddress'],
    channels: ['in-app', 'email', 'push'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

// Sample user preferences
export const sampleNotificationPreferences: NotificationPreferences = {
  userId: 'user-001',
  channels: {
    'in-app': {
      enabled: true,
      types: ['system', 'processing', 'collaboration', 'security'],
      priorities: ['medium', 'high', 'urgent', 'critical']
    },
    'email': {
      enabled: true,
      types: ['security', 'maintenance', 'warning', 'error'],
      priorities: ['high', 'urgent', 'critical'],
      quietHours: {
        start: '22:00',
        end: '08:00',
        timezone: 'America/New_York'
      }
    },
    'push': {
      enabled: true,
      types: ['warning', 'error'],
      priorities: ['urgent', 'critical']
    },
    'sms': {
      enabled: false,
      types: [],
      priorities: ['critical']
    },
    'webhook': {
      enabled: false,
      types: [],
      priorities: []
    },
    'slack': {
      enabled: true,
      types: ['collaboration', 'system'],
      priorities: ['medium', 'high']
    },
    'teams': {
      enabled: false,
      types: [],
      priorities: []
    }
  },
  frequency: {
    immediate: ['security', 'error', 'warning'],
    hourly: ['processing', 'collaboration'],
    daily: ['system', 'reminder'],
    weekly: ['marketing', 'info'],
    never: ['maintenance']
  },
  grouping: true,
  autoMarkAsRead: false,
  maxRetentionDays: 30
};

// Export for use in other components
export default notifications;