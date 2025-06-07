'use client';

import { Database, Document } from '../../types';

interface DocumentsViewProps {
    documents: Document[];
    selectedDatabase: Database | null;
    onBackToDatabases: () => void;
    onAddDocument: () => void;
    onPromptDocument: (document: Document) => void;
    onViewDocumentDetail: (document: Document) => void;
}

export function DocumentsView({
    documents,
    selectedDatabase,
    onBackToDatabases,
    onAddDocument,
    onPromptDocument,
    onViewDocumentDetail,
}: DocumentsViewProps) {
    const getStateColor = (state: string) => {
        switch (state) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'ingesting':
                return 'bg-blue-100 text-blue-800';
            case 'ingested':
                return 'bg-green-100 text-green-800';
            case 'deprecated':
                return 'bg-gray-100 text-gray-800';
            case 'deleted':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6" data-oid="wnwvuru">
            <div className="flex justify-between items-center" data-oid="r4kmo-_">
                <div data-oid=".lhpb5a">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="tg1e2rj">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={onBackToDatabases}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-oid="pi6phrc"
                    >
                        ← Back to Databases
                    </button>
                </div>
                <button
                    onClick={onAddDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid=".noa52k"
                >
                    Add Document
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="qgfmnv2"
            >
                <table className="w-full" data-oid="86-m91f">
                    <thead className="bg-gray-50" data-oid="7d421y.">
                        <tr data-oid="83.ljle">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="pn96_b3"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="376q4ro"
                            >
                                Type
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="7m3pjox"
                            >
                                State
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="8ww26vy"
                            >
                                Version
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="fw.d.c8"
                            >
                                Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="zdafuh4"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="_lub060">
                        {documents.map((doc) => (
                            <tr key={doc.id} data-oid="wbadi_n">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="3dmlvd_">
                                    <div className="text-sm font-medium" data-oid="vn2iif-">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="8ddrjwy"
                                        >
                                            {doc.name}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="hnin.07">
                                        {doc.uploadDate}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="6oc2xm4"
                                >
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="82e5gdc">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                        data-oid="-jk5q-7"
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="gi.s.1i"
                                >
                                    v{doc.version}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="fjkf6m."
                                >
                                    {doc.chunks} chunks, {(doc.quality * 100).toFixed(0)}% quality
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="sy.:d8z"
                                >
                                    <button
                                        onClick={() => onViewDocumentDetail(doc)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="view-detail-btn"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onPromptDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
                                        data-oid="s5gyn52"
                                    >
                                        Prompt
                                    </button>
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="34vd06c"
                                    >
                                        Re-ingest
                                    </button>
                                    <button
                                        className="text-yellow-600 hover:text-yellow-900"
                                        data-oid="wlmoyb5"
                                    >
                                        Supersede
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="npdwcjm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
