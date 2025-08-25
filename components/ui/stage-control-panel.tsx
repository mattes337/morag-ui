'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Card } from './card';
import { Alert, AlertDescription } from './alert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  FileText,
  Zap,
  Scissors,
  Brain,
  Database,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader
} from 'lucide-react';

type ProcessingStage = 'MARKDOWN_CONVERSION' | 'MARKDOWN_OPTIMIZER' | 'CHUNKER' | 'FACT_GENERATOR' | 'INGESTOR';
type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

interface StageInfo {
  stage: ProcessingStage;
  status: StageStatus;
  progress?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  canExecute?: boolean;
  isOptional?: boolean;
}

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

const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Markdown Conversion',
    description: 'Convert input files to unified markdown format',
    icon: FileText,
    color: 'bg-blue-500',
    estimatedTime: '30s - 2m',
    isOptional: false
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Markdown Optimizer',
    description: 'LLM-based text improvement and error correction',
    icon: Zap,
    color: 'bg-yellow-500',
    estimatedTime: '1m - 3m',
    isOptional: true
  },
  CHUNKER: {
    name: 'Chunker',
    description: 'Create summary, chunks, and contextual embeddings',
    icon: Scissors,
    color: 'bg-green-500',
    estimatedTime: '30s - 1m',
    isOptional: false
  },
  FACT_GENERATOR: {
    name: 'Fact Generator',
    description: 'Extract facts, entities, relations, and keywords',
    icon: Brain,
    color: 'bg-purple-500',
    estimatedTime: '1m - 4m',
    isOptional: false
  },
  INGESTOR: {
    name: 'Ingestor',
    description: 'Database ingestion and storage',
    icon: Database,
    color: 'bg-indigo-500',
    estimatedTime: '10s - 30s',
    isOptional: false
  }
};

const STATUS_CONFIG = {
  PENDING: { color: 'bg-gray-500', textColor: 'text-gray-700', icon: Clock, label: 'Pending' },
  RUNNING: { color: 'bg-blue-500', textColor: 'text-blue-700', icon: Loader, label: 'Running' },
  COMPLETED: { color: 'bg-green-500', textColor: 'text-green-700', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-500', textColor: 'text-red-700', icon: XCircle, label: 'Failed' },
  SKIPPED: { color: 'bg-gray-400', textColor: 'text-gray-600', icon: AlertCircle, label: 'Skipped' }
};

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

  const handleExecuteStage = async (stage: ProcessingStage) => {
    if (!onExecuteStage || executingStage) return;
    
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
    if (!onExecuteChain || executingStage) return;
    
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
    if (!onResetToStage || executingStage) return;
    
    try {
      setExecutingStage(stage);
      setError(null);
      await onResetToStage(stage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset to stage');
    } finally {
      setExecutingStage(null);
    }
  };

  const handleToggleMode = async () => {
    if (!onToggleProcessingMode) return;
    
    try {
      const newMode = processingMode === 'AUTOMATIC' ? 'MANUAL' : 'AUTOMATIC';
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

      {/* Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stageInfo, index) => {
          const stageConfig = STAGE_CONFIG[stageInfo.stage];
          const statusConfig = STATUS_CONFIG[stageInfo.status];
          const StageIcon = stageConfig.icon;
          const StatusIcon = statusConfig.icon;
          
          const isExecuting = executingStage === stageInfo.stage;
          const canExecute = stageInfo.canExecute !== false && !isExecuting && !isLoading;
          const isRunning = stageInfo.status === 'RUNNING' || isExecuting;
          
          return (
            <Card key={`${stageInfo.stage}-${index}`} className="p-4">
              {/* Stage Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stageConfig.color}`} />
                  <StageIcon className="w-5 h-5 text-gray-600" />
                </div>
                
                <div className="flex items-center space-x-1">
                  <StatusIcon className={`w-4 h-4 ${statusConfig.textColor} ${isRunning ? 'animate-spin' : ''}`} />
                  <Badge 
                    variant={stageInfo.status === 'COMPLETED' ? 'default' : 
                            stageInfo.status === 'FAILED' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Stage Info */}
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">
                  {stageConfig.name}
                  {stageConfig.isOptional && (
                    <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                  )}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {stageConfig.description}
                </p>
                <p className="text-xs text-gray-500">
                  Est. time: {stageConfig.estimatedTime}
                </p>
              </div>

              {/* Progress Bar */}
              {isRunning && stageInfo.progress !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium text-gray-900">
                      {stageInfo.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${stageInfo.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {stageInfo.status === 'FAILED' && stageInfo.errorMessage && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {stageInfo.errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              {processingMode === 'MANUAL' && (
                <div className="flex flex-col space-y-2">
                  {/* Execute Single Stage */}
                  <Button
                    size="sm"
                    variant={stageInfo.status === 'COMPLETED' ? 'outline' : 'default'}
                    onClick={() => handleExecuteStage(stageInfo.stage)}
                    disabled={!canExecute}
                    className="w-full"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {stageInfo.status === 'COMPLETED' ? 'Re-run' : 'Execute'}
                  </Button>
                  
                  {/* Execute Chain */}
                  {onExecuteChain && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecuteChain(stageInfo.stage)}
                      disabled={!canExecute}
                      className="w-full"
                    >
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Execute Chain
                    </Button>
                  )}
                  
                  {/* Reset */}
                  {stageInfo.status === 'COMPLETED' && onResetToStage && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResetToStage(stageInfo.stage)}
                      disabled={!canExecute}
                      className="w-full text-orange-600 hover:text-orange-700"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset to Here
                    </Button>
                  )}
                </div>
              )}
              
              {/* Automatic Mode Info */}
              {processingMode === 'AUTOMATIC' && (
                <div className="text-xs text-gray-500 text-center py-2">
                  Stages execute automatically
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default StageControlPanel;