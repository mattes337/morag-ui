// Layout component types and interfaces

export interface NavigationSubItem {
  id: string
  name: string
  href: string
  isActive?: boolean
}

export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: string
  badge?: number
  isActive?: boolean
  children?: NavigationSubItem[]
}

export type Role = 'admin' | 'user' | 'viewer'

export interface Realm {
  id: string
  name: string
  role: Role
  description?: string
  isActive?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  realms: Realm[]
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: Date
  isRead: boolean
  actionUrl?: string
}

export type SidebarState = 'expanded' | 'collapsed' | 'hidden'

export type Theme = 'light' | 'dark' | 'system'

export interface LayoutState {
  sidebarState: SidebarState
  isMobileMenuOpen: boolean
  theme: Theme
  isSearchOpen: boolean
}

// Breadcrumb types
export interface BreadcrumbItem {
  id: string
  name: string
  href?: string
  isActive?: boolean
}

// Component prop interfaces
export interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
  navigation: NavigationItem[]
  currentRealm: Realm | null
  onRealmChange: (realm: Realm) => void
  className?: string
}

export interface SidebarProps {
  navigation: NavigationItem[]
  currentPath: string
  className?: string
}

export interface HeaderProps {
  user: User
  currentRealm: Realm | null
  notifications: Notification[]
  unreadCount: number
  className?: string
}

export interface UserMenuProps {
  user: User
  onSignOut: () => void
  className?: string
}

export interface RealmSwitcherProps {
  realms: Realm[]
  currentRealm: Realm | null
  onRealmChange: (realm: Realm) => void
  className?: string
}

export interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  onNotificationRead: (id: string) => void
  onNotificationClick: (notification: Notification) => void
  className?: string
}

export interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  className?: string
}

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigation: NavigationItem[]
  currentPath: string
  className?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export interface ThemeToggleProps {
  className?: string
}

// Layout context types
export interface LayoutContextType {
  state: LayoutState
  toggleSidebar: () => void
  setSidebarState: (state: SidebarState) => void
  toggleMobileMenu: () => void
  toggleSearch: () => void
  setTheme: (theme: Theme) => void
}