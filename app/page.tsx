'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../contexts/AppContext';
import { DatabasesView } from '../components/views/DatabasesView';

export default function DatabasesPage() {
    const router = useRouter();
    const { databases, setSelectedDatabase, setSelectedDocument, setShowCreateDatabaseDialog } =
        useApp();

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
            data-oid="dz66y_5"
        />
    );
}
