import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { EnhancedDocumentDeletionService } from '@/lib/services/enhancedDocumentDeletionService';
import { z } from 'zod';

const executeSchema = z.object({
    documentIds: z.array(z.string()).min(1, 'At least one document ID is required'),
    options: z.object({
        dryRun: z.boolean().optional().default(false),
        preserveEntities: z.boolean().optional().default(true),
        createAuditLog: z.boolean().optional().default(true)
    }).optional().default({})
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = executeSchema.parse(body);

        const deletionService = new EnhancedDocumentDeletionService();
        
        if (validatedData.documentIds.length === 1) {
            // Single document deletion
            const result = await deletionService.deleteDocument(
                validatedData.documentIds[0], 
                {
                    ...validatedData.options,
                    userId: user.userId
                }
            );
            return NextResponse.json({ result });
        } else {
            // Batch deletion
            const result = await deletionService.batchDeleteDocuments(
                validatedData.documentIds,
                {
                    ...validatedData.options,
                    userId: user.userId
                }
            );
            return NextResponse.json({ result });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error executing document deletion:', error);
        return NextResponse.json(
            { error: 'Failed to execute document deletion' },
            { status: 500 }
        );
    }
}
