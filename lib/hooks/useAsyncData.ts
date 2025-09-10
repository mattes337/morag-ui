/**
 * useAsyncData Hook
 * Data fetching with React Query-like behavior, loading/error/success states,
 * automatic refetching on window focus, optimistic updates support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError, AsyncDataState } from '../api/types';
import { mockApiClient } from '../api/mockApiClient';

interface UseAsyncDataOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  retry?: {
    attempts?: number;
    delay?: number;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  select?: (data: any) => any;
}

interface FetchFunction<T> {
  (): Promise<T>;
}

export function useAsyncData<T = any>(
  key: string | string[],
  fetchFn: FetchFunction<T>,
  options: UseAsyncDataOptions = {}
): AsyncDataState<T> {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    staleTime = 300000, // 5 minutes
    retry = { attempts: 3, delay: 1000 },
    onSuccess,
    onError,
    select
  } = options;

  const [state, setState] = useState<{
    data: T | undefined;
    loading: boolean;
    error: ApiError | undefined;
    lastFetch: Date | undefined;
  }>({
    loading: false,
    error: undefined,
    data: undefined,
    lastFetch: undefined
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef<number>(0);

  // Generate cache key
  const cacheKey = Array.isArray(key) ? key.join(':') : key;

  // Check if data is stale
  const isStale = useCallback(() => {
    if (!state.lastFetch) return true;
    return Date.now() - state.lastFetch.getTime() > staleTime;
  }, [state.lastFetch, staleTime]);

  // Execute fetch with retry logic
  const executeWithRetry = useCallback(async (retryCount = 0): Promise<T> => {
    try {
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      const result = await fetchFn();
      return result;
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'Request cancelled') {
        throw error;
      }

      // Retry logic
      if (retryCount < (retry.attempts || 3)) {
        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await executeWithRetry(retryCount + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, (retry.delay || 1000) * Math.pow(2, retryCount)); // Exponential backoff
        });
      }

      throw error;
    }
  }, [fetchFn, retry]);

  // Main refetch function
  const refetch = useCallback(async (): Promise<void> => {
    if (!enabled || !isMountedRef.current) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: undefined
    }));

    try {
      const result = await executeWithRetry();
      
      if (!isMountedRef.current) return;

      const processedData = select ? select(result) : result;
      const now = new Date();

      setState({
        data: processedData,
        loading: false,
        error: undefined,
        lastFetch: now
      });

      lastFetchTimeRef.current = now.getTime();

      if (onSuccess) {
        onSuccess(processedData);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;

      if (error.name === 'AbortError' || error.message === 'Request cancelled') {
        return;
      }

      const apiError: ApiError = error.code ? error : {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch data',
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
    }
  }, [enabled, executeWithRetry, select, onSuccess, onError]);

  // Optimistic update function
  const mutate = useCallback((updater: (prev?: T) => T) => {
    setState(prev => ({
      ...prev,
      data: updater(prev.data),
      lastFetch: new Date()
    }));
  }, []);

  // Invalidate data (mark as stale and refetch if component is visible)
  const invalidate = useCallback(() => {
    lastFetchTimeRef.current = 0;
    if (enabled && document.visibilityState === 'visible') {
      refetch();
    }
  }, [enabled, refetch]);

  // Handle window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => {
      if (isStale() && document.visibilityState === 'visible') {
        refetch();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isStale()) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchOnWindowFocus, enabled, isStale, refetch]);

  // Handle interval refetch
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, refetch]);

  // Initial fetch on mount or when key changes
  useEffect(() => {
    if (enabled && refetchOnMount) {
      refetch();
    }

    return () => {
      // Cancel any ongoing requests when key changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [cacheKey, enabled, refetchOnMount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    mutate,
    invalidate
  };
}

// Convenience hook for GET requests
export function useQuery<T = any>(
  key: string | string[],
  endpoint: string,
  options: UseAsyncDataOptions = {}
) {
  const fetchFn = useCallback(async () => {
    const response = await mockApiClient.get<T>(endpoint);
    if (!response.success) {
      throw response.error;
    }
    return response.data as T;
  }, [endpoint]);

  return useAsyncData<T>(key, fetchFn, options);
}

// Convenience hook for paginated data
export function usePaginatedQuery<T = any>(
  key: string | string[],
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  options: UseAsyncDataOptions = {}
) {
  const fetchFn = useCallback(async () => {
    const url = `${endpoint}?page=${page}&limit=${limit}`;
    const response = await mockApiClient.get<T>(url);
    if (!response.success) {
      throw response.error;
    }
    return response.data as T;
  }, [endpoint, page, limit]);

  const paginationKey = Array.isArray(key) 
    ? [...key, 'page', page.toString(), 'limit', limit.toString()]
    : [key, 'page', page.toString(), 'limit', limit.toString()];

  return useAsyncData<T>(paginationKey, fetchFn, options);
}

// Convenience hook for infinite queries
export function useInfiniteQuery<T = any>(
  key: string | string[],
  endpoint: string,
  options: UseAsyncDataOptions & { 
    pageParam?: number;
    getNextPageParam?: (lastPage: any, allPages: any[]) => number | undefined;
  } = {}
) {
  const { pageParam = 1, getNextPageParam, ...asyncOptions } = options;
  const [pages, setPages] = useState<T[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchFn = useCallback(async () => {
    const url = `${endpoint}?page=${pageParam}`;
    const response = await mockApiClient.get<T>(url);
    if (!response.success) {
      throw response.error;
    }
    return response.data as T;
  }, [endpoint, pageParam]);

  const result = useAsyncData<T>(
    Array.isArray(key) ? [...key, 'infinite', pageParam.toString()] : [key, 'infinite', pageParam.toString()],
    fetchFn,
    {
      ...asyncOptions,
      onSuccess: (data) => {
        setPages(prev => {
          const newPages = [...prev];
          newPages[pageParam - 1] = data;
          return newPages;
        });

        if (getNextPageParam) {
          const nextParam = getNextPageParam(data, pages);
          setHasNextPage(nextParam !== undefined);
        }

        asyncOptions.onSuccess?.(data);
      }
    }
  );

  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !result.loading) {
      // This would typically increment pageParam and refetch
      // For simplicity, we're just indicating the pattern
      result.refetch();
    }
  }, [hasNextPage, result]);

  return {
    ...result,
    pages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: result.loading && pages.length > 0
  };
}