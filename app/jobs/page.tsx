'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProcessingJobsView } from '../../components/views/ProcessingJobsView';
import { useApp } from '../../contexts/AppContext';

interface ProcessingJob {
    id: string;
    documentId: string;
    stage: string;
    status: string;
    priority: number;
    scheduledAt: string;
    startedAt?: string;
    completedAt?: string;
    retryCount: number;
    maxRetries: number;
    errorMessage?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    document: {
        id: string;
        name: string;
        type: string;
        state: string;
    };
}

export default function JobsPage() {
    const router = useRouter();
    const { currentRealm } = useApp();
    const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch processing jobs
    useEffect(() => {
        const fetchProcessingJobs = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const realmParam = currentRealm ? `?realmId=${currentRealm.id}` : '';
                const response = await fetch(`/api/processing-jobs${realmParam}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch processing jobs: ${response.statusText}`);
                }

                const data = await response.json();
                setProcessingJobs(data.jobs || []);
            } catch (error) {
                console.error('Failed to fetch processing jobs:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch processing jobs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProcessingJobs();
    }, [currentRealm]);

    const handleCancelJob = async (job: ProcessingJob) => {
        try {
            const response = await fetch(`/api/processing-jobs/${job.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'cancel' }),
                credentials: 'include'
            });

            if (response.ok) {
                // Update the job status locally
                setProcessingJobs(prev =>
                    prev.map(j =>
                        j.id === job.id
                            ? { ...j, status: 'CANCELLED' }
                            : j
                    )
                );
            } else {
                console.error('Failed to cancel job:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to cancel job:', error);
        }
    };

    const handleViewJobDetail = (job: ProcessingJob) => {
        // Navigate to the document detail page
        router.push(`/documents/${job.documentId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading processing jobs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    return (
        <ProcessingJobsView
            jobs={processingJobs}
            onCancelJob={handleCancelJob}
            onViewJobDetail={handleViewJobDetail}
            data-oid="qa53lh_"
        />
    );
}
