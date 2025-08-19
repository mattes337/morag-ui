import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';
import { DocumentMigrationService, MigrationRequest } from '../../../lib/services/documentMigrationService';
import { z } from 'zod';

// Validation schema for migration request
const migrationRequestSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1, 'At least one document ID is required'),
  sourceRealmId: z.string().uuid('Invalid source realm ID'),
  targetRealmId: z.string().uuid('Invalid target realm ID'),
  migrationOptions: z.object({
    copyStageFiles: z.boolean().default(true),
    reprocessStages: z.array(z.string()).default(['ingestor']),
    preserveOriginal: z.boolean().default(true),
    migrationMode: z.enum(['copy', 'move']).default('copy'),
    targetDatabases: z.array(z.string()).optional(),
  }),
});

const getMigrationsQuerySchema = z.object({
  realmId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(0)).optional(),
});

// POST /api/migrations - Create new migration
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate request body
    const validationResult = migrationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const migrationRequest: MigrationRequest = validationResult.data;

    // Validate that source and target realms are different
    if (migrationRequest.sourceRealmId === migrationRequest.targetRealmId) {
      return NextResponse.json(
        { error: 'Source and target realms must be different' },
        { status: 400 }
      );
    }

    // Create migration
    const migration = await DocumentMigrationService.createMigration(
      migrationRequest,
      user.userId
    );

    return NextResponse.json({
      success: true,
      migration,
    });
  } catch (error) {
    console.error('Failed to create migration:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create migration' },
      { status: 500 }
    );
  }
}

// GET /api/migrations - Get user's migrations
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = getMigrationsQuerySchema.safeParse({
      realmId: searchParams.get('realmId'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { realmId, status, limit, offset } = queryValidation.data;

    // Get migrations
    const migrations = await DocumentMigrationService.getMigrations(user.userId, {
      realmId,
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      migrations,
    });
  } catch (error) {
    console.error('Failed to fetch migrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch migrations' },
      { status: 500 }
    );
  }
}