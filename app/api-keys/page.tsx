'use client';

import { useApp } from '../../contexts/AppContext';
import { ApiKeysView } from '../../components/views/ApiKeysView';

export default function ApiKeysPage() {
    const { apiKeys, setShowApiKeyDialog } = useApp();

    return (
        <ApiKeysView
            apiKeys={apiKeys}
            onGenerateApiKey={() => setShowApiKeyDialog(true)}
            data-oid="198o4ju"
        />
    );
}
