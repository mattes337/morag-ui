import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { DeletionImpactAnalyzer } from '@/lib/services/enhancedDocumentDeletionService';
import { z } from 'zod';

const analyzeSchema = z.object({
    documentIds: z.array(z.string()).min(1, 'At least one document ID is required')
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = analyzeSchema.parse(body);

        const analyzer = new DeletionImpactAnalyzer();
        const impact = await analyzer.analyzeImpact(validatedData.documentIds);

        return NextResponse.json({ impact });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error analyzing deletion impact:', error);
        return NextResponse.json(
            { error: 'Failed to analyze deletion impact' },
            { status: 500 }
        );
    }
}
