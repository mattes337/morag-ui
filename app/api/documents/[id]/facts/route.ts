import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Get facts for the document
    const facts = await prisma.fact.findMany({
      where: { documentId },
      include: {
        entity: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true
          }
        },
        chunk: {
          select: {
            id: true,
            chunkIndex: true,
            content: true
          }
        }
      },
      orderBy: [
        { confidence: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Group facts by confidence level for better display
    const groupedFacts = {
      high: facts.filter(f => f.confidence >= 0.8),
      medium: facts.filter(f => f.confidence >= 0.5 && f.confidence < 0.8),
      low: facts.filter(f => f.confidence < 0.5)
    };

    // Get some statistics
    const stats = {
      total: facts.length,
      high: groupedFacts.high.length,
      medium: groupedFacts.medium.length,
      low: groupedFacts.low.length,
      averageConfidence: facts.length > 0 ? facts.reduce((sum, f) => sum + f.confidence, 0) / facts.length : 0,
      uniqueSubjects: new Set(facts.map(f => f.subject)).size,
      uniquePredicates: new Set(facts.map(f => f.predicate)).size,
      uniqueObjects: new Set(facts.map(f => f.object)).size
    };

    return NextResponse.json({
      facts,
      groupedFacts,
      stats
    });
  } catch (error) {
    console.error('Error fetching document facts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document facts' },
      { status: 500 }
    );
  }
}
