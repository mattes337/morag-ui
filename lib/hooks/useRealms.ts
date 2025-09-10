/**
 * Realm Management Hooks
 * Custom hooks for realm CRUD operations, membership management, and configuration
 */

import { useCallback, useState } from 'react';
import { useAsyncData } from './useAsyncData';
import { mockApiClient } from '../api/mockApiClient';
import { queryKeys, getInvalidationKeys } from '../utils/queryKeys';
import type { 
  ApiResponse, 
  AsyncDataState,
  ApiError,
  Realm
} from '../api/types';

// Hook for fetching all realms accessible to the user
export function useRealms(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { enabled = true, staleTime = 60000 } = options || {};

  return useAsyncData<Realm[]>(
    queryKeys.realms.all,
    async () => {
      const response = await mockApiClient.get<Realm[]>('/api/realms');
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled,
      staleTime,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for fetching the current realm
export function useCurrentRealm(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { enabled = true, staleTime = 60000 } = options || {};

  return useAsyncData<Realm | null>(
    queryKeys.realms.current,
    async () => {
      const response = await mockApiClient.get<Realm>('/api/realms/current');
      if (!response.success) {
        // If no current realm is set, return null instead of throwing
        if (response.error?.code === 'NOT_FOUND') {
          return null;
        }
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled,
      staleTime,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for fetching a single realm by ID
export function useRealmById(id: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { enabled = true, staleTime = 60000 } = options || {};

  return useAsyncData<Realm>(
    queryKeys.realms.byId(id),
    async () => {
      const response = await mockApiClient.get<Realm>(`/api/realms/${id}`);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled: enabled && !!id,
      staleTime,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for realm creation
export function useRealmCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createRealm = useCallback(async (data: {
    name: string;
    description?: string;
    settings?: {
      autoProcessing?: boolean;
      defaultStages?: string[];
      retentionDays?: number;
    };
  }): Promise<Realm | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await mockApiClient.post<Realm>('/api/realms', data);
      if (!response.success) {
        throw response.error;
      }

      return response.data!;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'CREATE_REALM_ERROR',
        message: error.message || 'Failed to create realm',
        statusCode: 500
      };
      setError(apiError);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createRealm,
    isCreating,
    error
  };
}

// Hook for realm updates
export function useRealmUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateRealm = useCallback(async (
    realmId: string,
    data: Partial<{
      name: string;
      description: string;
      settings: {
        autoProcessing: boolean;
        defaultStages: string[];
        retentionDays: number;
      };
    }>
  ): Promise<Realm | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await mockApiClient.put<Realm>(`/api/realms/${realmId}`, data);
      if (!response.success) {
        throw response.error;
      }

      return response.data!;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'UPDATE_REALM_ERROR',
        message: error.message || 'Failed to update realm',
        statusCode: 500
      };
      setError(apiError);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateRealm,
    isUpdating,
    error
  };
}

// Hook for realm deletion
export function useRealmDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteRealm = useCallback(async (realmId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await mockApiClient.delete<{ message: string }>(`/api/realms/${realmId}`);
      if (!response.success) {
        throw response.error;
      }

      return true;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'DELETE_REALM_ERROR',
        message: error.message || 'Failed to delete realm',
        statusCode: 500
      };
      setError(apiError);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deleteRealm,
    isDeleting,
    error
  };
}

// Hook for switching current realm
export function useRealmSwitch() {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const switchRealm = useCallback(async (realmId: string): Promise<boolean> => {
    setIsSwitching(true);
    setError(null);

    try {
      const response = await mockApiClient.post<{ message: string }>('/api/realms/switch', { realmId });
      if (!response.success) {
        throw response.error;
      }

      return true;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'SWITCH_REALM_ERROR',
        message: error.message || 'Failed to switch realm',
        statusCode: 500
      };
      setError(apiError);
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, []);

  return {
    switchRealm,
    isSwitching,
    error
  };
}

// Hook for realm membership management
export function useRealmMembers(realmId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { enabled = true, staleTime = 120000 } = options || {};

  return useAsyncData<Array<{
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'member' | 'viewer';
    joinedAt: string;
    lastActive: string;
  }>>(
    queryKeys.realms.members(realmId),
    async () => {
      const response = await mockApiClient.get(`/api/realms/${realmId}/members`);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled: enabled && !!realmId,
      staleTime,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for realm settings management
export function useRealmSettings(realmId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { enabled = true, staleTime = 300000 } = options || {};

  const settingsQuery = useAsyncData<{
    processing: {
      autoProcessOnUpload: boolean;
      defaultStages: string[];
      enableMarkdownOptimizer: boolean;
      chunkingStrategy: 'semantic' | 'fixed' | 'hybrid';
      chunkSize: number;
      chunkOverlap: number;
    };
    storage: {
      maxFileSize: number;
      allowedFileTypes: string[];
      retentionPolicyDays: number;
    };
    access: {
      allowPublicSharing: boolean;
      requireApprovalForNewMembers: boolean;
      defaultMemberRole: 'member' | 'viewer';
    };
  }>(
    queryKeys.realms.settings(realmId),
    async () => {
      const response = await mockApiClient.get(`/api/realms/${realmId}/settings`);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled: enabled && !!realmId,
      staleTime,
      refetchOnWindowFocus: false, // Settings don't change frequently
    }
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<ApiError | null>(null);

  const updateSettings = useCallback(async (settings: any): Promise<boolean> => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await mockApiClient.put(`/api/realms/${realmId}/settings`, settings);
      if (!response.success) {
        throw response.error;
      }

      // Invalidate and refetch settings after successful update
      settingsQuery.refetch();
      return true;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'UPDATE_SETTINGS_ERROR',
        message: error.message || 'Failed to update settings',
        statusCode: 500
      };
      setUpdateError(apiError);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [realmId, settingsQuery]);

  return {
    ...settingsQuery,
    updateSettings,
    isUpdating,
    updateError
  };
}

// Hook for realm usage statistics
export function useRealmUsage(realmId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 60000, refetchInterval = 300000 } = options || {};

  return useAsyncData<{
    storage: {
      used: number;
      available: number;
      total: number;
    };
    documents: {
      total: number;
      processed: number;
      pending: number;
      failed: number;
    };
    processing: {
      totalJobs: number;
      successfulJobs: number;
      failedJobs: number;
      avgProcessingTime: number;
    };
    members: {
      total: number;
      active: number;
      lastWeek: number;
    };
  }>(
    queryKeys.realms.usage(realmId),
    async () => {
      const response = await mockApiClient.get(`/api/realms/${realmId}/usage`);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled: enabled && !!realmId,
      staleTime,
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}