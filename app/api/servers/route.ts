import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServerService } from '../../../lib/services/databaseServerService';
import { requireAuth } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const servers = await DatabaseServerService.getDatabaseServersByUser(user.userId);
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
        const user = requireAuth(request);
        const body = await request.json();
        const { name, type, host, port, username, password, apiKey, database, collection } = body;
        
        if (!name || !type || !host || port === undefined) {
            return NextResponse.json(
                { error: 'Name, type, host, and port are required' },
                { status: 400 },
            );
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
            userId: user.userId, // Use authenticated user's ID
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