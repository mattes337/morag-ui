import React, { ReactNode } from 'react';
import { User, Realm, Document } from '../types';
import { AppProvider } from '../contexts/AppContext';

interface MockAppProviderProps {
  children: ReactNode;
  initialValues?: {
    currentRealm?: Realm | null;
    documents?: Document[];
    user?: User | null;
  };
}

export function MockAppProvider({ children, initialValues = {} }: MockAppProviderProps) {
  // Simply wrap with the real AppProvider - it will handle its own initialization
  // The AppProvider will create its own mock data when no real API is available
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}

// Re-export the useApp hook for convenience
export { useApp } from '../contexts/AppContext';

// Export a decorator for Storybook
export const withMockAppProvider = (Story: any, context: any) => {
  return (
    <MockAppProvider>
      <Story {...context} />
    </MockAppProvider>
  );
};
