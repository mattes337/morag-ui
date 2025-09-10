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

/**
 * Props for the DashboardLayout component
 * 
 * Provides the main dashboard layout with sidebar navigation, header,
 * user management, realm switching, and responsive design.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DashboardLayout
 *   user={currentUser}
 *   navigation={navItems}
 *   currentRealm={activeRealm}
 *   onRealmChange={(realm) => switchToRealm(realm)}
 * >
 *   <PageContent />
 * </DashboardLayout>
 * 
 * // With custom styling
 * <DashboardLayout
 *   user={user}
 *   navigation={navigation}
 *   currentRealm={realm}
 *   onRealmChange={handleRealmChange}
 *   className="custom-layout"
 * >
 *   <CustomDashboard />
 * </DashboardLayout>
 * ```
 */
export interface DashboardLayoutProps {
  /** Page content to render in the main area */
  children: React.ReactNode
  /** Current authenticated user */
  user: User
  /** Navigation menu items */
  navigation: NavigationItem[]
  /** Currently selected realm/workspace */
  currentRealm: Realm | null
  /** Callback when user switches realms */
  onRealmChange: (realm: Realm) => void
  /** Additional CSS classes */
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

/**
 * Props for the SearchOverlay component
 * 
 * Provides a full-screen search overlay with advanced search capabilities,
 * suggestions, and keyboard navigation support.
 * 
 * @example
 * ```tsx
 * // Basic search overlay
 * <SearchOverlay
 *   isOpen={isSearchOpen}
 *   onClose={() => setIsSearchOpen(false)}
 *   onSearch={(query) => {
 *     console.log('Searching for:', query);
 *     navigate(`/search?q=${encodeURIComponent(query)}`);
 *   }}
 * />
 * 
 * // With analytics tracking
 * <SearchOverlay
 *   isOpen={showSearch}
 *   onClose={closeSearch}
 *   onSearch={(query) => {
 *     trackEvent('search', { query, source: 'overlay' });
 *     performSearch(query);
 *   }}
 *   className="custom-search-overlay"
 * />
 * ```
 */
export interface SearchOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean
  /** Callback to close the overlay */
  onClose: () => void
  /** Callback when search is executed */
  onSearch: (query: string) => void
  /** Additional CSS classes */
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

/**
 * Layout context interface for managing global layout state
 * 
 * Provides centralized state management for layout-related functionality
 * including sidebar, mobile menu, search overlay, and theme management.
 * 
 * @example
 * ```tsx
 * // Using in a component
 * const MyComponent = () => {
 *   const {
 *     state,
 *     toggleSidebar,
 *     toggleSearch,
 *     setTheme
 *   } = useLayoutContext();
 * 
 *   return (
 *     <div>
 *       <button onClick={toggleSidebar}>
 *         {state.sidebarState === 'expanded' ? 'Collapse' : 'Expand'} Sidebar
 *       </button>
 *       <button onClick={toggleSearch}>
 *         Search
 *       </button>
 *       <button onClick={() => setTheme('dark')}>
 *         Dark Theme
 *       </button>
 *     </div>
 *   );
 * };
 * 
 * // Custom sidebar control
 * const SidebarControl = () => {
 *   const { state, setSidebarState } = useLayoutContext();
 * 
 *   const handleSidebarMode = (mode: SidebarState) => {
 *     setSidebarState(mode);
 *     localStorage.setItem('sidebarState', mode);
 *   };
 * 
 *   return (
 *     <div>
 *       {(['expanded', 'collapsed', 'hidden'] as SidebarState[]).map(mode => (
 *         <button
 *           key={mode}
 *           onClick={() => handleSidebarMode(mode)}
 *           className={state.sidebarState === mode ? 'active' : ''}
 *         >
 *           {mode}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export interface LayoutContextType {
  /** Current layout state */
  state: LayoutState
  /** Toggle sidebar between expanded/collapsed states */
  toggleSidebar: () => void
  /** Set specific sidebar state */
  setSidebarState: (state: SidebarState) => void
  /** Toggle mobile menu open/closed */
  toggleMobileMenu: () => void
  /** Toggle search overlay open/closed */
  toggleSearch: () => void
  /** Set application theme */
  setTheme: (theme: Theme) => void
}