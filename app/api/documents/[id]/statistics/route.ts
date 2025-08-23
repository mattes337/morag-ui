import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DocumentStatistics {
  processing: {
    chunks: number;
    quality: number;
    processingTime: number;
    version: number;
    lastProcessed: string;
  };
  content: {
    words: number;
    characters: number;
    pages: number;
    language: string;
    readingTime: number;
  };
  knowledgeGraph: {
    entities: number;
    facts: number;
    relations: number;
    concepts: number;
    topics: string[];
  };
  performance: {
    searchQueries: number;
    avgResponseTime: number;
    accuracy: number;
    lastAccessed: string;
  };
}

/**
 * GET /api/documents/[id]/statistics
 * Get comprehensive statistics for a document
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = params;

    // Get document with related data
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        documentChunks: true,
        entities: {
          include: {
            entity: true
          }
        },
        facts: true,
        files: true,
        stageExecutions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        processingJobs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Calculate processing statistics
    const processingStats = {
      chunks: document.chunks || document.documentChunks.length,
      quality: document.quality || 0,
      processingTime: calculateProcessingTime(document.processingJobs),
      version: document.version,
      lastProcessed: document.stageExecutions[0]?.completedAt?.toISOString() || document.updatedAt.toISOString()
    };

    // Calculate content statistics
    const contentStats = await calculateContentStats(document);

    // Calculate knowledge graph statistics
    const knowledgeGraphStats = await calculateKnowledgeGraphStats(document);

    // Calculate performance statistics (mock for now - would need search logs)
    const performanceStats = {
      searchQueries: Math.floor(Math.random() * 200) + 50, // Mock data
      avgResponseTime: Math.round((Math.random() * 0.5 + 0.2) * 100) / 100,
      accuracy: Math.round((Math.random() * 0.2 + 0.8) * 100) / 100,
      lastAccessed: document.updatedAt.toISOString()
    };

    const statistics: DocumentStatistics = {
      processing: processingStats,
      content: contentStats,
      knowledgeGraph: knowledgeGraphStats,
      performance: performanceStats
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error getting document statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get document statistics' },
      { status: 500 }
    );
  }
}

function calculateProcessingTime(jobs: any[]): number {
  if (jobs.length === 0) return 0;
  
  let totalTime = 0;
  for (const job of jobs) {
    if (job.startedAt && job.completedAt) {
      const duration = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime();
      totalTime += duration;
    }
  }
  
  return Math.round(totalTime / 1000); // Convert to seconds
}

async function calculateContentStats(document: any) {
  const markdown = document.markdown || '';
  
  // Calculate word count
  const words = markdown.split(/\s+/).filter((word: string) => word.length > 0).length;
  
  // Calculate character count
  const characters = markdown.length;
  
  // Estimate pages (assuming ~250 words per page)
  const pages = Math.max(1, Math.ceil(words / 250));
  
  // Estimate reading time (assuming ~200 words per minute)
  const readingTime = Math.max(1, Math.ceil(words / 200));
  
  // Detect language (simple heuristic)
  const language = detectLanguage(markdown);
  
  return {
    words,
    characters,
    pages,
    language,
    readingTime
  };
}

async function calculateKnowledgeGraphStats(document: any) {
  const entities = document.entities.length;
  const facts = document.facts.length;
  
  // Calculate relations (connections between entities)
  const entityNames = new Set(document.entities.map((e: any) => e.entity.name));
  let relations = 0;
  
  for (const fact of document.facts) {
    if (entityNames.has(fact.subject) && entityNames.has(fact.object)) {
      relations++;
    }
  }
  
  // Extract concepts from entity types
  const concepts = new Set(document.entities.map((e: any) => e.entity.type)).size;
  
  // Extract topics from entity types and fact predicates
  const topics = Array.from(new Set([
    ...document.entities.map((e: any) => e.entity.type),
    ...document.facts.map((f: any) => f.predicate)
  ])).slice(0, 5); // Top 5 topics
  
  return {
    entities,
    facts,
    relations,
    concepts,
    topics
  };
}

function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = text.toLowerCase().split(/\s+/).slice(0, 100); // Check first 100 words
  
  const englishCount = words.filter(word => englishWords.includes(word)).length;
  
  if (englishCount > words.length * 0.1) {
    return 'English';
  }
  
  return 'Unknown';
}
