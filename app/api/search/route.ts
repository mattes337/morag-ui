import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '../../../lib/middleware/unifiedAuth';
import { prisma } from '../../../lib/database';

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

    // For now, implement basic text search
    // In a real implementation, this would use vector search, Elasticsearch, etc.
    const searchResults: SearchResult[] = documents
      .filter(doc => {
        const searchText = options.query.toLowerCase();
        return (
          doc.name.toLowerCase().includes(searchText) ||
          (doc.markdown && doc.markdown.toLowerCase().includes(searchText))
        );
      })
      .map(doc => ({
        id: doc.id,
        title: doc.name,
        score: 0.8, // Mock score
        type: doc.type,
        snippet: doc.markdown ? doc.markdown.substring(0, 200) + '...' : '',
        metadata: options.includeMetadata ? {
          uploadDate: doc.uploadDate,
          state: doc.state,
          chunks: doc.chunks,
          quality: doc.quality,
        } : {},
        content: options.includeContent ? (doc.markdown || undefined) : undefined,
      }));

    const executionTime = Date.now() - startTime;

    return {
      results: searchResults,
      total: searchResults.length,
      executionTime,
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

async function generateSearchSuggestions(query: string, realmId: string, limit: number): Promise<string[]> {
  try {
    // Get recent documents and extract common terms
    const documents = await prisma.document.findMany({
      where: {
        realmId,
        state: 'INGESTED',
      },
      select: {
        name: true,
        markdown: true,
      },
      take: 50,
      orderBy: {
        uploadDate: 'desc',
      },
    });

    // Extract suggestions from document names and content
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    documents.forEach(doc => {
      // Add document name if it contains the query
      if (doc.name.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.name);
      }

      // Extract words from markdown content
      if (doc.markdown) {
        const words = doc.markdown.toLowerCase().match(/\b\w{3,}\b/g) || [];
        words.forEach(word => {
          if (word.includes(queryLower) && suggestions.size < limit * 2) {
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}

/**
 * POST /api/search
 * Execute a search query on the realm
 * Supports both session and API key authentication
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUnifiedAuth(request);
    const body = await request.json();
    
    const { 
      query, 
      type = 'semantic', 
      limit = 10, 
      filters = {},
      includeContent = false,
      includeMetadata = true,
      realmId
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
    
    // Determine target realm
    let targetRealmId = realmId;
    if (!targetRealmId && auth.realm) {
      targetRealmId = auth.realm.id;
    }
    if (!targetRealmId) {
      return NextResponse.json(
        { error: 'realmId is required when not using API key authentication' },
        { status: 400 }
      );
    }
    
    // Enhanced search functionality
    const searchResults = await performSearch({
      query,
      type,
      realmId: targetRealmId,
      limit,
      filters,
      includeContent,
      includeMetadata,
    });

    const response = {
      query,
      type,
      results: searchResults.results,
      total: searchResults.total,
      executionTime: searchResults.executionTime,
      realm: {
        id: targetRealmId,
        name: auth.realm?.name || 'Unknown',
      },
      authMethod: auth.authMethod,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error executing search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * GET /api/search/suggestions
 * Get search suggestions
 * Supports both session and API key authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUnifiedAuth(request);
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '5');
    const realmId = searchParams.get('realmId');
    
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 20' },
        { status: 400 }
      );
    }
    
    // Determine target realm
    let targetRealmId = realmId;
    if (!targetRealmId && auth.realm) {
      targetRealmId = auth.realm.id;
    }
    if (!targetRealmId) {
      return NextResponse.json(
        { error: 'realmId is required when not using API key authentication' },
        { status: 400 }
      );
    }
    
    // Generate intelligent suggestions based on document content and entities
    const suggestions = await generateSearchSuggestions(query, targetRealmId, limit);

    const response = {
      query,
      suggestions,
      realmId: targetRealmId,
      authMethod: auth.authMethod,
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
