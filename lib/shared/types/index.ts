/**
 * Common types used across the MoRAG application
 * This is the bottom layer of our 4-layer DAG architecture
 */

export type ProcessingStage = 
  | 'markdown-conversion'
  | 'markdown-optimizer' 
  | 'chunker'
  | 'fact-generator'
  | 'ingestor';

export type DocumentState = 
  | 'PENDING'
  | 'INGESTING'
  | 'INGESTED'
  | 'DEPRECATED'
  | 'DELETED';

export type StageStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | undefined;
  error: string | undefined;
  message: string | undefined;
}

export interface PaginationParams {
  page: number | undefined;
  limit: number | undefined;
  cursor: string | undefined;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor: string | undefined;
}
