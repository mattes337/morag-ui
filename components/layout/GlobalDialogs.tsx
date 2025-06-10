'use client';

import { useApp } from '../../contexts/AppContext';
import { AddDocumentDialog } from '../dialogs/AddDocumentDialog';
import { CreateDatabaseDialog } from '../dialogs/CreateDatabaseDialog';
import { ApiKeyDialog } from '../dialogs/ApiKeyDialog';
import { ReingestConfirmDialog } from '../dialogs/ReingestConfirmDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { ApiConfig } from '../ApiConfig';

export function GlobalDialogs() {
    const {
        showAddDocumentDialog,
        setShowAddDocumentDialog,
        showSupersedeDocumentDialog,
        setShowSupersedeDocumentDialog,
        documentToSupersede,
        setDocumentToSupersede,
        showCreateDatabaseDialog,
        setShowCreateDatabaseDialog,
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
    } = useApp();

    return (
        <>
            <AddDocumentDialog
                isOpen={showAddDocumentDialog}
                onClose={() => setShowAddDocumentDialog(false)}
                data-oid="i80rshe"
            />

            <AddDocumentDialog
                isOpen={showSupersedeDocumentDialog}
                onClose={() => {
                    setShowSupersedeDocumentDialog(false);
                    setDocumentToSupersede(null);
                }}
                mode="supersede"
                documentToSupersede={documentToSupersede}
                data-oid=".6lgr8y"
            />

            <CreateDatabaseDialog
                isOpen={showCreateDatabaseDialog}
                onClose={() => setShowCreateDatabaseDialog(false)}
                data-oid="xq6786f"
            />

            <ApiKeyDialog
                isOpen={showApiKeyDialog}
                onClose={() => setShowApiKeyDialog(false)}
                data-oid="-os3xs_"
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
                data-oid="a0v4er6"
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
                data-oid="tjvay:j"
            />

            <ApiConfig
                isOpen={showApiConfigDialog}
                onClose={() => setShowApiConfigDialog(false)}
                data-oid="_z7fhfg"
            />
        </>
    );
}
