import {
  mockPipelineExecutions,
  getPipelineExecutionById,
  getPipelineExecutionsByStatus,
  getRecentPipelineExecutions,
  getActivePipelineExecutions,
  getRealTimeUpdatingExecutions,
  updatePipelineProgress,
  retryFailedStage,
  skipFailedStage,
  generateMockPipelineExecution,
} from '../pipelineData';

describe('pipelineData', () => {
  describe('mockPipelineExecutions', () => {
    it('should contain pipeline executions', () => {
      expect(mockPipelineExecutions).toHaveLength(8);
      expect(Array.isArray(mockPipelineExecutions)).toBe(true);
    });

    it('should have all required properties for each execution', () => {
      mockPipelineExecutions.forEach(execution => {
        expect(execution).toHaveProperty('id');
        expect(execution).toHaveProperty('document');
        expect(execution).toHaveProperty('stages');
        expect(execution).toHaveProperty('overallProgress');
        expect(execution).toHaveProperty('status');
        expect(execution).toHaveProperty('startTime');
        expect(execution).toHaveProperty('realtimeUpdates');
        
        // Document properties
        expect(execution.document).toHaveProperty('id');
        expect(execution.document).toHaveProperty('name');
        expect(execution.document).toHaveProperty('fileSize');
        expect(execution.document).toHaveProperty('fileType');
        expect(execution.document).toHaveProperty('uploadedAt');
        
        // Stages array
        expect(Array.isArray(execution.stages)).toBe(true);
        expect(execution.stages).toHaveLength(5); // Should have all 5 pipeline stages
        
        execution.stages.forEach(stage => {
          expect(stage).toHaveProperty('id');
          expect(stage).toHaveProperty('stage');
          expect(stage).toHaveProperty('status');
          expect(stage).toHaveProperty('progress');
          expect(typeof stage.progress).toBe('number');
          expect(stage.progress).toBeGreaterThanOrEqual(0);
          expect(stage.progress).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should have valid status values', () => {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'partial'];
      mockPipelineExecutions.forEach(execution => {
        expect(validStatuses).toContain(execution.status);
      });
    });

    it('should have overall progress between 0 and 100', () => {
      mockPipelineExecutions.forEach(execution => {
        expect(execution.overallProgress).toBeGreaterThanOrEqual(0);
        expect(execution.overallProgress).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('getPipelineExecutionById', () => {
    it('should return the correct execution by ID', () => {
      const firstExecution = mockPipelineExecutions[0];
      expect(firstExecution).toBeDefined();
      const result = getPipelineExecutionById(firstExecution!.id);
      
      expect(result).toEqual(firstExecution);
    });

    it('should return undefined for non-existent ID', () => {
      const result = getPipelineExecutionById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('getPipelineExecutionsByStatus', () => {
    it('should return executions with the specified status', () => {
      const completedExecutions = getPipelineExecutionsByStatus('completed');
      
      completedExecutions.forEach(execution => {
        expect(execution.status).toBe('completed');
      });
    });

    it('should return empty array for status with no matches', () => {
      // Assuming there are no executions with status 'cancelled' (not a valid status anyway)
      const result = getPipelineExecutionsByStatus('cancelled' as any);
      expect(result).toHaveLength(0);
    });

    it('should return all running executions', () => {
      const runningExecutions = getPipelineExecutionsByStatus('running');
      expect(runningExecutions.length).toBeGreaterThan(0);
      
      runningExecutions.forEach(execution => {
        expect(execution.status).toBe('running');
      });
    });
  });

  describe('getRecentPipelineExecutions', () => {
    it('should return executions sorted by start time (newest first)', () => {
      const recent = getRecentPipelineExecutions(5);
      expect(recent).toHaveLength(5);
      
      for (let i = 0; i < recent.length - 1; i++) {
        const current = recent[i]?.startTime?.getTime();
        const next = recent[i + 1]?.startTime?.getTime();
        expect(current).toBeDefined();
        expect(next).toBeDefined();
        if (current !== undefined && next !== undefined) {
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('should respect the limit parameter', () => {
      const recent = getRecentPipelineExecutions(3);
      expect(recent).toHaveLength(3);
    });

    it('should return all executions if limit exceeds total count', () => {
      const recent = getRecentPipelineExecutions(100);
      expect(recent).toHaveLength(mockPipelineExecutions.length);
    });

    it('should use default limit of 10', () => {
      const recent = getRecentPipelineExecutions();
      expect(recent.length).toBeLessThanOrEqual(10);
      expect(recent.length).toBeLessThanOrEqual(mockPipelineExecutions.length);
    });
  });

  describe('getActivePipelineExecutions', () => {
    it('should return only running and pending executions', () => {
      const activeExecutions = getActivePipelineExecutions();
      
      activeExecutions.forEach(execution => {
        expect(['running', 'pending']).toContain(execution.status);
      });
    });

    it('should not return completed, failed, or partial executions', () => {
      const activeExecutions = getActivePipelineExecutions();
      
      activeExecutions.forEach(execution => {
        expect(['completed', 'failed', 'partial']).not.toContain(execution.status);
      });
    });
  });

  describe('getRealTimeUpdatingExecutions', () => {
    it('should return only executions with realtimeUpdates enabled', () => {
      const realTimeExecutions = getRealTimeUpdatingExecutions();
      
      realTimeExecutions.forEach(execution => {
        expect(execution.realtimeUpdates).toBe(true);
      });
    });

    it('should not return executions with realtimeUpdates disabled', () => {
      const realTimeExecutions = getRealTimeUpdatingExecutions();
      const allExecutions = mockPipelineExecutions;
      
      const nonRealTimeCount = allExecutions.filter(e => !e.realtimeUpdates).length;
      expect(realTimeExecutions.length + nonRealTimeCount).toBe(allExecutions.length);
    });
  });

  describe('updatePipelineProgress', () => {
    it('should return null for non-existent execution', () => {
      const result = updatePipelineProgress('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return null for executions without real-time updates', () => {
      // Find an execution with realtimeUpdates disabled
      const nonRealTimeExecution = mockPipelineExecutions.find(e => !e.realtimeUpdates);
      if (nonRealTimeExecution) {
        const result = updatePipelineProgress(nonRealTimeExecution.id);
        expect(result).toBeNull();
      }
    });

    it('should return null for non-running executions', () => {
      // Find a completed execution
      const completedExecution = mockPipelineExecutions.find(e => e.status === 'completed');
      if (completedExecution) {
        const result = updatePipelineProgress(completedExecution.id);
        expect(result).toBeNull();
      }
    });

    it('should update progress for running executions with real-time updates', () => {
      // Find a running execution with real-time updates
      const runningExecution = mockPipelineExecutions.find(
        e => e.status === 'running' && e.realtimeUpdates
      );
      
      if (runningExecution) {
        const originalRunningStage = runningExecution.stages.find(s => s.status === 'RUNNING');
        const originalProgress = originalRunningStage?.progress || 0;
        
        const result = updatePipelineProgress(runningExecution.id);
        
        expect(result).not.toBeNull();
        if (result) {
          const updatedRunningStage = result.stages.find(s => s.status === 'RUNNING');
          if (updatedRunningStage && originalProgress < 100) {
            expect(updatedRunningStage.progress).toBeGreaterThanOrEqual(originalProgress);
          }
        }
      }
    });
  });

  describe('retryFailedStage', () => {
    it('should return false for non-existent execution', () => {
      const result = retryFailedStage('non-existent-id', 'stage-id');
      expect(result).toBe(false);
    });

    it('should return false for non-existent stage', () => {
      const execution = mockPipelineExecutions[0];
      expect(execution).toBeDefined();
      const result = retryFailedStage(execution!.id, 'non-existent-stage-id');
      expect(result).toBe(false);
    });

    it('should return false for non-failed stage', () => {
      // Find an execution with a completed stage
      const execution = mockPipelineExecutions.find(e => 
        e.stages.some(s => s.status === 'COMPLETED')
      );
      
      if (execution) {
        const completedStage = execution.stages.find(s => s.status === 'COMPLETED');
        if (completedStage) {
          const result = retryFailedStage(execution.id, completedStage.id);
          expect(result).toBe(false);
        }
      }
    });

    it('should return false for failed stage that cannot be retried', () => {
      // Find an execution with a failed stage that cannot be retried
      const execution = mockPipelineExecutions.find(e => 
        e.stages.some(s => s.status === 'FAILED' && s.canRetry === false)
      );
      
      if (execution) {
        const nonRetryableStage = execution.stages.find(s => 
          s.status === 'FAILED' && s.canRetry === false
        );
        if (nonRetryableStage) {
          const result = retryFailedStage(execution.id, nonRetryableStage.id);
          expect(result).toBe(false);
        }
      }
    });
  });

  describe('skipFailedStage', () => {
    it('should return false for non-existent execution', () => {
      const result = skipFailedStage('non-existent-id', 'stage-id');
      expect(result).toBe(false);
    });

    it('should return false for non-existent stage', () => {
      const execution = mockPipelineExecutions[0];
      expect(execution).toBeDefined();
      const result = skipFailedStage(execution!.id, 'non-existent-stage-id');
      expect(result).toBe(false);
    });

    it('should return false for non-failed stage', () => {
      // Find an execution with a completed stage
      const execution = mockPipelineExecutions.find(e => 
        e.stages.some(s => s.status === 'COMPLETED')
      );
      
      if (execution) {
        const completedStage = execution.stages.find(s => s.status === 'COMPLETED');
        if (completedStage) {
          const result = skipFailedStage(execution.id, completedStage.id);
          expect(result).toBe(false);
        }
      }
    });

    it('should return false for failed stage that cannot be skipped', () => {
      // Find an execution with a failed stage that cannot be skipped
      const execution = mockPipelineExecutions.find(e => 
        e.stages.some(s => s.status === 'FAILED' && s.canSkip === false)
      );
      
      if (execution) {
        const nonSkippableStage = execution.stages.find(s => 
          s.status === 'FAILED' && s.canSkip === false
        );
        if (nonSkippableStage) {
          const result = skipFailedStage(execution.id, nonSkippableStage.id);
          expect(result).toBe(false);
        }
      }
    });
  });

  describe('generateMockPipelineExecution', () => {
    it('should generate a valid pipeline execution', () => {
      const execution = generateMockPipelineExecution(
        'test-document.pdf',
        1024 * 1024, // 1MB
        'application/pdf'
      );

      expect(execution.document.name).toBe('test-document.pdf');
      expect(execution.document.fileSize).toBe(1024 * 1024);
      expect(execution.document.fileType).toBe('application/pdf');
      expect(execution.stages).toHaveLength(5);
      expect(execution.overallProgress).toBe(0);
      expect(execution.status).toBe('pending');
      expect(execution.realtimeUpdates).toBe(false);

      // Check all stages are pending
      execution.stages.forEach(stage => {
        expect(stage.status).toBe('PENDING');
        expect(stage.progress).toBe(0);
      });

      // Check stages are in correct order
      const expectedStages = [
        'markdown-conversion',
        'markdown-optimizer',
        'chunker',
        'fact-generator',
        'ingestor'
      ];
      execution.stages.forEach((stage, index) => {
        expect(stage.stage).toBe(expectedStages[index]);
      });
    });

    it('should generate unique IDs for each execution', () => {
      const execution1 = generateMockPipelineExecution('doc1.pdf', 1000, 'application/pdf');
      const execution2 = generateMockPipelineExecution('doc2.pdf', 2000, 'application/pdf');

      expect(execution1.id).not.toBe(execution2.id);
      expect(execution1.document.id).not.toBe(execution2.document.id);
    });

    it('should set upload time to current time', () => {
      const beforeTime = new Date();
      const execution = generateMockPipelineExecution('test.pdf', 1000, 'application/pdf');
      const afterTime = new Date();

      expect(execution.document.uploadedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(execution.document.uploadedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(execution.startTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(execution.startTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('data integrity', () => {
    it('should have unique IDs for all executions', () => {
      const ids = mockPipelineExecutions.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique document IDs', () => {
      const docIds = mockPipelineExecutions.map(e => e.document.id);
      const uniqueDocIds = new Set(docIds);
      expect(uniqueDocIds.size).toBe(docIds.length);
    });

    it('should have valid file types for documents', () => {
      const validMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];

      mockPipelineExecutions.forEach(execution => {
        expect(validMimeTypes).toContain(execution.document.fileType);
      });
    });

    it('should have reasonable file sizes', () => {
      mockPipelineExecutions.forEach(execution => {
        expect(execution.document.fileSize).toBeGreaterThan(0);
        expect(execution.document.fileSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      });
    });

    it('should have valid timestamps', () => {
      const now = new Date();
      
      mockPipelineExecutions.forEach(execution => {
        expect(execution.startTime).toBeInstanceOf(Date);
        expect(execution.startTime.getTime()).toBeLessThanOrEqual(now.getTime());
        expect(execution.document.uploadedAt).toBeInstanceOf(Date);
        expect(execution.document.uploadedAt.getTime()).toBeLessThanOrEqual(now.getTime());
        
        if (execution.endTime) {
          expect(execution.endTime).toBeInstanceOf(Date);
          expect(execution.endTime.getTime()).toBeGreaterThanOrEqual(execution.startTime.getTime());
        }
      });
    });
  });
});