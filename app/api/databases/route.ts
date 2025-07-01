import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { DatabaseService, createDatabase } from '@/lib/services/databaseService';
import { z } from 'zod';

const createDatabaseSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    ingestionPrompt: z.string().optional(),
    systemPrompt: z.string().optional(),
    serverIds: z.array(z.string()).min(1, 'At least one server is required'),
    realmId: z.string().min(1, 'Realm ID is required'),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const realmId = searchParams.get('realmId');

        const databases = await DatabaseService.getDatabasesByUserId(user.userId, realmId);
        return NextResponse.json(databases);
    } catch (error) {
        console.error('Error fetching databases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch databases' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createDatabaseSchema.parse(body);
        
        const database = await createDatabase({
            name: validatedData.name,
            description: validatedData.description || '',
            ingestionPrompt: validatedData.ingestionPrompt,
            systemPrompt: validatedData.systemPrompt,
            userId: user.userId,
            serverIds: validatedData.serverIds,
            realmId: validatedData.realmId,
        });
        
        return NextResponse.json(database, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }
        console.error('Error creating database:', error);
        return NextResponse.json(
            { error: 'Failed to create database' },
            { status: 500 }
        );
    }
}
