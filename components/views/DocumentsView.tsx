'use client';

import { Realm, Document } from '../../types';
import { FileText, Plus } from 'lucide-react';

interface DocumentsViewProps {
    documents: Document[];
    selectedRealm: Realm | null;
    onBackToRealms: () => void;
    onAddDocument: () => void;
    onPromptDocument: (document: Document) => void;
    onViewDocumentDetail: (document: Document) => void;
    onIngestDocument?: (document: Document) => void;
    'data-oid'?: string;
    [key: string]: any;
}

export function DocumentsView({
    documents,
    selectedRealm,
    onBackToRealms,
    onAddDocument,
    onPromptDocument,
    onViewDocumentDetail,
    onIngestDocument,
    ...props
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
            <div className="flex flex-col items-center justify-center py-16 px-4" {...props}>
                <button
                    onClick={onBackToRealms}
                    className="text-blue-600 hover:text-blue-800 text-sm self-start mb-8"
                >
                    ← Back to Realms
                </button>
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <FileText className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                    Start building your knowledge base by adding your first document. Upload PDFs,
                    text files, or other documents to enable AI-powered search and analysis.
                </p>
                <button
                    onClick={onAddDocument}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Document
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6" {...props}>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Documents {selectedRealm && `- ${selectedRealm.name}`}
                    </h2>
                    <button
                        onClick={onBackToRealms}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        ← Back to Realms
                    </button>
                </div>
                <button
                    onClick={onAddDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Document
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                State
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Version
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Content Stats
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Metadata
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                                        >
                                            {doc.name}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500">{doc.uploadDate}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    v{doc.version}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>{doc.metadata?.chunk_count || doc.chunks} chunks</div>
                                    <div className="text-gray-500">
                                        {(
                                            (doc.metadata?.extraction_quality || doc.quality) * 100
                                        ).toFixed(0)}
                                        % quality
                                    </div>
                                    {doc.metadata?.text_length && (
                                        <div className="text-gray-500">
                                            {(doc.metadata.text_length / 1000).toFixed(1)}k chars
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="space-y-1">
                                        {doc.metadata?.title && (
                                            <div
                                                className="text-gray-900 font-medium truncate max-w-xs"
                                                title={doc.metadata.title}
                                            >
                                                {doc.metadata.title}
                                            </div>
                                        )}
                                        {doc.metadata?.author && (
                                            <div className="text-gray-500 text-xs">
                                                by {doc.metadata.author}
                                            </div>
                                        )}
                                        {doc.metadata?.page_count && (
                                            <div className="text-gray-500 text-xs">
                                                {doc.metadata.page_count} pages
                                            </div>
                                        )}
                                        {doc.metadata?.duration && (
                                            <div className="text-gray-500 text-xs">
                                                {Math.floor(doc.metadata.duration / 60)}:
                                                {(doc.metadata.duration % 60)
                                                    .toFixed(0)
                                                    .padStart(2, '0')}
                                            </div>
                                        )}
                                        {doc.metadata?.word_count && (
                                            <div className="text-gray-500 text-xs">
                                                {doc.metadata.word_count.toLocaleString()} words
                                            </div>
                                        )}
                                        {doc.metadata?.file_size && (
                                            <div className="text-gray-500 text-xs">
                                                {(doc.metadata.file_size / 1024 / 1024).toFixed(1)}{' '}
                                                MB
                                            </div>
                                        )}
                                        {doc.metadata?.language && (
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                {doc.metadata.language.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex flex-col space-y-1">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-indigo-600 hover:text-indigo-900 text-left"
                                        >
                                            View Details
                                        </button>
                                        {onIngestDocument && doc.state === 'uploaded' && (
                                            <button
                                                onClick={() => onIngestDocument(doc)}
                                                className="text-blue-600 hover:text-blue-900 text-left"
                                            >
                                                Ingest
                                            </button>
                                        )}
                                        {doc.state === 'completed' && (
                                            <button
                                                onClick={() => onPromptDocument(doc)}
                                                className="text-green-600 hover:text-green-900 text-left"
                                            >
                                                Query
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
