import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/middleware/apiKeyAuth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SearchOptions {
  query: string;
  type: string;
  realmId: string;
  limit: number;
  filters: any;
  includeContent: boolean;
  includeMetadata: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  score: number;
  type: string;
  snippet: string;
  metadata: any;
  content?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  executionTime: number;
}

async function performSearch(options: SearchOptions): Promise<SearchResponse> {
  const startTime = Date.now();

  try {
    // Get documents in the realm
    const documents = await prisma.document.findMany({
      where: {
        realmId: options.realmId,
        state: 'INGESTED',
      },
      include: {
        documentChunks: options.type === 'semantic',
        entities: options.type === 'semantic' || options.type === 'hybrid',
        facts: options.type === 'semantic' || options.type === 'hybrid',
      },
      take: options.limit,
    });

    const results: SearchResult[] = [];
    const queryLower = options.query.toLowerCase();

    for (const doc of documents) {
      let score = 0;
      let snippet = '';

      // Basic keyword matching
      if (doc.name.toLowerCase().includes(queryLower)) {
        score += 0.8;
        snippet = `Document: ${doc.name}`;
      }

      if (doc.markdown && doc.markdown.toLowerCase().includes(queryLower)) {
        score += 0.6;
        const markdownLower = doc.markdown.toLowerCase();
        const index = markdownLower.indexOf(queryLower);
        const start = Math.max(0, index - 50);
        const end = Math.min(doc.markdown.length, index + 150);
        snippet = doc.markdown.substring(start, end) + '...';
      }

      // Search in chunks for semantic search
      if (options.type === 'semantic' || options.type === 'hybrid') {
        for (const chunk of doc.documentChunks || []) {
          if (chunk.content.toLowerCase().includes(queryLower)) {
            score += 0.7;
            if (!snippet) {
              snippet = chunk.content.substring(0, 200) + '...';
            }
          }
        }
      }

      // Search in entities (simplified for now)
      if (doc.entities) {
        for (const entity of doc.entities) {
          // Note: Entity structure may need to be updated based on actual schema
          score += 0.3;
          if (!snippet) {
            snippet = `Entity found in document`;
          }
        }
      }

      // Search in facts
      if (doc.facts) {
        for (const fact of doc.facts) {
          if (fact.subject.toLowerCase().includes(queryLower) ||
              fact.predicate.toLowerCase().includes(queryLower) ||
              fact.object.toLowerCase().includes(queryLower)) {
            score += 0.4;
            if (!snippet) {
              snippet = `${fact.subject} ${fact.predicate} ${fact.object}`;
            }
          }
        }
      }

      if (score > 0) {
        results.push({
          id: doc.id,
          title: doc.name,
          score: Math.min(score, 1.0),
          type: 'document',
          snippet: snippet || 'No preview available',
          metadata: {
            documentId: doc.id,
            source: 'document',
            createdAt: doc.createdAt.toISOString(),
            type: doc.type,
            subType: doc.subType,
            chunks: doc.chunks,
            quality: doc.quality,
          },
          content: options.includeContent ? (doc.markdown || undefined) : undefined,
        });
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    const executionTime = (Date.now() - startTime) / 1000;

    return {
      results: results.slice(0, options.limit),
      total: results.length,
      executionTime,
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      results: [],
      total: 0,
      executionTime: (Date.now() - startTime) / 1000,
    };
  }
}

interface Suggestion {
  text: string;
  type: 'completion' | 'entity' | 'document' | 'fact';
  score: number;
  metadata?: any;
}

async function generateSearchSuggestions(query: string, realmId: string, limit: number): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];
  const queryLower = query.toLowerCase().trim();

  if (queryLower.length < 2) {
    return suggestions;
  }

  try {
    // Get documents that match the query prefix
    const documents = await prisma.document.findMany({
      where: {
        realmId,
        state: 'INGESTED',
        OR: [
          { name: { contains: queryLower } },
          { markdown: { contains: queryLower } }
        ]
      },
      select: {
        id: true,
        name: true,
        type: true,
        subType: true,
      },
      take: 5,
    });

    // Add document name suggestions
    for (const doc of documents) {
      if (doc.name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: doc.name,
          type: 'document',
          score: 0.9,
          metadata: {
            documentId: doc.id,
            type: doc.type,
            subType: doc.subType,
          }
        });
      }
    }

    // Get entities that match the query
    const entities = await prisma.entity.findMany({
      where: {
        name: { contains: queryLower },
        documents: {
          some: {
            document: {
              realmId,
              state: 'INGESTED'
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        type: true,
        documents: {
          select: { id: true }
        }
      },
      take: 5,
    });

    // Add entity suggestions
    for (const entity of entities) {
      suggestions.push({
        text: entity.name,
        type: 'entity',
        score: 0.8 + (entity.documents.length * 0.01), // Higher score for more referenced entities
        metadata: {
          entityId: entity.id,
          entityType: entity.type,
          documentCount: entity.documents.length,
        }
      });
    }

    // Get facts that contain the query
    const facts = await prisma.fact.findMany({
      where: {
        document: {
          realmId,
          state: 'INGESTED'
        },
        OR: [
          { subject: { contains: queryLower } },
          { predicate: { contains: queryLower } },
          { object: { contains: queryLower } }
        ]
      },
      select: {
        id: true,
        subject: true,
        predicate: true,
        object: true,
        confidence: true,
      },
      take: 3,
    });

    // Add fact-based suggestions
    for (const fact of facts) {
      const factText = `${fact.subject} ${fact.predicate} ${fact.object}`;
      if (factText.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: factText,
          type: 'fact',
          score: 0.7 + (fact.confidence || 0) * 0.1,
          metadata: {
            factId: fact.id,
            subject: fact.subject,
            predicate: fact.predicate,
            object: fact.object,
            confidence: fact.confidence,
          }
        });
      }
    }

    // Add query completion suggestions
    const commonCompletions = [
      'documents',
      'analysis',
      'summary',
      'overview',
      'details',
      'information',
      'data',
      'research',
      'findings',
      'results'
    ];

    for (const completion of commonCompletions) {
      if (completion.startsWith(queryLower) || queryLower.length >= 3) {
        suggestions.push({
          text: `${query} ${completion}`,
          type: 'completion',
          score: 0.6,
        });
      }
    }

    // Sort by score and limit results
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(suggestion => ({
        ...suggestion,
        score: Math.round(suggestion.score * 100) / 100 // Round to 2 decimal places
      }));

  } catch (error) {
    console.error('Error generating search suggestions:', error);

    // Fallback to simple completions
    return [
      { text: `${query} documents`, type: 'completion' as const, score: 0.9 },
      { text: `${query} analysis`, type: 'completion' as const, score: 0.8 },
      { text: `${query} summary`, type: 'completion' as const, score: 0.7 }
    ].slice(0, limit);
  }
}

/**
 * POST /api/v1/search
 * Execute a search query on the realm
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiKey(request);
    const body = await request.json();
    
    const { 
      query, 
      type = 'semantic', 
      limit = 10, 
      filters = {},
      includeContent = false,
      includeMetadata = true 
    } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Enhanced search functionality
    const searchResults = await performSearch({
      query,
      type,
      realmId: auth.realm!.id,
      limit,
      filters,
      includeContent,
      includeMetadata,
    });

    const results = {
      query,
      type,
      realmId: auth.realm!.id,
      results: searchResults.results,
      pagination: {
        limit,
        total: searchResults.total,
        hasMore: searchResults.total > limit,
      },
      executionTime: searchResults.executionTime,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error executing search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute search' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * GET /api/v1/search/suggestions
 * Get search suggestions based on query
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiKey(request);
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '5');
    
    if (!query) {
      return NextResponse.json(
        { error: 'query parameter is required' },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 20' },
        { status: 400 }
      );
    }
    
    // Generate intelligent suggestions based on document content and entities
    const suggestions = await generateSearchSuggestions(query, auth.realm!.id, limit);

    const response = {
      query,
      suggestions,
      realmId: auth.realm!.id,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get suggestions' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
