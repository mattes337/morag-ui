'use client';

import { useApp } from '../../contexts/AppContext';
import { AddDocumentDialog } from '../dialogs/AddDocumentDialog';
import { CreateDatabaseDialog } from '../dialogs/CreateDatabaseDialog';
import { ApiKeyDialog } from '../dialogs/ApiKeyDialog';
import { ApiConfig } from '../ApiConfig';

export function GlobalDialogs() {
    const {
        showAddDocumentDialog,
        setShowAddDocumentDialog,
        showCreateDatabaseDialog,
        setShowCreateDatabaseDialog,
        showApiKeyDialog,
        setShowApiKeyDialog,
        showApiConfigDialog,
        setShowApiConfigDialog,
    } = useApp();

    return (
        <>
            <AddDocumentDialog
                isOpen={showAddDocumentDialog}
                onClose={() => setShowAddDocumentDialog(false)}
                data-oid="qvb-a83"
            />

            <CreateDatabaseDialog
                isOpen={showCreateDatabaseDialog}
                onClose={() => setShowCreateDatabaseDialog(false)}
                data-oid="99q3y3b"
            />

            <ApiKeyDialog
                isOpen={showApiKeyDialog}
                onClose={() => setShowApiKeyDialog(false)}
                data-oid="ibl0oha"
            />

            <ApiConfig
                isOpen={showApiConfigDialog}
                onClose={() => setShowApiConfigDialog(false)}
                data-oid="csq9ry1"
            />
        </>
    );
}
