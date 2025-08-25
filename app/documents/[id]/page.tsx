'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { DocumentDetailView } from '../../../components/views/DocumentDetailView';
import { Document } from '../../../types';

interface DocumentDetailPageProps {
    params: {
        id: string;
    };
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
    const router = useRouter();
    const {
        documents,
        selectedDocument,
        setSelectedDocument,
        setShowSupersedeDocumentDialog,
        setDocumentToSupersede,
        updateDocument,
        deleteDocument,
        isDataLoading,
    } = useApp();

    const [document, setDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDocument = async () => {
            try {
                console.log('🔍 [DocumentDetailPage] Loading document with ID:', params.id);
                setIsLoading(true);
                setError(null);

                // First, try to find the document in the context
                const contextDocument = documents.find(
                    (doc) => doc.id === params.id || doc.id.toString() === params.id,
                );

                if (contextDocument) {
                    console.log(
                        '✅ [DocumentDetailPage] Found document in context:',
                        contextDocument.name,
                    );
                    setDocument(contextDocument);
                    setIsLoading(false);
                    return;
                }

                // If not found in context and context is still loading, wait for it
                if (isDataLoading) {
                    console.log('⏳ [DocumentDetailPage] Context still loading, waiting...');
                    setIsLoading(false);
                    return;
                }

                // If context is loaded but document not found, try to fetch from API
                console.log('📡 [DocumentDetailPage] Document not in context, fetching from API');
                const response = await fetch(`/api/documents/${params.id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('❌ [DocumentDetailPage] Document not found (404)');
                        setError('Document not found');
                        // Only redirect after a longer delay and show error message
                        setTimeout(() => {
                            console.log('🔄 [DocumentDetailPage] Redirecting to documents list after 404');
                            router.push('/documents');
                        }, 3000);
                        return;
                    }
                    console.log('❌ [DocumentDetailPage] API fetch failed:', response.status, response.statusText);
                    // Don't redirect on API errors, just show error
                    setError(`Failed to load document: ${response.status} ${response.statusText}`);
                    setIsLoading(false);
                    return;
                }

                const docData = await response.json();
                const formattedDoc: Document = {
                    id: docData.id,
                    name: docData.name,
                    type: docData.type,
                    state: (docData.state || 'pending').toLowerCase() as Document['state'],
                    version: docData.version || 1,
                    chunks: docData.chunks || 0,
                    quality: docData.quality || 0,
                    uploadDate: docData.uploadDate
                        ? new Date(docData.uploadDate).toISOString().split('T')[0]
                        : '',
                    markdown: docData.markdown,
                };

                console.log(
                    '✅ [DocumentDetailPage] Successfully loaded document from API:',
                    formattedDoc.name,
                );
                setDocument(formattedDoc);
            } catch (err) {
                console.error('❌ [DocumentDetailPage] Failed to load document:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
                setError(errorMessage);

                // Only redirect on specific errors, not all errors
                if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                    console.log('🔄 [DocumentDetailPage] Redirecting due to document not found');
                    setTimeout(() => router.push('/documents'), 3000);
                } else {
                    console.log('⚠️ [DocumentDetailPage] Staying on page despite error:', errorMessage);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [params.id, documents, isDataLoading, router]);

    // Set the selected document if it's not already set or different
    useEffect(() => {
        if (document && (!selectedDocument || selectedDocument.id !== document.id)) {
            setSelectedDocument(document);
        }
    }, [document, selectedDocument, setSelectedDocument]);

    const handleBackFromDocumentDetail = () => {
        setSelectedDocument(null);
        router.push('/documents');
    };

    const handleReingestDocument = async (document: Document) => {
        try {
            await updateDocument(document.id, { state: 'ingesting' });
            console.log('Reingesting document:', document.name);
        } catch (error) {
            console.error('Failed to reingest document:', error);
        }
    };

    const handleSupersedeDocument = (document: Document) => {
        setDocumentToSupersede(document);
        setShowSupersedeDocumentDialog(true);
        console.log('Opening supersede dialog for document:', document.name);
    };

    const handleDeleteDocument = async (document: Document) => {
        try {
            await deleteDocument(document.id);
            console.log('Deleting document:', document.name);
            // Navigate back to documents list after deletion
            router.push('/documents');
        } catch (error) {
            console.error('Failed to delete document:', error);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="fl._5qc">
                <div className="text-center" data-oid="-bpnv.j">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                        data-oid="nwa4y2c"
                    ></div>
                    <p className="text-gray-600" data-oid="hlg7gay">
                        Loading document...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        const isNotFoundError = error.includes('404') || error.includes('not found');
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="l_hm87s">
                <div className="text-center" data-oid="9_oy9g:">
                    <div className="text-red-500 text-6xl mb-4" data-oid="aqr.t75">
                        {isNotFoundError ? '📄' : '⚠️'}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="rt1tv6.">
                        {isNotFoundError ? 'Document Not Found' : 'Error Loading Document'}
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="23wudt-">
                        {error}
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => router.push('/documents')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Back to Documents
                        </button>
                    </div>
                    {isNotFoundError && (
                        <p className="text-sm text-gray-500 mt-4" data-oid="nqfo80g">
                            Redirecting automatically in a few seconds...
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Document not found
    if (!document) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="f9od37k">
                <div className="text-center" data-oid="l2flp.g">
                    <div className="text-gray-400 text-6xl mb-4" data-oid="jyyrdxk">
                        📄
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="u-7r3em">
                        Document Not Found
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="g0wdbm4">
                        The document you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        onClick={() => router.push('/documents')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        data-oid="0of7ekw"
                    >
                        Back to Documents
                    </button>
                </div>
            </div>
        );
    }

    return (
        <DocumentDetailView
            document={document}
            onBack={handleBackFromDocumentDetail}
            onReingest={handleReingestDocument}
            onSupersede={handleSupersedeDocument}
            onDelete={handleDeleteDocument}
            data-oid="1e07g3x"
        />
    );
}
