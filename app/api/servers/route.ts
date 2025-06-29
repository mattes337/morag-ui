import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServerService } from '../../../lib/services/databaseServerService';
import { requireAuth } from '../../../lib/auth';
import { UserService } from '../../../lib/services/userService';
import { RealmService } from '../../../lib/services/realmService';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        
        // Debug logging to identify the issue
        console.log('GET /api/servers - User object:', JSON.stringify(user, null, 2));
        
        if (!user.userId) {
            console.error('GET /api/servers - user.userId is undefined:', user);
            throw new Error('User ID is missing from authentication');
        }
        
        // Get current realm for the user
        const userSettings = await UserService.getUserSettings(user.userId);
        let currentRealm = null;
        
        if (userSettings?.currentRealmId) {
            currentRealm = await RealmService.getRealmById(userSettings.currentRealmId, user.userId);
        }
        
        // If no current realm, get/create default realm
        if (!currentRealm) {
            currentRealm = await RealmService.ensureUserHasDefaultRealm(user.userId);
            await UserService.updateUserSettings(user.userId, {
                currentRealmId: currentRealm.id
            });
        }
        
        const servers = await DatabaseServerService.getDatabaseServersByUser(user.userId, currentRealm.id);
        return NextResponse.json(servers);
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to fetch servers:', error);
        return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        
        // Debug logging to identify the issue
        console.log('POST /api/servers - User object:', JSON.stringify(user, null, 2));
        
        if (!user.userId) {
            console.error('POST /api/servers - user.userId is undefined:', user);
            throw new Error('User ID is missing from authentication');
        }
        const body = await request.json();
        const { name, type, host, port, username, password, apiKey, database, collection } = body;
        
        if (!name || !type || !host || port === undefined) {
            return NextResponse.json(
                { error: 'Name, type, host, and port are required' },
                { status: 400 },
            );
        }
        
        // Get current realm for the user
        const userSettings = await UserService.getUserSettings(user.userId);
        let currentRealm = null;
        
        if (userSettings?.currentRealmId) {
            currentRealm = await RealmService.getRealmById(userSettings.currentRealmId, user.userId);
        }
        
        // If no current realm, get/create default realm
        if (!currentRealm) {
            currentRealm = await RealmService.ensureUserHasDefaultRealm(user.userId);
            await UserService.updateUserSettings(user.userId, {
                currentRealmId: currentRealm.id
            });
        }
        
        const server = await DatabaseServerService.createDatabaseServer({
            name,
            type,
            host,
            port,
            username,
            password,
            apiKey,
            database,
            collection,
            userId: user.userId,
            realmId: currentRealm.id,
            isActive: true,
        });
        
        return NextResponse.json(server, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to create server:', error);
        return NextResponse.json({ error: 'Failed to create server' }, { status: 500 });
    }
}