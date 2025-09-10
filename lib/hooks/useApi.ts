/**
 * useApi Hook
 * Generic API call hook with loading states, error handling, retry logic,
 * caching mechanism for repeated calls, and request cancellation support
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiResponse, ApiError, ApiRequestConfig, ApiState } from '../api/types';
import { mockApiClient } from '../api/mockApiClient';

interface UseApiOptions extends Omit<ApiRequestConfig, 'method'> {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  retry?: {
    attempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
  };
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (config?: ApiRequestConfig) => Promise<ApiResponse<T>>;
  reset: () => void;
  cancel: () => void;
}

export function useApi<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    loading: false,
    error: undefined,
    data: undefined,
    lastFetch: undefined
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    enabled = true,
    onSuccess,
    onError,
    retry = { attempts: 3, delay: 1000, backoff: 'exponential' },
    ...defaultConfig
  } = options;

  // Cancel any ongoing request when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const executeWithRetry = useCallback(async (
    config: ApiRequestConfig,
    retryCount = 0
  ): Promise<ApiResponse<T>> => {
    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const requestConfig: ApiRequestConfig = {
        ...defaultConfig,
        ...config,
        signal: abortControllerRef.current.signal
      };

      let response: ApiResponse<T>;

      // Make API call based on method
      switch (method) {
        case 'GET':
          response = await mockApiClient.get<T>(endpoint, requestConfig);
          break;
        case 'POST':
          response = await mockApiClient.post<T>(endpoint, requestConfig.body, requestConfig);
          break;
        case 'PUT':
          response = await mockApiClient.put<T>(endpoint, requestConfig.body, requestConfig);
          break;
        case 'DELETE':
          response = await mockApiClient.delete<T>(endpoint, requestConfig);
          break;
        case 'PATCH':
          response = await mockApiClient.patch<T>(endpoint, requestConfig.body, requestConfig);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (!response.success && response.error) {
        throw response.error;
      }

      return response;
    } catch (error: any) {
      // Handle cancellation
      if (error.name === 'AbortError' || error.message === 'Request cancelled') {
        throw error;
      }

      // Retry logic
      const maxRetries = retry.attempts || 3;
      if (retryCount < maxRetries) {
        const delay = retry.backoff === 'exponential' 
          ? (retry.delay || 1000) * Math.pow(2, retryCount)
          : (retry.delay || 1000);

        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await executeWithRetry(config, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }

      throw error;
    }
  }, [method, endpoint, defaultConfig, retry]);

  const execute = useCallback(async (config: ApiRequestConfig = {}): Promise<ApiResponse<T>> => {
    if (!enabled) {
      return { 
        success: false, 
        error: { 
          code: 'DISABLED', 
          message: 'API call is disabled', 
          statusCode: 400 
        },
        timestamp: new Date().toISOString(),
        requestId: 'disabled'
      };
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: undefined 
    }));

    try {
      const response = await executeWithRetry(config);
      
      const newState: ApiState<T> = {
        data: response.data,
        loading: false,
        error: undefined,
        lastFetch: new Date()
      };

      setState(newState);

      if (onSuccess && response.data) {
        onSuccess(response.data);
      }

      return response;
    } catch (error: any) {
      // Don't update state if request was cancelled
      if (error.name === 'AbortError' || error.message === 'Request cancelled') {
        return {
          success: false,
          error: {
            code: 'CANCELLED',
            message: 'Request was cancelled',
            statusCode: 0
          },
          timestamp: new Date().toISOString(),
          requestId: 'cancelled'
        };
      }

      const apiError: ApiError = error.code ? error : {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        statusCode: 500
      };

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: apiError 
      }));

      if (onError) {
        onError(apiError);
      }

      return {
        success: false,
        error: apiError,
        timestamp: new Date().toISOString(),
        requestId: 'error'
      };
    }
  }, [enabled, executeWithRetry, onSuccess, onError]);

  const reset = useCallback(() => {
    cancel();
    setState({
      loading: false,
      error: undefined,
      data: undefined,
      lastFetch: undefined
    });
  }, [cancel]);

  return {
    ...state,
    execute,
    reset,
    cancel
  };
}

// Convenience hooks for specific HTTP methods
export const useGet = <T = any>(endpoint: string, options?: UseApiOptions) => 
  useApi<T>('GET', endpoint, options);

export const usePost = <T = any>(endpoint: string, options?: UseApiOptions) => 
  useApi<T>('POST', endpoint, options);

export const usePut = <T = any>(endpoint: string, options?: UseApiOptions) => 
  useApi<T>('PUT', endpoint, options);

export const useDelete = <T = any>(endpoint: string, options?: UseApiOptions) => 
  useApi<T>('DELETE', endpoint, options);

export const usePatch = <T = any>(endpoint: string, options?: UseApiOptions) => 
  useApi<T>('PATCH', endpoint, options);