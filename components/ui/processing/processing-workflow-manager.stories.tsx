import type { Meta, StoryObj } from '@storybook/react';
import { ProcessingWorkflowManager } from './processing-workflow-manager';

const meta: Meta<typeof ProcessingWorkflowManager> = {
  title: 'Components/ProcessingWorkflowManager',
  component: ProcessingWorkflowManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    processingMode: {
      control: { type: 'radio' },
      options: ['MANUAL', 'AUTOMATIC'],
    },
    isProcessing: {
      control: { type: 'boolean' },
    },
    overallProgress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create stage info
const createStageInfo = (
  stage: 'MARKDOWN_CONVERSION' | 'MARKDOWN_OPTIMIZER' | 'CHUNKER' | 'FACT_GENERATOR' | 'INGESTOR',
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED',
  progress?: number,
  errorMessage?: string
) => ({
  stage,
  status,
  progress,
  errorMessage,
  startedAt: status !== 'PENDING' ? new Date(Date.now() - 120000) : undefined,
  completedAt: status === 'COMPLETED' ? new Date(Date.now() - 60000) : undefined,
  canExecute: status === 'PENDING',
  isOptional: stage === 'MARKDOWN_OPTIMIZER',
});

export const InitialState: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Sample Document.pdf',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'PENDING'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    overallProgress: 0,
    isProcessing: false,
  },
};

export const FirstStageRunning: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Research Paper.pdf',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'RUNNING', 45),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'AUTOMATIC',
    currentStage: 'MARKDOWN_CONVERSION',
    overallProgress: 9,
    isProcessing: true,
  },
};

export const PartiallyCompleted: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Technical Manual.docx',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'RUNNING', 75),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    currentStage: 'CHUNKER',
    overallProgress: 45,
    isProcessing: true,
  },
};

export const WithOptionalStageCompleted: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Legal Document.pdf',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'RUNNING', 30),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'AUTOMATIC',
    currentStage: 'FACT_GENERATOR',
    overallProgress: 70,
    isProcessing: true,
  },
};

export const AllCompleted: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Financial Report.xlsx',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'COMPLETED'),
      createStageInfo('INGESTOR', 'COMPLETED'),
    ],
    processingMode: 'MANUAL',
    overallProgress: 100,
    isProcessing: false,
  },
};

export const WithFailedStage: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Corrupted File.pdf',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'FAILED', undefined, 'Failed to process chunks: Invalid input format detected'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    currentStage: 'CHUNKER',
    overallProgress: 40,
    isProcessing: false,
  },
};

export const AutomaticModeProcessing: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Large Dataset.csv',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'RUNNING', 60),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'AUTOMATIC',
    currentStage: 'MARKDOWN_OPTIMIZER',
    overallProgress: 30,
    isProcessing: true,
  },
};

export const Interactive: Story = {
  args: {
    documentId: 'doc-123',
    documentName: 'Interactive Demo.pdf',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    overallProgress: 20,
    isProcessing: false,
    onExecuteStage: async (stage) => {
      console.log('Executing stage:', stage);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onExecuteChain: async (fromStage) => {
      console.log('Executing chain from stage:', fromStage);
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    onResetToStage: async (stage) => {
      console.log('Resetting to stage:', stage);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onToggleProcessingMode: async (mode) => {
      console.log('Toggling to mode:', mode);
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  },
};
