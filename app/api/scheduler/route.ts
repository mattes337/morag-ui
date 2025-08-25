import { NextRequest, NextResponse } from 'next/server';
import { jobScheduler } from '../../../lib/services/jobScheduler';

import { requireAuth } from '../../../lib/auth';

/**
 * GET /api/scheduler
 * Get job scheduler status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const stats = jobScheduler.getStats();
    const config = jobScheduler.getConfig();

    return NextResponse.json({
      stats,
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scheduler
 * Control job scheduler (start/stop/restart)
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    const user = await requireAuth(request);

    body = await request.json();
    const { action } = body;

    if (!action || !['start', 'stop', 'restart', 'trigger'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: start, stop, restart, trigger' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'start':
        await jobScheduler.start();
        result = { message: 'Job scheduler started successfully' };
        break;
      case 'stop':
        await jobScheduler.stop();
        result = { message: 'Job scheduler stopped successfully' };
        break;
      case 'restart':
        await jobScheduler.restart();
        result = { message: 'Job scheduler restarted successfully' };
        break;
      case 'trigger':
        await jobScheduler.triggerProcessing();
        result = { message: 'Job processing triggered manually' };
        break;
    }

    return NextResponse.json({
      success: true,
      ...result,
      stats: jobScheduler.getStats()
    });
  } catch (error) {
    console.error('Error controlling scheduler:', error);
    return NextResponse.json(
      { error: `Failed to ${body?.action || 'control'} scheduler: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/scheduler
 * Update job scheduler configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { config } = body;

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'Invalid configuration object' },
        { status: 400 }
      );
    }

    // Validate configuration values
    if (config.processingIntervalMs && (config.processingIntervalMs < 1000 || config.processingIntervalMs > 3600000)) {
      return NextResponse.json(
        { error: 'Processing interval must be between 1 second and 1 hour' },
        { status: 400 }
      );
    }

    if (config.maxConcurrentJobs && (config.maxConcurrentJobs < 1 || config.maxConcurrentJobs > 20)) {
      return NextResponse.json(
        { error: 'Max concurrent jobs must be between 1 and 20' },
        { status: 400 }
      );
    }

    jobScheduler.updateConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Scheduler configuration updated successfully',
      config: jobScheduler.getConfig()
    });
  } catch (error) {
    console.error('Error updating scheduler config:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduler configuration' },
      { status: 500 }
    );
  }
}