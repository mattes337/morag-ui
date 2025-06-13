'use client';

import { Database, Document } from '../../types';
import { FileText, Plus } from 'lucide-react';

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

    // Show empty state when no documents exist
    if (documents.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center py-16 px-4"
                data-oid="b2yjf1m"
            >
                <button
                    onClick={onBackToDatabases}
                    className="text-blue-600 hover:text-blue-800 text-sm self-start mb-8"
                    data-oid="k6js:k_"
                >
                    ← Back to Databases
                </button>
                <div className="bg-gray-100 rounded-full p-6 mb-6" data-oid="4nof8d8">
                    <FileText className="w-16 h-16 text-gray-400" data-oid="of6-kgo" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-oid="xj65hv4">
                    No documents yet
                </h3>
                <p className="text-gray-600 text-center mb-8 max-w-md" data-oid="-y76b9i">
                    Start building your knowledge base by adding your first document. Upload PDFs,
                    text files, or other documents to enable AI-powered search and analysis.
                </p>
                <button
                    onClick={onAddDocument}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    data-oid="iyho_6g"
                >
                    <Plus className="w-5 h-5 mr-2" data-oid="k9xn65p" />
                    Add Your First Document
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-oid="7fwqrri">
            <div className="flex justify-between items-center" data-oid="_0lpprv">
                <div data-oid="y:tkzpb">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="ufzbpdh">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={onBackToDatabases}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-oid="bngrmw."
                    >
                        ← Back to Databases
                    </button>
                </div>
                <button
                    onClick={onAddDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="wq9jiil"
                >
                    Add Document
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="gs_bbv7"
            >
                <table className="w-full" data-oid=":uij4i8">
                    <thead className="bg-gray-50" data-oid="h.hou4f">
                        <tr data-oid="taaid67">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="s9o6twv"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="m_etq6j"
                            >
                                Type
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="euss6c_"
                            >
                                State
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="aygo74a"
                            >
                                Version
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="ldfxw.c"
                            >
                                Content Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="1hc:eyc"
                            >
                                Metadata
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="76at7v6"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="hj4s1ha">
                        {documents.map((doc) => (
                            <tr key={doc.id} data-oid="xayl_oa">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="rbzx6s0">
                                    <div className="text-sm font-medium" data-oid="bgfy7jd">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="-wpw:uq"
                                        >
                                            {doc.name}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="fw5xz0u">
                                        {doc.uploadDate}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="_wx45-i"
                                >
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="tiyqwg8">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                        data-oid="nmsmbaf"
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="d5h8wi_"
                                >
                                    v{doc.version}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="q7hm.wa"
                                >
                                    <div data-oid="d.9kl.e">
                                        {doc.metadata?.chunk_count || doc.chunks} chunks
                                    </div>
                                    <div className="text-gray-500" data-oid="11vjy59">
                                        {(
                                            (doc.metadata?.extraction_quality || doc.quality) * 100
                                        ).toFixed(0)}
                                        % quality
                                    </div>
                                    {doc.metadata?.text_length && (
                                        <div className="text-gray-500" data-oid="247co5p">
                                            {(doc.metadata.text_length / 1000).toFixed(1)}k chars
                                        </div>
                                    )}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid=":d-bvs."
                                >
                                    <div className="space-y-1" data-oid="rz8:y36">
                                        {doc.metadata?.title && (
                                            <div
                                                className="text-gray-900 font-medium truncate max-w-xs"
                                                title={doc.metadata.title}
                                                data-oid="4y0s:wu"
                                            >
                                                {doc.metadata.title}
                                            </div>
                                        )}
                                        {doc.metadata?.author && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="v.i7x1c"
                                            >
                                                by {doc.metadata.author}
                                            </div>
                                        )}
                                        {doc.metadata?.page_count && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="wpsxqe."
                                            >
                                                {doc.metadata.page_count} pages
                                            </div>
                                        )}
                                        {doc.metadata?.duration && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="cwvzz9h"
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
                                                data-oid="uuu78r4"
                                            >
                                                {doc.metadata.word_count.toLocaleString()} words
                                            </div>
                                        )}
                                        {doc.metadata?.file_size && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="7qdj6yh"
                                            >
                                                {(doc.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {doc.metadata?.language && (
                                            <span
                                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                data-oid="_evn3le"
                                            >
                                                {doc.metadata.language.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="n-04hg4"
                                >
                                    <button
                                        onClick={() => onViewDocumentDetail(doc)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="u-anuy9"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onPromptDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
                                        data-oid="1yji3.y"
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
