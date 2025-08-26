import type { Meta, StoryObj } from '@storybook/react';
import { StageWorkflowView } from './stage-workflow-view';
import { ProcessingStage, StageInfo } from './stage-config';

const meta: Meta<typeof StageWorkflowView> = {
  title: 'Components/StageWorkflowView',
  component: StageWorkflowView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    executingStage: {
      control: { type: 'select' },
      options: [null, 'MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'],
    },
    isLoading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create stage info
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

export const InitialState: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'PENDING'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    executingStage: null,
    isLoading: false,
  },
};

export const FirstStageRunning: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'RUNNING', 45),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    executingStage: 'MARKDOWN_CONVERSION',
    isLoading: true,
  },
};

export const ProgressThroughWorkflow: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'RUNNING', 75),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    executingStage: 'CHUNKER',
    isLoading: true,
  },
};

export const WithOptionalStageCompleted: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'RUNNING', 30),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    executingStage: 'FACT_GENERATOR',
    isLoading: true,
  },
};

export const AllStagesCompleted: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'COMPLETED'),
      createStageInfo('INGESTOR', 'COMPLETED'),
    ],
    executingStage: null,
    isLoading: false,
  },
};

export const WithFailedStage: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'FAILED', undefined, 'Failed to process chunks: Invalid input format'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    executingStage: null,
    isLoading: false,
  },
};

export const MixedStates: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'FAILED', undefined, 'LLM service temporarily unavailable'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'RUNNING', 60),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    executingStage: 'FACT_GENERATOR',
    isLoading: true,
  },
};

export const Interactive: Story = {
  args: {
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    executingStage: null,
    isLoading: false,
    onExecuteStage: async (stage: ProcessingStage) => {
      console.log('Executing stage:', stage);
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
  },
};
