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
        <div className="space-y-6" data-oid="wap65an">
            <div className="flex justify-between items-center" data-oid="2hzaw77">
                <div data-oid="0qnz:72">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="v_yix6p">
                        Jobs
                    </h2>
                    <p className="text-gray-600 text-sm mt-1" data-oid="mm4-oyr">
                        Monitor document processing jobs and their progress
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="gg.iod."
            >
                <table className="w-full" data-oid="f:h08zf">
                    <thead className="bg-gray-50" data-oid="y397_29">
                        <tr data-oid="e47plsz">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="2ak3-p:"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="13:oaf6"
                            >
                                Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="o5yhadc"
                            >
                                Progress & Details
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="nh9i9o4"
                            >
                                Timing
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="sfeu.fz"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="lr-s6g.">
                        {jobs.map((job) => (
                            <tr key={job.id} data-oid="m9ogvpf">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="yle8ki6">
                                    <div className="text-sm font-medium" data-oid="np9s6vv">
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="9kjforq"
                                        >
                                            {job.documentName}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="txcfvea">
                                        {job.documentType} • Job #{job.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="w:gnn01">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                        data-oid="bzb3f._"
                                    >
                                        {job.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="b4lgtzy">
                                    <div className="w-full" data-oid="omcr9ib">
                                        <div
                                            className="flex justify-between text-xs text-gray-600 mb-1"
                                            data-oid="csyd6wj"
                                        >
                                            <span data-oid="abzph0z">
                                                {job.progress.percentage}%
                                            </span>
                                            {job.processingDetails?.estimatedTimeRemaining && (
                                                <span className="text-gray-500" data-oid="p5ty0l5">
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
                                            data-oid="a63om.k"
                                        >
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                                data-oid="r6x9v0s"
                                            ></div>
                                        </div>
                                        <div
                                            className="text-xs text-gray-500 mt-1"
                                            data-oid="wg8l13l"
                                        >
                                            {job.progress.summary}
                                        </div>
                                        {job.processingDetails?.currentStep && (
                                            <div
                                                className="text-xs text-blue-600 mt-1"
                                                data-oid="cs9-:en"
                                            >
                                                Step {job.processingDetails.completedSteps || 0}/
                                                {job.processingDetails.totalSteps || 0}:{' '}
                                                {job.processingDetails.currentStep}
                                            </div>
                                        )}
                                        {job.metadata?.file_size && (
                                            <div
                                                className="text-xs text-gray-500 mt-1"
                                                data-oid="j8xkzsv"
                                            >
                                                Size:{' '}
                                                {(job.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {job.metadata?.model_used && (
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="45q9kau"
                                            >
                                                Model: {job.metadata.model_used}
                                            </div>
                                        )}
                                        {job.processingDetails?.errorMessage && (
                                            <div
                                                className="text-xs text-red-600 mt-1"
                                                data-oid="_flz5b9"
                                            >
                                                ⚠️ {job.processingDetails.errorMessage}
                                            </div>
                                        )}
                                        {job.processingDetails?.warnings &&
                                            job.processingDetails.warnings.length > 0 && (
                                                <div
                                                    className="text-xs text-yellow-600 mt-1"
                                                    data-oid="mb97:13"
                                                >
                                                    ⚠️ {job.processingDetails.warnings.length}{' '}
                                                    warning(s)
                                                </div>
                                            )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="jmmc_cm"
                                >
                                    <div data-oid="vy.xbls">
                                        Started: {formatDate(job.startDate)}
                                    </div>
                                    {job.endDate && (
                                        <div className="text-gray-500" data-oid="6w9t2ix">
                                            Finished: {formatDate(job.endDate)}
                                        </div>
                                    )}
                                    <div className="text-gray-500" data-oid="gpf.c10">
                                        Duration: {formatDuration(job.startDate, job.endDate)}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="2p-11t9"
                                >
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="ixqeaq8"
                                    >
                                        View Details
                                    </button>
                                    {canCancelJob(job.status) && (
                                        <button
                                            onClick={() => onCancelJob(job)}
                                            className="text-red-600 hover:text-red-900"
                                            data-oid="9.6q_g7"
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
                <div className="text-center py-12" data-oid="_e_15ag">
                    <div className="text-gray-500" data-oid="1k8ns26">
                        No jobs found. Jobs are created when documents are uploaded or reingested.
                    </div>
                </div>
            )}
        </div>
    );
}
