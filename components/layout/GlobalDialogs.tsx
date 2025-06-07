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
                data-oid="le3pvpg"
            />

            <CreateDatabaseDialog
                isOpen={showCreateDatabaseDialog}
                onClose={() => setShowCreateDatabaseDialog(false)}
                data-oid="eza6vjy"
            />

            <ApiKeyDialog
                isOpen={showApiKeyDialog}
                onClose={() => setShowApiKeyDialog(false)}
                data-oid="fp3x1c9"
            />

            <ApiConfig
                isOpen={showApiConfigDialog}
                onClose={() => setShowApiConfigDialog(false)}
                data-oid="a0amjv."
            />
        </>
    );
}
