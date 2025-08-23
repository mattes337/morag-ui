import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DocumentMigrationService } from '@/lib/services/documentMigrationService';
import { RealmService } from '@/lib/services/realmService';

/**
 * POST /api/documents/migrate
 * Migrate documents between realms
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    const {
      documentIds,
      sourceRealmId,
      targetRealmId,
      migrationOptions = {}
    } = body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'documentIds array is required' },
        { status: 400 }
      );
    }
    
    if (!sourceRealmId || !targetRealmId) {
      return NextResponse.json(
        { error: 'sourceRealmId and targetRealmId are required' },
        { status: 400 }
      );
    }
    
    if (sourceRealmId === targetRealmId) {
      return NextResponse.json(
        { error: 'Source and target realms cannot be the same' },
        { status: 400 }
      );
    }
    
    // Validate user has access to both realms
    const sourceRealm = await RealmService.getRealmById(sourceRealmId, user.userId);
    const targetRealm = await RealmService.getRealmById(targetRealmId, user.userId);
    
    if (!sourceRealm) {
      return NextResponse.json(
        { error: 'Access denied to source realm' },
        { status: 403 }
      );
    }
    
    if (!targetRealm) {
      return NextResponse.json(
        { error: 'Access denied to target realm' },
        { status: 403 }
      );
    }
    
    // Check if user has permission to add documents to target realm
    if (targetRealm.userRole !== 'OWNER' && targetRealm.userRole !== 'ADMIN' && targetRealm.userRole !== 'MEMBER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to add documents to target realm' },
        { status: 403 }
      );
    }
    
    // Start migration
    const migrationRequest = {
      documentIds,
      sourceRealmId,
      targetRealmId,
      migrationOptions: {
        copyStageFiles: migrationOptions.copyFiles !== false,
        reprocessStages: migrationOptions.reprocessStages || [],
        preserveOriginal: migrationOptions.preserveOriginal !== false,
        migrationMode: migrationOptions.migrationMode || 'copy',
        targetDatabases: migrationOptions.targetDatabases,
      }
    };
    
    const migrationResult = await DocumentMigrationService.createMigration(
      migrationRequest,
      user.userId
    );
    
    return NextResponse.json({
      migration: migrationResult,
      message: 'Document migration started successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error starting document migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start migration' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/migrate
 * Get migration status and history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const migrationId = searchParams.get('migrationId');
    const documentId = searchParams.get('documentId');
    const realmId = searchParams.get('realmId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (migrationId) {
      // Get specific migration status
      const migration = await DocumentMigrationService.getMigrationStatus(migrationId);
      
      if (!migration) {
        return NextResponse.json(
          { error: 'Migration not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ migration });
    }
    
    if (documentId) {
      // Get migration history for a specific document
      // TODO: Implement document migration history
      const history: any[] = [];
      return NextResponse.json({ history });
    }
    
    // Get user's migration history
    const migrations = await DocumentMigrationService.getMigrations(
      user.userId,
      {
        realmId: realmId || undefined,
        status: status as any,
        limit,
        offset,
      }
    );
    
    return NextResponse.json({
      migrations,
      pagination: {
        limit,
        offset,
        total: migrations.length,
        hasMore: migrations.length === limit,
      }
    });
  } catch (error) {
    console.error('Error fetching migration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch migration data' },
      { status: 500 }
    );
  }
}
