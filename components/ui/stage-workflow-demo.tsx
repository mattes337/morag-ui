'use client';

import React from 'react';
import { StageControlPanel } from './stage-control-panel';

// Demo component to showcase the new workflow UI
export function StageWorkflowDemo() {
  // Mock stage data to demonstrate the workflow
  const mockStages = [
    {
      stage: 'MARKDOWN_CONVERSION' as const,
      status: 'COMPLETED' as const,
      progress: 100,
      startedAt: new Date(Date.now() - 120000), // 2 minutes ago
      completedAt: new Date(Date.now() - 60000), // 1 minute ago
      canExecute: true
    },
    {
      stage: 'MARKDOWN_OPTIMIZER' as const,
      status: 'PENDING' as const,
      canExecute: true
    },
    {
      stage: 'CHUNKER' as const,
      status: 'PENDING' as const,
      canExecute: true
    },
    {
      stage: 'FACT_GENERATOR' as const,
      status: 'PENDING' as const,
      canExecute: false // Can't execute until chunker is done
    },
    {
      stage: 'INGESTOR' as const,
      status: 'PENDING' as const,
      canExecute: false // Can't execute until fact generator is done
    }
  ];

  const handleExecuteStage = async (stage: string) => {
    console.log(`Executing stage: ${stage}`);
    // Mock execution logic
    alert(`Would execute stage: ${stage}`);
  };

  const handleExecuteChain = async (fromStage: string) => {
    console.log(`Executing chain from stage: ${fromStage}`);
    alert(`Would execute chain from stage: ${fromStage}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          New Workflow-Style Stage Control Panel
        </h2>
        <p className="text-gray-600">
          This demonstrates the new left-to-right workflow UI with proper stage dependencies.
          The MARKDOWN_OPTIMIZER stage is marked as optional and can be skipped.
        </p>
      </div>

      <StageControlPanel
        documentId="demo-document-123"
        stages={mockStages}
        processingMode="MANUAL"
        onExecuteStage={handleExecuteStage}
        onExecuteChain={handleExecuteChain}
        isLoading={false}
      />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Key Features:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Left-to-right workflow:</strong> Stages are displayed in execution order</li>
          <li>• <strong>Dependency management:</strong> Stages are only clickable when prerequisites are met</li>
          <li>• <strong>Optional stages:</strong> MARKDOWN_OPTIMIZER is marked as optional with dashed border</li>
          <li>• <strong>Visual state indicators:</strong> Colors and icons show completion status</li>
          <li>• <strong>Workflow arrows:</strong> Show the flow between stages</li>
          <li>• <strong>Batch execution:</strong> &quot;Execute Remaining&quot; button for running multiple stages</li>
        </ul>
      </div>
    </div>
  );
}

export default StageWorkflowDemo;
