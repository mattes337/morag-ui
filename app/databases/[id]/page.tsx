'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Database, Document, Job } from '../../../types';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { DatabaseDetailView } from '../../../components/views/DatabaseDetailView';
import { useApp } from '../../../contexts/AppContext';

interface DatabaseDetailPageProps {
    params: {
        id: string;
    };
}

export default function DatabaseDetailPage({ params }: DatabaseDetailPageProps) {
    const router = useRouter();
    const { 
        user, 
        isDataLoading, 
        setShowAddDocumentDialog,
        setShowDeleteConfirmDialog,
        setShowReingestConfirmDialog,
        setDocumentToDelete,
        setDocumentToReingest,
        setShowEditPromptDialog,
        setEditPromptData
    } = useApp();
    const [database, setDatabase] = useState<Database | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user && !isDataLoading) {
            router.push('/login');
            return;
        }

        if (user && params.id) {
            fetchDatabaseData();
        }
    }, [user, isDataLoading, params.id, router]);

    const fetchDatabaseData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch database details
            const databaseResponse = await fetch(`/api/databases/${params.id}`);
            if (!databaseResponse.ok) {
                throw new Error('Failed to fetch database');
            }
            const databaseData = await databaseResponse.json();
            setDatabase(databaseData);

            // Fetch documents for this database
            const documentsResponse = await fetch(`/api/documents?databaseId=${params.id}`);
            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                setDocuments(documentsData);
            }

            // Fetch jobs for this database
            const jobsResponse = await fetch(`/api/jobs?databaseId=${params.id}`);
            if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                setJobs(jobsData);
            }
        } catch (err) {
            console.error('Error fetching database data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load database');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/');
    };

    const handleAddDocument = () => {
        setShowAddDocumentDialog(true);
    };

    const handleDeleteDocument = (document: Document) => {
        setDocumentToDelete(document);
        setShowDeleteConfirmDialog(true);
    };

    const handleReingestDocument = (document: Document) => {
        setDocumentToReingest(document);
        setShowReingestConfirmDialog(true);
    };

    const handleEditIngestionPrompt = () => {
        if (database) {
            setEditPromptData({
                database,
                promptType: 'ingestion',
                currentPrompt: database.ingestionPrompt || ''
            });
            setShowEditPromptDialog(true);
        }
    };

    const handleEditSystemPrompt = () => {
        if (database) {
            setEditPromptData({
                database,
                promptType: 'system',
                currentPrompt: database.systemPrompt || ''
            });
            setShowEditPromptDialog(true);
        }
    };

    if (isDataLoading || isLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return null;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-red-600 text-lg font-medium mb-4">Error</div>
                <p className="text-gray-600 text-center mb-8">{error}</p>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Databases
                </button>
            </div>
        );
    }

    if (!database) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-gray-600 text-lg font-medium mb-4">Database not found</div>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Databases
                </button>
            </div>
        );
    }

    return (
        <DatabaseDetailView
            database={database}
            documents={documents}
            jobs={jobs}
            onBack={handleBack}
            onRefresh={fetchDatabaseData}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onReingestDocument={handleReingestDocument}
            onEditIngestionPrompt={handleEditIngestionPrompt}
            onEditSystemPrompt={handleEditSystemPrompt}
        />
    );
}