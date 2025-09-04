# Milestone 2B: Dashboard Layout & Navigation

## Objective
Build the main application shell with navigation, header, and layout components for the dashboard experience.

## Context
- **Parent**: 1A (Project Initialization)
- **Parallel to**: 2A (Authentication UI)
- **Focus**: Visual scaffolding for main application interface

## Scope
- Main dashboard layout with sidebar navigation
- Responsive design with mobile menu
- Header with user menu and notifications
- Realm switcher component
- Breadcrumb navigation
- Dark mode toggle
- Search overlay component

## Visual Components
```
/app/(dashboard)/
  ├── layout.tsx             # Main dashboard wrapper
  ├── page.tsx               # Dashboard home
  ├── documents/             # Document management
  ├── search/                # Search interface
  └── settings/              # Settings pages

/components/layout/
  ├── DashboardLayout.tsx    # Main container
  ├── Sidebar.tsx            # Collapsible navigation
  ├── Header.tsx             # Top bar with actions
  ├── UserMenu.tsx           # Profile dropdown
  ├── RealmSwitcher.tsx      # Realm selection
  ├── NotificationBell.tsx   # Notification dropdown
  ├── SearchOverlay.tsx      # Command palette style
  └── MobileMenu.tsx         # Mobile navigation

/stories/layout/
  ├── DashboardLayout.stories.tsx # Full layout compositions
  ├── Sidebar.stories.tsx    # Expanded, collapsed, mobile states
  ├── Header.stories.tsx     # With/without notifications
  ├── UserMenu.stories.tsx   # Open/closed states
  ├── RealmSwitcher.stories.tsx # Single/multiple realms
  ├── NotificationBell.stories.tsx # With/without notifications
  ├── SearchOverlay.stories.tsx # Search states
  └── MobileMenu.stories.tsx # Menu variations
```

## Storybook Stories
Component stories will demonstrate:
- **DashboardLayout**: Different page content, responsive breakpoints
- **Sidebar**: Navigation states, active items, collapsed view
- **Header**: User states, notification badges, search visibility
- **RealmSwitcher**: Multiple realms, loading states, permissions
- **SearchOverlay**: Empty, with suggestions, with results
- **MobileMenu**: Open/closed, with badges, gestures

## Mock Navigation Structure
```typescript
const navigation = [
  { name: 'Dashboard', href: '/', icon: 'home' },
  { name: 'Documents', href: '/documents', icon: 'file' },
  { name: 'Search', href: '/search', icon: 'search' },
  { name: 'Processing', href: '/processing', icon: 'cpu' },
  { name: 'Analytics', href: '/analytics', icon: 'chart' },
  { name: 'Settings', href: '/settings', icon: 'settings' }
];

const mockRealms = [
  { id: '1', name: 'Marketing Realm', role: 'admin' },
  { id: '2', name: 'Engineering Docs', role: 'user' },
  { id: '3', name: 'Customer Support', role: 'viewer' }
];
```

## Success Criteria
- [ ] Sidebar navigation is collapsible and responsive
- [ ] Realm switcher shows current realm and allows switching
- [ ] User menu displays profile options
- [ ] Search overlay opens with keyboard shortcut (Cmd+K)
- [ ] Mobile menu works on small screens
- [ ] Dark mode toggle persists preference
- [ ] Active navigation item is highlighted

## Dependencies
- 1A: Project initialization complete

## Deliverables
1. Complete dashboard layout system
2. Responsive navigation components
3. Theme switching functionality
4. Mock realm data and switching logic
5. Keyboard navigation support