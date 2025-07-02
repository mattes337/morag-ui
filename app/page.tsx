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
        return <LoadingSpinner data-oid="a1hr43t" />;
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

    const handleViewDatabase = (database: any) => {
        router.push(`/databases/${database.id}`);
    };

    return (
        <DatabasesView
            databases={databases}
            onCreateDatabase={() => setShowCreateDatabaseDialog(true)}
            onSelectDatabase={handleSelectDatabase}
            onPromptDatabase={handlePromptDatabase}
            onViewDatabase={handleViewDatabase}
            data-oid="bs7d6n9"
        />
    );
}
