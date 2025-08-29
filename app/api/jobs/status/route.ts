import { NextRequest, NextResponse } from 'next/server';
import { authenticateUnified } from '@/lib/middleware/unifiedAuth';
import { jobOrchestrator } from '@/lib/services/jobs';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUnified(request);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = jobOrchestrator.getStatus();
    
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Failed to get job status:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}
