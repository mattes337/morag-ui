import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { DocumentMigrationService } from '../../../../lib/services/documentMigrationService';
import { z } from 'zod';

const migrationIdSchema = z.string().uuid('Invalid migration ID');

// GET /api/migrations/[id] - Get migration details
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

    // Get migration details
    const migration = await DocumentMigrationService.getMigrationById(
      migrationId
    );

    if (!migration) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      migration,
    });
  } catch (error) {
    console.error('Failed to fetch migration:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch migration' },
      { status: 500 }
    );
  }
}

// DELETE /api/migrations/[id] - Cancel migration
export async function DELETE(
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

    // Cancel migration
    await DocumentMigrationService.cancelMigration(migrationId);

    return NextResponse.json({
      success: true,
      message: 'Migration cancelled successfully',
    });
  } catch (error) {
    console.error('Failed to cancel migration:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel migration' },
      { status: 500 }
    );
  }
}