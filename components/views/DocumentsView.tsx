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
        <div className="space-y-6" data-oid="acg1:p3">
            <div className="flex justify-between items-center" data-oid="jttvin:">
                <div data-oid="-u2np28">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="z.62qyd">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={onBackToDatabases}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-oid="egzrx50"
                    >
                        ← Back to Databases
                    </button>
                </div>
                <button
                    onClick={onAddDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="hx7vv2z"
                >
                    Add Document
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="yipnsbt"
            >
                <table className="w-full" data-oid=":_rl0nx">
                    <thead className="bg-gray-50" data-oid="m2jph5t">
                        <tr data-oid="x9vns-:">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="dv442oc"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="fp7w0e4"
                            >
                                Type
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="jye889j"
                            >
                                State
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid=".1jz8l7"
                            >
                                Version
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="l5brhc1"
                            >
                                Content Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="aai8ejw"
                            >
                                Metadata
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="5u8_e3:"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="brw5br7">
                        {documents.map((doc) => (
                            <tr key={doc.id} data-oid="_241w0z">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid=":w6h4i2">
                                    <div className="text-sm font-medium" data-oid="ylo66wd">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="v_os86l"
                                        >
                                            {doc.name}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="9sxvy.8">
                                        {doc.uploadDate}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid=":aop.ox"
                                >
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="dl_rbkd">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                        data-oid="4vqxj0_"
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="5jb:8y:"
                                >
                                    v{doc.version}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="qr0x70q"
                                >
                                    <div data-oid="y22gbhw">
                                        {doc.metadata?.chunk_count || doc.chunks} chunks
                                    </div>
                                    <div className="text-gray-500" data-oid="_1hf6op">
                                        {(
                                            (doc.metadata?.extraction_quality || doc.quality) * 100
                                        ).toFixed(0)}
                                        % quality
                                    </div>
                                    {doc.metadata?.text_length && (
                                        <div className="text-gray-500" data-oid="1gn9tgg">
                                            {(doc.metadata.text_length / 1000).toFixed(1)}k chars
                                        </div>
                                    )}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="0e6ksk0"
                                >
                                    <div className="space-y-1" data-oid="ctuaozo">
                                        {doc.metadata?.title && (
                                            <div
                                                className="text-gray-900 font-medium truncate max-w-xs"
                                                title={doc.metadata.title}
                                                data-oid="iqwjjwi"
                                            >
                                                {doc.metadata.title}
                                            </div>
                                        )}
                                        {doc.metadata?.author && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="f2my6y."
                                            >
                                                by {doc.metadata.author}
                                            </div>
                                        )}
                                        {doc.metadata?.page_count && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="9mi:xb0"
                                            >
                                                {doc.metadata.page_count} pages
                                            </div>
                                        )}
                                        {doc.metadata?.duration && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="him3irz"
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
                                                data-oid="sdno8q3"
                                            >
                                                {doc.metadata.word_count.toLocaleString()} words
                                            </div>
                                        )}
                                        {doc.metadata?.file_size && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="ijeq1qy"
                                            >
                                                {(doc.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {doc.metadata?.language && (
                                            <span
                                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                data-oid=":t1pdh3"
                                            >
                                                {doc.metadata.language.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="uuly3ig"
                                >
                                    <button
                                        onClick={() => onViewDocumentDetail(doc)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="a67l88n"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onPromptDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
                                        data-oid="xr9qdw0"
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
