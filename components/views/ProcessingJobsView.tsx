'use client';

import { Clock, Play, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

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

interface ProcessingJobsViewProps {
    jobs: ProcessingJob[];
    onCancelJob: (job: ProcessingJob) => void;
    onViewJobDetail: (job: ProcessingJob) => void;
    'data-oid'?: string;
}

export function ProcessingJobsView({ jobs, onCancelJob, onViewJobDetail, ...props }: ProcessingJobsViewProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'processing':
                return <Loader className="w-4 h-4 animate-spin" />;
            case 'finished':
                return <CheckCircle className="w-4 h-4" />;
            case 'failed':
                return <XCircle className="w-4 h-4" />;
            case 'cancelled':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (startDate?: string, endDate?: string) => {
        if (!startDate) return 'Not started';
        
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
        
        if (duration < 60) return `${duration}s`;
        if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
        return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
    };

    const canCancelJob = (status: string) => {
        return ['pending', 'processing'].includes(status.toLowerCase());
    };

    const formatStageName = (stage: string) => {
        return stage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    // Show empty state when no jobs exist
    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4" {...props}>
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <Clock className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No processing jobs yet</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                    Processing jobs are automatically created when you upload documents or trigger processing stages.
                    They&apos;ll appear here so you can monitor their progress and status.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6" {...props}>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Processing Jobs</h2>
                    <p className="text-gray-600">Monitor document processing progress and status</p>
                </div>
                <div className="text-sm text-gray-500">
                    {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document & Stage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timing
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Retries
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium">
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left break-all"
                                        >
                                            {job.document.name}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Stage: {formatStageName(job.stage)}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Job #{job.id.slice(0, 8)}...
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {getStatusIcon(job.status)}
                                        <span
                                            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                        >
                                            {job.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {job.errorMessage && (
                                        <div className="text-xs text-red-600 mt-1 truncate max-w-xs">
                                            {job.errorMessage}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {job.priority}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>
                                        <div className="text-xs text-gray-400">Scheduled:</div>
                                        <div>{formatDate(job.scheduledAt)}</div>
                                    </div>
                                    {job.startedAt && (
                                        <div className="mt-1">
                                            <div className="text-xs text-gray-400">Duration:</div>
                                            <div>{formatDuration(job.startedAt, job.completedAt)}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>
                                        {job.retryCount} / {job.maxRetries}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        View Document
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
