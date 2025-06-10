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

    return (
        <div className="space-y-6" data-oid="7px8s1o">
            <div className="flex justify-between items-center" data-oid="8buzfz_">
                <div data-oid="jbmmm-z">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="a:ccnmx">
                        Jobs
                    </h2>
                    <p className="text-gray-600 text-sm mt-1" data-oid="5k5qxyl">
                        Monitor document processing jobs and their progress
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="cqrq7c3"
            >
                <table className="w-full" data-oid="5llz9a3">
                    <thead className="bg-gray-50" data-oid="kkc2sap">
                        <tr data-oid="15wi8:u">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="46:_ozf"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="9svw.5g"
                            >
                                Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="41-orsj"
                            >
                                Progress & Details
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="o-hx16t"
                            >
                                Timing
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="i8n1608"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="foj5e1o">
                        {jobs.map((job) => (
                            <tr key={job.id} data-oid="h4vns1z">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="ql5se11">
                                    <div className="text-sm font-medium" data-oid="qbp:tlq">
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="yv1:.q2"
                                        >
                                            {job.documentName}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="u_71pr9">
                                        {job.documentType} • Job #{job.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="q210xfd">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                        data-oid="s73lyz0"
                                    >
                                        {job.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="buke-jh">
                                    <div className="w-full" data-oid="_sm67lk">
                                        <div
                                            className="flex justify-between text-xs text-gray-600 mb-1"
                                            data-oid="z-sw18y"
                                        >
                                            <span data-oid="0to5or8">
                                                {job.progress.percentage}%
                                            </span>
                                            {job.processingDetails?.estimatedTimeRemaining && (
                                                <span className="text-gray-500" data-oid="q.r2:rl">
                                                    ~
                                                    {Math.ceil(
                                                        job.processingDetails
                                                            .estimatedTimeRemaining / 60,
                                                    )}
                                                    m left
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className="w-full bg-gray-200 rounded-full h-2"
                                            data-oid="aep91ld"
                                        >
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                                data-oid="cqk1dzp"
                                            ></div>
                                        </div>
                                        <div
                                            className="text-xs text-gray-500 mt-1"
                                            data-oid="g:dtx_2"
                                        >
                                            {job.progress.summary}
                                        </div>
                                        {job.processingDetails?.currentStep && (
                                            <div
                                                className="text-xs text-blue-600 mt-1"
                                                data-oid="fgth26."
                                            >
                                                Step {job.processingDetails.completedSteps || 0}/
                                                {job.processingDetails.totalSteps || 0}:{' '}
                                                {job.processingDetails.currentStep}
                                            </div>
                                        )}
                                        {job.metadata?.file_size && (
                                            <div
                                                className="text-xs text-gray-500 mt-1"
                                                data-oid="a52fx6c"
                                            >
                                                Size:{' '}
                                                {(job.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {job.metadata?.model_used && (
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="ikvxkl5"
                                            >
                                                Model: {job.metadata.model_used}
                                            </div>
                                        )}
                                        {job.processingDetails?.errorMessage && (
                                            <div
                                                className="text-xs text-red-600 mt-1"
                                                data-oid="bk23b.y"
                                            >
                                                ⚠️ {job.processingDetails.errorMessage}
                                            </div>
                                        )}
                                        {job.processingDetails?.warnings &&
                                            job.processingDetails.warnings.length > 0 && (
                                                <div
                                                    className="text-xs text-yellow-600 mt-1"
                                                    data-oid="uw0q8kq"
                                                >
                                                    ⚠️ {job.processingDetails.warnings.length}{' '}
                                                    warning(s)
                                                </div>
                                            )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="28xkdun"
                                >
                                    <div data-oid="_vyb1-x">
                                        Started: {formatDate(job.startDate)}
                                    </div>
                                    {job.endDate && (
                                        <div className="text-gray-500" data-oid="9ct-q36">
                                            Finished: {formatDate(job.endDate)}
                                        </div>
                                    )}
                                    <div className="text-gray-500" data-oid="kpc8e1.">
                                        Duration: {formatDuration(job.startDate, job.endDate)}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="6wyn31a"
                                >
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="b5nde_8"
                                    >
                                        View Details
                                    </button>
                                    {canCancelJob(job.status) && (
                                        <button
                                            onClick={() => onCancelJob(job)}
                                            className="text-red-600 hover:text-red-900"
                                            data-oid="vuy:8bm"
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
                <div className="text-center py-12" data-oid="um_ty77">
                    <div className="text-gray-500" data-oid="2u3b2l5">
                        No jobs found. Jobs are created when documents are uploaded or reingested.
                    </div>
                </div>
            )}
        </div>
    );
}
