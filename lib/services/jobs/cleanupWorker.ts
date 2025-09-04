import { jobManager } from './jobManager';
import { stageExecutionCleanupService } from './stageExecutionCleanup';

/**
 * Background worker responsible for cleaning up old completed jobs
 */
export class CleanupWorker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the cleanup worker
   */
  start(intervalMs: number = 3600000): void { // Default: 1 hour
    if (this.isRunning) {
      console.log('⚠️ [CleanupWorker] Already running');
      return;
    }

    console.log(`🚀 [CleanupWorker] Starting with ${intervalMs}ms interval`);
    this.isRunning = true;

    // Clean immediately
    this.cleanup().catch(error => {
      console.error('❌ [CleanupWorker] Initial cleanup failed:', error);
    });

    // Schedule periodic cleanup
    this.intervalId = setInterval(async () => {
      try {
        await this.cleanup();
      } catch (error) {
        console.error('❌ [CleanupWorker] Periodic cleanup failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop the cleanup worker
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 [CleanupWorker] Stopping');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if cleanup worker is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Perform cleanup of old completed jobs and stuck stage executions
   */
  private async cleanup(): Promise<void> {
    try {
      // Clean up old completed jobs
      const deletedCount = await jobManager.cleanupCompletedJobs(7); // Keep jobs for 7 days

      if (deletedCount > 0) {
        console.log(`🧹 [CleanupWorker] Cleaned up ${deletedCount} old completed jobs`);
      }

      // Clean up stuck stage executions and orphaned jobs
      const cleanupResult = await stageExecutionCleanupService.performFullCleanup(30); // 30 minute timeout

      const totalStageCleanup = cleanupResult.stuckExecutions.cleanedCount + cleanupResult.orphanedJobs.cleanedCount;
      if (totalStageCleanup > 0) {
        console.log(`🧹 [CleanupWorker] Stage cleanup: ${cleanupResult.stuckExecutions.cleanedCount} stuck executions + ${cleanupResult.orphanedJobs.cleanedCount} orphaned jobs`);
      }
    } catch (error) {
      console.error('❌ [CleanupWorker] Cleanup failed:', error);
    }
  }
}

export const cleanupWorker = new CleanupWorker();
