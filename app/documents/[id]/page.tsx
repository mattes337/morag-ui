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
                setIsLoading(true);
                setError(null);

                // First, try to find the document in the context
                const contextDocument = documents.find(
                    (doc) => doc.id === params.id || doc.id.toString() === params.id,
                );

                if (contextDocument) {
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
                const response = await fetch(`/api/documents/${params.id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Document not found');
                        setTimeout(() => router.push('/documents'), 2000);
                        return;
                    }
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

                setDocument(formattedDoc);
            } catch (err) {
                console.error('Failed to load document:', err);
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
            <div className="flex items-center justify-center min-h-96" data-oid="9gwf:hd">
                <div className="text-center" data-oid="9hy8kno">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                        data-oid=":lj3sn4"
                    ></div>
                    <p className="text-gray-600" data-oid="s88.t5h">
                        Loading document...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="vc9d2ys">
                <div className="text-center" data-oid="_1.iq_o">
                    <div className="text-red-500 text-6xl mb-4" data-oid="z.jfuxy">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="q:mn8gp">
                        Error
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="f1oxveo">
                        {error}
                    </p>
                    <p className="text-sm text-gray-500" data-oid="yhx0jas">
                        Redirecting to documents...
                    </p>
                </div>
            </div>
        );
    }

    // Document not found
    if (!document) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="vryj7ey">
                <div className="text-center" data-oid="mob49tj">
                    <div className="text-gray-400 text-6xl mb-4" data-oid="b:_tc9.">
                        📄
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="q8nj3wk">
                        Document Not Found
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="lywhqaz">
                        The document you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => router.push('/documents')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        data-oid="v.k9p4q"
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
            data-oid="9.5.4eg"
        />
    );
}
