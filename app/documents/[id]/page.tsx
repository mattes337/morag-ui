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
                    setIsLoading(false);
                    return;
                }

                // If context is loaded but document not found, try to fetch from API
                console.log('📡 [DocumentDetailPage] Fetching document from API');
                const response = await fetch(`/api/documents/${params.id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('❌ [DocumentDetailPage] Document not found (404)');
                        setError('Document not found');
                        setTimeout(() => router.push('/documents'), 2000);
                        return;
                    }
                    console.log('❌ [DocumentDetailPage] API fetch failed:', response.status);
                    throw new Error('Failed to fetch document');
                }

                const docData = await response.json();
                const formattedDoc: Document = {
                    id: docData.id,
                    name: docData.name,
                    type: docData.type,
                    state: docData.state.toLowerCase() as Document['state'],
                    version: docData.version,
                    chunks: docData.chunks,
                    quality: docData.quality,
                    uploadDate: new Date(docData.uploadDate).toISOString().split('T')[0],
                };

                console.log(
                    '✅ [DocumentDetailPage] Successfully loaded document from API:',
                    formattedDoc.name,
                );
                setDocument(formattedDoc);
            } catch (err) {
                console.error('❌ [DocumentDetailPage] Failed to load document:', err);
                setError('Failed to load document');
                setTimeout(() => router.push('/documents'), 2000);
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
            <div className="flex items-center justify-center min-h-96" data-oid="7en5iw:">
                <div className="text-center" data-oid="_vwkdc5">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                        data-oid="7grixbq"
                    ></div>
                    <p className="text-gray-600" data-oid="exbvu:i">
                        Loading document...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="53hhsxg">
                <div className="text-center" data-oid="1b4kbbv">
                    <div className="text-red-500 text-6xl mb-4" data-oid="u5gol42">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="7k.uqrc">
                        Error
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="89q99t8">
                        {error}
                    </p>
                    <p className="text-sm text-gray-500" data-oid="q7styxd">
                        Redirecting to documents...
                    </p>
                </div>
            </div>
        );
    }

    // Document not found
    if (!document) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid=":wxshql">
                <div className="text-center" data-oid="rex_5xo">
                    <div className="text-gray-400 text-6xl mb-4" data-oid="och6_sm">
                        📄
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="ms31hey">
                        Document Not Found
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="y68c.7_">
                        The document you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        onClick={() => router.push('/documents')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        data-oid="vsw5hp1"
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
            data-oid="f0rx5ib"
        />
    );
}
