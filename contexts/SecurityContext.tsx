/**
 * Security Context for managing CSRF tokens and security utilities
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { csrfTokenManager, useCSRFToken } from '../lib/security/csrf';

interface SecurityContextValue {
  csrfToken: string | null;
  refreshToken: () => Promise<void>;
  isTokenValid: boolean;
  secureHeaders: Record<string, string>;
  secureFetch: typeof fetch;
}

const SecurityContext = createContext<SecurityContextValue | null>(null);

interface SecurityProviderProps {
  children: ReactNode;
}

/**
 * Security provider component that manages CSRF tokens and security utilities
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const { getToken, addToHeaders, fetch: csrfFetch } = useCSRFToken();

  /**
   * Refresh CSRF token from server
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token && data.signature && data.timestamp) {
          csrfTokenManager.setToken(data.token, data.signature, data.timestamp);
          setCsrfToken(data.token);
          setIsTokenValid(true);
        }
      } else {
        console.warn('Failed to refresh CSRF token:', response.status);
        setIsTokenValid(false);
      }
    } catch (error) {
      console.error('Error refreshing CSRF token:', error);
      setIsTokenValid(false);
    }
  };

  /**
   * Check if current token is valid
   */
  const checkTokenValidity = (): void => {
    const token = getToken();
    setCsrfToken(token);
    setIsTokenValid(!!token);
  };

  /**
   * Secure headers with CSRF token
   */
  const secureHeaders = React.useMemo(() => {
    return addToHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    });
  }, [csrfToken]);

  /**
   * Secure fetch wrapper
   */
  const secureFetch = React.useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      return csrfFetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          ...secureHeaders,
        },
      });
    },
    [csrfFetch, secureHeaders]
  );

  // Initialize token on mount
  useEffect(() => {
    checkTokenValidity();
    
    // If no valid token, refresh it
    if (!getToken()) {
      refreshToken();
    }
  }, []);

  // Check token validity periodically
  useEffect(() => {
    const interval = setInterval(checkTokenValidity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const contextValue: SecurityContextValue = {
    csrfToken,
    refreshToken,
    isTokenValid,
    secureHeaders,
    secureFetch,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

/**
 * Hook to use security context
 */
export function useSecurity(): SecurityContextValue {
  const context = useContext(SecurityContext);
  
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  
  return context;
}

/**
 * Hook for secure API calls with automatic CSRF token handling
 */
export function useSecureApi() {
  const { secureFetch, isTokenValid, refreshToken } = useSecurity();

  const secureRequest = React.useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // Ensure we have a valid token
      if (!isTokenValid) {
        await refreshToken();
      }

      let response = await secureFetch(url, options);

      // If CSRF error, refresh token and retry once
      if (response.status === 403) {
        const errorData = await response.clone().json().catch(() => ({}));
        if (errorData.code?.includes('CSRF')) {
          await refreshToken();
          response = await secureFetch(url, options);
        }
      }

      return response;
    },
    [secureFetch, isTokenValid, refreshToken]
  );

  return {
    secureRequest,
    isTokenValid,
    refreshToken,
  };
}

export default SecurityProvider;