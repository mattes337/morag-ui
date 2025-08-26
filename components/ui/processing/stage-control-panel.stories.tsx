import type { Meta, StoryObj } from '@storybook/react';
import { StageControlPanel } from './stage-control-panel';
import { ProcessingStage, StageInfo } from './stage-config';

const meta: Meta<typeof StageControlPanel> = {
  title: 'Components/StageControlPanel',
  component: StageControlPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    processingMode: {
      control: { type: 'radio' },
      options: ['MANUAL', 'AUTOMATIC'],
    },
    isLoading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock stage data for different scenarios
const createStageInfo = (
  stage: ProcessingStage,
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED',
  progress?: number,
  errorMessage?: string
): StageInfo => ({
  stage,
  status,
  progress,
  errorMessage,
  startedAt: status !== 'PENDING' ? new Date(Date.now() - 120000) : undefined,
  completedAt: status === 'COMPLETED' ? new Date(Date.now() - 60000) : undefined,
});

// Base stages for all scenarios
const baseStages: StageInfo[] = [
  createStageInfo('MARKDOWN_CONVERSION', 'PENDING'),
  createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
  createStageInfo('CHUNKER', 'PENDING'),
  createStageInfo('FACT_GENERATOR', 'PENDING'),
  createStageInfo('INGESTOR', 'PENDING'),
];

export const Default: Story = {
  args: {
    documentId: 'doc-123',
    stages: baseStages,
    processingMode: 'MANUAL',
    isLoading: false,
  },
};

export const FirstStageRunning: Story = {
  args: {
    documentId: 'doc-123',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'RUNNING', 45),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    isLoading: true,
  },
};

export const PartiallyCompleted: Story = {
  args: {
    documentId: 'doc-123',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'RUNNING', 75),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    isLoading: true,
  },
};

export const WithOptionalStageCompleted: Story = {
  args: {
    documentId: 'doc-123',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'RUNNING', 30),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    isLoading: true,
  },
};

export const AllCompleted: Story = {
  args: {
    documentId: 'doc-123',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'COMPLETED'),
      createStageInfo('INGESTOR', 'COMPLETED'),
    ],
    processingMode: 'MANUAL',
    isLoading: false,
  },
};

export const WithFailedStage: Story = {
  args: {
    documentId: 'doc-123',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'FAILED', undefined, 'Failed to process chunks: Invalid input format'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'MANUAL',
    isLoading: false,
  },
};

export const AutomaticMode: Story = {
  args: {
    documentId: 'doc-123',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'RUNNING', 60),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    processingMode: 'AUTOMATIC',
    isLoading: true,
  },
};

export const Interactive: Story = {
  args: {
    documentId: 'doc-123',
    stages: baseStages,
    processingMode: 'MANUAL',
    isLoading: false,
    onExecuteStage: async (stage: ProcessingStage) => {
      console.log('Executing stage:', stage);
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onExecuteChain: async (fromStage: ProcessingStage) => {
      console.log('Executing chain from stage:', fromStage);
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    onResetToStage: async (stage: ProcessingStage) => {
      console.log('Resetting to stage:', stage);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onToggleProcessingMode: async (mode: 'MANUAL' | 'AUTOMATIC') => {
      console.log('Toggling to mode:', mode);
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  },
};
