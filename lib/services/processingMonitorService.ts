import { PrismaClient, JobStatus, ProcessingStage } from '@prisma/client';
import { backgroundJobService } from './backgroundJobService';
import { jobScheduler } from './jobScheduler';

const prisma = new PrismaClient();

export interface ProcessingMetrics {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  jobsByStage: Record<ProcessingStage, number>;
  recentFailures: Array<{
    id: string;
    documentId: string;
    stage: ProcessingStage;
    errorMessage: string;
    failedAt: Date;
  }>;
}

export interface SystemHealth {
  isHealthy: boolean;
  schedulerRunning: boolean;
  processorRunning: boolean;
  pendingJobsCount: number;
  oldestPendingJob?: Date;
  failureRate: number;
  issues: string[];
  recommendations: string[];
}

export class ProcessingMonitorService {
  /**
   * Get comprehensive processing metrics
   */
  static async getProcessingMetrics(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<ProcessingMetrics> {
    const timeRangeMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };

    const since = new Date(Date.now() - timeRangeMs[timeRange]);

    // Get job counts by status
    const jobCounts = await prisma.processingJob.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: since }
      },
      _count: true,
    });

    // Get job counts by stage
    const jobsByStage = await prisma.processingJob.groupBy({
      by: ['stage'],
      where: {
        createdAt: { gte: since }
      },
      _count: true,
    });

    // Get recent failures
    const recentFailures = await prisma.processingJob.findMany({
      where: {
        status: JobStatus.FAILED,
        createdAt: { gte: since }
      },
      select: {
        id: true,
        documentId: true,
        stage: true,
        errorMessage: true,
        completedAt: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    // Calculate average processing time for completed jobs
    const completedJobs = await prisma.processingJob.findMany({
      where: {
        status: JobStatus.FINISHED,
        createdAt: { gte: since },
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const averageProcessingTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => {
          const duration = job.completedAt!.getTime() - job.startedAt!.getTime();
          return sum + duration;
        }, 0) / completedJobs.length / 1000 // Convert to seconds
      : 0;

    // Build metrics object
    const statusCounts = jobCounts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<JobStatus, number>);

    const stageCounts = jobsByStage.reduce((acc, item) => {
      acc[item.stage] = item._count;
      return acc;
    }, {} as Record<ProcessingStage, number>);

    return {
      totalJobs: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      pendingJobs: statusCounts[JobStatus.PENDING] || 0,
      processingJobs: statusCounts[JobStatus.PROCESSING] || 0,
      completedJobs: statusCounts[JobStatus.FINISHED] || 0,
      failedJobs: statusCounts[JobStatus.FAILED] || 0,
      averageProcessingTime,
      jobsByStage: stageCounts,
      recentFailures: recentFailures.map(job => ({
        id: job.id,
        documentId: job.documentId,
        stage: job.stage,
        errorMessage: job.errorMessage || 'Unknown error',
        failedAt: job.completedAt!,
      })),
    };
  }

  /**
   * Check system health
   */
  static async checkSystemHealth(): Promise<SystemHealth> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if scheduler is running
    const schedulerRunning = jobScheduler.getStats().isRunning;
    if (!schedulerRunning) {
      issues.push('Job scheduler is not running');
      recommendations.push('Start the job scheduler to enable automatic processing');
    }

    // Check if processor is running
    const processorRunning = backgroundJobService.isProcessorRunning();
    if (!processorRunning) {
      issues.push('Background job processor is not running');
      recommendations.push('Start the background job processor to process queued jobs');
    }

    // Check for old pending jobs
    const oldPendingJobs = await prisma.processingJob.findMany({
      where: {
        status: JobStatus.PENDING,
        scheduledAt: {
          lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 1,
    });

    const pendingJobsCount = await prisma.processingJob.count({
      where: { status: JobStatus.PENDING }
    });

    if (oldPendingJobs.length > 0) {
      issues.push(`Jobs pending for more than 30 minutes (oldest: ${oldPendingJobs[0].scheduledAt})`);
      recommendations.push('Check if the job processor is working correctly');
    }

    // Check failure rate
    const recentJobs = await prisma.processingJob.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      }
    });

    const recentFailures = await prisma.processingJob.count({
      where: {
        status: JobStatus.FAILED,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      }
    });

    const failureRate = recentJobs > 0 ? (recentFailures / recentJobs) * 100 : 0;

    if (failureRate > 20) {
      issues.push(`High failure rate: ${failureRate.toFixed(1)}%`);
      recommendations.push('Check recent error logs and fix common issues');
    }

    // Check for stuck processing jobs
    const stuckJobs = await prisma.processingJob.findMany({
      where: {
        status: JobStatus.PROCESSING,
        startedAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000) // Started more than 1 hour ago
        }
      }
    });

    if (stuckJobs.length > 0) {
      issues.push(`${stuckJobs.length} jobs appear to be stuck in processing state`);
      recommendations.push('Consider cancelling stuck jobs and retrying them');
    }

    const isHealthy = issues.length === 0;

    return {
      isHealthy,
      schedulerRunning,
      processorRunning,
      pendingJobsCount,
      oldestPendingJob: oldPendingJobs[0]?.scheduledAt,
      failureRate,
      issues,
      recommendations,
    };
  }

  /**
   * Get processing queue status
   */
  static async getQueueStatus() {
    const queueStats = await prisma.processingJob.groupBy({
      by: ['status', 'stage'],
      _count: true,
      orderBy: [
        { status: 'asc' },
        { stage: 'asc' }
      ]
    });

    const upcomingJobs = await prisma.processingJob.findMany({
      where: {
        status: JobStatus.PENDING,
        scheduledAt: { lte: new Date(Date.now() + 60 * 60 * 1000) } // Next hour
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            state: true,
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: 20,
    });

    return {
      queueStats,
      upcomingJobs: upcomingJobs.map(job => ({
        id: job.id,
        documentId: job.documentId,
        documentName: job.document.name,
        stage: job.stage,
        priority: job.priority,
        scheduledAt: job.scheduledAt,
      })),
    };
  }

  /**
   * Clean up old completed and failed jobs
   */
  static async cleanupOldJobs(olderThanDays: number = 30): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const result = await prisma.processingJob.deleteMany({
      where: {
        status: { in: [JobStatus.FINISHED, JobStatus.FAILED, JobStatus.CANCELLED] },
        completedAt: { lt: cutoffDate }
      }
    });

    return { deletedCount: result.count };
  }

  /**
   * Cancel stuck jobs
   */
  static async cancelStuckJobs(stuckForMinutes: number = 60): Promise<{ cancelledCount: number }> {
    const cutoffDate = new Date(Date.now() - stuckForMinutes * 60 * 1000);

    const result = await prisma.processingJob.updateMany({
      where: {
        status: JobStatus.PROCESSING,
        startedAt: { lt: cutoffDate }
      },
      data: {
        status: JobStatus.CANCELLED,
        completedAt: new Date(),
        errorMessage: `Cancelled due to being stuck for more than ${stuckForMinutes} minutes`
      }
    });

    return { cancelledCount: result.count };
  }

  /**
   * Restart failed jobs
   */
  static async restartFailedJobs(documentId?: string): Promise<{ restartedCount: number }> {
    const whereClause: any = {
      status: JobStatus.FAILED,
    };

    if (documentId) {
      whereClause.documentId = documentId;
    }

    const failedJobs = await prisma.processingJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: documentId ? 10 : 5, // Limit to prevent overwhelming the system
    });

    let restartedCount = 0;

    for (const job of failedJobs) {
      try {
        await backgroundJobService.createJob({
          documentId: job.documentId,
          stage: job.stage,
          priority: job.priority + 1, // Slightly higher priority for retries
        });
        restartedCount++;
      } catch (error) {
        console.error(`Failed to restart job ${job.id}:`, error);
      }
    }

    return { restartedCount };
  }
}
