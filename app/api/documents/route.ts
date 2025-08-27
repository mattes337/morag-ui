import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../lib/services/documentService';
import { requireUnifiedAuth } from '../../../lib/middleware/unifiedAuth';
import { unifiedFileService } from '../../../lib/services/unifiedFileService';
import { detectDocumentType } from '../../../lib/utils/documentTypeDetection';

/**
 * GET /api/documents
 * List documents for the authenticated user/realm
 * Supports both session and API key authentication
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const state = searchParams.get('state');
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const realmId = searchParams.get('realmId');

        // Validate pagination
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        // Determine which realm to use
        let targetRealmId = realmId;
        if (!targetRealmId && auth.realm) {
            targetRealmId = auth.realm.id;
        }

        // Build filters
        const filters: any = {};
        if (targetRealmId) {
            filters.realmId = targetRealmId;
        } else {
            // If no realm specified, get user's documents across all realms
            filters.userId = auth.user!.userId;
        }

        // Add state filter
        if (state) {
            const validStates = ['UPLOADED', 'PROCESSING', 'INGESTED', 'FAILED', 'ARCHIVED'];
            if (validStates.includes(state.toUpperCase())) {
                filters.state = state.toUpperCase();
            }
        }

        // Add type filter
        if (type) {
            filters.type = type;
        }

        // Get filtered documents with pagination
        let documents, total;

        if (targetRealmId) {
            // Use the enhanced filtering method for realm-specific queries
            const result = await DocumentService.getDocumentsWithFilters({
                realmId: targetRealmId,
                state: state || undefined,
                type: type || undefined,
                search: search || undefined,
                page,
                limit,
            });
            documents = result.documents;
            total = result.total;
        } else {
            // Fall back to user-based queries for session auth without realm
            const allDocuments = await DocumentService.getDocumentsByUserId(auth.user!.userId);

            // Apply client-side filtering for now (could be optimized with a new service method)
            let filteredDocs = allDocuments;

            if (state) {
                filteredDocs = filteredDocs.filter(doc => doc.state === state);
            }
            if (type) {
                filteredDocs = filteredDocs.filter(doc => doc.type === type);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filteredDocs = filteredDocs.filter(doc =>
                    doc.name.toLowerCase().includes(searchLower) ||
                    (doc.markdown && doc.markdown.toLowerCase().includes(searchLower))
                );
            }

            // Apply pagination
            total = filteredDocs.length;
            const skip = (page - 1) * limit;
            documents = filteredDocs.slice(skip, skip + limit);
        }

        return NextResponse.json({
            documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            realm: auth.realm ? {
                id: auth.realm.id,
                name: auth.realm.name,
            } : null,
            authMethod: auth.authMethod
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * POST /api/documents
 * Create a new document
 * Supports both session and API key authentication
 * Supports both JSON payload and multipart form data (file upload)
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData();
            const file = formData.get('file') as File;
            const name = formData.get('name') as string || file?.name;
            const type = formData.get('type') as string;
            const subType = formData.get('subType') as string;
            const processingMode = formData.get('processingMode') as string || 'AUTOMATIC';
            const realmId = formData.get('realmId') as string;

            if (!file || !name) {
                return NextResponse.json(
                    { error: 'file and name are required' },
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

            // Auto-detect type and subType if not provided
            let finalType = type;
            let finalSubType = subType;

            if (!finalType || !finalSubType) {
                const detected = detectDocumentType(file.name);
                finalType = finalType || detected.type;
                finalSubType = finalSubType || detected.subType || 'unknown';
            }

            // Create document
            const document = await DocumentService.createDocument({
                name,
                type: finalType,
                subType: finalSubType,
                realmId: targetRealmId,
                userId: auth.user!.userId,
                processingMode: processingMode as any
            });

            // Store file
            const buffer = await file.arrayBuffer();
            const content = Buffer.from(buffer);

            const storedFile = await unifiedFileService.storeFile({
                documentId: document.id,
                fileType: 'ORIGINAL_DOCUMENT',
                filename: file.name,
                originalName: file.name,
                content,
                contentType: file.type,
                isPublic: false,
                accessLevel: 'REALM_MEMBERS',
                metadata: {
                    uploadedBy: auth.user!.userId,
                    uploadedAt: new Date().toISOString(),
                    originalSize: file.size,
                }
            });

            return NextResponse.json({
                document,
                file: storedFile,
                message: 'Document created successfully'
            }, { status: 201 });
        } else {
            // Handle JSON payload
            const body = await request.json();
            const { name, type, subType, processingMode, url, realmId } = body;

            if (!name) {
                return NextResponse.json(
                    { error: 'name is required' },
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

            // Auto-detect type and subType if not provided
            let finalType = type;
            let finalSubType = subType;

            if (!finalType || !finalSubType) {
                const detectionInput = url || name;
                const detected = detectDocumentType(detectionInput);
                finalType = finalType || detected.type;
                finalSubType = finalSubType || detected.subType || 'unknown';
            }

            const document = await DocumentService.createDocument({
                name,
                type: finalType,
                subType: finalSubType,
                realmId: targetRealmId,
                userId: auth.user!.userId,
                processingMode: processingMode || 'AUTOMATIC'
            });

            // If URL is provided, store it as the original content
            let storedFile = null;
            if (url) {
                storedFile = await unifiedFileService.storeFile({
                    documentId: document.id,
                    fileType: 'ORIGINAL_DOCUMENT',
                    filename: `${finalType}_content.txt`,
                    originalName: name,
                    content: Buffer.from(url, 'utf-8'),
                    contentType: 'text/plain',
                    isPublic: false,
                    accessLevel: 'REALM_MEMBERS',
                    metadata: {
                        sourceUrl: url,
                        documentType: finalType,
                        documentSubType: finalSubType,
                        createdAt: new Date().toISOString(),
                        createdBy: auth.user!.userId,
                    }
                });
            }

            // Schedule automatic processing if enabled
            if ((processingMode || 'AUTOMATIC') === 'AUTOMATIC' && storedFile) {
                try {
                    // Import the background job service to schedule processing
                    const { backgroundJobService } = await import('@/lib/services/backgroundJobService');

                    // Schedule basic processing for URL-based documents
                    const jobId = await backgroundJobService.createJob({
                        documentId: document.id,
                        stage: 'MARKDOWN_CONVERSION',
                        priority: 0,
                        scheduledAt: new Date()
                    });

                    console.log(`Document ${document.id} created from URL, scheduled automatic processing with job ${jobId}`);
                } catch (processingError) {
                    console.error(`Failed to schedule automatic processing for document ${document.id}:`, processingError);
                    // Don't fail the creation if processing scheduling fails
                }
            }

            return NextResponse.json({
                document,
                file: storedFile,
                message: 'Document created successfully'
            }, { status: 201 });
        }
    } catch (error) {
        console.error('Failed to create document:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create document' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}
