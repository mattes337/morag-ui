'use client';

import React, { useState } from 'react';
import { Button } from '../button';
import { Badge } from '../badge';
import { Alert, AlertDescription } from '../alert';
import { AlertCircle, Settings } from 'lucide-react';
import { StageWorkflowView } from './stage-workflow-view';
import {
  ProcessingStage,
  StageInfo
} from './stage-config';

interface StageControlPanelProps {
  documentId: string;
  stages: StageInfo[];
  processingMode: 'MANUAL' | 'AUTOMATIC';
  onExecuteStage?: (stage: ProcessingStage) => Promise<void>;
  onExecuteChain?: (fromStage: ProcessingStage) => Promise<void>;
  onResetToStage?: (stage: ProcessingStage) => Promise<void>;
  onToggleProcessingMode?: (mode: 'MANUAL' | 'AUTOMATIC') => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function StageControlPanel({
  documentId,
  stages,
  processingMode,
  onExecuteStage,
  onExecuteChain,
  onResetToStage,
  onToggleProcessingMode,
  isLoading = false,
  className = ''
}: StageControlPanelProps) {
  const [executingStage, setExecutingStage] = useState<ProcessingStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Handle stage execution with error handling
  const handleExecuteStage = async (stage: ProcessingStage) => {
    if (!onExecuteStage) return;

    try {
      setExecutingStage(stage);
      setError(null);
      await onExecuteStage(stage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute stage');
    } finally {
      setExecutingStage(null);
    }
  };

  const handleExecuteChain = async (fromStage: ProcessingStage) => {
    if (!onExecuteChain) return;

    try {
      setExecutingStage(fromStage);
      setError(null);
      await onExecuteChain(fromStage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute stage chain');
    } finally {
      setExecutingStage(null);
    }
  };

  const handleResetToStage = async (stage: ProcessingStage) => {
    if (!onResetToStage) return;

    try {
      setError(null);
      await onResetToStage(stage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset stage');
    }
  };

  const handleToggleMode = async () => {
    if (!onToggleProcessingMode || executingStage) return;

    try {
      setError(null);
      const newMode = processingMode === 'MANUAL' ? 'AUTOMATIC' : 'MANUAL';
      await onToggleProcessingMode(newMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle processing mode');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Stage Control Panel</h3>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant={processingMode === 'AUTOMATIC' ? 'default' : 'secondary'}>
            {processingMode} Mode
          </Badge>

          {onToggleProcessingMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMode}
              disabled={isLoading || !!executingStage}
            >
              Switch to {processingMode === 'AUTOMATIC' ? 'Manual' : 'Automatic'}
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Workflow View */}
      <StageWorkflowView
        stages={stages}
        executingStage={executingStage}
        onExecuteStage={handleExecuteStage}
        onExecuteChain={handleExecuteChain}
        onResetToStage={handleResetToStage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default StageControlPanel;