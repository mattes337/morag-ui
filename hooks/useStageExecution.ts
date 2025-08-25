'use client';

import { useState, useCallback } from 'react';
import { ProcessingStage, StageStatus } from '@prisma/client';

interface StageExecutionOptions {
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
  retryCount?: number;
  skipValidation?: boolean;
  customParameters?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface StageExecutionResult {
  id: string;
  documentId: string;
  stage: ProcessingStage;
  status: StageStatus;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  inputFiles?: string[];
  outputFiles?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface PipelineStatus {
  currentStage: ProcessingStage | null;
  stageStatus: StageStatus;
  completedStages: ProcessingStage[];
  failedStages: ProcessingStage[];
  nextStage: ProcessingStage | null;
  progress: number;
}

interface UseStageExecutionReturn {
  // State
  isExecuting: boolean;
  executionError: string | null;
  currentExecution: StageExecutionResult | null;
  
  // Actions
  executeStage: (documentId: string, stage: ProcessingStage, options?: StageExecutionOptions) => Promise<StageExecutionResult>;
  executeChain: (documentId: string, stages: ProcessingStage[], options?: StageExecutionOptions) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  resetToStage: (documentId: string, stage: ProcessingStage) => Promise<void>;
  
  // Data fetching
  fetchPipelineStatus: (documentId: string) => Promise<PipelineStatus>;
  fetchExecutions: (documentId: string) => Promise<StageExecutionResult[]>;
  fetchExecution: (executionId: string) => Promise<StageExecutionResult>;
}

export function useStageExecution(): UseStageExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [currentExecution, setCurrentExecution] = useState<StageExecutionResult | null>(null);

  const executeStage = useCallback(async (
    documentId: string, 
    stage: ProcessingStage, 
    options: StageExecutionOptions = {}
  ): Promise<StageExecutionResult> => {
    setIsExecuting(true);
    setExecutionError(null);
    
    try {
      console.log(`🚀 [UI] Executing stage: ${stage} for document: ${documentId}`);

      const response = await fetch('/api/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          stage,
          priority: options?.priority || 5,
          metadata: options || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Handle new background job response format
      if (result.job) {
        console.log(`✅ [UI] Background job created for stage execution:`, result.job);

        // Create a mock execution object for compatibility
        const mockExecution: StageExecutionResult = {
          id: result.job.id,
          documentId: result.job.documentId,
          stage: result.job.stage,
          status: 'PENDING' as StageStatus,
          startedAt: new Date(result.job.createdAt),
          metadata: { jobId: result.job.id },
          createdAt: new Date(result.job.createdAt),
          updatedAt: new Date(result.job.createdAt)
        };

        setCurrentExecution(mockExecution);
        return mockExecution;
      }

      // Handle legacy execution response format
      setCurrentExecution(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const executeChain = useCallback(async (
    documentId: string, 
    stages: ProcessingStage[], 
    options: StageExecutionOptions = {}
  ): Promise<void> => {
    setIsExecuting(true);
    setExecutionError(null);
    
    try {
      const response = await fetch('/api/stages/chain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          stages,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setCurrentExecution(result.executions?.[0] || null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const cancelExecution = useCallback(async (executionId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/stages/${executionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Clear current execution if it matches
      if (currentExecution?.id === executionId) {
        setCurrentExecution(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      throw error;
    }
  }, [currentExecution]);

  const resetToStage = useCallback(async (
    documentId: string, 
    stage: ProcessingStage
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/documents/${documentId}/stages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset',
          stage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      throw error;
    }
  }, []);

  const fetchPipelineStatus = useCallback(async (documentId: string): Promise<PipelineStatus> => {
    try {
      const response = await fetch(`/api/documents/${documentId}/stages`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      throw error;
    }
  }, []);

  const fetchExecutions = useCallback(async (documentId: string): Promise<StageExecutionResult[]> => {
    try {
      const response = await fetch(`/api/stages?documentId=${documentId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.executions || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      throw error;
    }
  }, []);

  const fetchExecution = useCallback(async (executionId: string): Promise<StageExecutionResult> => {
    try {
      const response = await fetch(`/api/stages/${executionId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      throw error;
    }
  }, []);

  return {
    // State
    isExecuting,
    executionError,
    currentExecution,
    
    // Actions
    executeStage,
    executeChain,
    cancelExecution,
    resetToStage,
    
    // Data fetching
    fetchPipelineStatus,
    fetchExecutions,
    fetchExecution,
  };
}

export default useStageExecution;