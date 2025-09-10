/**
 * Mock Upload API with chunked upload simulation
 * Provides realistic file upload behavior with progress tracking and error simulation
 */

import { validateFile, validateFiles } from '@/lib/utils/fileValidation';

export interface UploadResult {
  success: boolean;
  data?: UploadedFile;
  error?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  type: string;
  status: UploadStatus;
  url?: string;
  processingJobId?: string;
  pipelineStages?: PipelineStage[];
  uploadSpeed?: number;
  timeRemaining?: number;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface BatchUploadProgress {
  overall: number;
  files: Array<{
    id: string;
    filename: string;
    progress: number;
    status: UploadStatus;
    error?: string;
  }>;
}

export type UploadProgressCallback = (progress: number | BatchUploadProgress) => void;

// Concurrent upload limit
const CONCURRENT_UPLOADS = 3;

// Simulated failure rate (5%)
const FAILURE_RATE = 0.05;

// Chunk size for large files (1MB)
const CHUNK_SIZE = 1024 * 1024;

/**
 * Simulates network delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a unique upload ID
 */
const generateUploadId = () => `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Simulates random failure based on failure rate
 */
const shouldSimulateFailure = () => Math.random() < FAILURE_RATE;

/**
 * Calculates upload speed and time remaining
 */
const calculateUploadMetrics = (bytesUploaded: number, startTime: number) => {
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const uploadSpeed = bytesUploaded / elapsedSeconds; // bytes per second
  return { uploadSpeed };
};

/**
 * Simulates chunked file upload with progress callbacks
 */
const simulateChunkedUpload = async (
  file: File,
  uploadId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  const startTime = Date.now();
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Simulate chunk upload time (200-800ms per chunk)
      await delay(200 + Math.random() * 600);
      
      // Check for simulated failure
      if (shouldSimulateFailure()) {
        throw new Error('Simulated random failure');
      }
      
      const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      const bytesUploaded = Math.min((chunkIndex + 1) * CHUNK_SIZE, file.size);
      const metrics = calculateUploadMetrics(bytesUploaded, startTime);
      
      // Call progress callback
      if (onProgress && typeof onProgress === 'function') {
        onProgress(progress);
      }
      
      // Simulate chunk upload request
      const chunkResponse = await fetch(`/api/upload/${uploadId}/chunk`, {
        method: 'POST',
        body: JSON.stringify({
          chunkIndex,
          totalChunks,
          progress,
          uploadSpeed: metrics.uploadSpeed
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => {
        // Handle network errors
        throw new Error('Network error during chunk upload');
      });
      
      if (!chunkResponse.ok) {
        const errorData = await chunkResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Upload failed with status ${chunkResponse.status}`);
      }
    }
    
    // Finalize upload
    const finalizeResponse = await fetch(`/api/upload/${uploadId}/finalize`, {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        size: file.size,
        type: file.type
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(() => {
      throw new Error('Network error during upload finalization');
    });
    
    if (!finalizeResponse.ok) {
      const errorData = await finalizeResponse.json().catch(() => ({ error: 'Finalization failed' }));
      throw new Error(errorData.error || 'Upload finalization failed');
    }
    
    const result = await finalizeResponse.json();
    
    return {
      success: true,
      data: {
        id: uploadId,
        filename: file.name,
        size: file.size,
        type: file.type,
        status: 'completed',
        url: `/uploads/${uploadId}/${file.name}`,
        processingJobId: `job-${uploadId}`,
        pipelineStages: [
          { name: 'markdown-conversion', status: 'pending' },
          { name: 'chunker', status: 'pending' },
          { name: 'fact-generator', status: 'pending' },
          { name: 'ingestor', status: 'pending' }
        ],
        ...result.data
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Uploads a single file with progress tracking
 */
export const uploadFile = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  // Validate file first
  const validation = await validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.errors[0]?.message || 'File validation failed');
  }
  
  const uploadId = generateUploadId();
  
  // For small files, use simple upload
  if (file.size <= CHUNK_SIZE) {
    try {
      // Simulate upload delay
      await delay(500 + Math.random() * 1000);
      
      if (shouldSimulateFailure()) {
        throw new Error('Simulated random failure');
      }
      
      // Simulate progress updates
      if (onProgress) {
        onProgress(50);
        await delay(200);
        onProgress(100);
      }
      
      // Simulate API call
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          type: file.type
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => {
        throw new Error('Network error');
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        data: {
          id: uploadId,
          filename: file.name,
          size: file.size,
          type: file.type,
          status: 'completed',
          url: `/uploads/${uploadId}/${file.name}`,
          processingJobId: `job-${uploadId}`,
          pipelineStages: [
            { name: 'markdown-conversion', status: 'pending' },
            { name: 'chunker', status: 'pending' },
            { name: 'fact-generator', status: 'pending' },
            { name: 'ingestor', status: 'pending' }
          ],
          ...result.data
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
  
  // For large files, use chunked upload
  return simulateChunkedUpload(file, uploadId, onProgress);
};

/**
 * Uploads multiple files with batch progress tracking
 */
export const uploadFiles = async (
  files: File[],
  onProgress?: UploadProgressCallback
): Promise<UploadResult[]> => {
  // Validate all files first
  const validation = await validateFiles(files);
  if (!validation.isValid) {
    throw new Error(validation.errors[0]?.message || 'File validation failed');
  }
  
  const results: UploadResult[] = [];
  const fileProgress: Array<{ id: string; filename: string; progress: number; status: UploadStatus; error?: string }> = 
    files.map(file => ({
      id: generateUploadId(),
      filename: file.name,
      progress: 0,
      status: 'pending' as const
    }));
  
  // Update initial progress
  if (onProgress) {
    onProgress({
      overall: 0,
      files: [...fileProgress]
    });
  }
  
  // Process files in batches to limit concurrent uploads
  const batches = [];
  for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
    batches.push(files.slice(i, i + CONCURRENT_UPLOADS));
  }
  
  let completedFiles = 0;
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (file, batchIndex) => {
      const globalIndex = batches.indexOf(batch) * CONCURRENT_UPLOADS + batchIndex;
      const fileId = fileProgress[globalIndex].id;
      
      // Update status to uploading
      fileProgress[globalIndex].status = 'uploading';
      if (onProgress) {
        onProgress({
          overall: Math.round((completedFiles / files.length) * 100),
          files: [...fileProgress]
        });
      }
      
      const result = await uploadFile(file, (progress) => {
        if (typeof progress === 'number') {
          fileProgress[globalIndex].progress = progress;
          
          if (onProgress) {
            onProgress({
              overall: Math.round(((completedFiles + (progress / 100)) / files.length) * 100),
              files: [...fileProgress]
            });
          }
        }
      });
      
      // Update final status
      if (result.success) {
        fileProgress[globalIndex].status = 'completed';
        fileProgress[globalIndex].progress = 100;
      } else {
        fileProgress[globalIndex].status = 'error';
        fileProgress[globalIndex].error = result.error;
      }
      
      completedFiles++;
      
      if (onProgress) {
        onProgress({
          overall: Math.round((completedFiles / files.length) * 100),
          files: [...fileProgress]
        });
      }
      
      return result;
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Cancels an ongoing upload
 */
export const cancelUpload = async (uploadId: string): Promise<UploadResult> => {
  try {
    await delay(200 + Math.random() * 300);
    
    const response = await fetch(`/api/upload/${uploadId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(() => {
      throw new Error('Network error');
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Cancellation failed' }));
      throw new Error(errorData.error || 'Cannot cancel upload');
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancellation failed'
    };
  }
};

/**
 * Retries a failed upload
 */
export const retryUpload = async (uploadId: string): Promise<UploadResult> => {
  try {
    await delay(200 + Math.random() * 300);
    
    const response = await fetch(`/api/upload/${uploadId}/retry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(() => {
      throw new Error('Network error');
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Retry failed' }));
      throw new Error(errorData.error || 'Cannot retry upload');
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: {
        id: uploadId,
        status: 'uploading' as UploadStatus,
        ...result.data
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Retry failed'
    };
  }
};

/**
 * Gets the current status of an upload
 */
export const getUploadStatus = async (uploadId: string): Promise<UploadResult> => {
  try {
    await delay(100 + Math.random() * 200);
    
    const response = await fetch(`/api/upload/${uploadId}/status`).catch(() => {
      throw new Error('Network error');
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Upload not found');
      }
      const errorData = await response.json().catch(() => ({ error: 'Status query failed' }));
      throw new Error(errorData.error || 'Cannot get upload status');
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Status query failed'
    };
  }
};

/**
 * Mock fetch implementation for testing
 * This would normally be handled by MSW or similar mocking library
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'test') {
  // Mock fetch for tests
  const originalFetch = global.fetch;
  global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    // Default successful response for testing
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        data: { id: 'mock-upload-id', status: 'completed' }
      })
    } as Response);
  });
}