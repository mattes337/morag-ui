import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { UserService } from '@/lib/services/userService';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user settings to find current realm
        const userSettings = await UserService.getUserSettings(user.id);
        let currentRealm = null;

        if (userSettings?.currentRealmId) {
            // Try to get the specified current realm
            currentRealm = await RealmService.getRealmById(userSettings.currentRealmId, user.id);
        }

        // If no current realm or user doesn't have access, get/create default realm
        if (!currentRealm) {
            currentRealm = await RealmService.ensureUserHasDefaultRealm(user.id);
            
            // Update user settings to point to default realm
            await UserService.updateUserSettings(user.id, {
                currentRealmId: currentRealm.id
            });
            
            // Add user role info
            const realmWithRole = await RealmService.getRealmById(currentRealm.id, user.id);
            currentRealm = realmWithRole || currentRealm;
        }

        return NextResponse.json({ currentRealm });
    } catch (error) {
        console.error('Error fetching current realm:', error);
        return NextResponse.json(
            { error: 'Failed to fetch current realm' },
            { status: 500 }
        );
    }
}