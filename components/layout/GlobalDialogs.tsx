'use client';

import { useApp } from '../../contexts/AppContext';
import { AddDocumentDialog } from '../dialogs/AddDocumentDialog';
// CreateDatabaseDialog removed - replaced by RealmManagementDialog
import { ApiKeyDialog } from '../dialogs/ApiKeyDialog';
import { ReingestConfirmDialog } from '../dialogs/ReingestConfirmDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { RealmManagementDialog } from '../dialogs/RealmManagementDialog';
import { EditPromptDialog } from '../dialogs/EditPromptDialog';
import { ApiConfig } from '../ApiConfig';

export function GlobalDialogs() {
    const {
        showAddDocumentDialog,
        setShowAddDocumentDialog,
        showSupersedeDocumentDialog,
        setShowSupersedeDocumentDialog,
        documentToSupersede,
        setDocumentToSupersede,
        showCreateRealmDialog,
        setShowCreateRealmDialog,
        showApiKeyDialog,
        setShowApiKeyDialog,
        showApiConfigDialog,
        setShowApiConfigDialog,
        showReingestConfirmDialog,
        setShowReingestConfirmDialog,
        documentToReingest,
        setDocumentToReingest,
        showDeleteConfirmDialog,
        setShowDeleteConfirmDialog,
        documentToDelete,
        setDocumentToDelete,
        showRealmManagementDialog,
        setShowRealmManagementDialog,
        showEditPromptDialog,
        setShowEditPromptDialog,
        editPromptData,
        setEditPromptData,
    } = useApp();

    return (
        <>
            <AddDocumentDialog
                isOpen={showAddDocumentDialog}
                onClose={() => setShowAddDocumentDialog(false)}
                data-oid="8h_nnnb"
            />

            <AddDocumentDialog
                isOpen={showSupersedeDocumentDialog}
                onClose={() => {
                    setShowSupersedeDocumentDialog(false);
                    setDocumentToSupersede(null);
                }}
                mode="supersede"
                documentToSupersede={documentToSupersede}
                data-oid="85-z0i5"
            />

            <RealmManagementDialog
                isOpen={showCreateRealmDialog}
                onClose={() => setShowCreateRealmDialog(false)}
            />

            <ApiKeyDialog
                isOpen={showApiKeyDialog}
                onClose={() => setShowApiKeyDialog(false)}
                data-oid="o66hhm:"
            />

            <ReingestConfirmDialog
                isOpen={showReingestConfirmDialog}
                onClose={() => {
                    setShowReingestConfirmDialog(false);
                    setDocumentToReingest(null);
                }}
                onConfirm={() => {
                    if (documentToReingest) {
                        // Here you would call the actual reingest function
                        console.log('Reingesting document:', documentToReingest);
                    }
                }}
                document={documentToReingest}
                data-oid="75z5t-c"
            />

            <DeleteConfirmDialog
                isOpen={showDeleteConfirmDialog}
                onClose={() => {
                    setShowDeleteConfirmDialog(false);
                    setDocumentToDelete(null);
                }}
                onConfirm={() => {
                    if (documentToDelete) {
                        // Here you would call the actual delete function
                        console.log('Deleting document:', documentToDelete);
                    }
                }}
                document={documentToDelete}
                data-oid=".f9lboi"
            />

            <RealmManagementDialog
                isOpen={showRealmManagementDialog}
                onClose={() => setShowRealmManagementDialog(false)}
            />

            {editPromptData && (
                <EditPromptDialog
                    isOpen={showEditPromptDialog}
                    onClose={() => {
                        setShowEditPromptDialog(false);
                        setEditPromptData(null);
                    }}
                    onSave={async (prompt: string) => {
                        // TODO: Implement API call to save prompt
                        console.log('Saving prompt:', prompt, 'for database:', editPromptData.database?.id, 'type:', editPromptData.promptType);
                        setShowEditPromptDialog(false);
                        setEditPromptData(null);
                    }}
                    database={editPromptData.database!}
                    promptType={editPromptData.promptType}
                    currentPrompt={editPromptData.currentPrompt}
                />
            )}

            <ApiConfig
                isOpen={showApiConfigDialog}
                onClose={() => setShowApiConfigDialog(false)}
                data-oid="n5dudat"
            />
        </>
    );
}
