// Mock data for pipeline visualization
// Represents the 5-stage processing pipeline with various states and scenarios

export type PipelineStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PipelineStage {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: PipelineStageStatus;
  progress: number;
  duration?: number; // in milliseconds
  startTime?: Date;
  endTime?: Date;
  errorMessage?: string;
  canRetry?: boolean;
  canSkip?: boolean;
}

export interface PipelinePipeline {
  id: string;
  documentId: string;
  documentName: string;
  stages: PipelineStage[];
  overallProgress: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
}

// The 5 canonical stages from CLAUDE.md
const STAGE_DEFINITIONS = [
  {
    id: 'markdown-conversion',
    displayName: 'Markdown Conversion',
    description: 'Convert content to markdown format',
  },
  {
    id: 'markdown-optimizer',
    displayName: 'Markdown Optimizer',
    description: 'LLM-based text improvement (optional)',
  },
  {
    id: 'chunker',
    displayName: 'Chunker',
    description: 'Split content into semantic chunks',
  },
  {
    id: 'fact-generator',
    displayName: 'Fact Generator',
    description: 'Extract facts, entities, and relations',
  },
  {
    id: 'ingestor',
    displayName: 'Ingestor',
    description: 'Store in vector and graph databases',
  },
] as const;

// Helper function to create a stage with given status
function createStage(
  index: number,
  status: PipelineStageStatus,
  progress: number = 0,
  options: {
    duration?: number;
    errorMessage?: string;
    canRetry?: boolean;
    canSkip?: boolean;
  } = {}
): PipelineStage {
  const stageDef = STAGE_DEFINITIONS[index];
  if (!stageDef) {
    throw new Error(`Invalid stage index: ${index}`);
  }
  
  const now = new Date();
  const startTime = new Date(now.getTime() - (options.duration || 0));
  
  const stage: Partial<PipelineStage> = {
    id: stageDef.id,
    name: stageDef.id,
    displayName: stageDef.displayName,
    description: stageDef.description,
    status,
    progress,
    canRetry: options.canRetry ?? status === 'failed',
    canSkip: options.canSkip ?? (status === 'failed' && stageDef.id === 'markdown-optimizer'),
  };

  if (options.duration !== undefined) {
    stage.duration = options.duration;
  }
  if (status !== 'pending') {
    stage.startTime = startTime;
  }
  if (status === 'completed' || status === 'failed') {
    stage.endTime = now;
  }
  if (options.errorMessage !== undefined) {
    stage.errorMessage = options.errorMessage;
  }

  return stage as PipelineStage;
}

// Mock pipeline scenarios with different states
export const mockPipelines: PipelinePipeline[] = [
  // Scenario 1: Successfully completed pipeline
  {
    id: 'pipeline-1',
    documentId: 'doc-1',
    documentName: 'Annual Report 2023.pdf',
    stages: [
      createStage(0, 'completed', 100, { duration: 2300 }),
      createStage(1, 'completed', 100, { duration: 4500 }),
      createStage(2, 'completed', 100, { duration: 1800 }),
      createStage(3, 'completed', 100, { duration: 6200 }),
      createStage(4, 'completed', 100, { duration: 3100 }),
    ],
    overallProgress: 100,
    status: 'completed',
    startTime: new Date(Date.now() - 18000), // 18 seconds ago
    endTime: new Date(),
    totalDuration: 17900,
  },
  
  // Scenario 2: Currently running pipeline (stage 3)
  {
    id: 'pipeline-2',
    documentId: 'doc-2',
    documentName: 'Research Paper - AI Ethics.pdf',
    stages: [
      createStage(0, 'completed', 100, { duration: 1900 }),
      createStage(1, 'completed', 100, { duration: 3200 }),
      createStage(2, 'running', 75, { duration: 2400 }),
      createStage(3, 'pending', 0),
      createStage(4, 'pending', 0),
    ],
    overallProgress: 55,
    status: 'running',
    startTime: new Date(Date.now() - 7500), // 7.5 seconds ago
  },
  
  // Scenario 3: Failed pipeline with retry option
  {
    id: 'pipeline-3',
    documentId: 'doc-3',
    documentName: 'Technical Specifications.docx',
    stages: [
      createStage(0, 'completed', 100, { duration: 1600 }),
      createStage(1, 'skipped', 0), // Optional stage skipped
      createStage(2, 'completed', 100, { duration: 2100 }),
      createStage(3, 'failed', 45, { 
        duration: 1800, 
        errorMessage: 'Failed to connect to vector database. Connection timeout after 30 seconds.',
        canRetry: true 
      }),
      createStage(4, 'pending', 0),
    ],
    overallProgress: 49,
    status: 'failed',
    startTime: new Date(Date.now() - 12000), // 12 seconds ago
  },
  
  // Scenario 4: Just started pipeline
  {
    id: 'pipeline-4',
    documentId: 'doc-4',
    documentName: 'User Manual v2.1.pdf',
    stages: [
      createStage(0, 'running', 25, { duration: 800 }),
      createStage(1, 'pending', 0),
      createStage(2, 'pending', 0),
      createStage(3, 'pending', 0),
      createStage(4, 'pending', 0),
    ],
    overallProgress: 5,
    status: 'running',
    startTime: new Date(Date.now() - 800), // Just started
  },
  
  // Scenario 5: Partial completion (optimizer failed, but continued)
  {
    id: 'pipeline-5',
    documentId: 'doc-5',
    documentName: 'Marketing Campaign Analysis.xlsx',
    stages: [
      createStage(0, 'completed', 100, { duration: 2800 }),
      createStage(1, 'failed', 20, { 
        duration: 1200, 
        errorMessage: 'LLM service unavailable. Skipping optimization step.',
        canSkip: true
      }),
      createStage(2, 'completed', 100, { duration: 1500 }),
      createStage(3, 'completed', 100, { duration: 4200 }),
      createStage(4, 'completed', 100, { duration: 2800 }),
    ],
    overallProgress: 90,
    status: 'partial',
    startTime: new Date(Date.now() - 12500),
    endTime: new Date(),
    totalDuration: 12500,
  },
  
  // Scenario 6: Long-running complex document
  {
    id: 'pipeline-6',
    documentId: 'doc-6',
    documentName: 'Enterprise Architecture Guide (500 pages).pdf',
    stages: [
      createStage(0, 'completed', 100, { duration: 8200 }),
      createStage(1, 'completed', 100, { duration: 15400 }),
      createStage(2, 'completed', 100, { duration: 6800 }),
      createStage(3, 'running', 80, { duration: 18200 }),
      createStage(4, 'pending', 0),
    ],
    overallProgress: 76,
    status: 'running',
    startTime: new Date(Date.now() - 48600), // Started 48 seconds ago
  },
];

// Helper function to get pipeline by ID
export function getPipelineById(id: string): PipelinePipeline | undefined {
  return mockPipelines.find(pipeline => pipeline.id === id);
}

// Helper function to get pipelines by status
export function getPipelinesByStatus(status: PipelinePipeline['status']): PipelinePipeline[] {
  return mockPipelines.filter(pipeline => pipeline.status === status);
}

// Helper function to get stage status color class
export function getStageStatusColor(status: PipelineStageStatus): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'running':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'pending':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'skipped':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Helper function to get stage status icon
export function getStageStatusIcon(status: PipelineStageStatus): string {
  switch (status) {
    case 'completed':
      return '✓';
    case 'running':
      return '⟳';
    case 'failed':
      return '✗';
    case 'pending':
      return '○';
    case 'skipped':
      return '⊘';
    default:
      return '○';
  }
}

// Helper function to format duration
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

// Helper function to calculate overall progress
export function calculateOverallProgress(stages: PipelineStage[]): number {
  const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0);
  return Math.round(totalProgress / stages.length);
}

// Mock function to simulate pipeline updates (for real-time features)
export function updatePipelineProgress(pipelineId: string): PipelinePipeline | null {
  const pipeline = mockPipelines.find(p => p.id === pipelineId);
  if (!pipeline || pipeline.status === 'completed' || pipeline.status === 'failed') {
    return null;
  }

  // Find the running stage and advance its progress
  const runningStage = pipeline.stages.find(stage => stage.status === 'running');
  if (runningStage && runningStage.progress < 100) {
    runningStage.progress = Math.min(100, runningStage.progress + Math.random() * 10);
    
    // If stage is complete, move to next stage
    if (runningStage.progress >= 100) {
      runningStage.status = 'completed';
      runningStage.endTime = new Date();
      
      // Start next pending stage
      const nextStage = pipeline.stages.find(stage => stage.status === 'pending');
      if (nextStage) {
        nextStage.status = 'running';
        nextStage.startTime = new Date();
      } else {
        // All stages complete
        pipeline.status = 'completed';
        pipeline.endTime = new Date();
      }
    }
  }

  // Update overall progress
  pipeline.overallProgress = calculateOverallProgress(pipeline.stages);
  
  return pipeline;
}