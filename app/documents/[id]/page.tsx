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
        setDocuments,
        selectedDocument,
        setSelectedDocument,
        setShowSupersedeDocumentDialog,
        setDocumentToSupersede,
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

    const handleReingestDocument = (document: Document) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === document.id ? { ...doc, state: 'ingesting' as const } : doc,
            ),
        );
        console.log('Reingesting document:', document.name);
    };

    const handleSupersedeDocument = (document: Document) => {
        setDocumentToSupersede(document);
        setShowSupersedeDocumentDialog(true);
        console.log('Opening supersede dialog for document:', document.name);
    };

    const handleDeleteDocument = (document: Document) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === document.id ? { ...doc, state: 'deleted' as const } : doc,
            ),
        );
        console.log('Deleting document:', document.name);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="c6t:5eg">
                <div className="text-center" data-oid="nkck7p8">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                        data-oid="fbc3r1n"
                    ></div>
                    <p className="text-gray-600" data-oid="lsyo-o2">
                        Loading document...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="2txdnjx">
                <div className="text-center" data-oid="faxajk8">
                    <div className="text-red-500 text-6xl mb-4" data-oid="ssn.4vz">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="ao-sbvn">
                        Error
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="vh5lrxx">
                        {error}
                    </p>
                    <p className="text-sm text-gray-500" data-oid="8nsktd0">
                        Redirecting to documents...
                    </p>
                </div>
            </div>
        );
    }

    // Document not found
    if (!document) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="gcozx2q">
                <div className="text-center" data-oid="3r62at2">
                    <div className="text-gray-400 text-6xl mb-4" data-oid="dc8n6bt">
                        📄
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="v9accfq">
                        Document Not Found
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="ji6t_le">
                        The document you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => router.push('/documents')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        data-oid="kge:9-d"
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
            data-oid="g3hi7xm"
        />
    );
}
