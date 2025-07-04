'use client';

import { Job } from '../../types';
import { Clock } from 'lucide-react';

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
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
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

    // Show empty state when no jobs exist
    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <Clock className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs yet</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                    Jobs are automatically created when you upload documents or trigger reingestion.
                    They&apos;ll appear here so you can monitor their progress and status.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Monitor document processing jobs and their progress
                    </p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progress & Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timing
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {jobs.map((job) => (
                            <tr key={job.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium">
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                        >
                                            {job.documentName}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {job.documentType} • Job #{job.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                    >
                                        {job.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="w-full">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>{job.progress.percentage}%</span>
                                            {job.processingDetails?.estimatedTimeRemaining && (
                                                <span className="text-gray-500">
                                                    ~
                                                    {Math.ceil(
                                                        job.processingDetails
                                                            .estimatedTimeRemaining / 60,
                                                    )}
                                                    m left
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {job.progress.summary}
                                        </div>
                                        {job.processingDetails?.currentStep && (
                                            <div className="text-xs text-blue-600 mt-1">
                                                Step {job.processingDetails.completedSteps || 0}/
                                                {job.processingDetails.totalSteps || 0}:{' '}
                                                {job.processingDetails.currentStep}
                                            </div>
                                        )}
                                        {job.metadata?.file_size && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Size:{' '}
                                                {(job.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {job.metadata?.model_used && (
                                            <div className="text-xs text-gray-500">
                                                Model: {job.metadata.model_used}
                                            </div>
                                        )}
                                        {job.processingDetails?.errorMessage && (
                                            <div className="text-xs text-red-600 mt-1">
                                                ⚠️ {job.processingDetails.errorMessage}
                                            </div>
                                        )}
                                        {job.processingDetails?.warnings &&
                                            job.processingDetails.warnings.length > 0 && (
                                                <div className="text-xs text-yellow-600 mt-1">
                                                    ⚠️ {job.processingDetails.warnings.length}{' '}
                                                    warning(s)
                                                </div>
                                            )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>Started: {formatDate(job.startDate)}</div>
                                    {job.endDate && (
                                        <div className="text-gray-500">
                                            Finished: {formatDate(job.endDate)}
                                        </div>
                                    )}
                                    <div className="text-gray-500">
                                        Duration: {formatDuration(job.startDate, job.endDate)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        View Details
                                    </button>
                                    {canCancelJob(job.status) && (
                                        <button
                                            onClick={() => onCancelJob(job)}
                                            className="text-red-600 hover:text-red-900"
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
        </div>
    );
}
