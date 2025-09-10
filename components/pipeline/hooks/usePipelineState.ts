import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PipelinePipeline, 
  PipelineStage, 
  mockPipelines, 
  getPipelineById,
  updatePipelineProgress,
  calculateOverallProgress 
} from '@/lib/mockData/pipelineMockData';

export interface UsePipelineStateOptions {
  /**
   * Pipeline ID to track
   */
  pipelineId?: string;
  /**
   * Auto-refresh interval for running pipelines (in milliseconds)
   */
  refreshInterval?: number;
  /**
   * Whether to enable real-time updates
   */
  enableRealTime?: boolean;
}

export interface PipelineStateActions {
  /**
   * Retry a failed stage
   */
  retryStage: (stageId: string) => void;
  /**
   * Skip a failed stage (if allowed)
   */
  skipStage: (stageId: string) => void;
  /**
   * Refresh pipeline data
   */
  refresh: () => void;
  /**
   * Start real-time updates
   */
  startRealTime: () => void;
  /**
   * Stop real-time updates
   */
  stopRealTime: () => void;
}

export interface PipelineState {
  /**
   * Current pipeline data
   */
  pipeline: PipelinePipeline | null;
  /**
   * All available pipelines
   */
  allPipelines: PipelinePipeline[];
  /**
   * Loading state
   */
  isLoading: boolean;
  /**
   * Error state
   */
  error: string | null;
  /**
   * Whether real-time updates are active
   */
  isRealTimeActive: boolean;
  /**
   * Actions available for pipeline control
   */
  actions: PipelineStateActions;
}

/**
 * Hook for managing pipeline state with real-time updates
 */
export function usePipelineState(options: UsePipelineStateOptions = {}): PipelineState {
  const {
    pipelineId,
    refreshInterval = 1000, // 1 second default
    enableRealTime = true,
  } = options;

  const [pipeline, setPipeline] = useState<PipelinePipeline | null>(null);
  const [allPipelines, setAllPipelines] = useState<PipelinePipeline[]>(mockPipelines);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(enableRealTime);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial pipeline data
  useEffect(() => {
    if (pipelineId) {
      setIsLoading(true);
      try {
        // Simulate API call delay
        setTimeout(() => {
          const foundPipeline = getPipelineById(pipelineId);
          if (foundPipeline) {
            setPipeline(foundPipeline);
            setError(null);
          } else {
            setError(`Pipeline with ID "${pipelineId}" not found`);
          }
          setIsLoading(false);
        }, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    } else {
      setPipeline(null);
      setError(null);
    }
  }, [pipelineId]);

  // Real-time updates for running pipelines
  useEffect(() => {
    if (!isRealTimeActive || !pipeline || !pipelineId) {
      return;
    }

    // Only update if pipeline is actively running
    if (pipeline.status !== 'running') {
      return;
    }

    intervalRef.current = setInterval(() => {
      const updatedPipeline = updatePipelineProgress(pipelineId);
      if (updatedPipeline) {
        setPipeline(updatedPipeline);
        // Also update in allPipelines array
        setAllPipelines(prev => 
          prev.map(p => p.id === pipelineId ? updatedPipeline : p)
        );
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRealTimeActive, pipeline?.status, pipelineId, refreshInterval]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const retryStage = useCallback((stageId: string) => {
    if (!pipeline) return;

    try {
      const updatedStages = pipeline.stages.map(stage => {
        if (stage.id === stageId && stage.status === 'failed' && stage.canRetry) {
          return {
            ...stage,
            status: 'running' as const,
            progress: 0,
            errorMessage: undefined,
            startTime: new Date(),
            endTime: undefined,
          };
        }
        return stage;
      });

      const updatedPipeline: PipelinePipeline = {
        ...pipeline,
        stages: updatedStages,
        status: 'running',
        overallProgress: calculateOverallProgress(updatedStages),
      };

      setPipeline(updatedPipeline);
      setAllPipelines(prev => 
        prev.map(p => p.id === pipeline.id ? updatedPipeline : p)
      );
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry stage');
    }
  }, [pipeline]);

  const skipStage = useCallback((stageId: string) => {
    if (!pipeline) return;

    try {
      let stageIndex = -1;
      const updatedStages = pipeline.stages.map((stage, index) => {
        if (stage.id === stageId && stage.status === 'failed' && stage.canSkip) {
          stageIndex = index;
          return {
            ...stage,
            status: 'skipped' as const,
            progress: 0,
            errorMessage: undefined,
            endTime: new Date(),
          };
        }
        return stage;
      });

      // Start the next pending stage if available
      if (stageIndex >= 0 && stageIndex < updatedStages.length - 1) {
        const nextStage = updatedStages[stageIndex + 1];
        if (nextStage.status === 'pending') {
          updatedStages[stageIndex + 1] = {
            ...nextStage,
            status: 'running',
            startTime: new Date(),
          };
        }
      }

      const updatedPipeline: PipelinePipeline = {
        ...pipeline,
        stages: updatedStages,
        status: updatedStages.some(s => s.status === 'running') ? 'running' : 
                updatedStages.some(s => s.status === 'failed') ? 'failed' : 'partial',
        overallProgress: calculateOverallProgress(updatedStages),
      };

      setPipeline(updatedPipeline);
      setAllPipelines(prev => 
        prev.map(p => p.id === pipeline.id ? updatedPipeline : p)
      );
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip stage');
    }
  }, [pipeline]);

  const refresh = useCallback(async () => {
    if (!pipelineId) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const refreshedPipeline = getPipelineById(pipelineId);
      if (refreshedPipeline) {
        setPipeline(refreshedPipeline);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh pipeline');
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId]);

  const startRealTime = useCallback(() => {
    setIsRealTimeActive(true);
  }, []);

  const stopRealTime = useCallback(() => {
    setIsRealTimeActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const actions: PipelineStateActions = {
    retryStage,
    skipStage,
    refresh,
    startRealTime,
    stopRealTime,
  };

  return {
    pipeline,
    allPipelines,
    isLoading,
    error,
    isRealTimeActive,
    actions,
  };
}

/**
 * Hook for managing multiple pipelines
 */
export function useMultiplePipelines() {
  const [pipelines, setPipelines] = useState<PipelinePipeline[]>(mockPipelines);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setPipelines([...mockPipelines]); // Create new reference
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh pipelines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    pipelines,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for pipeline statistics
 */
export function usePipelineStats(pipelines: PipelinePipeline[] = mockPipelines) {
  const stats = {
    total: pipelines.length,
    running: pipelines.filter(p => p.status === 'running').length,
    completed: pipelines.filter(p => p.status === 'completed').length,
    failed: pipelines.filter(p => p.status === 'failed').length,
    partial: pipelines.filter(p => p.status === 'partial').length,
    pending: pipelines.filter(p => p.status === 'pending').length,
    averageProgress: pipelines.length > 0 
      ? Math.round(pipelines.reduce((sum, p) => sum + p.overallProgress, 0) / pipelines.length)
      : 0,
  };

  return stats;
}