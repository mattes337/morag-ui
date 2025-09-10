import {
  PIPELINE_STAGES,
  STAGE_INFO,
  calculateProgress,
  getPipelineProgress,
  calculateEstimatedTimeRemaining,
  getStatusColor,
  getStatusIcon,
  formatDuration,
  getNextStage,
  getPreviousStage,
  canRetryStage,
  canSkipStage,
  getStagePosition,
  getStageConnections,
  createMockStageExecution,
  type StageExecution,
} from '../pipelineHelpers';

describe('pipelineHelpers', () => {
  describe('PIPELINE_STAGES constant', () => {
    it('should contain all 5 canonical stages in order', () => {
      expect(PIPELINE_STAGES).toEqual([
        'markdown-conversion',
        'markdown-optimizer',
        'chunker',
        'fact-generator',
        'ingestor'
      ]);
      expect(PIPELINE_STAGES).toHaveLength(5);
    });
  });

  describe('STAGE_INFO constant', () => {
    it('should contain info for all pipeline stages', () => {
      PIPELINE_STAGES.forEach(stage => {
        expect(STAGE_INFO[stage]).toBeDefined();
        expect(STAGE_INFO[stage].displayName).toBeTruthy();
        expect(STAGE_INFO[stage].description).toBeTruthy();
        expect(STAGE_INFO[stage].icon).toBeTruthy();
        expect(STAGE_INFO[stage].estimatedDuration).toBeGreaterThan(0);
      });
    });

    it('should mark markdown-optimizer as optional', () => {
      expect(STAGE_INFO['markdown-optimizer'].optional).toBe(true);
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for empty array', () => {
      expect(calculateProgress([])).toBe(0);
    });

    it('should calculate average progress correctly', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('chunker', 'RUNNING', 50),
        createMockStageExecution('ingestor', 'PENDING', 0),
      ];
      
      expect(calculateProgress(executions)).toBe(50); // (100 + 50 + 0) / 3 = 50
    });

    it('should handle partial progress correctly', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('chunker', 'RUNNING', 75),
      ];
      
      expect(calculateProgress(executions)).toBe(88); // (100 + 75) / 2 = 87.5, rounded to 88
    });
  });

  describe('getPipelineProgress', () => {
    it('should categorize stages correctly', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('markdown-optimizer', 'SKIPPED', 0),
        createMockStageExecution('chunker', 'RUNNING', 60),
        createMockStageExecution('fact-generator', 'FAILED', 30),
        createMockStageExecution('ingestor', 'PENDING', 0),
      ];

      const progress = getPipelineProgress(executions);

      expect(progress.completedStages).toEqual(['markdown-conversion']);
      expect(progress.failedStages).toEqual(['fact-generator']);
      expect(progress.skippedStages).toEqual(['markdown-optimizer']);
      expect(progress.currentStage).toBe('chunker');
      expect(progress.overall).toBe(38); // (100 + 0 + 60 + 30 + 0) / 5 = 38
    });

    it('should handle pipeline with no current stage', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('chunker', 'COMPLETED', 100),
      ];

      const progress = getPipelineProgress(executions);

      expect(progress.currentStage).toBeUndefined();
      expect(progress.completedStages).toHaveLength(2);
    });
  });

  describe('calculateEstimatedTimeRemaining', () => {
    it('should return undefined when no pending or running stages', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('chunker', 'COMPLETED', 100),
      ];

      expect(calculateEstimatedTimeRemaining(executions)).toBeUndefined();
    });

    it('should estimate time for pending stages', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('chunker', 'PENDING', 0),
        createMockStageExecution('ingestor', 'PENDING', 0),
      ];

      const estimate = calculateEstimatedTimeRemaining(executions);
      const expectedTime = STAGE_INFO.chunker.estimatedDuration + STAGE_INFO.ingestor.estimatedDuration;
      
      expect(estimate).toBe(expectedTime);
    });

    it('should estimate remaining time for running stages', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('chunker', 'RUNNING', 50), // 50% complete
        createMockStageExecution('ingestor', 'PENDING', 0),
      ];

      const estimate = calculateEstimatedTimeRemaining(executions);
      const expectedTime = (STAGE_INFO.chunker.estimatedDuration * 0.5) + STAGE_INFO.ingestor.estimatedDuration;
      
      expect(estimate).toBe(expectedTime);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color classes for each status', () => {
      expect(getStatusColor('COMPLETED')).toContain('text-green-600');
      expect(getStatusColor('RUNNING')).toContain('text-blue-600');
      expect(getStatusColor('FAILED')).toContain('text-red-600');
      expect(getStatusColor('PENDING')).toContain('text-gray-600');
      expect(getStatusColor('SKIPPED')).toContain('text-yellow-600');
    });

    it('should handle unknown status gracefully', () => {
      // @ts-expect-error - Testing unknown status
      expect(getStatusColor('UNKNOWN')).toContain('text-gray-600');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icons for each status', () => {
      expect(getStatusIcon('COMPLETED')).toBe('✓');
      expect(getStatusIcon('RUNNING')).toBe('⟳');
      expect(getStatusIcon('FAILED')).toBe('✗');
      expect(getStatusIcon('PENDING')).toBe('○');
      expect(getStatusIcon('SKIPPED')).toBe('⊘');
    });

    it('should handle unknown status gracefully', () => {
      // @ts-expect-error - Testing unknown status
      expect(getStatusIcon('UNKNOWN')).toBe('○');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds correctly', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    it('should format seconds correctly', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(5500)).toBe('5s');
      expect(formatDuration(59000)).toBe('59s');
    });

    it('should format minutes correctly', () => {
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(120000)).toBe('2m');
    });
  });

  describe('getNextStage', () => {
    it('should return next stage in pipeline', () => {
      expect(getNextStage('markdown-conversion')).toBe('markdown-optimizer');
      expect(getNextStage('chunker')).toBe('fact-generator');
    });

    it('should return null for last stage', () => {
      expect(getNextStage('ingestor')).toBeNull();
    });

    it('should return null for invalid stage', () => {
      // @ts-expect-error - Testing invalid stage
      expect(getNextStage('invalid-stage')).toBeNull();
    });
  });

  describe('getPreviousStage', () => {
    it('should return previous stage in pipeline', () => {
      expect(getPreviousStage('markdown-optimizer')).toBe('markdown-conversion');
      expect(getPreviousStage('ingestor')).toBe('fact-generator');
    });

    it('should return null for first stage', () => {
      expect(getPreviousStage('markdown-conversion')).toBeNull();
    });

    it('should return null for invalid stage', () => {
      // @ts-expect-error - Testing invalid stage
      expect(getPreviousStage('invalid-stage')).toBeNull();
    });
  });

  describe('canRetryStage', () => {
    it('should allow retry for failed stages by default', () => {
      const execution = createMockStageExecution('chunker', 'FAILED', 30);
      expect(canRetryStage(execution)).toBe(true);
    });

    it('should respect explicit canRetry setting', () => {
      const execution = createMockStageExecution('chunker', 'FAILED', 30, {
        canRetry: false
      });
      expect(canRetryStage(execution)).toBe(false);
    });

    it('should not allow retry for non-failed stages', () => {
      const execution = createMockStageExecution('chunker', 'COMPLETED', 100);
      expect(canRetryStage(execution)).toBe(false);
    });
  });

  describe('canSkipStage', () => {
    it('should allow skip for failed optional stages', () => {
      const execution = createMockStageExecution('markdown-optimizer', 'FAILED', 20);
      expect(canSkipStage(execution)).toBe(true);
    });

    it('should not allow skip for failed non-optional stages by default', () => {
      const execution = createMockStageExecution('chunker', 'FAILED', 30);
      expect(canSkipStage(execution)).toBe(false);
    });

    it('should respect explicit canSkip setting', () => {
      const execution = createMockStageExecution('chunker', 'FAILED', 30, {
        canSkip: true
      });
      expect(canSkipStage(execution)).toBe(true);
    });

    it('should not allow skip for non-failed stages', () => {
      const execution = createMockStageExecution('markdown-optimizer', 'COMPLETED', 100);
      expect(canSkipStage(execution)).toBe(false);
    });
  });

  describe('getStagePosition', () => {
    it('should return correct position for each stage', () => {
      expect(getStagePosition('markdown-conversion')).toBe(0);
      expect(getStagePosition('markdown-optimizer')).toBe(1);
      expect(getStagePosition('chunker')).toBe(2);
      expect(getStagePosition('fact-generator')).toBe(3);
      expect(getStagePosition('ingestor')).toBe(4);
    });

    it('should return -1 for invalid stage', () => {
      // @ts-expect-error - Testing invalid stage
      expect(getStagePosition('invalid-stage')).toBe(-1);
    });
  });

  describe('getStageConnections', () => {
    it('should create connections between consecutive stages', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('markdown-optimizer', 'RUNNING', 50),
        createMockStageExecution('chunker', 'PENDING', 0),
      ];

      const connections = getStageConnections(executions);

      expect(connections).toHaveLength(4); // 5 stages = 4 connections
      expect(connections[0]).toEqual({
        from: 'markdown-conversion',
        to: 'markdown-optimizer',
        status: 'active',
        progress: 50,
      });
    });

    it('should mark completed connections correctly', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
        createMockStageExecution('markdown-optimizer', 'COMPLETED', 100),
        createMockStageExecution('chunker', 'PENDING', 0),
      ];

      const connections = getStageConnections(executions);
      expect(connections[0]?.status).toBe('completed');
    });

    it('should mark failed connections correctly', () => {
      const executions: StageExecution[] = [
        createMockStageExecution('markdown-conversion', 'FAILED', 30),
        createMockStageExecution('markdown-optimizer', 'PENDING', 0),
      ];

      const connections = getStageConnections(executions);
      expect(connections[0]?.status).toBe('failed');
    });
  });

  describe('createMockStageExecution', () => {
    it('should create basic stage execution', () => {
      const execution = createMockStageExecution('chunker', 'RUNNING', 75);

      expect(execution.stage).toBe('chunker');
      expect(execution.status).toBe('RUNNING');
      expect(execution.progress).toBe(75);
      expect(execution.id).toMatch(/^execution-chunker-/);
    });

    it('should set start and end times correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');
      
      const execution = createMockStageExecution('chunker', 'COMPLETED', 100, {
        startTime,
        endTime,
      });

      expect(execution.startTime).toEqual(startTime);
      expect(execution.endTime).toEqual(endTime);
      expect(execution.duration).toBe(5 * 60 * 1000); // 5 minutes in milliseconds
    });

    it('should set error message and retry options', () => {
      const execution = createMockStageExecution('chunker', 'FAILED', 30, {
        errorMessage: 'Test error',
        canRetry: true,
        canSkip: false,
      });

      expect(execution.errorMessage).toBe('Test error');
      expect(execution.canRetry).toBe(true);
      expect(execution.canSkip).toBe(false);
    });
  });
});