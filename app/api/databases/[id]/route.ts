import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/services/databaseService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const database = await DatabaseService.getDatabaseById(params.id);
        if (!database) {
            return NextResponse.json({ error: 'Database not found' }, { status: 404 });
        }
        return NextResponse.json(database);
    } catch (error) {
        console.error('Failed to fetch database:', error);
        return NextResponse.json({ error: 'Failed to fetch database' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const database = await DatabaseService.updateDatabase(params.id, body);
        return NextResponse.json(database);
    } catch (error) {
        console.error('Failed to update database:', error);
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await DatabaseService.deleteDatabase(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete database:', error);
        return NextResponse.json({ error: 'Failed to delete database' }, { status: 500 });
    }
}
