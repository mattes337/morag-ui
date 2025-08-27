'use client';

import { DocumentsView } from '../../components/views/DocumentsView';
import { useDocumentsController } from '../../lib/controllers/DocumentsController';

export default function DocumentsPage() {
    const { state, actions } = useDocumentsController();

    return (
        <DocumentsView
            documents={state.documents}
            selectedRealm={state.currentRealm}
            onBackToRealms={actions.handleBackToRealms}
            onAddDocument={actions.handleAddDocument}
            onPromptDocument={actions.handlePromptDocument}
            onViewDocumentDetail={actions.handleViewDocumentDetail}
            data-oid="f__.a_s"
        />
    );
}
