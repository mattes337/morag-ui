'use client';

import { Job } from '../../types';

interface JobsViewProps {
    jobs: Job[];
    onCancelJob: (job: Job) => void;
    onViewJobDetail: (job: Job) => void;
}

export function JobsView({ jobs, onCancelJob, onViewJobDetail }: JobsViewProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'waiting-for-remote-worker':
                return 'bg-orange-100 text-orange-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'finished':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (startDate: string, endDate?: string) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffHours > 0) {
            return `${diffHours}h ${diffMins % 60}m`;
        }
        return `${diffMins}m`;
    };

    const canCancelJob = (status: string) => {
        return status === 'pending' || status === 'waiting-for-remote-worker';
    };

    return (
        <div className="space-y-6" data-oid="jobs-view">
            <div className="flex justify-between items-center" data-oid="jobs-header">
                <div data-oid="jobs-title">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="jobs-title-text">
                        Jobs
                    </h2>
                    <p className="text-gray-600 text-sm mt-1" data-oid="jobs-subtitle">
                        Monitor document processing jobs and their progress
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="jobs-table-container"
            >
                <table className="w-full" data-oid="jobs-table">
                    <thead className="bg-gray-50" data-oid="jobs-table-header">
                        <tr data-oid="jobs-header-row">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="jobs-header-document"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="jobs-header-status"
                            >
                                Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="jobs-header-progress"
                            >
                                Progress
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="jobs-header-timing"
                            >
                                Timing
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="jobs-header-actions"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="jobs-table-body">
                        {jobs.map((job) => (
                            <tr key={job.id} data-oid={`job-row-${job.id}`}>
                                <td
                                    className="px-6 py-4 whitespace-nowrap"
                                    data-oid={`job-document-${job.id}`}
                                >
                                    <div
                                        className="text-sm font-medium"
                                        data-oid={`job-document-name-${job.id}`}
                                    >
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid={`job-document-link-${job.id}`}
                                        >
                                            {job.documentName}
                                        </button>
                                    </div>
                                    <div
                                        className="text-sm text-gray-500"
                                        data-oid={`job-document-type-${job.id}`}
                                    >
                                        {job.documentType} • Job #{job.id}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap"
                                    data-oid={`job-status-${job.id}`}
                                >
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                        data-oid={`job-status-badge-${job.id}`}
                                    >
                                        {job.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap"
                                    data-oid={`job-progress-${job.id}`}
                                >
                                    <div
                                        className="w-full"
                                        data-oid={`job-progress-container-${job.id}`}
                                    >
                                        <div
                                            className="flex justify-between text-xs text-gray-600 mb-1"
                                            data-oid={`job-progress-header-${job.id}`}
                                        >
                                            <span data-oid={`job-progress-percentage-${job.id}`}>
                                                {job.progress.percentage}%
                                            </span>
                                        </div>
                                        <div
                                            className="w-full bg-gray-200 rounded-full h-2"
                                            data-oid={`job-progress-bar-bg-${job.id}`}
                                        >
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                                data-oid={`job-progress-bar-${job.id}`}
                                            ></div>
                                        </div>
                                        <div
                                            className="text-xs text-gray-500 mt-1"
                                            data-oid={`job-progress-summary-${job.id}`}
                                        >
                                            {job.progress.summary}
                                        </div>
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid={`job-timing-${job.id}`}
                                >
                                    <div data-oid={`job-start-time-${job.id}`}>
                                        Started: {formatDate(job.startDate)}
                                    </div>
                                    {job.endDate && (
                                        <div
                                            className="text-gray-500"
                                            data-oid={`job-end-time-${job.id}`}
                                        >
                                            Finished: {formatDate(job.endDate)}
                                        </div>
                                    )}
                                    <div
                                        className="text-gray-500"
                                        data-oid={`job-duration-${job.id}`}
                                    >
                                        Duration: {formatDuration(job.startDate, job.endDate)}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid={`job-actions-${job.id}`}
                                >
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid={`job-view-detail-${job.id}`}
                                    >
                                        View Details
                                    </button>
                                    {canCancelJob(job.status) && (
                                        <button
                                            onClick={() => onCancelJob(job)}
                                            className="text-red-600 hover:text-red-900"
                                            data-oid={`job-cancel-${job.id}`}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {jobs.length === 0 && (
                <div className="text-center py-12" data-oid="jobs-empty-state">
                    <div className="text-gray-500" data-oid="jobs-empty-message">
                        No jobs found. Jobs are created when documents are uploaded or reingested.
                    </div>
                </div>
            )}
        </div>
    );
}
