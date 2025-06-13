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
        <div className="space-y-6" data-oid="rb:jg-n">
            <div className="flex justify-between items-center" data-oid="zgmvfwx">
                <div data-oid="qf2f6fd">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="xk_s2.k">
                        Jobs
                    </h2>
                    <p className="text-gray-600 text-sm mt-1" data-oid="gqq5-rv">
                        Monitor document processing jobs and their progress
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="3yo6vdj"
            >
                <table className="w-full" data-oid="m5dpc7_">
                    <thead className="bg-gray-50" data-oid="29r4izu">
                        <tr data-oid="vd:.wx0">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="m:rpf08"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="xftlrdk"
                            >
                                Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="hqb:kml"
                            >
                                Progress & Details
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="bgpicoy"
                            >
                                Timing
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="raxy6x."
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="vg63w2e">
                        {jobs.map((job) => (
                            <tr key={job.id} data-oid="iwjb4u3">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="filg2ff">
                                    <div className="text-sm font-medium" data-oid="_059f.z">
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="z-m8f:b"
                                        >
                                            {job.documentName}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="ibf_k2m">
                                        {job.documentType} • Job #{job.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="g562pz7">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                        data-oid="7nld4te"
                                    >
                                        {job.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="60rext6">
                                    <div className="w-full" data-oid="gh:ls7d">
                                        <div
                                            className="flex justify-between text-xs text-gray-600 mb-1"
                                            data-oid=":e.3eu4"
                                        >
                                            <span data-oid="d3g2sqp">
                                                {job.progress.percentage}%
                                            </span>
                                            {job.processingDetails?.estimatedTimeRemaining && (
                                                <span className="text-gray-500" data-oid="-ifu5ow">
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
                                            data-oid="ry9bf2f"
                                        >
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                                data-oid="nduc2kl"
                                            ></div>
                                        </div>
                                        <div
                                            className="text-xs text-gray-500 mt-1"
                                            data-oid="o9xi0tw"
                                        >
                                            {job.progress.summary}
                                        </div>
                                        {job.processingDetails?.currentStep && (
                                            <div
                                                className="text-xs text-blue-600 mt-1"
                                                data-oid="-c8j1kv"
                                            >
                                                Step {job.processingDetails.completedSteps || 0}/
                                                {job.processingDetails.totalSteps || 0}:{' '}
                                                {job.processingDetails.currentStep}
                                            </div>
                                        )}
                                        {job.metadata?.file_size && (
                                            <div
                                                className="text-xs text-gray-500 mt-1"
                                                data-oid="s0zbh48"
                                            >
                                                Size:{' '}
                                                {(job.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {job.metadata?.model_used && (
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="j-efa_e"
                                            >
                                                Model: {job.metadata.model_used}
                                            </div>
                                        )}
                                        {job.processingDetails?.errorMessage && (
                                            <div
                                                className="text-xs text-red-600 mt-1"
                                                data-oid="n07evp5"
                                            >
                                                ⚠️ {job.processingDetails.errorMessage}
                                            </div>
                                        )}
                                        {job.processingDetails?.warnings &&
                                            job.processingDetails.warnings.length > 0 && (
                                                <div
                                                    className="text-xs text-yellow-600 mt-1"
                                                    data-oid="wyowm4o"
                                                >
                                                    ⚠️ {job.processingDetails.warnings.length}{' '}
                                                    warning(s)
                                                </div>
                                            )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="udx:aeb"
                                >
                                    <div data-oid="zjxatsv">
                                        Started: {formatDate(job.startDate)}
                                    </div>
                                    {job.endDate && (
                                        <div className="text-gray-500" data-oid="d9ybg8s">
                                            Finished: {formatDate(job.endDate)}
                                        </div>
                                    )}
                                    <div className="text-gray-500" data-oid="un:044a">
                                        Duration: {formatDuration(job.startDate, job.endDate)}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="6y7hofp"
                                >
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="gsmk8du"
                                    >
                                        View Details
                                    </button>
                                    {canCancelJob(job.status) && (
                                        <button
                                            onClick={() => onCancelJob(job)}
                                            className="text-red-600 hover:text-red-900"
                                            data-oid="u326_v5"
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
                <div className="text-center py-12" data-oid="e5-.gef">
                    <div className="text-gray-500" data-oid="d:3l0_7">
                        No jobs found. Jobs are created when documents are uploaded or reingested.
                    </div>
                </div>
            )}
        </div>
    );
}
