import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/middleware/apiKeyAuth';
import { RealmService } from '@/lib/services/realmService';
import { prisma } from '@/lib/database';
import { DocumentState, JobStatus } from '@prisma/client';

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
    const statistics = await calculateRealmStatistics(auth.realm!.id);
    
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

/**
 * Calculate comprehensive statistics for a realm
 */
async function calculateRealmStatistics(realmId: string) {
  // Get document statistics
  const documentStats = await prisma.document.groupBy({
    by: ['state'],
    where: { realmId },
    _count: { id: true },
  });

  const documents = {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  // Process document statistics
  for (const stat of documentStats) {
    documents.total += stat._count.id;
    switch (stat.state) {
      case DocumentState.PENDING:
        documents.pending += stat._count.id;
        break;
      case DocumentState.INGESTING:
        documents.processing += stat._count.id;
        break;
      case DocumentState.INGESTED:
        documents.completed += stat._count.id;
        break;
      case DocumentState.DEPRECATED:
      case DocumentState.DELETED:
        documents.failed += stat._count.id;
        break;
    }
  }

  // Get storage statistics
  const storageStats = await prisma.documentFile.aggregate({
    where: {
      document: { realmId },
    },
    _sum: { filesize: true },
    _count: { id: true },
  });

  const storage = {
    totalSize: storageStats._sum.filesize || 0,
    fileCount: storageStats._count.id || 0,
  };

  // Get processing job statistics
  const jobStats = await prisma.processingJob.groupBy({
    by: ['status'],
    where: {
      document: { realmId },
    },
    _count: { id: true },
  });

  const processing = {
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
  };

  // Process job statistics
  for (const stat of jobStats) {
    processing.totalJobs += stat._count.id;
    switch (stat.status) {
      case JobStatus.PENDING:
      case JobStatus.PROCESSING:
        processing.activeJobs += stat._count.id;
        break;
      case JobStatus.FINISHED:
        processing.completedJobs += stat._count.id;
        break;
      case JobStatus.FAILED:
        processing.failedJobs += stat._count.id;
        break;
    }
  }

  // Get last activity
  const lastDocument = await prisma.document.findFirst({
    where: { realmId },
    orderBy: { uploadDate: 'desc' },
    select: { uploadDate: true },
  });

  return {
    documents,
    storage,
    processing,
    lastActivity: lastDocument?.uploadDate?.toISOString() || new Date().toISOString(),
  };
}
