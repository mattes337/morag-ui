import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orphanedEntities = await prisma.entity.findMany({
            where: { isOrphaned: true },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ entities: orphanedEntities });
    } catch (error) {
        console.error('Error fetching orphaned entities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orphaned entities' },
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

        // Cleanup orphaned entities (delete them permanently)
        const result = await prisma.entity.deleteMany({
            where: { isOrphaned: true }
        });

        return NextResponse.json({ 
            message: `Cleaned up ${result.count} orphaned entities`,
            deletedCount: result.count
        });
    } catch (error) {
        console.error('Error cleaning up orphaned entities:', error);
        return NextResponse.json(
            { error: 'Failed to cleanup orphaned entities' },
            { status: 500 }
        );
    }
}
