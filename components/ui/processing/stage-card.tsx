'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../button';
import { Badge } from '../badge';
import { Alert, AlertDescription } from '../alert';
import { ChevronRight, Play, Settings, RotateCcw, AlertCircle } from 'lucide-react';
import {
  ProcessingStage,
  StageInfo,
  STAGE_CONFIG,
  STATUS_CONFIG,
  getEffectiveStageStatus,
  canExecuteStage,
  canExecuteChainFrom
} from './stage-config';

interface StageCardProps {
  stage: ProcessingStage;
  stageInfo: StageInfo | undefined;
  stageMap: Map<ProcessingStage, StageInfo>;
  isExecuting: boolean;
  onExecuteStage?: (stage: ProcessingStage) => Promise<void>;
  onExecuteChain?: (fromStage: ProcessingStage) => Promise<void>;
  onResetToStage?: (stage: ProcessingStage) => Promise<void>;
  isLoading?: boolean;
  processingMode?: 'MANUAL' | 'AUTOMATIC';
  documentId?: string;
}

interface RetryInfo {
  retryCount: number;
  canRetry: boolean;
}

export function StageCard({
  stage,
  stageInfo,
  stageMap,
  isExecuting,
  onExecuteStage,
  onExecuteChain,
  onResetToStage,
  isLoading = false,
  processingMode = 'MANUAL',
  documentId
}: StageCardProps) {
  const [retryInfo, setRetryInfo] = useState<RetryInfo>({ retryCount: 0, canRetry: true });

  const config = STAGE_CONFIG[stage];
  const effectiveStatus = getEffectiveStageStatus(stage, stageMap);
  const statusConfig = STATUS_CONFIG[effectiveStatus];
  const canExecute = canExecuteStage(stage, stageMap);
  const canExecuteChain = canExecuteChainFrom(stage, stageMap);

  const IconComponent = config.icon;
  const StatusIcon = statusConfig.icon;

  // Load retry information for failed stages
  useEffect(() => {
    if (documentId && effectiveStatus === 'FAILED') {
      const loadRetryInfo = async () => {
        try {
          const response = await fetch(`/api/documents/${documentId}/retry-info?stage=${stage}`);
          if (response.ok) {
            const data = await response.json();
            setRetryInfo({
              retryCount: data.retryCount || 0,
              canRetry: data.canRetry !== false
            });
          }
        } catch (error) {
          console.error('Failed to load retry info:', error);
        }
      };
      loadRetryInfo();
    }
  }, [documentId, stage, effectiveStatus]);

  const handleExecuteStage = async () => {
    if (onExecuteStage && canExecute && !isLoading) {
      await onExecuteStage(stage);
      // Reload retry info after execution
      if (documentId && effectiveStatus === 'FAILED') {
        try {
          const response = await fetch(`/api/documents/${documentId}/retry-info?stage=${stage}`);
          if (response.ok) {
            const data = await response.json();
            setRetryInfo({
              retryCount: data.retryCount || 0,
              canRetry: data.canRetry !== false
            });
          }
        } catch (error) {
          console.error('Failed to reload retry info:', error);
        }
      }
    }
  };

  const handleRetryStage = async () => {
    if (onExecuteStage && retryInfo.canRetry && !isLoading) {
      await onExecuteStage(stage);
      // Reload retry info after retry
      if (documentId) {
        try {
          const response = await fetch(`/api/documents/${documentId}/retry-info?stage=${stage}`);
          if (response.ok) {
            const data = await response.json();
            setRetryInfo({
              retryCount: data.retryCount || 0,
              canRetry: data.canRetry !== false
            });
          }
        } catch (error) {
          console.error('Failed to reload retry info:', error);
        }
      }
    }
  };

  const handleExecuteChain = async () => {
    if (onExecuteChain && canExecuteChain && !isLoading) {
      await onExecuteChain(stage);
    }
  };

  const handleResetToStage = async () => {
    if (onResetToStage && !isLoading) {
      await onResetToStage(stage);
    }
  };

  return (
    <div className={`
      relative p-4 border rounded-lg transition-all duration-200
      ${effectiveStatus === 'RUNNING' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}
      ${canExecute ? 'hover:border-blue-300 hover:shadow-sm' : ''}
    `}>
      {/* Stage Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-white
            ${config.color}
          `}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{config.name}</h3>
              {config.isOptional && (
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <Badge 
            variant={effectiveStatus === 'COMPLETED' ? 'default' : 'secondary'}
            className={`
              flex items-center space-x-1
              ${statusConfig.textColor}
            `}
          >
            <StatusIcon className={`w-3 h-3 ${effectiveStatus === 'RUNNING' ? 'animate-spin' : ''}`} />
            <span>{statusConfig.label}</span>
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      {effectiveStatus === 'RUNNING' && stageInfo?.progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(stageInfo.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stageInfo?.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {effectiveStatus === 'FAILED' && stageInfo?.errorMessage && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Stage Failed</div>
            <div className="text-sm mt-1">{stageInfo.errorMessage}</div>
            {retryInfo.retryCount > 0 && (
              <div className="text-xs mt-2 opacity-75">
                Retry attempts: {retryInfo.retryCount}/3
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Timing Information */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Est. time: {config.estimatedTime}</span>
        {stageInfo?.startedAt && (
          <span>
            {effectiveStatus === 'RUNNING' ? 'Started' : 'Completed'}: {' '}
            {stageInfo.startedAt.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Only show execute buttons in manual mode or when processing is halted/failed */}
        {processingMode === 'MANUAL' && canExecute && effectiveStatus !== 'RUNNING' && (
          <Button
            size="sm"
            onClick={handleExecuteStage}
            disabled={isLoading || isExecuting}
            className="flex items-center space-x-1"
          >
            <Play className="w-3 h-3" />
            <span>Execute</span>
          </Button>
        )}

        {/* Retry button for failed stages */}
        {effectiveStatus === 'FAILED' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetryStage}
            disabled={isLoading || isExecuting || !retryInfo.canRetry}
            className="flex items-center space-x-1"
            title={!retryInfo.canRetry ? `Maximum retries exceeded (${retryInfo.retryCount}/3)` : 'Retry stage'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>
              {!retryInfo.canRetry ? 'Max Retries' : 'Retry'}
              {retryInfo.retryCount > 0 && ` (${retryInfo.retryCount}/3)`}
            </span>
          </Button>
        )}

        {processingMode === 'MANUAL' && canExecuteChain && effectiveStatus !== 'RUNNING' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleExecuteChain}
            disabled={isLoading || isExecuting}
            className="flex items-center space-x-1"
          >
            <ChevronRight className="w-3 h-3" />
            <span>Execute Chain</span>
          </Button>
        )}

        {(effectiveStatus === 'COMPLETED' || effectiveStatus === 'FAILED') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetToStage}
            disabled={isLoading || isExecuting}
            className="flex items-center space-x-1"
          >
            <Settings className="w-3 h-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Execution Indicator */}
      {isExecuting && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="bg-white px-3 py-2 rounded-md shadow-sm flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Executing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
