/**
 * Lazy Loading Utilities for UI Components
 * Provides React.lazy wrappers for heavy components to enable code splitting
 */

import { lazy } from 'react';

// Create lazy-loaded component wrappers
export const LazyTable = lazy(() => import('./data').then(module => ({
  default: ({ children, ...props }: any) => {
    const { Table } = module;
    return Table({ children, ...props });
  }
})));

export const LazySelect = lazy(() => import('./forms').then(module => ({
  default: ({ children, ...props }: any) => {
    const { Select } = module;
    return Select({ children, ...props });
  }
})));

export const LazyTabs = lazy(() => import('./layout').then(module => ({
  default: ({ children, ...props }: any) => {
    const { Tabs } = module;
    return Tabs({ children, ...props });
  }
})));

export const LazyDrawer = lazy(() => import('./layout').then(module => ({
  default: ({ children, ...props }: any) => {
    const { Drawer } = module;
    return Drawer({ children, ...props });
  }
})));

export const LazyEmptyState = lazy(() => import('./data').then(module => ({
  default: ({ children, ...props }: any) => {
    const { EmptyState } = module;
    return EmptyState({ children, ...props });
  }
})));

export const LazyToast = lazy(() => import('./overlays').then(module => ({
  default: ({ children, ...props }: any) => {
    const { Toast } = module;
    return Toast({ children, ...props });
  }
})));

// Utility function to preload heavy components
export const preloadHeavyComponents = () => {
  // Preload commonly used heavy components
  import('./data'); // Table, EmptyState
  import('./layout'); // Tabs, Drawer, Collapsible
  import('./overlays'); // Toast system
};

// Component size estimates for bundle analysis
export const COMPONENT_SIZES = {
  // Core components (always loaded) - ~15KB
  Button: 1.2,
  Input: 0.8,
  Label: 0.5,
  Card: 1.5,
  Badge: 0.6,
  Spinner: 0.8,
  Skeleton: 0.4,
  Separator: 0.3,
  Progress: 1.0,
  Avatar: 1.2,
  
  // Form components - ~25KB when loaded together
  Checkbox: 2.1,
  Textarea: 1.0,
  Switch: 2.5,
  RadioGroup: 2.0,
  Select: 8.5, // Heavy due to Radix complexity
  
  // Overlay components - ~20KB when loaded together
  Dialog: 6.5,
  Tooltip: 2.0,
  Toast: 4.8,
  
  // Data display components - ~18KB when loaded together
  Table: 12.0, // Heavy due to complex layout and styling
  EmptyState: 3.2,
  
  // Layout components - ~22KB when loaded together
  Tabs: 5.5,
  Drawer: 8.2, // Heavy due to mobile optimization
  Collapsible: 2.8,
} as const;