import { NextRequest, NextResponse } from 'next/server';
import { backgroundJobService } from '../../../../lib/services/backgroundJobService';
import { prisma } from '../../../../lib/database';

/**
 * GET /api/processing-jobs/cleanup
 * Get cleanup statistics
 */
export async function GET() {
  try {
    // Get cleanup statistics
    const stats = await prisma.processingJob.groupBy({
      by: ['cleanedUp'],
      _count: {
        id: true,
      },
      where: {
        status: 'FINISHED',
      },
    });

    const cleanedUpCount = stats.find(s => s.cleanedUp === true)?._count.id || 0;
    const notCleanedUpCount = stats.find(s => s.cleanedUp === false)?._count.id || 0;

    // Get recent cleanup activity
    const recentCleanups = await prisma.processingJob.findMany({
      where: {
        cleanedUp: true,
        cleanedUpAt: {
          not: null,
        },
      },
      select: {
        id: true,
        documentId: true,
        stage: true,
        cleanedUpAt: true,
        cleanupStats: true,
      },
      orderBy: {
        cleanedUpAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      statistics: {
        finishedJobs: cleanedUpCount + notCleanedUpCount,
        cleanedUp: cleanedUpCount,
        pendingCleanup: notCleanedUpCount,
        cleanupPercentage: cleanedUpCount + notCleanedUpCount > 0 
          ? Math.round((cleanedUpCount / (cleanedUpCount + notCleanedUpCount)) * 100) 
          : 0,
      },
      recentCleanups: recentCleanups.map(job => ({
        id: job.id,
        documentId: job.documentId,
        stage: job.stage,
        cleanedUpAt: job.cleanedUpAt,
        stats: job.cleanupStats ? JSON.parse(job.cleanupStats) : null,
      })),
    });
  } catch (error) {
    console.error('Error getting cleanup statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cleanup statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/processing-jobs/cleanup
 * Manually trigger cleanup process
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize || 10;

    // Trigger manual cleanup
    const result = await backgroundJobService.cleanupCompletedJobs(batchSize);

    return NextResponse.json({
      success: true,
      message: 'Cleanup process completed',
      result,
    });
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to trigger cleanup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
