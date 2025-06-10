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
        <div className="space-y-6" data-oid="00168ao">
            <div className="flex justify-between items-center" data-oid="0ezx3mf">
                <div data-oid=":77xoad">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="z8ee5.-">
                        Jobs
                    </h2>
                    <p className="text-gray-600 text-sm mt-1" data-oid="yq1ckzq">
                        Monitor document processing jobs and their progress
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="5dj.rz0"
            >
                <table className="w-full" data-oid="betiezk">
                    <thead className="bg-gray-50" data-oid="9a0u0kl">
                        <tr data-oid="7_1glr.">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="l953so6"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="b9q7.l0"
                            >
                                Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="d1bba09"
                            >
                                Progress
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="k_0mb9m"
                            >
                                Timing
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="ij_joch"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="jsa48ay">
                        {jobs.map((job) => (
                            <tr key={job.id} data-oid="yp9290-">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="n:4xvt4">
                                    <div className="text-sm font-medium" data-oid="ewmw3zq">
                                        <button
                                            onClick={() => onViewJobDetail(job)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="9xwbl8s"
                                        >
                                            {job.documentName}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="odloht0">
                                        {job.documentType} • Job #{job.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="x-ere-v">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                                        data-oid="dsd30:p"
                                    >
                                        {job.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="nn5sxsb">
                                    <div className="w-full" data-oid="m.szvd-">
                                        <div
                                            className="flex justify-between text-xs text-gray-600 mb-1"
                                            data-oid="fss5_ej"
                                        >
                                            <span data-oid="18tyqnw">
                                                {job.progress.percentage}%
                                            </span>
                                        </div>
                                        <div
                                            className="w-full bg-gray-200 rounded-full h-2"
                                            data-oid="ihf72xq"
                                        >
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress.percentage}%` }}
                                                data-oid="dz3xylq"
                                            ></div>
                                        </div>
                                        <div
                                            className="text-xs text-gray-500 mt-1"
                                            data-oid="kboqwpf"
                                        >
                                            {job.progress.summary}
                                        </div>
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="of.71sr"
                                >
                                    <div data-oid="v-213b:">
                                        Started: {formatDate(job.startDate)}
                                    </div>
                                    {job.endDate && (
                                        <div className="text-gray-500" data-oid="ft-m_3g">
                                            Finished: {formatDate(job.endDate)}
                                        </div>
                                    )}
                                    <div className="text-gray-500" data-oid="5h6f2bp">
                                        Duration: {formatDuration(job.startDate, job.endDate)}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="ck_.._j"
                                >
                                    <button
                                        onClick={() => onViewJobDetail(job)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="xnm_8_a"
                                    >
                                        View Details
                                    </button>
                                    {canCancelJob(job.status) && (
                                        <button
                                            onClick={() => onCancelJob(job)}
                                            className="text-red-600 hover:text-red-900"
                                            data-oid="xp1.65e"
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
                <div className="text-center py-12" data-oid="-tdwz4c">
                    <div className="text-gray-500" data-oid="1tx.pih">
                        No jobs found. Jobs are created when documents are uploaded or reingested.
                    </div>
                </div>
            )}
        </div>
    );
}
