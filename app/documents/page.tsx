'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { DocumentsView } from '../../components/views/DocumentsView';

export default function DocumentsPage() {
    const router = useRouter();

    const { documents, selectedDatabase, setSelectedDocument, setShowAddDocumentDialog } = useApp();

    const handleBackToDatabases = () => {
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
            selectedDatabase={selectedDatabase}
            onBackToDatabases={handleBackToDatabases}
            onAddDocument={() => setShowAddDocumentDialog(true)}
            onPromptDocument={handlePromptDocument}
            onViewDocumentDetail={handleViewDocumentDetail}
            data-oid="w066df2"
        />
    );
}
