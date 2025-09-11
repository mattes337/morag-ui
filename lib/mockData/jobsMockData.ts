import { ProcessingStage, StageStatus } from '@/lib/domain/types';

export interface ProcessingJob {
  id: string;
  name: string;
  type: 'document_processing' | 'search_indexing' | 'fact_extraction' | 'chunk_generation' | 'vector_ingestion';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'queued';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number; // 0-100
  stage: ProcessingStage;
  realmId: string;
  realmName: string;
  documentId?: string;
  documentName?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  errorMessage?: string;
  errorStack?: string;
  resourceUsage: {
    cpuPercent: number;
    memoryMB: number;
    diskIOKB: number;
  };
  metadata: {
    fileSize?: number;
    fileType?: string;
    chunkCount?: number;
    factCount?: number;
    processingSteps: Array<{
      stage: ProcessingStage;
      status: StageStatus;
      duration?: number;
      error?: string;
    }>;
  };
  retryCount: number;
  maxRetries: number;
  tags: string[];
}

const REALM_NAMES = [
  'Marketing Campaign Analysis',
  'Product Research',
  'Customer Support',
  'Engineering Documentation',
  'Sales Intelligence',
  'HR Knowledge Base',
  'Legal Compliance',
  'Financial Reports',
  'Research & Development',
  'Quality Assurance',
  'Business Intelligence',
  'Content Marketing',
  'User Experience Research',
  'Competitive Analysis',
  'Training Materials'
];

const DOCUMENT_TYPES = [
  'PDF', 'DOCX', 'TXT', 'MD', 'HTML', 'CSV', 'XLSX', 'PPTX',
  'MP4', 'MP3', 'WAV', 'PNG', 'JPG', 'WEBP', 'JSON', 'XML'
];

const DOCUMENT_NAMES = [
  'Annual Report 2024.pdf',
  'Product Specification v2.1.docx',
  'Customer Feedback Analysis.xlsx',
  'Training Manual Chapter 5.pdf',
  'Marketing Strategy Overview.pptx',
  'Technical Architecture Guide.md',
  'User Research Findings.pdf',
  'Quarterly Sales Report.xlsx',
  'Employee Handbook 2024.pdf',
  'Product Demo Video.mp4',
  'Customer Interview Audio.mp3',
  'Brand Guidelines.pdf',
  'Competitor Analysis Report.docx',
  'Financial Forecast Model.xlsx',
  'System Requirements.md',
  'User Stories Backlog.txt',
  'Design System Documentation.pdf',
  'API Reference Guide.html',
  'Security Policy Document.pdf',
  'Project Timeline.pptx',
  'Code Review Checklist.md',
  'Performance Test Results.json',
  'Customer Journey Map.pdf',
  'Risk Assessment Matrix.xlsx',
  'Compliance Audit Report.pdf'
];

const ERROR_MESSAGES = [
  'File format not supported for processing',
  'Memory limit exceeded during chunking',
  'API rate limit exceeded for fact extraction',
  'Network timeout during vector storage',
  'Invalid document structure detected',
  'Insufficient permissions for file access',
  'Document too large for processing queue',
  'Concurrent processing limit reached',
  'External service temporarily unavailable',
  'Malformed content detected in document',
  'Storage quota exceeded for realm',
  'Processing pipeline configuration error',
  'Document corruption detected during scan',
  'Authentication failed for external API',
  'Resource allocation timeout occurred'
];

const PROCESSING_STAGES: ProcessingStage[] = [
  ProcessingStage.MARKDOWN_CONVERSION,
  ProcessingStage.MARKDOWN_OPTIMIZER,
  ProcessingStage.CHUNKER,
  ProcessingStage.FACT_GENERATOR,
  ProcessingStage.INGESTOR
];

const TAGS = [
  'high-priority', 'bulk-upload', 'automated', 'manual-trigger', 'retry',
  'large-file', 'multimedia', 'structured-data', 'legacy-format', 'urgent',
  'scheduled', 'batch-process', 'real-time', 'experimental', 'production',
  'development', 'testing', 'archived', 'sensitive', 'public'
];

function generateRandomJob(index: number): ProcessingJob {
  const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const hasStarted = Math.random() > 0.3;
  const hasCompleted = hasStarted && Math.random() > 0.4;
  const hasFailed = hasStarted && !hasCompleted && Math.random() > 0.8;
  const isCancelled = hasStarted && !hasCompleted && !hasFailed && Math.random() > 0.9;
  
  let status: ProcessingJob['status'] = 'pending';
  let progress = 0;
  let startedAt: Date | undefined;
  let completedAt: Date | undefined;
  let errorMessage: string | undefined;
  let errorStack: string | undefined;
  
  if (isCancelled) {
    status = 'cancelled';
    progress = Math.random() * 100;
    startedAt = new Date(createdAt.getTime() + Math.random() * 60000);
  } else if (hasFailed) {
    status = 'failed';
    progress = Math.random() * 100;
    startedAt = new Date(createdAt.getTime() + Math.random() * 60000);
    errorMessage = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
    errorStack = `Error: ${errorMessage}\n    at processDocument (/src/pipeline/processor.ts:${Math.floor(Math.random() * 200) + 100}:${Math.floor(Math.random() * 50) + 10})\n    at Pipeline.execute (/src/pipeline/index.ts:${Math.floor(Math.random() * 100) + 50}:${Math.floor(Math.random() * 30) + 5})`;
  } else if (hasCompleted) {
    status = 'completed';
    progress = 100;
    startedAt = new Date(createdAt.getTime() + Math.random() * 60000);
    completedAt = new Date(startedAt.getTime() + Math.random() * 1800000); // Up to 30 minutes
  } else if (hasStarted) {
    status = Math.random() > 0.5 ? 'running' : 'queued';
    progress = status === 'running' ? Math.random() * 90 + 5 : 0;
    if (status === 'running') {
      startedAt = new Date(createdAt.getTime() + Math.random() * 60000);
    }
  } else {
    status = Math.random() > 0.7 ? 'queued' : 'pending';
  }

  const realmName = REALM_NAMES[Math.floor(Math.random() * REALM_NAMES.length)];
  const documentName = DOCUMENT_NAMES[Math.floor(Math.random() * DOCUMENT_NAMES.length)];
  const fileType = documentName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
  const stage = PROCESSING_STAGES[Math.floor(Math.random() * PROCESSING_STAGES.length)];
  
  const estimatedDuration = Math.floor(Math.random() * 120) + 5; // 5-125 minutes
  const actualDuration = completedAt && startedAt 
    ? Math.floor((completedAt.getTime() - startedAt.getTime()) / 60000)
    : undefined;

  const retryCount = hasFailed ? Math.floor(Math.random() * 3) : 0;
  const selectedTags = TAGS.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);

  // Generate processing steps
  const processingSteps = PROCESSING_STAGES.map((stageType, stepIndex) => {
    let stepStatus: StageStatus = StageStatus.PENDING;
    let stepDuration: number | undefined;
    let stepError: string | undefined;
    
    if (stepIndex < PROCESSING_STAGES.indexOf(stage)) {
      stepStatus = StageStatus.COMPLETED;
      stepDuration = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    } else if (stepIndex === PROCESSING_STAGES.indexOf(stage)) {
      if (status === 'completed') {
        stepStatus = StageStatus.COMPLETED;
        stepDuration = Math.floor(Math.random() * 300) + 30;
      } else if (status === 'running') {
        stepStatus = StageStatus.RUNNING;
      } else if (status === 'failed') {
        stepStatus = StageStatus.FAILED;
        stepError = errorMessage;
      }
    }
    
    return {
      stage: stageType,
      status: stepStatus,
      duration: stepDuration,
      error: stepError
    };
  });

  return {
    id: `job_${index.toString().padStart(6, '0')}`,
    name: `Process ${documentName}`,
    type: (['document_processing', 'search_indexing', 'fact_extraction', 'chunk_generation', 'vector_ingestion'] as const)[Math.floor(Math.random() * 5)],
    status,
    priority: (['low', 'medium', 'high', 'urgent'] as const)[Math.floor(Math.random() * 4)],
    progress,
    stage,
    realmId: `realm_${Math.floor(Math.random() * 15) + 1}`,
    realmName,
    documentId: `doc_${Math.floor(Math.random() * 10000)}`,
    documentName,
    createdAt,
    startedAt,
    completedAt,
    estimatedDuration,
    actualDuration,
    errorMessage,
    errorStack,
    resourceUsage: {
      cpuPercent: Math.floor(Math.random() * 80) + 10,
      memoryMB: Math.floor(Math.random() * 2048) + 256,
      diskIOKB: Math.floor(Math.random() * 10240) + 1024
    },
    metadata: {
      fileSize: Math.floor(Math.random() * 50000000) + 100000, // 100KB - 50MB
      fileType,
      chunkCount: Math.floor(Math.random() * 500) + 10,
      factCount: Math.floor(Math.random() * 200) + 5,
      processingSteps
    },
    retryCount,
    maxRetries: 3,
    tags: selectedTags
  };
}

// Generate 500+ jobs
export const mockJobs: ProcessingJob[] = Array.from({ length: 537 }, (_, index) => 
  generateRandomJob(index + 1)
);

// Filter functions for common queries
export const getJobsByStatus = (status: ProcessingJob['status']) => 
  mockJobs.filter(job => job.status === status);

export const getJobsByRealm = (realmId: string) => 
  mockJobs.filter(job => job.realmId === realmId);

export const getJobsByDateRange = (startDate: Date, endDate: Date) =>
  mockJobs.filter(job => job.createdAt >= startDate && job.createdAt <= endDate);

export const getRecentJobs = (hours: number = 24) => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return mockJobs.filter(job => job.createdAt >= cutoff);
};

// Statistics functions
export const getJobStatistics = () => {
  const total = mockJobs.length;
  const pending = getJobsByStatus('pending').length;
  const queued = getJobsByStatus('queued').length;
  const running = getJobsByStatus('running').length;
  const completed = getJobsByStatus('completed').length;
  const failed = getJobsByStatus('failed').length;
  const cancelled = getJobsByStatus('cancelled').length;
  
  const averageProcessingTime = mockJobs
    .filter(job => job.actualDuration)
    .reduce((acc, job) => acc + (job.actualDuration || 0), 0) / 
    mockJobs.filter(job => job.actualDuration).length;
  
  const successRate = (completed / (completed + failed)) * 100;
  
  return {
    total,
    pending,
    queued,
    running,
    completed,
    failed,
    cancelled,
    averageProcessingTime: Math.round(averageProcessingTime || 0),
    successRate: Math.round(successRate || 0)
  };
};

export const getUniqueRealms = () => {
  const realms = new Set<string>();
  mockJobs.forEach(job => realms.add(job.realmName));
  return Array.from(realms).sort();
};

export const getJobTrends = (days: number = 7) => {
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayJobs = mockJobs.filter(job => 
      job.createdAt >= date && job.createdAt < nextDate
    );
    
    trends.push({
      date: date.toISOString().split('T')[0],
      total: dayJobs.length,
      completed: dayJobs.filter(job => job.status === 'completed').length,
      failed: dayJobs.filter(job => job.status === 'failed').length,
      running: dayJobs.filter(job => job.status === 'running').length
    });
  }
  return trends;
};