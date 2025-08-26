'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { ApiKeysView } from '../../components/views/ApiKeysView';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
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
        return <LoadingSpinner data-oid="-3pg1k8" />;
    }

    if (!user) {
        return null; // or a loading spinner
    }

    const handleGenerateApiKey = () => {
        setShowApiKeyDialog(true);
    };

    return (
        <ApiKeysView apiKeys={apiKeys} onGenerateApiKey={handleGenerateApiKey} data-oid="fw76c80" />
    );
}
