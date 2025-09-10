'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockApiClient } from '@/lib/api/mockApiClient';
import { ApiClient, ApiError } from '@/lib/api/types';

interface ApiContextType {
  client: ApiClient;
  isOnline: boolean;
  globalLoading: boolean;
  globalError: ApiError | null;
  retryCount: number;
  setGlobalLoading: (loading: boolean) => void;
  setGlobalError: (error: ApiError | null) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};

export interface ApiProviderProps {
  children: React.ReactNode;
  client?: ApiClient;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ 
  children, 
  client = mockApiClient 
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear global error when coming back online
  useEffect(() => {
    if (isOnline && globalError?.code === 'NETWORK_ERROR') {
      setGlobalError(null);
      setRetryCount(0);
    }
  }, [isOnline, globalError]);

  // Auto-retry on network errors
  useEffect(() => {
    if (!isOnline) {
      setGlobalError({
        code: 'NETWORK_ERROR' as any,
        message: 'No internet connection. Please check your network and try again.',
        statusCode: 0
      });
    }
  }, [isOnline]);

  const incrementRetryCount = () => {
    setRetryCount(prev => prev + 1);
  };

  const resetRetryCount = () => {
    setRetryCount(0);
  };

  const contextValue: ApiContextType = {
    client,
    isOnline,
    globalLoading,
    globalError,
    retryCount,
    setGlobalLoading,
    setGlobalError,
    incrementRetryCount,
    resetRetryCount
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
      
      {/* Global Loading Indicator */}
      {globalLoading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-background border border-border rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-sm text-foreground">Loading...</span>
          </div>
        </div>
      )}

      {/* Global Error Display */}
      {globalError && !isOnline && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-destructive" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-destructive">Connection Problem</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {globalError.message}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      setGlobalError(null);
                      window.location.reload();
                    }}
                    className="text-sm bg-destructive text-destructive-foreground px-3 py-1 rounded hover:bg-destructive/90 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => setGlobalError(null)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retry Attempts Warning */}
      {retryCount >= 3 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 22h20L12 2zm0 15h-2v-2h2v2zm0-4h-2V9h2v4z"/>
              </svg>
              <span className="text-sm text-yellow-800">
                Multiple retry attempts. Please check your connection.
              </span>
            </div>
          </div>
        </div>
      )}
    </ApiContext.Provider>
  );
};

export default ApiProvider;