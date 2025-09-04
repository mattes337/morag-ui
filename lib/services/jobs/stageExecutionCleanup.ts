import { prisma } from '../../database';

/**
 * Service for cleaning up stuck stage executions and orphaned jobs
 */
export class StageExecutionCleanupService {
  /**
   * Clean up stuck stage executions that have been running for too long
   */
  async cleanupStuckExecutions(timeoutMinutes: number = 30): Promise<{
    cleanedCount: number;
    details: Array<{ id: string; stage: string; documentId: string; minutesStuck: number }>;
  }> {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const cutoffTime = new Date(Date.now() - timeoutMs);
    
    console.log(`🧹 [StageExecutionCleanup] Looking for executions stuck longer than ${timeoutMinutes} minutes...`);
    
    // Find stuck executions
    const stuckExecutions = await prisma.stageExecution.findMany({
      where: {
        status: 'RUNNING',
        startedAt: {
          lt: cutoffTime
        }
      },
      include: {
        document: {
          select: { id: true, name: true }
        }
      }
    });
    
    const details = stuckExecutions.map(exec => ({
      id: exec.id,
      stage: exec.stage,
      documentId: exec.documentId,
      minutesStuck: Math.floor((Date.now() - exec.startedAt.getTime()) / (1000 * 60))
    }));
    
    if (stuckExecutions.length === 0) {
      console.log(`✅ [StageExecutionCleanup] No stuck executions found`);
      return { cleanedCount: 0, details: [] };
    }
    
    console.log(`🚨 [StageExecutionCleanup] Found ${stuckExecutions.length} stuck executions:`);
    details.forEach(detail => {
      console.log(`  - ${detail.stage} for document ${detail.documentId} (stuck for ${detail.minutesStuck} minutes)`);
    });
    
    // Clean up stuck executions
    const updateResult = await prisma.stageExecution.updateMany({
      where: {
        id: {
          in: stuckExecutions.map(exec => exec.id)
        }
      },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: `Execution timed out and was automatically cleaned up after ${timeoutMinutes} minutes`
      }
    });
    
    console.log(`✅ [StageExecutionCleanup] Cleaned up ${updateResult.count} stuck executions`);
    
    return {
      cleanedCount: updateResult.count,
      details
    };
  }
  
  /**
   * Clean up orphaned processing jobs (jobs for non-existent documents)
   */
  async cleanupOrphanedJobs(): Promise<{
    cleanedCount: number;
    details: Array<{ id: string; stage: string; documentId: string; status: string }>;
  }> {
    console.log(`🧹 [StageExecutionCleanup] Looking for orphaned processing jobs...`);
    
    // Find jobs with non-existent documents
    const orphanedJobs = await prisma.processingJob.findMany({
      where: {
        status: {
          in: ['PENDING', 'PROCESSING']
        }
      },
      include: {
        document: true
      }
    });
    
    const actualOrphans = orphanedJobs.filter(job => !job.document);
    
    const details = actualOrphans.map(job => ({
      id: job.id,
      stage: job.stage,
      documentId: job.documentId,
      status: job.status
    }));
    
    if (actualOrphans.length === 0) {
      console.log(`✅ [StageExecutionCleanup] No orphaned jobs found`);
      return { cleanedCount: 0, details: [] };
    }
    
    console.log(`🚨 [StageExecutionCleanup] Found ${actualOrphans.length} orphaned jobs:`);
    details.forEach(detail => {
      console.log(`  - Job ${detail.id}: ${detail.stage} for missing document ${detail.documentId}`);
    });
    
    // Delete orphaned jobs
    const deleteResult = await prisma.processingJob.deleteMany({
      where: {
        id: {
          in: actualOrphans.map(job => job.id)
        }
      }
    });
    
    console.log(`✅ [StageExecutionCleanup] Deleted ${deleteResult.count} orphaned jobs`);
    
    return {
      cleanedCount: deleteResult.count,
      details
    };
  }
  
  /**
   * Comprehensive cleanup that runs both stuck executions and orphaned jobs cleanup
   */
  async performFullCleanup(timeoutMinutes: number = 30): Promise<{
    stuckExecutions: { cleanedCount: number; details: any[] };
    orphanedJobs: { cleanedCount: number; details: any[] };
  }> {
    console.log(`🧹 [StageExecutionCleanup] Starting comprehensive cleanup...`);
    
    const [stuckExecutions, orphanedJobs] = await Promise.all([
      this.cleanupStuckExecutions(timeoutMinutes),
      this.cleanupOrphanedJobs()
    ]);
    
    const totalCleaned = stuckExecutions.cleanedCount + orphanedJobs.cleanedCount;
    
    if (totalCleaned > 0) {
      console.log(`✅ [StageExecutionCleanup] Cleanup complete: ${stuckExecutions.cleanedCount} stuck executions + ${orphanedJobs.cleanedCount} orphaned jobs = ${totalCleaned} total items cleaned`);
    } else {
      console.log(`✅ [StageExecutionCleanup] Cleanup complete: No issues found`);
    }
    
    return {
      stuckExecutions,
      orphanedJobs
    };
  }
  
  /**
   * Get current system health status
   */
  async getSystemHealth(): Promise<{
    stuckExecutions: number;
    orphanedJobs: number;
    pendingJobs: number;
    processingJobs: number;
  }> {
    const timeoutMs = 30 * 60 * 1000; // 30 minutes
    const cutoffTime = new Date(Date.now() - timeoutMs);
    
    const [stuckExecutions, orphanedJobsRaw, pendingJobs, processingJobs] = await Promise.all([
      prisma.stageExecution.count({
        where: {
          status: 'RUNNING',
          startedAt: { lt: cutoffTime }
        }
      }),
      prisma.processingJob.findMany({
        where: {
          status: { in: ['PENDING', 'PROCESSING'] }
        },
        include: { document: true }
      }),
      prisma.processingJob.count({
        where: { status: 'PENDING' }
      }),
      prisma.processingJob.count({
        where: { status: 'PROCESSING' }
      })
    ]);
    
    const orphanedJobs = orphanedJobsRaw.filter(job => !job.document).length;
    
    return {
      stuckExecutions,
      orphanedJobs,
      pendingJobs,
      processingJobs
    };
  }
}

export const stageExecutionCleanupService = new StageExecutionCleanupService();
