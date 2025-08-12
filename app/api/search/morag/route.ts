import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { DatabaseServerService } from '../../../../lib/services/databaseServerService';
import { moragService } from '../../../../lib/services/moragService';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      query, 
      realmIds, 
      limit = 10, 
      threshold = 0.7,
      includeMetadata = true 
    } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!realmIds || !Array.isArray(realmIds) || realmIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one realmId is required' },
        { status: 400 }
      );
    }

    // Get database servers for all specified realms
    const allServers = [];
    for (const realmId of realmIds) {
      const servers = await DatabaseServerService.getServersByRealm(realmId);
      allServers.push(...servers);
    }

    if (allServers.length === 0) {
      return NextResponse.json(
        { error: 'No database servers configured for the specified realms' },
        { status: 400 }
      );
    }

    try {
      // Perform search using MoRAG service
      const searchResults = await moragService.search(
        query,
        allServers,
        {
          limit,
          threshold,
          includeMetadata,
          realmIds,
        }
      );

      return NextResponse.json({
        query,
        results: searchResults.results || [],
        totalResults: searchResults.total || 0,
        searchTime: searchResults.search_time || 0,
        realms: realmIds,
      });

    } catch (error) {
      console.error('MoRAG search failed:', error);
      
      return NextResponse.json(
        { 
          error: 'Search failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Search endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const realmIds = searchParams.get('realmIds')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '10');
    const threshold = parseFloat(searchParams.get('threshold') || '0.7');
    const includeMetadata = searchParams.get('includeMetadata') !== 'false';
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (realmIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one realmId is required' },
        { status: 400 }
      );
    }

    // Get database servers for all specified realms
    const allServers = [];
    for (const realmId of realmIds) {
      const servers = await DatabaseServerService.getServersByRealm(realmId);
      allServers.push(...servers);
    }

    if (allServers.length === 0) {
      return NextResponse.json(
        { error: 'No database servers configured for the specified realms' },
        { status: 400 }
      );
    }

    try {
      // Perform search using MoRAG service
      const searchResults = await moragService.search(
        query,
        allServers,
        {
          limit,
          threshold,
          includeMetadata,
          realmIds,
        }
      );

      return NextResponse.json({
        query,
        results: searchResults.results || [],
        totalResults: searchResults.total || 0,
        searchTime: searchResults.search_time || 0,
        realms: realmIds,
      });

    } catch (error) {
      console.error('MoRAG search failed:', error);
      
      return NextResponse.json(
        { 
          error: 'Search failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Search endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}