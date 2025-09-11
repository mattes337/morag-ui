// Domain types for the application

export type ProcessingStage = 
  | 'markdown-conversion'
  | 'markdown-optimizer'
  | 'chunker'
  | 'fact-generator'
  | 'ingestor'

export type DocumentState = 
  | 'PENDING'
  | 'INGESTING'
  | 'INGESTED'
  | 'DEPRECATED'
  | 'DELETED'

export type StageStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'

export type JobType = 
  | 'document_processing'
  | 'search_indexing'
  | 'fact_extraction'
  | 'chunk_generation'
  | 'vector_ingestion'

export type JobPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

export type JobStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface ProcessingJob {
  id: string
  type: JobType
  status: JobStatus
  priority: JobPriority
  documentId?: string
  documentName?: string
  realmId: string
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  progress?: number
  stages?: StageExecution[]
}

export interface StageExecution {
  stage: ProcessingStage
  status: StageStatus
  duration?: number
  error?: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  state: DocumentState
  realmId: string
  createdAt: string
  updatedAt: string
  processedAt?: string
}

export interface Realm {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
