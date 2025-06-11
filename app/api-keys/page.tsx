'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { ApiKeysView } from '../../components/views/ApiKeysView';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useEffect } from 'react';

export default function ApiKeysPage() {
    const router = useRouter();
    const { user, apiKeys, isDataLoading, setShowApiKeyDialog } = useApp();

    useEffect(() => {
        if (!user && !isDataLoading) {
            router.push('/login');
        }
    }, [user, isDataLoading, router]);

    if (isDataLoading) {
        return <LoadingSpinner data-oid="j51dc78" />;
    }

    if (!user) {
        return null; // or a loading spinner
    }

    const handleGenerateApiKey = () => {
        setShowApiKeyDialog(true);
    };

    return (
        <ApiKeysView apiKeys={apiKeys} onGenerateApiKey={handleGenerateApiKey} data-oid="9lhfv0g" />
    );
}
