import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
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

// Interactive story with simulated event handling
export const InteractiveSimulation = {
  render: () => {
    const [stages, setStages] = useState<StageInfo[]>([
      createStageInfo('MARKDOWN_CONVERSION', 'PENDING'),
      createStageInfo('MARKDOWN_OPTIMIZER', 'PENDING'),
      createStageInfo('CHUNKER', 'PENDING'),
      createStageInfo('FACT_GENERATOR', 'PENDING'),
      createStageInfo('INGESTOR', 'PENDING'),
    ]);
    const [processingMode, setProcessingMode] = useState<'MANUAL' | 'AUTOMATIC'>('MANUAL');
    const [isLoading, setIsLoading] = useState(false);
    const [executingStage, setExecutingStage] = useState<ProcessingStage | null>(null);

    // Simulate stage execution with 2-second delay
    const simulateStageExecution = async (stage: ProcessingStage) => {
      console.log(`🎬 [Storybook] Simulating execution of stage: ${stage}`);

      setExecutingStage(stage);
      setIsLoading(true);

      // Update stage to RUNNING with progress
      setStages(prev => prev.map(s =>
        s.stage === stage
          ? { ...s, status: 'RUNNING' as const, progress: 0, startedAt: new Date() }
          : s
      ));

      // Simulate progress updates
      for (let progress = 10; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setStages(prev => prev.map(s =>
          s.stage === stage
            ? { ...s, progress }
            : s
        ));
      }

      // Complete the stage
      setStages(prev => prev.map(s =>
        s.stage === stage
          ? { ...s, status: 'COMPLETED' as const, progress: 100, completedAt: new Date() }
          : s
      ));

      setExecutingStage(null);
      setIsLoading(false);

      console.log(`✅ [Storybook] Stage ${stage} completed successfully`);
    };

    // Simulate chain execution
    const simulateChainExecution = async (fromStage: ProcessingStage) => {
      console.log(`🔗 [Storybook] Simulating chain execution from stage: ${fromStage}`);

      const stageOrder: ProcessingStage[] = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
      const startIndex = stageOrder.indexOf(fromStage);

      for (let i = startIndex; i < stageOrder.length; i++) {
        const stage = stageOrder[i];
        const currentStage = stages.find(s => s.stage === stage);

        // Skip if already completed or if it's the optional optimizer and we want to skip it
        if (currentStage?.status === 'COMPLETED') continue;
        if (stage === 'MARKDOWN_OPTIMIZER' && Math.random() > 0.7) {
          // Sometimes skip the optional optimizer
          setStages(prev => prev.map(s =>
            s.stage === stage
              ? { ...s, status: 'SKIPPED' as const }
              : s
          ));
          continue;
        }

        await simulateStageExecution(stage);
      }
    };

    // Handle stage execution
    const handleExecuteStage = async (stage: ProcessingStage) => {
      await simulateStageExecution(stage);
    };

    // Handle chain execution
    const handleExecuteChain = async (fromStage: ProcessingStage) => {
      await simulateChainExecution(fromStage);
    };

    // Handle reset to stage
    const handleResetToStage = async (stage: ProcessingStage) => {
      console.log(`🔄 [Storybook] Resetting to stage: ${stage}`);

      const stageOrder: ProcessingStage[] = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
      const resetIndex = stageOrder.indexOf(stage);

      setStages(prev => prev.map(s => {
        const stageIndex = stageOrder.indexOf(s.stage);
        if (stageIndex >= resetIndex) {
          return { ...s, status: 'PENDING' as const, progress: undefined, startedAt: undefined, completedAt: undefined };
        }
        return s;
      }));
    };

    // Handle processing mode toggle
    const handleToggleProcessingMode = async () => {
      const newMode = processingMode === 'MANUAL' ? 'AUTOMATIC' : 'MANUAL';
      console.log(`🔄 [Storybook] Switching processing mode to: ${newMode}`);
      setProcessingMode(newMode);
    };

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Interactive Stage Control Panel Simulation
          </h2>
          <p className="text-gray-600 mb-4">
            This story simulates the complete stage execution workflow. Click &quot;Execute&quot; on any stage
            to see a 2-second simulation with progress updates. The MARKDOWN_OPTIMIZER stage is optional
            and may be skipped during chain execution.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to test:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Click &quot;Execute&quot; on MARKDOWN_CONVERSION to start the first stage</li>
              <li>• Use &quot;Execute Chain&quot; to run all remaining stages automatically</li>
              <li>• Try &quot;Reset to Stage&quot; to reset progress from a specific point</li>
              <li>• Toggle between MANUAL and AUTOMATIC processing modes</li>
              <li>• Watch the progress indicators and status changes</li>
            </ul>
          </div>
        </div>

        <StageControlPanel
          documentId="interactive-demo-doc"
          stages={stages}
          processingMode={processingMode}
          onExecuteStage={handleExecuteStage}
          onExecuteChain={handleExecuteChain}
          onResetToStage={handleResetToStage}
          onToggleProcessingMode={handleToggleProcessingMode}
          isLoading={isLoading}
        />

        {/* Debug Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Debug Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Processing Mode: <span className="font-mono">{processingMode}</span></div>
            <div>Is Loading: <span className="font-mono">{isLoading.toString()}</span></div>
            <div>Executing Stage: <span className="font-mono">{executingStage || 'none'}</span></div>
            <div>Stage Status:
              <div className="ml-4 mt-1">
                {stages.map(stage => (
                  <div key={stage.stage} className="font-mono text-xs">
                    {stage.stage}: {stage.status} {stage.progress ? `(${stage.progress}%)` : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
