// types.test.ts - Test TypeScript interfaces and type definitions
import {
  NavigationItem,
  NavigationSubItem,
  Realm,
  User,
  Notification,
  LayoutState,
  SidebarState,
  Theme,
} from '../types'

describe('Layout Types', () => {
  describe('NavigationItem', () => {
    it('should define a navigation item with required properties', () => {
      const navItem: NavigationItem = {
        id: 'dashboard',
        name: 'Dashboard',
        href: '/',
        icon: 'home',
      }

      expect(navItem.id).toBe('dashboard')
      expect(navItem.name).toBe('Dashboard')
      expect(navItem.href).toBe('/')
      expect(navItem.icon).toBe('home')
    })

    it('should support optional properties', () => {
      const navItemWithOptionals: NavigationItem = {
        id: 'documents',
        name: 'Documents',
        href: '/documents',
        icon: 'file',
        badge: 5,
        isActive: true,
        children: [
          {
            id: 'recent',
            name: 'Recent',
            href: '/documents/recent',
            isActive: false,
          },
        ],
      }

      expect(navItemWithOptionals.badge).toBe(5)
      expect(navItemWithOptionals.isActive).toBe(true)
      expect(navItemWithOptionals.children).toHaveLength(1)
    })
  })

  describe('NavigationSubItem', () => {
    it('should define a navigation sub-item', () => {
      const subItem: NavigationSubItem = {
        id: 'recent',
        name: 'Recent',
        href: '/documents/recent',
      }

      expect(subItem.id).toBe('recent')
      expect(subItem.name).toBe('Recent')
      expect(subItem.href).toBe('/documents/recent')
    })

    it('should support optional isActive property', () => {
      const activeSubItem: NavigationSubItem = {
        id: 'active',
        name: 'Active',
        href: '/active',
        isActive: true,
      }

      expect(activeSubItem.isActive).toBe(true)
    })
  })

  describe('Realm', () => {
    it('should define a realm with required properties', () => {
      const realm: Realm = {
        id: '1',
        name: 'Marketing Realm',
        role: 'admin',
      }

      expect(realm.id).toBe('1')
      expect(realm.name).toBe('Marketing Realm')
      expect(realm.role).toBe('admin')
    })

    it('should support all role types', () => {
      const adminRealm: Realm = {
        id: '1',
        name: 'Admin Realm',
        role: 'admin',
      }

      const userRealm: Realm = {
        id: '2',
        name: 'User Realm',
        role: 'user',
      }

      const viewerRealm: Realm = {
        id: '3',
        name: 'Viewer Realm',
        role: 'viewer',
      }

      expect(adminRealm.role).toBe('admin')
      expect(userRealm.role).toBe('user')
      expect(viewerRealm.role).toBe('viewer')
    })

    it('should support optional properties', () => {
      const realmWithOptionals: Realm = {
        id: '1',
        name: 'Marketing Realm',
        role: 'admin',
        description: 'Marketing team workspace',
        isActive: true,
      }

      expect(realmWithOptionals.description).toBe('Marketing team workspace')
      expect(realmWithOptionals.isActive).toBe(true)
    })
  })

  describe('User', () => {
    it('should define a user with required properties', () => {
      const user: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        realms: [],
      }

      expect(user.id).toBe('1')
      expect(user.name).toBe('John Doe')
      expect(user.email).toBe('john@example.com')
      expect(user.role).toBe('admin')
      expect(user.realms).toEqual([])
    })

    it('should support optional avatar property', () => {
      const userWithAvatar: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        realms: [],
        avatar: 'https://example.com/avatar.jpg',
      }

      expect(userWithAvatar.avatar).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('Notification', () => {
    it('should define a notification with required properties', () => {
      const notification: Notification = {
        id: '1',
        title: 'Test Notification',
        message: 'This is a test message',
        type: 'info',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        isRead: false,
      }

      expect(notification.id).toBe('1')
      expect(notification.title).toBe('Test Notification')
      expect(notification.message).toBe('This is a test message')
      expect(notification.type).toBe('info')
      expect(notification.timestamp).toBeInstanceOf(Date)
      expect(notification.isRead).toBe(false)
    })

    it('should support all notification types', () => {
      const infoNotification: Notification = {
        id: '1',
        title: 'Info',
        message: 'Info message',
        type: 'info',
        timestamp: new Date(),
        isRead: false,
      }

      const successNotification: Notification = {
        id: '2',
        title: 'Success',
        message: 'Success message',
        type: 'success',
        timestamp: new Date(),
        isRead: false,
      }

      const warningNotification: Notification = {
        id: '3',
        title: 'Warning',
        message: 'Warning message',
        type: 'warning',
        timestamp: new Date(),
        isRead: false,
      }

      const errorNotification: Notification = {
        id: '4',
        title: 'Error',
        message: 'Error message',
        type: 'error',
        timestamp: new Date(),
        isRead: false,
      }

      expect(infoNotification.type).toBe('info')
      expect(successNotification.type).toBe('success')
      expect(warningNotification.type).toBe('warning')
      expect(errorNotification.type).toBe('error')
    })

    it('should support optional actionUrl property', () => {
      const notificationWithAction: Notification = {
        id: '1',
        title: 'Action Required',
        message: 'Please review the document',
        type: 'warning',
        timestamp: new Date(),
        isRead: false,
        actionUrl: '/documents/123',
      }

      expect(notificationWithAction.actionUrl).toBe('/documents/123')
    })
  })

  describe('LayoutState', () => {
    it('should define layout state with sidebar and theme', () => {
      const layoutState: LayoutState = {
        sidebarState: 'expanded',
        isMobileMenuOpen: false,
        theme: 'light',
        isSearchOpen: false,
      }

      expect(layoutState.sidebarState).toBe('expanded')
      expect(layoutState.isMobileMenuOpen).toBe(false)
      expect(layoutState.theme).toBe('light')
      expect(layoutState.isSearchOpen).toBe(false)
    })

    it('should support all sidebar states', () => {
      const expandedLayout: LayoutState = {
        sidebarState: 'expanded',
        isMobileMenuOpen: false,
        theme: 'light',
        isSearchOpen: false,
      }

      const collapsedLayout: LayoutState = {
        sidebarState: 'collapsed',
        isMobileMenuOpen: false,
        theme: 'light',
        isSearchOpen: false,
      }

      const hiddenLayout: LayoutState = {
        sidebarState: 'hidden',
        isMobileMenuOpen: false,
        theme: 'light',
        isSearchOpen: false,
      }

      expect(expandedLayout.sidebarState).toBe('expanded')
      expect(collapsedLayout.sidebarState).toBe('collapsed')
      expect(hiddenLayout.sidebarState).toBe('hidden')
    })

    it('should support all theme types', () => {
      const lightTheme: LayoutState = {
        sidebarState: 'expanded',
        isMobileMenuOpen: false,
        theme: 'light',
        isSearchOpen: false,
      }

      const darkTheme: LayoutState = {
        sidebarState: 'expanded',
        isMobileMenuOpen: false,
        theme: 'dark',
        isSearchOpen: false,
      }

      const systemTheme: LayoutState = {
        sidebarState: 'expanded',
        isMobileMenuOpen: false,
        theme: 'system',
        isSearchOpen: false,
      }

      expect(lightTheme.theme).toBe('light')
      expect(darkTheme.theme).toBe('dark')
      expect(systemTheme.theme).toBe('system')
    })
  })

  describe('SidebarState type', () => {
    it('should only allow valid sidebar states', () => {
      const expanded: SidebarState = 'expanded'
      const collapsed: SidebarState = 'collapsed'
      const hidden: SidebarState = 'hidden'

      expect(expanded).toBe('expanded')
      expect(collapsed).toBe('collapsed')
      expect(hidden).toBe('hidden')
    })
  })

  describe('Theme type', () => {
    it('should only allow valid theme values', () => {
      const light: Theme = 'light'
      const dark: Theme = 'dark'
      const system: Theme = 'system'

      expect(light).toBe('light')
      expect(dark).toBe('dark')
      expect(system).toBe('system')
    })
  })
})