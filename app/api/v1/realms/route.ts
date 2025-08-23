import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/middleware/apiKeyAuth';
import { RealmService } from '@/lib/services/realmService';

/**
 * GET /api/v1/realms
 * Get realm information for the authenticated API key
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiKey(request);
    
    // Get realm details
    const realm = await RealmService.getRealmById(auth.realm!.id, auth.user!.id);
    
    if (!realm) {
      return NextResponse.json(
        { error: 'Realm not found' },
        { status: 404 }
      );
    }
    
    // Get realm statistics
    // TODO: Implement actual statistics gathering
    const statistics = {
      documents: {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      },
      storage: {
        totalSize: 0,
        fileCount: 0,
      },
      processing: {
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
      },
      lastActivity: new Date().toISOString(),
    };
    
    return NextResponse.json({
      realm: {
        id: realm.id,
        name: realm.name,
        description: realm.description,
        createdAt: realm.createdAt,
        updatedAt: realm.updatedAt,
      },
      statistics,
      user: {
        id: auth.user!.id,
        email: auth.user!.email,
        name: auth.user!.name,
      }
    });
  } catch (error) {
    console.error('Error fetching realm:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch realm' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * PUT /api/v1/realms
 * Update realm settings
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireApiKey(request);
    const body = await request.json();
    
    const { name, description, settings } = body;
    
    // Update realm
    const updatedRealm = await RealmService.updateRealm(auth.realm!.id, auth.user!.id, {
      name,
      description,
    });
    
    return NextResponse.json({
      realm: updatedRealm,
      message: 'Realm updated successfully'
    });
  } catch (error) {
    console.error('Error updating realm:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update realm' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
