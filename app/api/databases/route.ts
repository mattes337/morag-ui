import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/services/databaseService';

export async function GET() {
    try {
        const databases = await DatabaseService.getAllDatabases();
        return NextResponse.json(databases);
    } catch (error) {
        console.error('Failed to fetch databases:', error);
        return NextResponse.json({ error: 'Failed to fetch databases' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name || !description) {
            return NextResponse.json(
                { error: 'Name and description are required' },
                { status: 400 },
            );
        }

        const database = await DatabaseService.createDatabase({ name, description });
        return NextResponse.json(database, { status: 201 });
    } catch (error) {
        console.error('Failed to create database:', error);
        return NextResponse.json({ error: 'Failed to create database' }, { status: 500 });
    }
}
