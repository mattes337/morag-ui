'use client';

import { Realm, Document } from '../../types';
import { FileText, Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getDocumentTypeDescription } from '../../lib/utils/documentTypeDetection';
import { ProcessingStatusDisplay } from '../ui/processing/processing-status-display';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading-spinner';

interface DocumentsViewProps {
    documents: Document[];
    selectedRealm: Realm | null;
    isLoading?: boolean;
    onBackToRealms: () => void;
    onAddDocument: () => void;
    onPromptDocument: (document: Document) => void;
    onViewDocumentDetail: (document: Document) => void;
    'data-oid'?: string;
    [key: string]: any;
}

export function DocumentsView({
    documents,
    selectedRealm,
    isLoading = false,
    onBackToRealms,
    onAddDocument,
    onPromptDocument,
    onViewDocumentDetail,
    ...props
}: DocumentsViewProps) {


    const getStatusIcon = (state: string, hasFailedJobs?: boolean) => {
        if (hasFailedJobs) {
            return <XCircle className="w-4 h-4 text-red-500" />;
        }

        switch (state) {
            case 'pending':
                return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
            case 'ingesting':
                return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'ingested':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'deleted':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    // Show loading state while data is being fetched
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4" {...props}>
                <button
                    onClick={onBackToRealms}
                    className="text-blue-600 hover:text-blue-800 text-sm self-start mb-8"
                >
                    ← Back to Realms
                </button>
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Loading documents...</p>
            </div>
        );
    }

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
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/4">
                                    <div className="truncate">Document</div>
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 hidden sm:table-cell">
                                    Type
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    State
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 hidden md:table-cell">
                                    Processing
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 hidden lg:table-cell">
                                    Content Stats
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-3 sm:px-6 py-4 min-w-0 w-1/4">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(doc.state, doc.processingJobs?.some(job => job.status === 'FAILED'))}
                                        <div className="text-sm font-medium min-w-0 flex-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onViewDocumentDetail(doc);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 hover:underline text-left truncate block w-full max-w-xs"
                                                type="button"
                                                title={doc.name}
                                            >
                                                {doc.name}
                                            </button>
                                            <div className="text-sm text-gray-500 truncate">{doc.uploadDate}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                                    <div>
                                        <div className="font-medium">{getDocumentTypeDescription(doc.type, doc.subType)}</div>
                                        {doc.subType && doc.subType !== 'unknown' && (
                                            <div className="text-xs text-gray-500">{doc.subType}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="flex justify-center">
                                        {doc.state === 'ingested' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        ) : doc.currentStage ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {doc.currentStage.replace(/_/g, ' ').toLowerCase()}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {doc.state}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    <div className="flex items-center space-x-2">
                                        <Badge
                                            variant={doc.processingMode === 'AUTOMATIC' ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {doc.processingMode || 'AUTOMATIC'}
                                        </Badge>
                                        {doc.state === 'ingesting' && doc.id && (
                                            <ProcessingStatusDisplay
                                                documentId={doc.id}
                                                processingMode={doc.processingMode || 'AUTOMATIC'}
                                                compact={true}
                                                hideProcessingMode={true}
                                            />
                                        )}
                                    </div>
                                </td>

                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
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

                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                        <button
                                            onClick={() => onViewDocumentDetail(doc)}
                                            className="text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => onPromptDocument(doc)}
                                            className="text-green-600 hover:text-green-900 text-xs sm:text-sm"
                                        >
                                            Prompt
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    );
}
