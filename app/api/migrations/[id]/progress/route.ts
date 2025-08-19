import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { DocumentMigrationService } from '../../../../../lib/services/documentMigrationService';
import { z } from 'zod';

const migrationIdSchema = z.string().uuid('Invalid migration ID');

// GET /api/migrations/[id]/progress - Get migration progress
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    
    // Validate migration ID
    const validationResult = migrationIdSchema.safeParse(params.id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid migration ID format' },
        { status: 400 }
      );
    }

    const migrationId = validationResult.data;

    // Get migration progress
    const progress = await DocumentMigrationService.getMigrationProgress(
      migrationId,
      user.userId
    );

    if (!progress) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Failed to fetch migration progress:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch migration progress' },
      { status: 500 }
    );
  }
}