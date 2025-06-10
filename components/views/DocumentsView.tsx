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
        <div className="space-y-6" data-oid="5zodr:p">
            <div className="flex justify-between items-center" data-oid="i3.c9me">
                <div data-oid="r_ri:ms">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="-zze45h">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={onBackToDatabases}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-oid="yt-icv0"
                    >
                        ← Back to Databases
                    </button>
                </div>
                <button
                    onClick={onAddDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="_6zgvz."
                >
                    Add Document
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="v_ca7pm"
            >
                <table className="w-full" data-oid="y4ii7oa">
                    <thead className="bg-gray-50" data-oid="hcvl:-j">
                        <tr data-oid="j9.2q3-">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="fnl2:ch"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="7vw.pxi"
                            >
                                Type
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="fe9xqds"
                            >
                                State
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="0f3cruv"
                            >
                                Version
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="5x_.bc0"
                            >
                                Content Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="i1-eymp"
                            >
                                Metadata
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="1lkomli"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="celw._0">
                        {documents.map((doc) => (
                            <tr key={doc.id} data-oid="vxh177w">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="odd-zlw">
                                    <div className="text-sm font-medium" data-oid="mj:0qi8">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid=":14kckz"
                                        >
                                            {doc.name}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="o8rbst1">
                                        {doc.uploadDate}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="qx_hk6:"
                                >
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="wg72ejv">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                        data-oid="1726f02"
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="obyibv0"
                                >
                                    v{doc.version}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="d1s-m0m"
                                >
                                    <div data-oid="z_.xkbi">
                                        {doc.metadata?.chunk_count || doc.chunks} chunks
                                    </div>
                                    <div className="text-gray-500" data-oid="o2fm5_n">
                                        {(
                                            (doc.metadata?.extraction_quality || doc.quality) * 100
                                        ).toFixed(0)}
                                        % quality
                                    </div>
                                    {doc.metadata?.text_length && (
                                        <div className="text-gray-500" data-oid="mnlkvfy">
                                            {(doc.metadata.text_length / 1000).toFixed(1)}k chars
                                        </div>
                                    )}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="qbgy:3b"
                                >
                                    <div className="space-y-1" data-oid=":j_82-s">
                                        {doc.metadata?.title && (
                                            <div
                                                className="text-gray-900 font-medium truncate max-w-xs"
                                                title={doc.metadata.title}
                                                data-oid="v0d:6y_"
                                            >
                                                {doc.metadata.title}
                                            </div>
                                        )}
                                        {doc.metadata?.author && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="oxs-9sb"
                                            >
                                                by {doc.metadata.author}
                                            </div>
                                        )}
                                        {doc.metadata?.page_count && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="oe8cvv7"
                                            >
                                                {doc.metadata.page_count} pages
                                            </div>
                                        )}
                                        {doc.metadata?.duration && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="4zleysa"
                                            >
                                                {Math.floor(doc.metadata.duration / 60)}:
                                                {(doc.metadata.duration % 60)
                                                    .toFixed(0)
                                                    .padStart(2, '0')}
                                            </div>
                                        )}
                                        {doc.metadata?.word_count && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="b6rbh32"
                                            >
                                                {doc.metadata.word_count.toLocaleString()} words
                                            </div>
                                        )}
                                        {doc.metadata?.file_size && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="azx1b14"
                                            >
                                                {(doc.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {doc.metadata?.language && (
                                            <span
                                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                data-oid="2vrdmkm"
                                            >
                                                {doc.metadata.language.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="s349l6g"
                                >
                                    <button
                                        onClick={() => onViewDocumentDetail(doc)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="04jvx6w"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onPromptDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
                                        data-oid="3a3ejdr"
                                    >
                                        Prompt
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
