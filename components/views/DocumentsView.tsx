'use client';

import { Realm, Document } from '../../types';
import { FileText, Plus, CheckCircle, XCircle, Loader2, File, FileVideo, FileAudio, Globe, Youtube, FileImage, FileSpreadsheet, Presentation } from 'lucide-react';
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

    // Get file type icon based on document type and subtype
    const getFileTypeIcon = (type: string, subType?: string) => {
        const iconClass = "w-6 h-6"; // Increased from w-4 h-4 to w-6 h-6

        switch (type) {
            case 'pdf':
                return <File className={`${iconClass} text-red-600`} />;
            case 'youtube':
                return <FileVideo className={`${iconClass} text-red-500`} />;
            case 'website':
                return <Globe className={`${iconClass} text-blue-500`} />;
            case 'markdown':
                return <FileText className={`${iconClass} text-blue-600`} />;
            case 'video':
                return <FileVideo className={`${iconClass} text-purple-600`} />;
            case 'audio':
                return <FileAudio className={`${iconClass} text-green-600`} />;
            case 'document':
                switch (subType) {
                    case 'pdf':
                        return <File className={`${iconClass} text-red-600`} />;
                    case 'word':
                        return <FileText className={`${iconClass} text-blue-600`} />;
                    case 'excel':
                        return <FileSpreadsheet className={`${iconClass} text-green-600`} />;
                    case 'powerpoint':
                        return <Presentation className={`${iconClass} text-orange-600`} />;
                    case 'markdown':
                        return <FileText className={`${iconClass} text-blue-600`} />;
                    case 'text':
                        return <FileText className={`${iconClass} text-gray-600`} />;
                    default:
                        return <FileText className={`${iconClass} text-gray-600`} />;
                }
            default:
                return <FileText className={`${iconClass} text-gray-600`} />;
        }
    };

    // Get compound icon with loading overlay for processing documents
    const getDocumentIcon = (doc: Document) => {
        const isProcessing = doc.state === 'ingesting' || doc.state === 'pending';
        const hasFailedJobs = doc.processingJobs?.some(job => job.status === 'FAILED');

        return (
            <div className="relative">
                {/* Base file type icon */}
                <div className={isProcessing && !hasFailedJobs ? 'opacity-50' : ''}>
                    {getFileTypeIcon(doc.type, doc.subType)}
                </div>

                {/* Processing overlay */}
                {isProcessing && !hasFailedJobs && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Error overlay */}
                {hasFailedJobs && (
                    <div className="absolute -top-1 -right-1">
                        <XCircle className="w-3 h-3 text-red-500" />
                    </div>
                )}

                {/* Success overlay */}
                {doc.state === 'ingested' && !hasFailedJobs && (
                    <div className="absolute -top-1 -right-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                )}
            </div>
        );
    };

    // Get proper document state display
    const getDocumentState = (doc: Document) => {
        const hasFailedJobs = doc.processingJobs?.some(job => job.status === 'FAILED');

        if (hasFailedJobs) {
            return 'failed';
        }

        // Map current stage to proper state if document is still processing
        if (doc.state === 'ingesting' && doc.currentStage) {
            return doc.currentStage.toLowerCase();
        }

        return doc.state;
    };

    // Get content stats display
    const getContentStats = (doc: Document) => {
        const chunks = doc.chunks || 0;
        const quality = Math.round((doc.quality || 0) * 100);

        return (
            <div className="text-sm text-gray-600">
                <div>{chunks} chunks</div>
                <div>{quality}% quality</div>
            </div>
        );
    };

    // Get document type display (single line)
    const getDocumentTypeDisplay = (doc: Document) => {
        const description = getDocumentTypeDescription(doc.type, doc.subType);
        return (
            <div className="text-sm text-gray-600">
                {description}
                {doc.subType && doc.subType !== doc.type && (
                    <span className="text-xs text-gray-400 ml-1">({doc.subType})</span>
                )}
            </div>
        );
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
                                        {getDocumentIcon(doc)}
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
                                    {getDocumentTypeDisplay(doc)}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="flex justify-center">
                                        {doc.state === 'ingested' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                {getDocumentState(doc).replace(/_/g, ' ')}
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

                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                    {getContentStats(doc)}
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
