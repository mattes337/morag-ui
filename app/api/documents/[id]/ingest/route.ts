import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/documentService';
import { RealmService } from '@/lib/services/realmService';
import { MoragService, type MoragIngestionRequest } from '@/lib/services/moragService';
import { JobService } from '@/lib/services/jobService';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { ingestionPrompt, chunkSize = 1000, chunkingMethod = 'Semantic' } = body;

        // Get the document
        const document = await DocumentService.getDocumentById(params.id);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Check if user has access to this document
        if (document.userId !== user.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Check if document has a file path
        if (!document.filePath) {
            return NextResponse.json({ 
                error: 'Document has no associated file. Only uploaded documents can be ingested.' 
            }, { status: 400 });
        }

        // Get the realm and its servers
        const realm = await RealmService.getRealmById(document.realmId, user.userId);
        if (!realm) {
            return NextResponse.json({ error: 'Realm not found' }, { status: 404 });
        }

        // Check if realm has required servers (Qdrant and Neo4j)
        const qdrantServer = realm.servers.find(s => s.type === 'QDRANT');
        const neo4jServer = realm.servers.find(s => s.type === 'NEO4J');

        if (!qdrantServer || !neo4jServer) {
            return NextResponse.json({ 
                error: 'Realm must have both Qdrant and Neo4j servers configured for ingestion' 
            }, { status: 400 });
        }

        // Prepare the ingestion request
        const ingestionRequest: MoragIngestionRequest = {
            document_id: document.id,
            document_name: document.name,
            document_type: document.type,
            file_path: document.filePath,
            realm_id: document.realmId,
            user_id: user.userId,
            ingestion_prompt: ingestionPrompt || realm.ingestionPrompt,
            chunk_size: parseInt(chunkSize.toString()),
            chunking_method: chunkingMethod,
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

        // Send to MoRAG for ingestion
        const moragResponse = await MoragService.ingestDocument(ingestionRequest);

        // Create a job record to track the ingestion
        const job = await JobService.createJob({
            documentId: document.id,
            documentName: document.name,
            documentType: document.type,
            userId: user.userId,
            realmId: document.realmId,
            jobType: 'INGESTION',
            status: 'PENDING',
            externalJobId: moragResponse.job_id,
            metadata: {
                chunkSize,
                chunkingMethod,
                ingestionPrompt: ingestionPrompt || realm.ingestionPrompt,
                moragJobId: moragResponse.job_id
            }
        });

        // Update document state to processing
        await DocumentService.updateDocument(document.id, {
            state: 'PROCESSING'
        });

        return NextResponse.json({
            success: true,
            message: 'Document ingestion started',
            jobId: job.id,
            moragJobId: moragResponse.job_id,
            document: {
                id: document.id,
                name: document.name,
                state: 'PROCESSING'
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Document ingestion error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        
        return NextResponse.json(
            { 
                error: 'Failed to start document ingestion',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
