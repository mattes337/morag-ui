import type { Meta, StoryObj } from '@storybook/react';
import { StageCard } from './stage-card';
import { ProcessingStage, StageInfo } from './stage-config';

const meta: Meta<typeof StageCard> = {
  title: 'Components/StageCard',
  component: StageCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    stage: {
      control: { type: 'select' },
      options: ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'],
    },
    isExecuting: {
      control: { type: 'boolean' },
    },
    isLoading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create stage map
const createStageMap = (stages: StageInfo[]): Map<ProcessingStage, StageInfo> => {
  return new Map(stages.map(stage => [stage.stage, stage]));
};

// Mock stage info
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

const baseStages = [
  createStageInfo('MARKDOWN_CONVERSION', 'PENDING'),
  createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
  createStageInfo('CHUNKER', 'PENDING'),
  createStageInfo('FACT_GENERATOR', 'PENDING'),
  createStageInfo('INGESTOR', 'PENDING'),
];

export const MarkdownConversionPending: Story = {
  args: {
    stage: 'MARKDOWN_CONVERSION',
    stageInfo: createStageInfo('MARKDOWN_CONVERSION', 'PENDING'),
    stageMap: createStageMap(baseStages),
    isExecuting: false,
    isLoading: false,
  },
};

export const MarkdownConversionRunning: Story = {
  args: {
    stage: 'MARKDOWN_CONVERSION',
    stageInfo: createStageInfo('MARKDOWN_CONVERSION', 'RUNNING', 45),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'RUNNING', 45),
      ...baseStages.slice(1),
    ]),
    isExecuting: true,
    isLoading: true,
  },
};

export const MarkdownConversionCompleted: Story = {
  args: {
    stage: 'MARKDOWN_CONVERSION',
    stageInfo: createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      ...baseStages.slice(1),
    ]),
    isExecuting: false,
    isLoading: false,
  },
};

export const OptionalStageSkipped: Story = {
  args: {
    stage: 'MARKDOWN_OPTIMIZER',
    stageInfo: createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'RUNNING', 30),
      ...baseStages.slice(3),
    ]),
    isExecuting: false,
    isLoading: false,
  },
};

export const OptionalStageCompleted: Story = {
  args: {
    stage: 'MARKDOWN_OPTIMIZER',
    stageInfo: createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      ...baseStages.slice(2),
    ]),
    isExecuting: false,
    isLoading: false,
  },
};

export const StageWithError: Story = {
  args: {
    stage: 'CHUNKER',
    stageInfo: createStageInfo('CHUNKER', 'FAILED', undefined, 'Failed to process chunks: Invalid input format detected'),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'FAILED', undefined, 'Failed to process chunks: Invalid input format detected'),
      ...baseStages.slice(3),
    ]),
    isExecuting: false,
    isLoading: false,
  },
};

export const FactGeneratorRunning: Story = {
  args: {
    stage: 'FACT_GENERATOR',
    stageInfo: createStageInfo('FACT_GENERATOR', 'RUNNING', 75),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'RUNNING', 75),
      createStageInfo('INGESTOR', 'PENDING'),
    ]),
    isExecuting: true,
    isLoading: true,
  },
};

export const IngestorCompleted: Story = {
  args: {
    stage: 'INGESTOR',
    stageInfo: createStageInfo('INGESTOR', 'COMPLETED'),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'COMPLETED'),
      createStageInfo('INGESTOR', 'COMPLETED'),
    ]),
    isExecuting: false,
    isLoading: false,
  },
};

export const Interactive: Story = {
  args: {
    stage: 'CHUNKER',
    stageInfo: createStageInfo('CHUNKER', 'PENDING'),
    stageMap: createStageMap([
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ]),
    isExecuting: false,
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
