'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../../contexts/AppContext';
import { DocumentDetailView } from '../../../components/views/DocumentDetailView';

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
    } = useApp();

    // Find the document by ID
    const document = documents.find((doc) => doc.id.toString() === params.id);

    // If document not found, redirect back to documents
    if (!document) {
        router.push('/documents');
        return null;
    }

    // Set the selected document if it's not already set or different
    if (!selectedDocument || selectedDocument.id !== document.id) {
        setSelectedDocument(document);
    }

    const handleBackFromDocumentDetail = () => {
        setSelectedDocument(null);
        router.push('/documents');
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
        setDocumentToSupersede(document);
        setShowSupersedeDocumentDialog(true);
        console.log('Opening supersede dialog for document:', document.name);
    };

    const handleDeleteDocument = (document: any) => {
        setDocuments((prev: any) =>
            prev.map((doc: any) =>
                doc.id === document.id ? { ...doc, state: 'deleted' as const } : doc,
            ),
        );
        console.log('Deleting document:', document.name);
    };

    return (
        <DocumentDetailView
            document={document}
            onBack={handleBackFromDocumentDetail}
            onReingest={handleReingestDocument}
            onSupersede={handleSupersedeDocument}
            onDelete={handleDeleteDocument}
            data-oid="wq80.i-"
        />
    );
}
