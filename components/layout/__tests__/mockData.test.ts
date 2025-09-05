// mockData.test.ts - Test mock data for layout components
import {
  mockNavigation,
  mockRealms,
  mockUser,
  mockNotifications,
  mockCurrentRealm,
} from '../mockData'
import { NavigationItem, Realm, Notification } from '../types'

describe('Mock Data', () => {
  describe('mockNavigation', () => {
    it('should provide valid navigation items', () => {
      expect(mockNavigation).toBeDefined()
      expect(Array.isArray(mockNavigation)).toBe(true)
      expect(mockNavigation.length).toBeGreaterThan(0)

      mockNavigation.forEach((item: NavigationItem) => {
        expect(item.id).toBeDefined()
        expect(item.name).toBeDefined()
        expect(item.href).toBeDefined()
        expect(item.icon).toBeDefined()
        expect(typeof item.id).toBe('string')
        expect(typeof item.name).toBe('string')
        expect(typeof item.href).toBe('string')
        expect(typeof item.icon).toBe('string')
      })
    })

    it('should include dashboard as first item', () => {
      expect(mockNavigation[0]?.id).toBe('dashboard')
      expect(mockNavigation[0]?.name).toBe('Dashboard')
      expect(mockNavigation[0]?.href).toBe('/')
      expect(mockNavigation[0]?.icon).toBe('home')
      expect(mockNavigation[0]?.isActive).toBe(true)
    })

    it('should include documents with badge and children', () => {
      const documentsItem = mockNavigation.find(item => item.id === 'documents')
      expect(documentsItem).toBeDefined()
      expect(documentsItem?.badge).toBeGreaterThan(0)
      expect(documentsItem?.children).toBeDefined()
      expect(Array.isArray(documentsItem?.children)).toBe(true)
      expect(documentsItem?.children?.length).toBeGreaterThan(0)
    })

    it('should include nested navigation items', () => {
      const documentsItem = mockNavigation.find(item => item.id === 'documents')
      const children = documentsItem?.children
      
      if (children) {
        children.forEach(child => {
          expect(child.id).toBeDefined()
          expect(child.name).toBeDefined()
          expect(child.href).toBeDefined()
          expect(typeof child.id).toBe('string')
          expect(typeof child.name).toBe('string')
          expect(typeof child.href).toBe('string')
        })
      }
    })
  })

  describe('mockRealms', () => {
    it('should provide valid realm data', () => {
      expect(mockRealms).toBeDefined()
      expect(Array.isArray(mockRealms)).toBe(true)
      expect(mockRealms.length).toBeGreaterThan(0)

      mockRealms.forEach((realm: Realm) => {
        expect(realm.id).toBeDefined()
        expect(realm.name).toBeDefined()
        expect(realm.role).toBeDefined()
        expect(typeof realm.id).toBe('string')
        expect(typeof realm.name).toBe('string')
        expect(['admin', 'user', 'viewer']).toContain(realm.role)
      })
    })

    it('should have at least one active realm', () => {
      const activeRealms = mockRealms.filter(realm => realm.isActive)
      expect(activeRealms.length).toBeGreaterThan(0)
    })

    it('should include Marketing Realm as first item', () => {
      expect(mockRealms[0]?.id).toBe('1')
      expect(mockRealms[0]?.name).toBe('Marketing Realm')
      expect(mockRealms[0]?.role).toBe('admin')
      expect(mockRealms[0]?.isActive).toBe(true)
    })
  })

  describe('mockUser', () => {
    it('should provide valid user data', () => {
      expect(mockUser).toBeDefined()
      expect(mockUser.id).toBeDefined()
      expect(mockUser.name).toBeDefined()
      expect(mockUser.email).toBeDefined()
      expect(mockUser.role).toBeDefined()
      expect(mockUser.realms).toBeDefined()

      expect(typeof mockUser.id).toBe('string')
      expect(typeof mockUser.name).toBe('string')
      expect(typeof mockUser.email).toBe('string')
      expect(typeof mockUser.role).toBe('string')
      expect(Array.isArray(mockUser.realms)).toBe(true)
    })

    it('should have valid email format', () => {
      expect(mockUser.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should have realms assigned', () => {
      expect(mockUser.realms.length).toBeGreaterThan(0)
    })

    it('should have avatar URL', () => {
      if (mockUser.avatar) {
        expect(typeof mockUser.avatar).toBe('string')
        expect(mockUser.avatar.length).toBeGreaterThan(0)
      }
    })
  })

  describe('mockNotifications', () => {
    it('should provide valid notification data', () => {
      expect(mockNotifications).toBeDefined()
      expect(Array.isArray(mockNotifications)).toBe(true)
      expect(mockNotifications.length).toBeGreaterThan(0)

      mockNotifications.forEach((notification: Notification) => {
        expect(notification.id).toBeDefined()
        expect(notification.title).toBeDefined()
        expect(notification.message).toBeDefined()
        expect(notification.type).toBeDefined()
        expect(notification.timestamp).toBeDefined()
        expect(typeof notification.isRead).toBe('boolean')

        expect(typeof notification.id).toBe('string')
        expect(typeof notification.title).toBe('string')
        expect(typeof notification.message).toBe('string')
        expect(['info', 'success', 'warning', 'error']).toContain(notification.type)
        expect(notification.timestamp).toBeInstanceOf(Date)
      })
    })

    it('should include both read and unread notifications', () => {
      const readNotifications = mockNotifications.filter(n => n.isRead)
      const unreadNotifications = mockNotifications.filter(n => !n.isRead)
      
      expect(readNotifications.length).toBeGreaterThan(0)
      expect(unreadNotifications.length).toBeGreaterThan(0)
    })

    it('should include different notification types', () => {
      const types = mockNotifications.map(n => n.type)
      const uniqueTypes = [...new Set(types)]
      
      expect(uniqueTypes.length).toBeGreaterThan(1)
      expect(uniqueTypes.every(type => 
        ['info', 'success', 'warning', 'error'].includes(type)
      )).toBe(true)
    })

    it('should have some notifications with action URLs', () => {
      const notificationsWithActions = mockNotifications.filter(n => n.actionUrl)
      expect(notificationsWithActions.length).toBeGreaterThan(0)
    })
  })

  describe('mockCurrentRealm', () => {
    it('should provide valid current realm data', () => {
      expect(mockCurrentRealm).toBeDefined()
      expect(mockCurrentRealm.id).toBe('1')
      expect(mockCurrentRealm.name).toBe('Marketing Realm')
      expect(mockCurrentRealm.role).toBe('admin')
      expect(mockCurrentRealm.isActive).toBe(true)
    })

    it('should match first realm from mockRealms', () => {
      expect(mockCurrentRealm).toEqual(mockRealms[0])
    })
  })

  describe('Data consistency', () => {
    it('should have consistent realm data between user and mockRealms', () => {
      const userRealmIds = mockUser.realms.map(r => r.id)
      const mockRealmIds = mockRealms.map(r => r.id)
      
      userRealmIds.forEach(id => {
        expect(mockRealmIds).toContain(id)
      })
    })

    it('should have current realm in user realms', () => {
      const userRealmIds = mockUser.realms.map(r => r.id)
      expect(userRealmIds).toContain(mockCurrentRealm.id)
    })
  })
})