import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { UserService } from '@/lib/services/userService';
import { z } from 'zod';

const switchRealmSchema = z.object({
    realmId: z.string().min(1, 'Realm ID is required')
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { realmId } = switchRealmSchema.parse(body);

        // Verify user has access to the realm
        const realm = await RealmService.getRealmById(realmId, user.userId);
        if (!realm) {
            return NextResponse.json(
                { error: 'Realm not found or access denied' },
                { status: 404 }
            );
        }

        // Set current realm in session cookie (primary method)
        const response = NextResponse.json({
            success: true,
            currentRealm: realm
        });

        // Store current realm in cookie for immediate session use
        response.cookies.set('current-realm', realmId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400 * 30, // 30 days
            path: '/'
        });

        // Also update user settings as a backup/preference storage
        // This runs in background and doesn't block the response
        UserService.updateUserSettings(user.userId, {
            currentRealmId: realmId
        }).catch(error => {
            console.warn('Failed to update user settings for realm switch:', error);
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error switching realm:', error);
        return NextResponse.json(
            { error: 'Failed to switch realm' },
            { status: 500 }
        );
    }
}