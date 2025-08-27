'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { Alert, AlertDescription } from '../alert';
import { StageControlPanel } from './stage-control-panel';
import { StageProgressIndicator } from './stage-progress-indicator';
import { ProcessingModeToggle } from './processing-mode-toggle';
import { RetryButton } from './retry-button';
import {
  Settings,
  Activity,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

type ProcessingStage = 'MARKDOWN_CONVERSION' | 'MARKDOWN_OPTIMIZER' | 'CHUNKER' | 'FACT_GENERATOR' | 'INGESTOR';
type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
type ProcessingMode = 'MANUAL' | 'AUTOMATIC';

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

interface ProcessingWorkflowManagerProps {
  documentId: string;
  documentName: string;
  stages: StageInfo[];
  processingMode: ProcessingMode;
  currentStage?: ProcessingStage;
  overallProgress?: number;
  isProcessing?: boolean;
  onExecuteStage?: (stage: ProcessingStage) => Promise<void>;
  onExecuteChain?: (fromStage: ProcessingStage) => Promise<void>;
  onResetToStage?: (stage: ProcessingStage) => Promise<void>;
  onToggleProcessingMode?: (mode: ProcessingMode) => Promise<void>;
  onStartProcessing?: () => Promise<void>;
  onPauseProcessing?: () => Promise<void>;
  onRefreshStatus?: () => Promise<void>;
  className?: string;
}

export function ProcessingWorkflowManager({
  documentId,
  documentName,
  stages,
  processingMode,
  currentStage,
  overallProgress,
  isProcessing = false,
  onExecuteStage,
  onExecuteChain,
  onResetToStage,
  onToggleProcessingMode,
  onStartProcessing,
  onPauseProcessing,
  onRefreshStatus,
  className = ''
}: ProcessingWorkflowManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh status every 30 seconds when processing
  useEffect(() => {
    if (!isProcessing || !onRefreshStatus) return;

    const interval = setInterval(async () => {
      try {
        await onRefreshStatus();
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Failed to refresh status:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isProcessing, onRefreshStatus]);

  const handleStartProcessing = async () => {
    if (!onStartProcessing) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onStartProcessing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start processing');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseProcessing = async () => {
    if (!onPauseProcessing) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onPauseProcessing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause processing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!onRefreshStatus) return;
    
    try {
      setIsLoading(true);
      await onRefreshStatus();
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = async (mode: ProcessingMode) => {
    if (!onToggleProcessingMode) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onToggleProcessingMode(mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle processing mode');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const completedStages = stages.filter(s => s.status === 'COMPLETED').length;
  const failedStages = stages.filter(s => s.status === 'FAILED').length;
  const pendingStages = stages.filter(s => s.status === 'PENDING').length;
  const runningStages = stages.filter(s => s.status === 'RUNNING').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Processing Workflow</h2>
          <p className="text-sm text-gray-600 mt-1">
            Document: <span className="font-medium">{documentName}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Processing Mode Toggle */}
          <ProcessingModeToggle
            mode={processingMode}
            onModeChange={handleToggleMode}
            disabled={isProcessing || isLoading}
          />
          
          {/* Refresh Button */}
          <RetryButton
            variant="outline"
            size="sm"
            onRetry={handleRefreshStatus}
            isLoading={isLoading}
          >
            Refresh Status
          </RetryButton>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{completedStages}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{runningStages}</p>
                <p className="text-xs text-gray-600">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-600">{pendingStages}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{failedStages}</p>
                <p className="text-xs text-gray-600">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Controls */}
      {processingMode === 'AUTOMATIC' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Automatic Processing</h3>
                  <p className="text-sm text-gray-600">
                    {isProcessing ? 'Processing stages automatically...' : 'Ready to start automatic processing'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isProcessing && onStartProcessing && (
                  <Button
                    onClick={handleStartProcessing}
                    disabled={isLoading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Processing
                  </Button>
                )}
                
                {isProcessing && onPauseProcessing && (
                  <Button
                    variant="outline"
                    onClick={handlePauseProcessing}
                    disabled={isLoading}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Processing
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="control">Stage Control</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Processing Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StageProgressIndicator
                stages={stages}
                currentStage={currentStage}
                overallProgress={overallProgress}
                showLabels={true}
                showProgress={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Stage Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StageControlPanel
                documentId={documentId}
                stages={stages}
                processingMode={processingMode}
                onExecuteStage={onExecuteStage}
                onExecuteChain={onExecuteChain}
                onResetToStage={onResetToStage}
                onToggleProcessingMode={onToggleProcessingMode}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {lastRefresh.toLocaleString()}
        {isProcessing && ' • Auto-refreshing every 30 seconds'}
      </div>
    </div>
  );
}

export default ProcessingWorkflowManager;