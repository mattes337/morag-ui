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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={onBackToDatabases}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        ← Back to Databases
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => onViewDocumentDetail(doc)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onPromptDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
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
