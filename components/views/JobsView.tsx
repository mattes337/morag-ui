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
        <div className="space-y-6" data-oid="m2xune6">
            <div className="flex justify-between items-center" data-oid="h442405">
                <div data-oid="35y6918">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="rcd8mab">
                        Jobs
                    </h2>
                    <p className="text-gray-600 text-sm mt-1" data-oid="kd-9dv4">
                        Monitor document processing jobs and their progress
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="q5rp1q0"
            >
                <table className="w-full" data-oid="et9wbwk">
                    <thead className="bg-gray-50" data-oid="bz63amh">
                        <tr data-oid="-5125kr">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="3j8yzn5"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="e40ay3k"
                            >
                                Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid=":e26.1t"
                            >
                                Progress & Details
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="-ouphx8"
                            >
                                Timing
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="xedmu6w"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="qdp8xov">
                        {jobs.map((job) => (
                            <tr key={job.id} data-oid="vx820z1">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="7uohmmw">
                                    <div className="text-sm font-medium" data-oid="obh5bfc">
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="wpm4fbg"
                                        >
                                            {job.documentName}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="ik8hkge">
                                        {job.documentType} • Job #{job.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="sen-j-k">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                        data-oid="tep4q:-"
                                    >
                                        {job.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="-asodd4">
                                    <div className="w-full" data-oid="_.crr0o">
                                        <div
                                            className="flex justify-between text-xs text-gray-600 mb-1"
                                            data-oid="jeb:9_4"
                                        >
                                            <span data-oid="uukawgr">
                                                {job.progress.percentage}%
                                            </span>
                                            {job.processingDetails?.estimatedTimeRemaining && (
                                                <span className="text-gray-500" data-oid="b2mqu_8">
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
                                            data-oid="izmcf_o"
                                        >
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                                data-oid="g4x1ant"
                                            ></div>
                                        </div>
                                        <div
                                            className="text-xs text-gray-500 mt-1"
                                            data-oid="1j-xcc0"
                                        >
                                            {job.progress.summary}
                                        </div>
                                        {job.processingDetails?.currentStep && (
                                            <div
                                                className="text-xs text-blue-600 mt-1"
                                                data-oid="1yy:_r7"
                                            >
                                                Step {job.processingDetails.completedSteps || 0}/
                                                {job.processingDetails.totalSteps || 0}:{' '}
                                                {job.processingDetails.currentStep}
                                            </div>
                                        )}
                                        {job.metadata?.file_size && (
                                            <div
                                                className="text-xs text-gray-500 mt-1"
                                                data-oid="iq07ecu"
                                            >
                                                Size:{' '}
                                                {(job.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {job.metadata?.model_used && (
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="1p9zvyh"
                                            >
                                                Model: {job.metadata.model_used}
                                            </div>
                                        )}
                                        {job.processingDetails?.errorMessage && (
                                            <div
                                                className="text-xs text-red-600 mt-1"
                                                data-oid="pnu83c2"
                                            >
                                                ⚠️ {job.processingDetails.errorMessage}
                                            </div>
                                        )}
                                        {job.processingDetails?.warnings &&
                                            job.processingDetails.warnings.length > 0 && (
                                                <div
                                                    className="text-xs text-yellow-600 mt-1"
                                                    data-oid="-qj8aqg"
                                                >
                                                    ⚠️ {job.processingDetails.warnings.length}{' '}
                                                    warning(s)
                                                </div>
                                            )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="eixdc2m"
                                >
                                    <div data-oid="_imvz42">
                                        Started: {formatDate(job.startDate)}
                                    </div>
                                    {job.endDate && (
                                        <div className="text-gray-500" data-oid="1xdncbo">
                                            Finished: {formatDate(job.endDate)}
                                        </div>
                                    )}
                                    <div className="text-gray-500" data-oid="h389y:w">
                                        Duration: {formatDuration(job.startDate, job.endDate)}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="b6kz0u1"
                                >
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="3:ggtm7"
                                    >
                                        View Details
                                    </button>
                                    {canCancelJob(job.status) && (
                                        <button
                                            onClick={() => onCancelJob(job)}
                                            className="text-red-600 hover:text-red-900"
                                            data-oid="x_:2673"
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
                <div className="text-center py-12" data-oid="92:gdez">
                    <div className="text-gray-500" data-oid="16hrgjh">
                        No jobs found. Jobs are created when documents are uploaded or reingested.
                    </div>
                </div>
            )}
        </div>
    );
}
