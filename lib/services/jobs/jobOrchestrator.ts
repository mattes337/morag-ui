import { jobScheduler } from './jobScheduler';
import { jobProcessor } from './jobProcessor';
import { statusPoller } from './statusPoller';
import { cleanupWorker } from './cleanupWorker';

export interface JobOrchestratorConfig {
  schedulerIntervalMs?: number;
  processorIntervalMs?: number;
  pollerIntervalMs?: number;
  cleanupIntervalMs?: number;
}

/**
 * Main orchestrator that manages all background job workers
 */
export class JobOrchestrator {
  private isRunning = false;
  private isStarting = false;
  private config: Required<JobOrchestratorConfig>;

  constructor(config: JobOrchestratorConfig = {}) {
    this.config = {
      schedulerIntervalMs: config.schedulerIntervalMs || 30000,  // 30 seconds
      processorIntervalMs: config.processorIntervalMs || 10000,  // 10 seconds
      pollerIntervalMs: config.pollerIntervalMs || 15000,        // 15 seconds
      cleanupIntervalMs: config.cleanupIntervalMs || 3600000,    // 1 hour
    };
  }

  /**
   * Start all background workers
   */
  async start(): Promise<{ success: boolean; error?: string }> {
    if (this.isRunning) {
      console.log('⚠️ [JobOrchestrator] Already running, skipping startup');
      return { success: true, error: 'Already running' };
    }

    if (this.isStarting) {
      console.log('⚠️ [JobOrchestrator] Already starting, skipping duplicate startup');
      return { success: true, error: 'Already starting' };
    }

    this.isStarting = true;

    try {
      console.log('🚀 [JobOrchestrator] Starting all background workers...');

      // Start all workers
      jobScheduler.start(this.config.schedulerIntervalMs);
      jobProcessor.start(this.config.processorIntervalMs);
      statusPoller.start(this.config.pollerIntervalMs);
      cleanupWorker.start(this.config.cleanupIntervalMs);

      this.isRunning = true;
      this.isStarting = false;

      console.log('✅ [JobOrchestrator] All background workers started successfully');
      return { success: true };
    } catch (error) {
      this.isStarting = false;
      console.error('❌ [JobOrchestrator] Failed to start background workers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Stop all background workers
   */
  async stop(): Promise<{ success: boolean; error?: string }> {
    if (!this.isRunning && !this.isStarting) {
      return { success: false, error: 'Job orchestrator is not running' };
    }

    try {
      console.log('🛑 [JobOrchestrator] Stopping all background workers...');

      // Stop all workers
      jobScheduler.stop();
      jobProcessor.stop();
      statusPoller.stop();
      cleanupWorker.stop();

      this.isRunning = false;
      this.isStarting = false;

      console.log('✅ [JobOrchestrator] All background workers stopped successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [JobOrchestrator] Failed to stop background workers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the status of all workers
   */
  getStatus(): {
    isRunning: boolean;
    isStarting: boolean;
    workers: {
      scheduler: boolean;
      processor: boolean;
      poller: boolean;
      cleanup: boolean;
    };
  } {
    return {
      isRunning: this.isRunning,
      isStarting: this.isStarting,
      workers: {
        scheduler: jobScheduler.getIsRunning(),
        processor: jobProcessor.getIsRunning(),
        poller: statusPoller.getIsRunning(),
        cleanup: cleanupWorker.getIsRunning(),
      }
    };
  }

  /**
   * Get statistics about the job system
   */
  async getStats(): Promise<{
    isRunning: boolean;
    workers: {
      scheduler: boolean;
      processor: boolean;
      poller: boolean;
      cleanup: boolean;
    };
  }> {
    return this.getStatus();
  }

  /**
   * Schedule a job for a specific document (used for initial document creation)
   */
  async scheduleJobForDocument(documentId: string, stage: string, metadata?: Record<string, any>): Promise<string> {
    if (!this.isRunning) {
      throw new Error('Job orchestrator is not running');
    }

    return await jobScheduler.scheduleJobForDocument(documentId, stage as any, metadata);
  }
}

// Export singleton instance
export const jobOrchestrator = new JobOrchestrator();
