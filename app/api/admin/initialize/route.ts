import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSeeder } from '../../../../lib/database/seeder';

/**
 * POST /api/admin/initialize
 * Manual database initialization endpoint
 * No authentication required for fresh installations
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';
        
        console.log('🔧 Manual database initialization requested...');

        // Perform seeding (will check if database is empty automatically)
        const result = await DatabaseSeeder.seedDefaultUser({ force });
        
        if (!result.created && !force) {
            return NextResponse.json({
                success: false,
                error: 'Database already contains data. Use ?force=true to recreate.',
                needsForce: true
            }, { status: 400 });
        }

        if (!result.user || !result.apiKey || !result.realm) {
            return NextResponse.json({
                success: false,
                error: 'Database initialization failed - missing required data',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Database initialization completed successfully',
            result: {
                user: {
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role
                },
                apiKey: result.apiKey.key,
                genericApiKey: result.genericApiKey?.key || null,
                realm: {
                    id: result.realm.id,
                    name: result.realm.name
                },
                created: result.created
            },
            usage: {
                swagger: '/swagger',
                documentation: '/docs',
                apiStatus: '/api/status?credentials=true'
            }
        });
        
    } catch (error) {
        console.error('❌ Manual database initialization failed:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Database initialization failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * GET /api/admin/initialize
 * Check if initialization is needed
 */
export async function GET(request: NextRequest) {
    try {
        const status = await DatabaseSeeder.checkSeeding();
        
        return NextResponse.json({
            needsInitialization: status.isEmpty,
            status: status,
            endpoints: {
                initialize: '/api/admin/initialize',
                forceInitialize: '/api/admin/initialize?force=true',
                swagger: '/swagger',
                documentation: '/docs'
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to check initialization status:', error);
        
        return NextResponse.json({
            error: 'Failed to check database status',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
