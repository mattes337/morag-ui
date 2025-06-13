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
                data-oid="58iimr7"
            >
                <button
                    onClick={onBackToDatabases}
                    className="text-blue-600 hover:text-blue-800 text-sm self-start mb-8"
                    data-oid="f-j:bza"
                >
                    ← Back to Databases
                </button>
                <div className="bg-gray-100 rounded-full p-6 mb-6" data-oid="l:bdag8">
                    <FileText className="w-16 h-16 text-gray-400" data-oid="f7997cc" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-oid="3932q:4">
                    No documents yet
                </h3>
                <p className="text-gray-600 text-center mb-8 max-w-md" data-oid="8zlc2kh">
                    Start building your knowledge base by adding your first document. Upload PDFs,
                    text files, or other documents to enable AI-powered search and analysis.
                </p>
                <button
                    onClick={onAddDocument}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    data-oid="xlg6:g2"
                >
                    <Plus className="w-5 h-5 mr-2" data-oid="v1c7n56" />
                    Add Your First Document
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-oid="w-p:myg">
            <div className="flex justify-between items-center" data-oid="825:c3t">
                <div data-oid="v.s80hs">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="7fk:o8g">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={onBackToDatabases}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-oid="i3fi:mm"
                    >
                        ← Back to Databases
                    </button>
                </div>
                <button
                    onClick={onAddDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="7g_g52a"
                >
                    Add Document
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="fjok0wv"
            >
                <table className="w-full" data-oid="hr:jvk9">
                    <thead className="bg-gray-50" data-oid="_-udxzm">
                        <tr data-oid="3lkptz3">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="mj33:_0"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="y0606cu"
                            >
                                Type
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="_s8o5eh"
                            >
                                State
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="3rs74an"
                            >
                                Version
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="pp6eymd"
                            >
                                Content Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="hs8es0l"
                            >
                                Metadata
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="ok5s4rv"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="tvkfmrl">
                        {documents.map((doc) => (
                            <tr key={doc.id} data-oid="6l79k57">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="_y-k8wp">
                                    <div className="text-sm font-medium" data-oid="nkxbm4w">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            data-oid="yfb3bkk"
                                        >
                                            {doc.name}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="aokt76f">
                                        {doc.uploadDate}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="zxk8j2s"
                                >
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="3hgan5o">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                        data-oid="0tjpwge"
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="olc9ghg"
                                >
                                    v{doc.version}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="oee3-nz"
                                >
                                    <div data-oid="y267duw">
                                        {doc.metadata?.chunk_count || doc.chunks} chunks
                                    </div>
                                    <div className="text-gray-500" data-oid="2hudzfg">
                                        {(
                                            (doc.metadata?.extraction_quality || doc.quality) * 100
                                        ).toFixed(0)}
                                        % quality
                                    </div>
                                    {doc.metadata?.text_length && (
                                        <div className="text-gray-500" data-oid="-ii9d8k">
                                            {(doc.metadata.text_length / 1000).toFixed(1)}k chars
                                        </div>
                                    )}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="92tv_9b"
                                >
                                    <div className="space-y-1" data-oid="ui8ottq">
                                        {doc.metadata?.title && (
                                            <div
                                                className="text-gray-900 font-medium truncate max-w-xs"
                                                title={doc.metadata.title}
                                                data-oid="i-7b6vh"
                                            >
                                                {doc.metadata.title}
                                            </div>
                                        )}
                                        {doc.metadata?.author && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="43.mos:"
                                            >
                                                by {doc.metadata.author}
                                            </div>
                                        )}
                                        {doc.metadata?.page_count && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="31ow3y9"
                                            >
                                                {doc.metadata.page_count} pages
                                            </div>
                                        )}
                                        {doc.metadata?.duration && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="ztlq.lv"
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
                                                data-oid="cdy_q5l"
                                            >
                                                {doc.metadata.word_count.toLocaleString()} words
                                            </div>
                                        )}
                                        {doc.metadata?.file_size && (
                                            <div
                                                className="text-gray-500 text-xs"
                                                data-oid="brt7ti0"
                                            >
                                                {(doc.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {doc.metadata?.language && (
                                            <span
                                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                data-oid="i_qit.t"
                                            >
                                                {doc.metadata.language.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="q-ig:i0"
                                >
                                    <button
                                        onClick={() => onViewDocumentDetail(doc)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        data-oid="zxqhxs5"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onPromptDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
                                        data-oid="e3kmfel"
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
