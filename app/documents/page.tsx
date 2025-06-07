'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { DocumentsView } from '../../components/views/DocumentsView';
import { DocumentDetailView } from '../../components/views/DocumentDetailView';

export default function DocumentsPage() {
    const router = useRouter();
    const [viewingDocumentDetail, setViewingDocumentDetail] = useState(false);

    const {
        documents,
        setDocuments,
        selectedDatabase,
        selectedDocument,
        setSelectedDocument,
        setShowAddDocumentDialog,
    } = useApp();

    const handleBackToDatabases = () => {
        router.push('/');
    };

    const handlePromptDocument = (document: any) => {
        setSelectedDocument(document);
        router.push('/prompt');
    };

    const handleViewDocumentDetail = (document: any) => {
        setSelectedDocument(document);
        setViewingDocumentDetail(true);
    };

    const handleBackFromDocumentDetail = () => {
        setViewingDocumentDetail(false);
        setSelectedDocument(null);
    };

    const handleReingestDocument = (document: any) => {
        setDocuments((prev: any) =>
            prev.map((doc: any) =>
                doc.id === document.id ? { ...doc, state: 'ingesting' as const } : doc,
            ),
        );
        console.log('Reingesting document:', document.name);
    };

    const handleSupersedeDocument = (document: any) => {
        setDocuments((prev: any) =>
            prev.map((doc: any) =>
                doc.id === document.id ? { ...doc, state: 'deprecated' as const } : doc,
            ),
        );
        console.log('Superseding document:', document.name);
    };

    const handleDeleteDocument = (document: any) => {
        setDocuments((prev: any) =>
            prev.map((doc: any) =>
                doc.id === document.id ? { ...doc, state: 'deleted' as const } : doc,
            ),
        );
        console.log('Deleting document:', document.name);
    };

    if (viewingDocumentDetail && selectedDocument) {
        return (
            <DocumentDetailView
                document={selectedDocument}
                onBack={handleBackFromDocumentDetail}
                onReingest={handleReingestDocument}
                onSupersede={handleSupersedeDocument}
                onDelete={handleDeleteDocument}
                data-oid="93tmrl2"
            />
        );
    }

    return (
        <DocumentsView
            documents={documents}
            selectedDatabase={selectedDatabase}
            onBackToDatabases={handleBackToDatabases}
            onAddDocument={() => setShowAddDocumentDialog(true)}
            onPromptDocument={handlePromptDocument}
            onViewDocumentDetail={handleViewDocumentDetail}
            data-oid="ilp8nbg"
        />
    );
}
