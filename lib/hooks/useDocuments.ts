/**
 * Document Management Hooks
 * Custom hooks for document CRUD operations, upload tracking, and data fetching
 */

import { useCallback, useState } from 'react';
import { useAsyncData } from './useAsyncData';
import { mockApiClient } from '../api/mockApiClient';
import { queryKeys } from '../utils/queryKeys';
import type { 
  DocumentUploadResponse,
  ApiError
} from '../api/types';
import type { DocumentMetadata, UploadProgress } from '../mockData/documentMockData';

// Hook for fetching documents with optional realm filtering
export function useDocuments(realmId?: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const {
    enabled = true,
    staleTime = 30000, // 30 seconds
    refetchInterval
  } = options || {};

  const endpoint = realmId ? `/api/documents?realm=${realmId}` : '/api/documents';
  const queryKey = realmId ? queryKeys.documents.byRealm(realmId) : queryKeys.documents.all;

  return useAsyncData<DocumentMetadata[]>(
    queryKey,
    async () => {
      const response = await mockApiClient.get<DocumentMetadata[]>(endpoint);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled,
      staleTime,
      ...(refetchInterval !== undefined && { refetchInterval }),
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for fetching a single document by ID
export function useDocumentById(id: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { enabled = true, staleTime = 60000 } = options || {};

  return useAsyncData<DocumentMetadata>(
    queryKeys.documents.byId(id),
    async () => {
      const response = await mockApiClient.get<DocumentMetadata>(`/api/documents/${id}`);
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

// Hook for document upload functionality
export function useDocumentUpload() {
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const uploadDocuments = useCallback(async (
    files: File[], 
    realmId: string, 
    options?: {
      metadata?: Record<string, any>;
      autoProcess?: boolean;
      onProgress?: (fileId: string, progress: number) => void;
      onFileComplete?: (fileId: string, documentId: string) => void;
      onFileError?: (fileId: string, error: ApiError) => void;
    }
  ): Promise<DocumentUploadResponse | null> => {
    if (files.length === 0) return null;

    setIsUploading(true);
    setError(null);
    const progressMap = new Map<string, UploadProgress>();

    try {
      // Initialize progress tracking for each file
      files.forEach((file, index) => {
        const fileId = `${file.name}-${Date.now()}-${index}`;
        progressMap.set(fileId, {
          fileId,
          filename: file.name,
          progress: 0,
          status: 'uploading',
          speed: undefined,
          eta: undefined,
          error: undefined
        });
      });
      setUploadProgress(new Map(progressMap));

      // Simulate upload progress for each file
      const uploadPromises = files.map(async (file, index) => {
        const fileId = `${file.name}-${Date.now()}-${index}`;
        
        try {
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            progressMap.set(fileId, {
              ...progressMap.get(fileId)!,
              progress
            });
            setUploadProgress(new Map(progressMap));
            options?.onProgress?.(fileId, progress);
          }

          // Complete upload for this file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('realmId', realmId);
          if (options?.metadata) {
            formData.append('metadata', JSON.stringify(options.metadata));
          }
          if (options?.autoProcess !== undefined) {
            formData.append('autoProcess', String(options.autoProcess));
          }

          const response = await mockApiClient.post<{ documentId: string; pipelineId: string }>(
            '/api/documents/upload',
            formData
          );

          if (!response.success) {
            throw response.error;
          }

          progressMap.set(fileId, {
            ...progressMap.get(fileId)!,
            status: 'completed'
          });
          setUploadProgress(new Map(progressMap));

          options?.onFileComplete?.(fileId, response.data!.documentId);
          return response.data!;
        } catch (fileError: any) {
          progressMap.set(fileId, {
            ...progressMap.get(fileId)!,
            status: 'failed'
          });
          setUploadProgress(new Map(progressMap));
          
          const apiError: ApiError = fileError.code ? fileError : {
            code: 'UPLOAD_ERROR',
            message: fileError.message || `Failed to upload ${file.name}`,
            statusCode: 500
          };
          options?.onFileError?.(fileId, apiError);
          throw apiError;
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // Create batch response
      const batchResponse: DocumentUploadResponse = {
        documents: results.map((result, index) => {
          const file = files[index];
          return {
            id: result.documentId,
            filename: file?.name || 'unknown',
            size: file?.size || 0,
            uploadUrl: `/api/documents/${result.documentId}/download`,
            status: 'completed'
          };
        }),
        batchId: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      return batchResponse;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'BATCH_UPLOAD_ERROR',
        message: error.message || 'Failed to upload documents',
        statusCode: 500
      };
      setError(apiError);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearUploadProgress = useCallback(() => {
    setUploadProgress(new Map());
    setError(null);
  }, []);

  return {
    uploadDocuments,
    uploadProgress: Array.from(uploadProgress.values()),
    isUploading,
    error,
    clearUploadProgress
  };
}

// Hook for document deletion
export function useDocumentDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteDocument = useCallback(async (
    documentId: string,
    _realmId?: string
  ): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await mockApiClient.delete<{ message: string }>(
        `/api/documents/${documentId}`
      );

      if (!response.success) {
        throw response.error;
      }

      return true;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'DELETE_ERROR',
        message: error.message || 'Failed to delete document',
        statusCode: 500
      };
      setError(apiError);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const deleteBatch = useCallback(async (
    documentIds: string[],
    realmId?: string
  ): Promise<{ success: string[]; failed: { id: string; error: string }[] }> => {
    setIsDeleting(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        documentIds.map(id => deleteDocument(id, realmId))
      );

      const success: string[] = [];
      const failed: { id: string; error: string }[] = [];

      results.forEach((result, index) => {
        const documentId = documentIds[index];
        if (!documentId) return; // Skip if no documentId
        
        if (result.status === 'fulfilled' && result.value) {
          success.push(documentId);
        } else {
          failed.push({
            id: documentId,
            error: result.status === 'rejected' ? result.reason?.message || 'Unknown error' : 'Delete failed'
          });
        }
      });

      return { success, failed };
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'BATCH_DELETE_ERROR',
        message: error.message || 'Failed to delete documents',
        statusCode: 500
      };
      setError(apiError);
      return { success: [], failed: documentIds.map(id => ({ id, error: apiError.message })) };
    } finally {
      setIsDeleting(false);
    }
  }, [deleteDocument]);

  return {
    deleteDocument,
    deleteBatch,
    isDeleting,
    error
  };
}

// Hook for document statistics
export function useDocumentStats(realmId?: string, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  const { enabled = true, refetchInterval = 60000 } = options || {};
  
  const endpoint = realmId ? `/api/documents/stats?realm=${realmId}` : '/api/documents/stats';
  const queryKey = queryKeys.documents.stats(realmId);

  return useAsyncData<{
    totalDocuments: number;
    totalSize: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentUploads: number;
    processingQueue: number;
  }>(
    queryKey,
    async () => {
      const response = await mockApiClient.get(endpoint);
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled,
      refetchInterval,
      staleTime: 30000,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for document processing status
export function useDocumentProcessing(documentId: string, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  const { enabled = true, refetchInterval = 2000 } = options || {};

  return useAsyncData<{
    documentId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    currentStage?: string;
    progress: number;
    stages: Array<{
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      progress: number;
    }>;
    error?: string;
  }>(
    queryKeys.documents.processing(documentId),
    async () => {
      const response = await mockApiClient.get(`/api/documents/${documentId}/processing`);
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled: enabled && !!documentId,
      refetchInterval,
      staleTime: 1000, // 1 second for processing status
      refetchOnWindowFocus: true,
    }
  );
}