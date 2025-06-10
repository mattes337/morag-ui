'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../contexts/AppContext';
import { DatabasesView } from '../components/views/DatabasesView';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useEffect } from 'react';

export default function DatabasesPage() {
    const router = useRouter();
    const {
        user,
        databases,
        isDataLoading,
        setSelectedDatabase,
        setSelectedDocument,
        setShowCreateDatabaseDialog,
    } = useApp();

    useEffect(() => {
        if (!user && !isDataLoading) {
            router.push('/login');
        }
    }, [user, isDataLoading, router]);

    if (isDataLoading) {
        return <LoadingSpinner data-oid="h::_tcu" />;
    }

    if (!user) {
        return null; // or a loading spinner
    }

    const handleSelectDatabase = (database: any) => {
        setSelectedDatabase(database);
        router.push('/documents');
    };

    const handlePromptDatabase = (database: any) => {
        setSelectedDatabase(database);
        setSelectedDocument(null);
        router.push('/prompt');
    };

    return (
        <DatabasesView
            databases={databases}
            onCreateDatabase={() => setShowCreateDatabaseDialog(true)}
            onSelectDatabase={handleSelectDatabase}
            onPromptDatabase={handlePromptDatabase}
            data-oid=":9dugzc"
        />
    );
}
