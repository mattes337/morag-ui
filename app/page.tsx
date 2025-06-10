'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../contexts/AppContext';
import { DatabasesView } from '../components/views/DatabasesView';
import { useEffect } from 'react';

export default function DatabasesPage() {
    const router = useRouter();
    const {
        user,
        databases,
        setSelectedDatabase,
        setSelectedDocument,
        setShowCreateDatabaseDialog,
    } = useApp();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

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
            data-oid="_20qu10"
        />
    );
}
