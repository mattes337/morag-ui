import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServerService } from '../../../../lib/services/databaseServerService';
import { requireAuth } from '../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = requireAuth(request);
        const server = await DatabaseServerService.getDatabaseServerById(params.id);
        
        if (!server) {
            return NextResponse.json({ error: 'Server not found' }, { status: 404 });
        }
        
        // Check if the server belongs to the authenticated user
        if (server.userId !== user.userId) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }
        
        return NextResponse.json(server);
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to fetch server:', error);
        return NextResponse.json({ error: 'Failed to fetch server' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = requireAuth(request);
        const body = await request.json();
        
        // First check if the server exists and belongs to the user
        const existingServer = await DatabaseServerService.getDatabaseServerById(params.id);
        
        if (!existingServer) {
            return NextResponse.json({ error: 'Server not found' }, { status: 404 });
        }
        
        if (existingServer.userId !== user.userId) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }
        
        const server = await DatabaseServerService.updateDatabaseServer(params.id, body);
        return NextResponse.json(server);
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to update server:', error);
        return NextResponse.json({ error: 'Failed to update server' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = requireAuth(request);
        
        // First check if the server exists and belongs to the user
        const existingServer = await DatabaseServerService.getDatabaseServerById(params.id);
        
        if (!existingServer) {
            return NextResponse.json({ error: 'Server not found' }, { status: 404 });
        }
        
        if (existingServer.userId !== user.userId) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }
        
        await DatabaseServerService.deleteDatabaseServer(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to delete server:', error);
        return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 });
    }
}