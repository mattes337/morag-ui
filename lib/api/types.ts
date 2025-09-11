/**
 * API Type Definitions
 * Request/response interfaces, error types, and generic API response wrapper
 * TypeScript strict mode compliance
 */

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId: string;
}

// Error types and codes
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
}

// Request configuration
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  signal?: AbortSignal;
}

// API client interface
export interface ApiClient {
  get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  patch<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
}

// Hook states
export interface ApiState<T> {
  data?: T;
  loading: boolean;
  error?: ApiError;
  lastFetch?: Date;
}

export interface AsyncDataState<T> extends ApiState<T> {
  refetch: () => Promise<void>;
  mutate: (updater: (prev?: T) => T) => void;
  invalidate: () => void;
}

// Cache entry
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Request context
export interface RequestContext {
  signal?: AbortSignal;
  retryCount?: number;
  startTime?: number;
}

// Search API types
export interface SearchRequest {
  query: string;
  filters?: {
    documentType?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
    relevanceThreshold?: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  documentType: string;
  relevanceScore: number;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  facets?: Record<string, any>;
}

// Document API types
export interface DocumentUploadRequest {
  files: File[];
  realmId: string;
  metadata?: Record<string, any>;
  processingOptions?: {
    stages?: string[];
    autoProcess?: boolean;
  };
}

export interface DocumentUploadResponse {
  documents: Array<{
    id: string;
    filename: string;
    size: number;
    uploadUrl: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
  }>;
  batchId: string;
}

// Pipeline API types
export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  error?: string;
}

export interface PipelineStatus {
  documentId: string;
  stages: PipelineStage[];
  overallProgress: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  estimatedTimeRemaining?: number;
}

// User API types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
  lastActive: string;
}

export interface Realm {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  documentCount: number;
  createdAt: string;
  settings: {
    autoProcessing: boolean;
    defaultStages: string[];
    retentionDays: number;
  };
}

// Analytics API types
export interface AnalyticsData {
  documentProcessing: {
    totalDocuments: number;
    processedToday: number;
    avgProcessingTime: number;
    successRate: number;
  };
  usage: {
    storageUsed: number;
    storageLimit: number;
    apiCalls: number;
    activeUsers: number;
  };
  trends: Array<{
    date: string;
    documents: number;
    processing_time: number;
    success_rate: number;
  }>;
}

// Job API types
export interface ProcessingJob {
  id: string;
  type: 'document_upload' | 'pipeline_execution' | 'batch_processing';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata: Record<string, any>;
}

export interface JobQueue {
  pending: ProcessingJob[];
  running: ProcessingJob[];
  completed: ProcessingJob[];
  failed: ProcessingJob[];
  totalJobs: number;
}