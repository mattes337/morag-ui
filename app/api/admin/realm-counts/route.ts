import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '../../../../lib/middleware/unifiedAuth';
import { RealmCountService } from '../../../../lib/services/realmCountService';

/**
 * GET /api/admin/realm-counts
 * Validate realm document counts and return discrepancies
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUnifiedAuth(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may want to implement proper admin role checking)
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const result = await RealmCountService.validateAndFixRealmDocumentCounts();

    return NextResponse.json({
      success: true,
      message: 'Realm document count validation completed',
      ...result,
    });
  } catch (error) {
    console.error('Error validating realm document counts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate realm document counts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/realm-counts
 * Recalculate document counts for specific realm or all realms
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUnifiedAuth(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { realmId, action } = body;

    if (action === 'recalculate-all') {
      await RealmCountService.recalculateAllRealmDocumentCounts();
      return NextResponse.json({
        success: true,
        message: 'Recalculated document counts for all realms',
      });
    } else if (action === 'recalculate-single' && realmId) {
      const newCount = await RealmCountService.recalculateRealmDocumentCount(realmId);
      return NextResponse.json({
        success: true,
        message: `Recalculated document count for realm ${realmId}`,
        newCount,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing realmId for single realm recalculation' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error recalculating realm document counts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to recalculate realm document counts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
