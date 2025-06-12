import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/services/databaseService';
import { requireAuth } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const databases = await DatabaseService.getDatabasesByUser(user.userId);
        return NextResponse.json(databases);
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to fetch databases:', error);
        return NextResponse.json({ error: 'Failed to fetch databases' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const body = await request.json();
        const { name, description, serverId } = body;
        
        if (!name || !description || !serverId) {
            return NextResponse.json(
                { error: 'Name, description, and serverId are required' },
                { status: 400 },
            );
        }
        
        const database = await DatabaseService.createDatabase({
            name,
            description,
            userId: user.userId, // Use authenticated user's ID
            serverId,
        });
        
        return NextResponse.json(database, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to create database:', error);
        return NextResponse.json({ error: 'Failed to create database' }, { status: 500 });
    }
}
