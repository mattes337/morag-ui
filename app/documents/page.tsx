'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { DocumentsView } from '../../components/views/DocumentsView';

export default function DocumentsPage() {
    const router = useRouter();

    const { documents, currentRealm, setSelectedDocument, setShowAddDocumentDialog } = useApp();

    const handleBackToRealms = () => {
        router.push('/');
    };

    const handlePromptDocument = (document: any) => {
        setSelectedDocument(document);
        router.push('/prompt');
    };

    const handleViewDocumentDetail = (document: any) => {
        setSelectedDocument(document);
        router.push(`/documents/${document.id}`);
    };

    const handleIngestDocument = async (document: any) => {
        try {
            const response = await fetch(`/api/documents/${document.id}/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Use realm's default ingestion prompt if available
                    ingestionPrompt: currentRealm?.ingestionPrompt,
                    chunkSize: 1000,
                    chunkingMethod: 'Semantic'
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start ingestion');
            }

            const result = await response.json();
            console.log('Ingestion started:', result);

            // Refresh the page to show updated document state
            window.location.reload();
        } catch (error) {
            console.error('Failed to ingest document:', error);
            alert(`Failed to ingest document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <DocumentsView
            documents={documents}
            selectedRealm={currentRealm}
            onBackToRealms={handleBackToRealms}
            onAddDocument={() => setShowAddDocumentDialog(true)}
            onPromptDocument={handlePromptDocument}
            onViewDocumentDetail={handleViewDocumentDetail}
            onIngestDocument={handleIngestDocument}
            data-oid="f__.a_s"
        />
    );
}
