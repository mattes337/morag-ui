import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../lib/services/startupService';
import { DatabaseSeeder } from '../../../lib/database/seeder';

/**
 * GET /api/status
 * Public endpoint that shows API status and default credentials for fresh installations
 * No authentication required
 */
export async function GET(request: NextRequest) {
    try {
        // Check database status
        const dbStatus = await DatabaseSeeder.checkSeeding();
        const credentials = StartupService.getDefaultCredentials();
        const autoSeedEnabled = StartupService.isAutoSeedEnabled();
        
        const { searchParams } = new URL(request.url);
        const showCredentials = searchParams.get('credentials') === 'true';
        
        const response: any = {
            status: 'ok',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            database: {
                users: dbStatus.users,
                realms: dbStatus.realms,
                apiKeys: dbStatus.apiKeys,
                isEmpty: dbStatus.isEmpty,
                autoSeedEnabled,
            },
            endpoints: {
                swagger: '/swagger',
                openapi: '/api/openapi',
                documentation: '/docs',
            },
            features: {
                unifiedAuth: true,
                genericApiKeys: true,
                userManagement: true,
                jobManagement: true,
                fileManagement: true,
            }
        };

        // Only show credentials if explicitly requested or database is empty
        if (showCredentials || dbStatus.isEmpty) {
            response.defaultCredentials = {
                note: dbStatus.isEmpty 
                    ? "Database is empty. These credentials will be created on first API call."
                    : "Default credentials (if they exist in the database).",
                ui: {
                    email: credentials.email,
                    password: credentials.password,
                },
                api: {
                    defaultKey: credentials.apiKey,
                    genericKey: credentials.genericApiKey || 'Not configured',
                },
                usage: {
                    swagger: `Visit /swagger to test the API with these credentials`,
                    curl: `curl -H "Authorization: Bearer ${credentials.apiKey}" ${getBaseUrl(request)}/api/realms`,
                    automation: credentials.genericApiKey 
                        ? `Use "${credentials.genericApiKey}" for automation across all realms`
                        : 'Set GENERIC_API_KEY environment variable for automation'
                }
            };
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to get API status:', error);
        return NextResponse.json({
            status: 'error',
            error: 'Failed to get API status',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

function getBaseUrl(request: NextRequest): string {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    return `${protocol}://${host}`;
}
