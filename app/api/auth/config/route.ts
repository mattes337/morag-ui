import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '../../../../lib/auth-config';

/**
 * GET /api/auth/config
 * Get authentication configuration for the frontend
 */
export async function GET(request: NextRequest) {
    try {
        // Only expose safe configuration values to the frontend
        const config = {
            enableHeaderAuth: authConfig.enableHeaderAuth,
            enableAutoLogin: authConfig.enableAutoLogin,
            autoLoginEmail: authConfig.enableAutoLogin ? authConfig.autoLoginEmail : null,
            autoLoginName: authConfig.enableAutoLogin ? authConfig.autoLoginName : null,
            // Never expose the password to the frontend
        };

        return NextResponse.json(config);
    } catch (error) {
        console.error('Auth config error:', error);
        return NextResponse.json(
            { error: 'Failed to get auth configuration' },
            { status: 500 }
        );
    }
}
