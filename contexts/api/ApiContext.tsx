/**
 * API Context for Global Configuration
 * Provides API client instance and global configuration to the entire app
 */

'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ApiClient, ApiError } from '../../lib/api/types';
import { mockApiClient } from '../../lib/api/mockApiClient';

interface ApiContextValue {
  client: ApiClient;
  baseURL: string;
  isOnline: boolean;
  globalLoading: boolean;
  globalError: ApiError | undefined;
  setGlobalLoading: (loading: boolean) => void;
  setGlobalError: (error: ApiError | undefined) => void;
  clearGlobalError: () => void;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
  baseURL?: string;
  client?: ApiClient;
}

export function ApiProvider({ 
  children, 
  baseURL = '/api/v1', 
  client = mockApiClient 
}: ApiProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<ApiError | undefined>();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-clear global error after 5 seconds
  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => {
        setGlobalError(undefined);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [globalError]);

  const clearGlobalError = () => {
    setGlobalError(undefined);
  };

  const value: ApiContextValue = {
    client,
    baseURL,
    isOnline,
    globalLoading,
    globalError,
    setGlobalLoading,
    setGlobalError,
    clearGlobalError
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
      {/* Global loading indicator */}
      {globalLoading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading...
            </span>
          </div>
        </div>
      )}
      
      {/* Global error indicator */}
      {globalError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {globalError.message}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={clearGlobalError}
                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  You're currently offline. Some features may not work properly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ApiContext.Provider>
  );
}

// Custom hook to use the API context
export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}

// Custom hook for global loading state
export function useGlobalLoading() {
  const { globalLoading, setGlobalLoading } = useApiContext();
  return [globalLoading, setGlobalLoading] as const;
}

// Custom hook for global error state
export function useGlobalError() {
  const { globalError, setGlobalError, clearGlobalError } = useApiContext();
  return { globalError, setGlobalError, clearGlobalError };
}

// HOC to provide API context to any component
export function withApiContext<P extends object>(Component: React.ComponentType<P>) {
  const WrappedComponent = (props: P) => (
    <ApiProvider>
      <Component {...props} />
    </ApiProvider>
  );

  WrappedComponent.displayName = `withApiContext(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}