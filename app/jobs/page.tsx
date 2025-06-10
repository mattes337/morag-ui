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
                      status: 'cancelled' as const,
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

    const handleViewJobDetail = (job: Job) => {
        // For now, navigate to the document detail page
        // In a real app, you might have a dedicated job detail page
        router.push(`/documents/${job.documentId}`);
    };

    return (
        <JobsView
            jobs={jobs}
            onCancelJob={handleCancelJob}
            onViewJobDetail={handleViewJobDetail}
            data-oid="e3f328j"
        />
    );
}
