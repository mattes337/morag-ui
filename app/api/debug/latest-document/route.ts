import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

/**
 * GET /api/debug/latest-document
 * Get the latest document to check its processing mode
 */
export async function GET(request: NextRequest) {
  try {
    const latestDocument = await prisma.document.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        processingMode: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      document: latestDocument
    });
  } catch (error) {
    console.error('Error fetching latest document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest document' },
      { status: 500 }
    );
  }
}
