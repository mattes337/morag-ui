import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '../../../../lib/middleware/unifiedAuth';
import { stageExecutionCleanupService } from '../../../../lib/services/jobs/stageExecutionCleanup';

/**
 * POST /api/admin/cleanup
 * Manually trigger system cleanup
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireUnifiedAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users to trigger cleanup
    if (!authResult.user || authResult.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const timeoutMinutes = body.timeoutMinutes || 30;

    console.log(`🧹 [AdminCleanup] Manual cleanup triggered by ${authResult.user.email}`);

    // Perform comprehensive cleanup
    const result = await stageExecutionCleanupService.performFullCleanup(timeoutMinutes);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      result: {
        stuckExecutions: {
          count: result.stuckExecutions.cleanedCount,
          details: result.stuckExecutions.details
        },
        orphanedJobs: {
          count: result.orphanedJobs.cleanedCount,
          details: result.orphanedJobs.details
        },
        totalCleaned: result.stuckExecutions.cleanedCount + result.orphanedJobs.cleanedCount
      }
    });

  } catch (error) {
    console.error('❌ [AdminCleanup] Manual cleanup failed:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup
 * Get system health status
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireUnifiedAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users to view system health
    if (!authResult.user || authResult.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get system health status
    const health = await stageExecutionCleanupService.getSystemHealth();

    return NextResponse.json({
      success: true,
      health: {
        stuckExecutions: health.stuckExecutions,
        orphanedJobs: health.orphanedJobs,
        pendingJobs: health.pendingJobs,
        processingJobs: health.processingJobs,
        totalIssues: health.stuckExecutions + health.orphanedJobs,
        status: (health.stuckExecutions + health.orphanedJobs) === 0 ? 'healthy' : 'needs_attention'
      }
    });

  } catch (error) {
    console.error('❌ [AdminCleanup] Health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
