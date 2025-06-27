'use client';

import { useApp } from '../../contexts/AppContext';
import { AddDocumentDialog } from '../dialogs/AddDocumentDialog';
import { CreateDatabaseDialog } from '../dialogs/CreateDatabaseDialog';
import { ApiKeyDialog } from '../dialogs/ApiKeyDialog';
import { ReingestConfirmDialog } from '../dialogs/ReingestConfirmDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { RealmManagementDialog } from '../dialogs/RealmManagementDialog';
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
        showRealmManagementDialog,
        setShowRealmManagementDialog,
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

            <CreateDatabaseDialog
                isOpen={showCreateDatabaseDialog}
                onClose={() => setShowCreateDatabaseDialog(false)}
                data-oid="f:qfnnc"
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

            <ApiConfig
                isOpen={showApiConfigDialog}
                onClose={() => setShowApiConfigDialog(false)}
                data-oid="n5dudat"
            />
        </>
    );
}
