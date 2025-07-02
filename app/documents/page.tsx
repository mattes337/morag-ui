'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { DocumentsView } from '../../components/views/DocumentsView';

export default function DocumentsPage() {
    const router = useRouter();

    const { documents, selectedRealm, setSelectedDocument, setShowAddDocumentDialog } = useApp();

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

    return (
        <DocumentsView
            documents={documents}
            selectedRealm={selectedRealm}
            onBackToRealms={handleBackToRealms}
            onAddDocument={() => setShowAddDocumentDialog(true)}
            onPromptDocument={handlePromptDocument}
            onViewDocumentDetail={handleViewDocumentDetail}
            data-oid="f__.a_s"
        />
    );
}
