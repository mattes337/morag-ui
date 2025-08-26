import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProcessingStatusDisplay } from './processing-status-display';

const meta: Meta<typeof ProcessingStatusDisplay> = {
  title: 'Components/ProcessingStatusDisplay',
  component: ProcessingStatusDisplay,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    processingMode: {
      control: { type: 'radio' },
      options: ['MANUAL', 'AUTOMATIC'],
    },
    currentStage: {
      control: { type: 'select' },
      options: [undefined, 'MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'],
    },
    overallProgress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    compact: {
      control: { type: 'boolean' },
    },
    hideProcessingMode: {
      control: { type: 'boolean' },
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
});

export const Idle: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'MANUAL',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'PENDING'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 0,
  },
};

export const FirstStageRunning: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'AUTOMATIC',
    currentStage: 'MARKDOWN_CONVERSION',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'RUNNING', 45),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 9,
  },
};

export const PartiallyCompleted: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'MANUAL',
    currentStage: 'CHUNKER',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'RUNNING', 75),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 45,
  },
};

export const WithOptionalStageCompleted: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'AUTOMATIC',
    currentStage: 'FACT_GENERATOR',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'RUNNING', 30),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 70,
  },
};

export const AllCompleted: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'MANUAL',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'COMPLETED'),
      createStageInfo('INGESTOR', 'COMPLETED'),
    ],
    overallProgress: 100,
  },
};

export const WithFailedStage: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'MANUAL',
    currentStage: 'CHUNKER',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'FAILED', undefined, 'Failed to process chunks: Invalid input format'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 40,
  },
};

export const CompactView: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'AUTOMATIC',
    currentStage: 'FACT_GENERATOR',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'COMPLETED'),
      createStageInfo('CHUNKER', 'COMPLETED'),
      createStageInfo('FACT_GENERATOR', 'RUNNING', 60),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 75,
    compact: true,
  },
};

export const HiddenProcessingMode: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'MANUAL',
    currentStage: 'CHUNKER',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'SKIPPED'),
      createStageInfo('CHUNKER', 'RUNNING', 50),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 50,
    hideProcessingMode: true,
  },
};

export const CompactWithError: Story = {
  args: {
    documentId: 'doc-123',
    processingMode: 'AUTOMATIC',
    currentStage: 'MARKDOWN_OPTIMIZER',
    stages: [
      createStageInfo('MARKDOWN_CONVERSION', 'COMPLETED'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'FAILED', undefined, 'LLM service temporarily unavailable'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ],
    overallProgress: 20,
    compact: true,
  },
};
