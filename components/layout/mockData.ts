// Mock data for layout components - Updated to use centralized mock data
import { NavigationItem, Realm, User, Notification, BreadcrumbItem } from './types'
import { 
  currentUser, 
  mockRealms as centralizedRealms, 
  currentRealm as centralizedCurrentRealm 
} from '@/lib/mockData'

export const mockNavigation: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/',
    icon: 'home',
    isActive: true,
  },
  {
    id: 'documents',
    name: 'Documents',
    href: '/documents',
    icon: 'file',
    badge: 12,
    children: [
      { id: 'recent', name: 'Recent', href: '/documents/recent' },
      { id: 'uploaded', name: 'Uploaded', href: '/documents/uploaded' },
      { id: 'shared', name: 'Shared', href: '/documents/shared', isActive: false },
    ],
  },
  {
    id: 'search',
    name: 'Search',
    href: '/search',
    icon: 'search',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    href: '/analytics',
    icon: 'bar-chart',
    children: [
      { id: 'reports', name: 'Reports', href: '/analytics/reports' },
      { id: 'insights', name: 'Insights', href: '/analytics/insights' },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/settings',
    icon: 'settings',
    children: [
      { id: 'general', name: 'General', href: '/settings/general' },
      { id: 'users', name: 'Users', href: '/settings/users' },
      { id: 'integrations', name: 'Integrations', href: '/settings/integrations' },
    ],
  },
  {
    id: 'help',
    name: 'Help',
    href: '/help',
    icon: 'help-circle',
  },
]

// Convert centralized realm data to legacy format for backward compatibility
export const mockRealms: Realm[] = centralizedRealms.map((realm, index) => ({
  id: realm.id,
  name: realm.name,
  role: realm.memberships.find(m => m.userId === currentUser.id)?.role || 'viewer',
  description: realm.description,
  isActive: index === 0, // First realm is active by default
}))

// Convert centralized user data to legacy format for backward compatibility
export const mockUser: User = {
  id: currentUser.id,
  name: currentUser.name,
  email: currentUser.email,
  avatar: currentUser.avatar,
  role: currentUser.role === 'system-admin' ? 'System Administrator' : 
        currentUser.role === 'realm-admin' ? 'Realm Administrator' :
        currentUser.role === 'user' ? 'User' : 'Viewer',
  realms: mockRealms.slice(0, 4), // First 4 realms for compatibility
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Document Processing Complete',
    message: 'Your uploaded document "Q4 Marketing Report.pdf" has been successfully processed and indexed.',
    type: 'success',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    actionUrl: '/documents/q4-marketing-report',
  },
  {
    id: '2',
    title: 'New User Joined Realm',
    message: 'Sarah Wilson has joined the Marketing Realm and needs access approval.',
    type: 'info',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: false,
    actionUrl: '/settings/users',
  },
  {
    id: '3',
    title: 'System Maintenance Scheduled',
    message: 'Planned maintenance window: Tonight 11 PM - 2 AM EST. Some features may be unavailable.',
    type: 'warning',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
  },
  {
    id: '4',
    title: 'Search Index Error',
    message: 'There was an error updating the search index. Some recent documents may not appear in search results.',
    type: 'error',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    isRead: true,
    actionUrl: '/settings/integrations',
  },
  {
    id: '5',
    title: 'Weekly Analytics Report',
    message: 'Your weekly analytics report is ready for review. 25% increase in document processing this week.',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: true,
    actionUrl: '/analytics/reports',
  },
  {
    id: '6',
    title: 'Backup Completed',
    message: 'Daily backup of all realm data completed successfully.',
    type: 'success',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
  },
  {
    id: '7',
    title: 'Storage Quota Warning',
    message: 'Marketing Realm storage is at 85% capacity. Consider archiving old documents.',
    type: 'warning',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: true,
    actionUrl: '/settings/general',
  },
  {
    id: '8',
    title: 'Integration Connected',
    message: 'Successfully connected to Slack workspace. Team notifications are now enabled.',
    type: 'success',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    actionUrl: '/settings/integrations',
  },
]

// Use centralized current realm data
export const mockCurrentRealm: Realm = {
  id: centralizedCurrentRealm.id,
  name: centralizedCurrentRealm.name,
  role: centralizedCurrentRealm.memberships.find(m => m.userId === currentUser.id)?.role || 'viewer',
  description: centralizedCurrentRealm.description,
  isActive: true,
}

// Helper functions for mock data
export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter(notification => !notification.isRead)
}

export const getUnreadCount = (): number => {
  return getUnreadNotifications().length
}

export const getNavigationItemByPath = (path: string): NavigationItem | null => {
  for (const item of mockNavigation) {
    if (item.href === path) {
      return item
    }
    
    if (item.children) {
      for (const child of item.children) {
        if (child.href === path) {
          return item
        }
      }
    }
  }
  
  return null
}

export const getBreadcrumbItems = (path: string): BreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [{ id: 'home', name: 'Dashboard', href: '/' }]
  
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const navItem = getNavigationItemByPath(currentPath)
    
    if (navItem) {
      items.push({
        id: navItem.id,
        name: navItem.name,
        href: currentPath,
        isActive: index === segments.length - 1,
      })
    } else {
      items.push({
        id: segment,
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: currentPath,
        isActive: index === segments.length - 1,
      })
    }
  })
  
  return items
}