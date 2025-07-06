import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { MoragService, type MoragQueryRequest } from '@/lib/services/moragService';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { 
            query, 
            realmId, 
            systemPrompt, 
            maxResults = 10, 
            minSimilarity = 0.7,
            documentIds 
        } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (!realmId) {
            return NextResponse.json({ error: 'Realm ID is required' }, { status: 400 });
        }

        // Get the realm and check access
        const realm = await RealmService.getRealmById(realmId, user.userId);
        if (!realm) {
            return NextResponse.json({ error: 'Realm not found or access denied' }, { status: 404 });
        }

        // Check if realm has required servers (Qdrant and Neo4j)
        const qdrantServer = realm.servers?.find(s => s.type === 'QDRANT');
        const neo4jServer = realm.servers?.find(s => s.type === 'NEO4J');

        if (!qdrantServer || !neo4jServer) {
            return NextResponse.json({ 
                error: 'Realm must have both Qdrant and Neo4j servers configured for querying' 
            }, { status: 400 });
        }

        // Prepare the query request
        const queryRequest: MoragQueryRequest = {
            query,
            realm_id: realmId,
            user_id: user.userId,
            system_prompt: systemPrompt || realm.systemPrompt,
            max_results: maxResults,
            min_similarity: minSimilarity,
            document_ids: documentIds,
            servers: {
                qdrant: {
                    host: qdrantServer.host,
                    port: qdrantServer.port,
                    collection: qdrantServer.collection || 'documents',
                    api_key: qdrantServer.apiKey || undefined,
                },
                neo4j: {
                    host: neo4jServer.host,
                    port: neo4jServer.port,
                    database: neo4jServer.database || 'neo4j',
                    username: neo4jServer.username || undefined,
                    password: neo4jServer.password || undefined,
                }
            }
        };

        // Query MoRAG
        const moragResponse = await MoragService.queryDocuments(queryRequest);

        return NextResponse.json({
            success: true,
            answer: moragResponse.answer,
            sources: moragResponse.sources,
            processingTime: moragResponse.processing_time,
            tokensUsed: moragResponse.tokens_used,
            query: {
                text: query,
                realmId,
                systemPrompt: systemPrompt || realm.systemPrompt,
                maxResults,
                minSimilarity
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Query error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        
        return NextResponse.json(
            { 
                error: 'Failed to process query',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
