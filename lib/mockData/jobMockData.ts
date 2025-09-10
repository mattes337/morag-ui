// Comprehensive job mock data for the MoRAG platform

export type JobType = 
  | 'document-processing' 
  | 'batch-processing' 
  | 'index-rebuild' 
  | 'data-migration' 
  | 'backup' 
  | 'cleanup' 
  | 'analytics-generation'
  | 'user-sync'
  | 'integration-sync'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused'
export type JobPriority = 'low' | 'normal' | 'high' | 'critical'

export interface JobMetrics {
  itemsTotal: number
  itemsProcessed: number
  itemsSucceeded: number
  itemsFailed: number
  bytesProcessed?: number
  recordsCreated?: number
  recordsUpdated?: number
  recordsDeleted?: number
}

export interface JobStep {
  id: string
  name: string
  status: JobStatus
  startedAt?: Date
  completedAt?: Date
  duration?: number // in milliseconds
  progress: number // 0-100
  logs: string[]
  error?: string
}

export interface JobError {
  code: string
  message: string
  details?: string
  timestamp: Date
  stackTrace?: string
  retryable: boolean
}

export interface JobDependency {
  jobId: string
  jobName: string
  status: JobStatus
  required: boolean
}

export interface JobNotification {
  onStart: boolean
  onComplete: boolean
  onError: boolean
  onProgress: boolean
  progressInterval?: number // percentage points
  recipients: string[]
  channels: ('email' | 'webhook' | 'slack')[]
}

export interface JobConfiguration {
  timeout: number // in milliseconds
  maxRetries: number
  retryDelay: number // in milliseconds
  concurrency?: number
  batchSize?: number
  enableCheckpoints: boolean
  checkpointInterval?: number // in milliseconds
  resources: {
    cpuLimit?: number
    memoryLimit?: number
    diskSpace?: number
  }
  environment: Record<string, string>
}

export interface JobLog {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: Record<string, any>
  stepId?: string
}

export interface MockJob {
  id: string
  name: string
  description: string
  type: JobType
  status: JobStatus
  priority: JobPriority
  progress: number // 0-100
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  scheduledAt?: Date
  duration?: number // in milliseconds
  estimatedDuration?: number // in milliseconds
  realmId?: string
  userId: string
  parentJobId?: string
  childJobIds: string[]
  dependencies: JobDependency[]
  configuration: JobConfiguration
  metrics: JobMetrics
  steps: JobStep[]
  errors: JobError[]
  logs: JobLog[]
  notifications: JobNotification
  tags: string[]
  metadata: Record<string, any>
  checkpoint?: {
    stepId: string
    progress: number
    data: Record<string, any>
    timestamp: Date
  }
}

// Helper function to generate job logs
const generateJobLogs = (jobId: string, stepCount: number, logCount: number = 15): JobLog[] => {
  const logs: JobLog[] = []
  const levels: JobLog['level'][] = ['debug', 'info', 'warn', 'error']
  const messages = [
    'Job execution started',
    'Initializing processing pipeline',
    'Loading configuration',
    'Connecting to database',
    'Processing batch {batchNumber}',
    'Completed step {stepNumber}',
    'Memory usage: {memoryMb}MB',
    'Processing file: {filename}',
    'Validation completed successfully',
    'Error encountered: {errorMessage}',
    'Retrying operation...',
    'Checkpoint saved',
    'Performance metrics updated',
    'Cleanup completed',
    'Job execution finished',
  ]
  
  const startTime = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
  
  for (let i = 0; i < logCount; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]!
    let message = messages[Math.floor(Math.random() * messages.length)]!
    
    // Replace placeholders
    message = message
      .replace('{batchNumber}', String(Math.floor(Math.random() * 10) + 1))
      .replace('{stepNumber}', String(Math.floor(Math.random() * stepCount) + 1))
      .replace('{memoryMb}', String(Math.floor(Math.random() * 2000) + 500))
      .replace('{filename}', `document_${Math.floor(Math.random() * 1000)}.pdf`)
      .replace('{errorMessage}', 'Connection timeout')
    
    const timestamp = new Date(startTime.getTime() + i * (Math.random() * 30000 + 10000))
    
    logs.push({
      id: `log-${jobId}-${i}`,
      timestamp,
      level,
      message,
      context: {
        jobId,
        stepIndex: Math.floor(i / (logCount / stepCount)),
        threadId: `thread-${Math.floor(Math.random() * 4) + 1}`,
      },
      stepId: `step-${jobId}-${Math.floor(i / (logCount / stepCount))}`,
    })
  }
  
  return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

// Helper function to generate job steps
const generateJobSteps = (jobId: string, jobType: JobType): JobStep[] => {
  const stepTemplates: Record<JobType, string[]> = {
    'document-processing': [
      'File Validation',
      'Markdown Conversion',
      'Markdown Optimization',
      'Text Chunking',
      'Fact Generation',
      'Vector Ingestion',
    ],
    'batch-processing': [
      'Queue Preparation',
      'Batch Creation',
      'Parallel Processing',
      'Result Aggregation',
      'Cleanup',
    ],
    'index-rebuild': [
      'Index Backup',
      'Schema Validation',
      'Data Extraction',
      'Index Recreation',
      'Data Reindexing',
      'Verification',
    ],
    'data-migration': [
      'Source Validation',
      'Schema Mapping',
      'Data Extraction',
      'Data Transformation',
      'Data Loading',
      'Verification',
    ],
    'backup': [
      'Preparation',
      'Database Backup',
      'File System Backup',
      'Compression',
      'Upload to Storage',
      'Verification',
    ],
    'cleanup': [
      'Scanning',
      'Analysis',
      'File Deletion',
      'Database Cleanup',
      'Cache Clearing',
    ],
    'analytics-generation': [
      'Data Collection',
      'Metric Calculation',
      'Report Generation',
      'Chart Creation',
      'Export',
    ],
    'user-sync': [
      'Connection Test',
      'User Retrieval',
      'Data Mapping',
      'User Update',
      'Permission Sync',
    ],
    'integration-sync': [
      'Service Connection',
      'Data Retrieval',
      'Format Conversion',
      'Data Sync',
      'Status Update',
    ],
  }
  
  const stepNames = stepTemplates[jobType] || ['Step 1', 'Step 2', 'Step 3']
  
  return stepNames.map((name, index) => {
    const isCompleted = Math.random() > 0.3 // 70% chance of completion
    const isFailed = !isCompleted && Math.random() > 0.8 // 20% chance of failure if not completed
    const isRunning = !isCompleted && !isFailed && index === stepNames.length - 1
    
    let status: JobStatus = 'pending'
    if (isCompleted) status = 'completed'
    else if (isFailed) status = 'failed'
    else if (isRunning) status = 'running'
    
    const startedAt = isCompleted || isFailed || isRunning 
      ? new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000))
      : undefined
    
    const completedAt = isCompleted || isFailed
      ? new Date((startedAt?.getTime() || Date.now()) + Math.floor(Math.random() * 30 * 60 * 1000))
      : undefined
    
    const step: JobStep = {
      id: `step-${jobId}-${index}`,
      name,
      status,
      progress: isCompleted ? 100 : isFailed ? 0 : isRunning ? Math.floor(Math.random() * 80) + 10 : 0,
      logs: [],
    };

    if (startedAt) {
      step.startedAt = startedAt;
    }
    
    if (completedAt) {
      step.completedAt = completedAt;
    }
    
    if (completedAt && startedAt) {
      step.duration = completedAt.getTime() - startedAt.getTime();
    }
    
    if (isFailed) {
      step.error = `Error in step: ${name}`;
    }

    return step;
  })
}

// Helper function to generate job errors
const generateJobErrors = (jobId: string, hasErrors: boolean): JobError[] => {
  if (!hasErrors) return []
  
  const errorTemplates = [
    {
      code: 'NETWORK_TIMEOUT',
      message: 'Network request timed out',
      retryable: true,
    },
    {
      code: 'INVALID_FILE_FORMAT',
      message: 'Unsupported file format detected',
      retryable: false,
    },
    {
      code: 'INSUFFICIENT_MEMORY',
      message: 'Out of memory during processing',
      retryable: true,
    },
    {
      code: 'DATABASE_CONNECTION_FAILED',
      message: 'Unable to connect to database',
      retryable: true,
    },
    {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'API rate limit exceeded',
      retryable: true,
    },
    {
      code: 'PERMISSION_DENIED',
      message: 'Insufficient permissions to access resource',
      retryable: false,
    },
  ]
  
  const errorCount = Math.floor(Math.random() * 3) + 1
  const errors: JobError[] = []
  
  for (let i = 0; i < errorCount; i++) {
    const template = errorTemplates[Math.floor(Math.random() * errorTemplates.length)]!
    
    const error: JobError = {
      code: template.code,
      message: template.message,
      details: `Error occurred during job execution. Job ID: ${jobId}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000)),
      retryable: template.retryable,
    };
    
    if (!template.retryable) {
      error.stackTrace = 'Stack trace would be here...';
    }
    
    errors.push(error);
  }
  
  return errors
}

// Generate mock jobs
export const mockJobs: MockJob[] = [
  {
    id: 'job-001',
    name: 'Marketing Report Processing',
    description: 'Process Q4 marketing reports and generate analytics',
    type: 'document-processing',
    status: 'completed',
    priority: 'high',
    progress: 100,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    startedAt: new Date('2024-01-10T09:05:00Z'),
    completedAt: new Date('2024-01-10T09:47:00Z'),
    duration: 2520000, // 42 minutes
    estimatedDuration: 2400000, // 40 minutes
    realmId: '1',
    userId: '2',
    childJobIds: [],
    dependencies: [],
    configuration: {
      timeout: 3600000, // 1 hour
      maxRetries: 3,
      retryDelay: 30000, // 30 seconds
      batchSize: 10,
      enableCheckpoints: true,
      checkpointInterval: 300000, // 5 minutes
      resources: {
        cpuLimit: 2,
        memoryLimit: 4096,
        diskSpace: 10240,
      },
      environment: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
      },
    },
    metrics: {
      itemsTotal: 25,
      itemsProcessed: 25,
      itemsSucceeded: 24,
      itemsFailed: 1,
      bytesProcessed: 157286400, // ~150MB
      recordsCreated: 1250,
      recordsUpdated: 0,
      recordsDeleted: 0,
    },
    steps: generateJobSteps('job-001', 'document-processing'),
    errors: generateJobErrors('job-001', false),
    logs: generateJobLogs('job-001', 6, 20),
    notifications: {
      onStart: true,
      onComplete: true,
      onError: true,
      onProgress: false,
      recipients: ['sarah.wilson@company.com', 'john.doe@company.com'],
      channels: ['email', 'slack'],
    },
    tags: ['marketing', 'quarterly', 'reports'],
    metadata: {
      triggeredBy: 'user',
      sourceFiles: ['Q4_Marketing_Report.pdf', 'Campaign_Analysis.docx'],
      targetRealm: 'Marketing Realm',
    },
  },
  {
    id: 'job-002',
    name: 'Vector Index Rebuild',
    description: 'Rebuild vector database index for improved search performance',
    type: 'index-rebuild',
    status: 'running',
    priority: 'normal',
    progress: 65,
    createdAt: new Date('2024-01-10T14:30:00Z'),
    startedAt: new Date('2024-01-10T14:35:00Z'),
    estimatedDuration: 5400000, // 90 minutes
    realmId: '3',
    userId: '8',
    childJobIds: [],
    dependencies: [],
    configuration: {
      timeout: 7200000, // 2 hours
      maxRetries: 1,
      retryDelay: 60000, // 1 minute
      concurrency: 4,
      enableCheckpoints: true,
      checkpointInterval: 600000, // 10 minutes
      resources: {
        cpuLimit: 8,
        memoryLimit: 16384,
        diskSpace: 51200,
      },
      environment: {
        NODE_ENV: 'production',
        REBUILD_TYPE: 'full',
      },
    },
    metrics: {
      itemsTotal: 15000,
      itemsProcessed: 9750,
      itemsSucceeded: 9734,
      itemsFailed: 16,
      bytesProcessed: 2684354560, // ~2.5GB
      recordsCreated: 0,
      recordsUpdated: 9734,
      recordsDeleted: 0,
    },
    steps: generateJobSteps('job-002', 'index-rebuild'),
    errors: generateJobErrors('job-002', true),
    logs: generateJobLogs('job-002', 6, 35),
    notifications: {
      onStart: true,
      onComplete: true,
      onError: true,
      onProgress: true,
      progressInterval: 10,
      recipients: ['maria.garcia@company.com', 'john.doe@company.com'],
      channels: ['email', 'webhook'],
    },
    tags: ['maintenance', 'performance', 'index'],
    metadata: {
      triggeredBy: 'schedule',
      indexType: 'vector',
      lastRebuild: '2023-12-15T10:00:00Z',
    },
    checkpoint: {
      stepId: 'step-job-002-4',
      progress: 65,
      data: {
        processedRecords: 9750,
        currentBatch: 98,
        totalBatches: 150,
      },
      timestamp: new Date('2024-01-10T15:20:00Z'),
    },
  },
  {
    id: 'job-003',
    name: 'Daily Backup',
    description: 'Automated daily backup of all realm data',
    type: 'backup',
    status: 'completed',
    priority: 'normal',
    progress: 100,
    createdAt: new Date('2024-01-10T02:00:00Z'),
    startedAt: new Date('2024-01-10T02:00:00Z'),
    completedAt: new Date('2024-01-10T03:45:00Z'),
    scheduledAt: new Date('2024-01-10T02:00:00Z'),
    duration: 6300000, // 105 minutes
    estimatedDuration: 6000000, // 100 minutes
    userId: 'system',
    childJobIds: [],
    dependencies: [],
    configuration: {
      timeout: 14400000, // 4 hours
      maxRetries: 2,
      retryDelay: 300000, // 5 minutes
      enableCheckpoints: false,
      resources: {
        cpuLimit: 4,
        memoryLimit: 8192,
        diskSpace: 102400,
      },
      environment: {
        BACKUP_TYPE: 'full',
        COMPRESSION: 'gzip',
        RETENTION_DAYS: '30',
      },
    },
    metrics: {
      itemsTotal: 5,
      itemsProcessed: 5,
      itemsSucceeded: 5,
      itemsFailed: 0,
      bytesProcessed: 5368709120, // 5GB
      recordsCreated: 1,
      recordsUpdated: 0,
      recordsDeleted: 0,
    },
    steps: generateJobSteps('job-003', 'backup'),
    errors: [],
    logs: generateJobLogs('job-003', 6, 25),
    notifications: {
      onStart: false,
      onComplete: true,
      onError: true,
      onProgress: false,
      recipients: ['john.doe@company.com'],
      channels: ['email'],
    },
    tags: ['backup', 'automated', 'daily'],
    metadata: {
      triggeredBy: 'schedule',
      backupLocation: 's3://morag-backups/2024-01-10/',
      compressionRatio: 0.65,
    },
  },
  {
    id: 'job-004',
    name: 'Sales Data Migration',
    description: 'Migrate sales data from legacy CRM system',
    type: 'data-migration',
    status: 'failed',
    priority: 'high',
    progress: 45,
    createdAt: new Date('2024-01-09T16:00:00Z'),
    startedAt: new Date('2024-01-09T16:05:00Z'),
    completedAt: new Date('2024-01-09T17:30:00Z'),
    duration: 5100000, // 85 minutes
    estimatedDuration: 7200000, // 120 minutes
    realmId: '2',
    userId: '3',
    childJobIds: [],
    dependencies: [],
    configuration: {
      timeout: 10800000, // 3 hours
      maxRetries: 3,
      retryDelay: 120000, // 2 minutes
      batchSize: 100,
      enableCheckpoints: true,
      checkpointInterval: 900000, // 15 minutes
      resources: {
        cpuLimit: 4,
        memoryLimit: 8192,
        diskSpace: 20480,
      },
      environment: {
        SOURCE_SYSTEM: 'legacy-crm',
        TARGET_REALM: '2',
        MIGRATION_TYPE: 'incremental',
      },
    },
    metrics: {
      itemsTotal: 50000,
      itemsProcessed: 22500,
      itemsSucceeded: 20100,
      itemsFailed: 2400,
      bytesProcessed: 1073741824, // 1GB
      recordsCreated: 20100,
      recordsUpdated: 0,
      recordsDeleted: 0,
    },
    steps: generateJobSteps('job-004', 'data-migration'),
    errors: generateJobErrors('job-004', true),
    logs: generateJobLogs('job-004', 6, 40),
    notifications: {
      onStart: true,
      onComplete: true,
      onError: true,
      onProgress: true,
      progressInterval: 25,
      recipients: ['michael.chen@company.com', 'john.doe@company.com'],
      channels: ['email', 'slack'],
    },
    tags: ['migration', 'crm', 'sales'],
    metadata: {
      triggeredBy: 'user',
      sourceSystem: 'Salesforce Legacy',
      migrationPhase: 'customer-data',
      lastSuccessfulRun: '2024-01-08T14:00:00Z',
    },
    checkpoint: {
      stepId: 'step-job-004-3',
      progress: 45,
      data: {
        processedRecords: 22500,
        lastProcessedId: 'cust_45123',
        errorThreshold: 0.1,
      },
      timestamp: new Date('2024-01-09T17:15:00Z'),
    },
  },
  {
    id: 'job-005',
    name: 'Weekly Analytics Generation',
    description: 'Generate weekly analytics reports for all realms',
    type: 'analytics-generation',
    status: 'pending',
    priority: 'low',
    progress: 0,
    createdAt: new Date('2024-01-10T18:00:00Z'),
    scheduledAt: new Date('2024-01-11T08:00:00Z'),
    estimatedDuration: 1800000, // 30 minutes
    userId: 'system',
    childJobIds: [],
    dependencies: [
      {
        jobId: 'job-002',
        jobName: 'Vector Index Rebuild',
        status: 'running',
        required: false,
      },
    ],
    configuration: {
      timeout: 3600000, // 1 hour
      maxRetries: 2,
      retryDelay: 60000, // 1 minute
      concurrency: 2,
      enableCheckpoints: false,
      resources: {
        cpuLimit: 2,
        memoryLimit: 4096,
        diskSpace: 5120,
      },
      environment: {
        REPORT_TYPE: 'weekly',
        OUTPUT_FORMAT: 'pdf,excel',
        EMAIL_REPORTS: 'true',
      },
    },
    metrics: {
      itemsTotal: 5,
      itemsProcessed: 0,
      itemsSucceeded: 0,
      itemsFailed: 0,
      bytesProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
    },
    steps: generateJobSteps('job-005', 'analytics-generation'),
    errors: [],
    logs: [],
    notifications: {
      onStart: false,
      onComplete: true,
      onError: true,
      onProgress: false,
      recipients: ['john.doe@company.com'],
      channels: ['email'],
    },
    tags: ['analytics', 'weekly', 'reports'],
    metadata: {
      triggeredBy: 'schedule',
      reportPeriod: '2024-01-04 to 2024-01-10',
      recipientGroups: ['realm-admins', 'executives'],
    },
  },
  {
    id: 'job-006',
    name: 'Document Cleanup',
    description: 'Clean up orphaned documents and expired files',
    type: 'cleanup',
    status: 'paused',
    priority: 'low',
    progress: 20,
    createdAt: new Date('2024-01-10T10:00:00Z'),
    startedAt: new Date('2024-01-10T10:05:00Z'),
    estimatedDuration: 2700000, // 45 minutes
    userId: '1',
    childJobIds: [],
    dependencies: [],
    configuration: {
      timeout: 5400000, // 90 minutes
      maxRetries: 1,
      retryDelay: 60000, // 1 minute
      batchSize: 50,
      enableCheckpoints: true,
      checkpointInterval: 600000, // 10 minutes
      resources: {
        cpuLimit: 1,
        memoryLimit: 2048,
        diskSpace: 1024,
      },
      environment: {
        CLEANUP_TYPE: 'orphaned,expired',
        DRY_RUN: 'false',
        RETENTION_DAYS: '365',
      },
    },
    metrics: {
      itemsTotal: 1200,
      itemsProcessed: 240,
      itemsSucceeded: 235,
      itemsFailed: 5,
      bytesProcessed: 104857600, // 100MB
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 235,
    },
    steps: generateJobSteps('job-006', 'cleanup'),
    errors: generateJobErrors('job-006', false),
    logs: generateJobLogs('job-006', 5, 15),
    notifications: {
      onStart: false,
      onComplete: true,
      onError: true,
      onProgress: false,
      recipients: ['john.doe@company.com'],
      channels: ['email'],
    },
    tags: ['cleanup', 'maintenance', 'storage'],
    metadata: {
      triggeredBy: 'user',
      cleanupTypes: ['orphaned_documents', 'expired_files', 'temp_files'],
      storageFreed: 104857600,
    },
    checkpoint: {
      stepId: 'step-job-006-1',
      progress: 20,
      data: {
        processedDocuments: 240,
        deletedDocuments: 235,
        currentPhase: 'orphaned_documents',
      },
      timestamp: new Date('2024-01-10T10:25:00Z'),
    },
  },
]

// Helper functions
export const getJobById = (id: string): MockJob | undefined => {
  return mockJobs.find(job => job.id === id)
}

export const getJobsByStatus = (status: JobStatus): MockJob[] => {
  return mockJobs.filter(job => job.status === status)
}

export const getJobsByType = (type: JobType): MockJob[] => {
  return mockJobs.filter(job => job.type === type)
}

export const getJobsByPriority = (priority: JobPriority): MockJob[] => {
  return mockJobs.filter(job => job.priority === priority)
}

export const getJobsByRealm = (realmId: string): MockJob[] => {
  return mockJobs.filter(job => job.realmId === realmId)
}

export const getJobsByUser = (userId: string): MockJob[] => {
  return mockJobs.filter(job => job.userId === userId)
}

export const getActiveJobs = (): MockJob[] => {
  return mockJobs.filter(job => ['pending', 'running', 'paused'].includes(job.status))
}

export const getCompletedJobs = (): MockJob[] => {
  return mockJobs.filter(job => job.status === 'completed')
}

export const getFailedJobs = (): MockJob[] => {
  return mockJobs.filter(job => job.status === 'failed')
}

export const getRecentJobs = (hours: number = 24): MockJob[] => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
  return mockJobs.filter(job => job.createdAt > cutoff)
}

export const getJobQueue = (): MockJob[] => {
  return mockJobs
    .filter(job => ['pending', 'running'].includes(job.status))
    .sort((a, b) => {
      // Sort by priority first, then by creation time
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
}

export const getJobStatistics = () => {
  const total = mockJobs.length
  const byStatus = {
    pending: getJobsByStatus('pending').length,
    running: getJobsByStatus('running').length,
    completed: getJobsByStatus('completed').length,
    failed: getJobsByStatus('failed').length,
    cancelled: getJobsByStatus('cancelled').length,
    paused: getJobsByStatus('paused').length,
  }
  
  const byType = Object.fromEntries(
    (['document-processing', 'batch-processing', 'index-rebuild', 'data-migration', 'backup', 'cleanup', 'analytics-generation', 'user-sync', 'integration-sync'] as JobType[])
      .map(type => [type, getJobsByType(type).length])
  )
  
  const byPriority = {
    critical: getJobsByPriority('critical').length,
    high: getJobsByPriority('high').length,
    normal: getJobsByPriority('normal').length,
    low: getJobsByPriority('low').length,
  }
  
  const completedJobs = getCompletedJobs()
  const averageDuration = completedJobs.length > 0
    ? completedJobs.reduce((sum, job) => sum + (job.duration || 0), 0) / completedJobs.length
    : 0
  
  const successRate = total > 0 
    ? Math.round((byStatus.completed / total) * 100)
    : 0
  
  return {
    total,
    byStatus,
    byType,
    byPriority,
    averageDuration,
    successRate,
    activeJobs: byStatus.pending + byStatus.running + byStatus.paused,
  }
}

export const getJobLogs = (jobId: string, limit: number = 50): JobLog[] => {
  const job = getJobById(jobId)
  return job ? job.logs.slice(-limit) : []
}

export const getJobProgress = (jobId: string): { overall: number; steps: { stepId: string; progress: number }[] } | null => {
  const job = getJobById(jobId)
  if (!job) return null
  
  const stepProgress = job.steps.map(step => ({
    stepId: step.id,
    progress: step.progress,
  }))
  
  return {
    overall: job.progress,
    steps: stepProgress,
  }
}

export const getJobDependencyGraph = (jobId: string): { job: MockJob; dependencies: MockJob[]; dependents: MockJob[] } | null => {
  const job = getJobById(jobId)
  if (!job) return null
  
  const dependencies = job.dependencies
    .map(dep => getJobById(dep.jobId))
    .filter((j): j is MockJob => j !== undefined)
  
  const dependents = mockJobs.filter(j => 
    j.dependencies.some(dep => dep.jobId === jobId)
  )
  
  return {
    job,
    dependencies,
    dependents,
  }
}

// Mock job queue with real-time updates simulation
export const jobQueue = {
  items: getJobQueue(),
  
  // Simulate job progression
  simulateProgress: () => {
    const runningJobs = getJobsByStatus('running')
    runningJobs.forEach(job => {
      if (job.progress < 100) {
        job.progress = Math.min(100, job.progress + Math.floor(Math.random() * 5) + 1)
        
        // Update step progress
        const currentStep = job.steps.find(step => step.status === 'running')
        if (currentStep && currentStep.progress < 100) {
          currentStep.progress = Math.min(100, currentStep.progress + Math.floor(Math.random() * 10) + 2)
        }
        
        // Complete job if progress reaches 100
        if (job.progress >= 100) {
          job.status = 'completed'
          job.completedAt = new Date()
          if (job.startedAt) {
            job.duration = Date.now() - job.startedAt.getTime();
          }
        }
      }
    })
  },
}