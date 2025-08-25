'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { JobsView } from '../../components/views/JobsView';
import { Job } from '../../types';

export default function JobsPage() {
    const router = useRouter();
    const { jobs, setJobs } = useApp();

    const handleCancelJob = (job: Job) => {
        // Update job status to cancelled
        const updatedJobs = jobs.map((j) =>
            j.id === job.id
                ? {
                      ...j,
                      status: 'CANCELLED' as const,
                      endDate: new Date().toISOString(),
                      progress: {
                          ...j.progress,
                          summary: 'Job cancelled by user',
                      },
                      updatedAt: new Date().toISOString(),
                  }
                : j,
        );
        setJobs(updatedJobs);
    };

    const handleViewJobDetail = async (job: Job) => {
        try {
            // Fetch job with fresh status check
            const response = await fetch(`/api/jobs/${job.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const updatedJob = await response.json();
                
                // Update the job in the local state if it was refreshed
                const updatedJobs = jobs.map((j) =>
                    j.id === job.id ? { ...j, ...updatedJob } : j
                );
                setJobs(updatedJobs);
            }
        } catch (error) {
            console.error('Failed to fetch fresh job status:', error);
        }

        // Navigate to the document detail page
        router.push(`/documents/${job.documentId}`);
    };

    return (
        <JobsView
            jobs={jobs}
            onCancelJob={handleCancelJob}
            onViewJobDetail={handleViewJobDetail}
            data-oid="qa53lh_"
        />
    );
}
