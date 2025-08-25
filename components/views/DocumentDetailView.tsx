'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Document } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { getDocumentTypeDescription } from '../../lib/utils/documentTypeDetection';
import { ProcessingStatusDisplay } from '../ui/processing-status-display';
import { ProcessingModeToggle } from '../ui/processing-mode-toggle';
import { StageControlPanel } from '../ui/stage-control-panel';
import { ProcessingHistory } from '../ui/processing-history';
import { DocumentStatistics } from '../ui/document-statistics';
import { ToastService } from '../../lib/services/toastService';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Activity,
  Settings,
  FileText,
  Download,
  Eye,
  RotateCcw,
  Trash2,
  ArrowLeft,
  Play,
  Loader2,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocumentFile {
  id: string;
  fileType: string;
  stage?: string;
  filename: string;
  originalName?: string;
  filesize: number;
  contentType: string;
  content?: string;
  createdAt: string;
}

interface DocumentDetailViewProps {
    document: Document;
    onBack: () => void;
    onReingest: (document: Document) => void;
    onSupersede: (document: Document) => void;
    onDelete: (document: Document) => void;
}

export function DocumentDetailView({
    document,
    onBack,
    onReingest,
    onSupersede,
    onDelete,
}: DocumentDetailViewProps) {
    // All hooks must be called before any early returns
    const {
        setShowReingestConfirmDialog,
        setDocumentToReingest,
        setShowDeleteConfirmDialog,
        setDocumentToDelete,
    } = useApp();

    const [activeTab, setActiveTab] = useState('overview');
    const [files, setFiles] = useState<DocumentFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isExecutingStage, setIsExecutingStage] = useState(false);
    const [viewingFile, setViewingFile] = useState<DocumentFile | null>(null);

    // Processing state
    const [processingMode, setProcessingMode] = useState<'MANUAL' | 'AUTOMATIC'>('MANUAL');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stageInfos, setStageInfos] = useState<any[]>([]);

    const loadDocumentFiles = useCallback(async () => {
        if (!document?.id) return;
        try {
          setIsLoadingFiles(true);
          const response = await fetch(`/api/files?documentId=${document.id}`);
          if (response.ok) {
            const data = await response.json();
            setFiles(data.files || []);
          }
        } catch (error) {
          console.error('Failed to load document files:', error);
          ToastService.error('Failed to load document files');
        } finally {
          setIsLoadingFiles(false);
        }
    }, [document?.id]);

    const loadStageInfo = useCallback(async () => {
        if (!document?.id) return;
        try {
            const response = await fetch(`/api/documents/${document.id}/stages?includeExecutions=true`);
            if (response.ok) {
                const data = await response.json();
                // Convert pipelineStatus to stage info format with execution data
                const stages = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
                const stageInfos = stages.map(stage => {
                    const isCompleted = data.pipelineStatus?.completedStages?.includes(stage);
                    const isFailed = data.pipelineStatus?.failedStages?.includes(stage);
                    const isCurrent = data.pipelineStatus?.currentStage === stage;

                    let status = 'PENDING';
                    if (isCompleted) status = 'COMPLETED';
                    else if (isFailed) status = 'FAILED';
                    else if (isCurrent && data.pipelineStatus?.stageStatus === 'RUNNING') status = 'RUNNING';

                    // Find the latest execution for this stage
                    const stageExecutions = data.executions?.filter((exec: any) => exec.stage === stage) || [];
                    const latestExecution = stageExecutions.sort((a: any, b: any) =>
                        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                    )[0];

                    return {
                        stage,
                        status,
                        progress: isCurrent ? data.pipelineStatus?.progress : (isCompleted ? 100 : 0),
                        startedAt: latestExecution?.startedAt ? new Date(latestExecution.startedAt) : undefined,
                        completedAt: latestExecution?.completedAt ? new Date(latestExecution.completedAt) : undefined,
                        errorMessage: latestExecution?.errorMessage
                    };
                });
                setStageInfos(stageInfos);
            }
        } catch (error) {
            console.error('Failed to load stage info:', error);
        }
    }, [document?.id]);

    const loadProcessingStatus = useCallback(async () => {
        if (!document?.id || document.id === 'undefined') {
            console.warn('DocumentDetailView: Invalid document ID provided:', document?.id);
            return;
        }

        try {
            const response = await fetch(`/api/documents/${document.id}/processing`);
            if (response.ok) {
                const data = await response.json();

                // Check if there are any active processing jobs
                const activeJobs = data.jobs?.filter((job: any) =>
                    job.status === 'PENDING' || job.status === 'PROCESSING'
                ) || [];

                setIsProcessing(activeJobs.length > 0);

                // Update processing mode from document
                if (data.processingMode) {
                    setProcessingMode(data.processingMode);
                }

                console.log(`📊 [DocumentDetailView] Processing status: ${activeJobs.length} active jobs`);
            }
        } catch (error) {
            console.error('Failed to load processing status:', error);
        }
    }, [document?.id]);

    useEffect(() => {
        if (document?.id) {
            loadDocumentFiles();
            loadStageInfo();
            loadProcessingStatus();
        }
    }, [document?.id, loadDocumentFiles, loadStageInfo, loadProcessingStatus]);

    // Poll processing status every 5 seconds when processing is active
    useEffect(() => {
        if (!isProcessing) return;

        const interval = setInterval(() => {
            loadProcessingStatus();
            loadStageInfo(); // Also refresh stage info to show progress
        }, 5000);

        return () => clearInterval(interval);
    }, [isProcessing, loadProcessingStatus, loadStageInfo]);

    // Early validation to prevent undefined document ID issues
    if (!document || !document.id) {
        console.error('❌ [DocumentDetailView] Invalid document provided:', document);
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Document</h2>
                    <p className="text-gray-600 mb-4">Document data is missing or invalid</p>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Documents
                    </button>
                </div>
            </div>
        );
    }

    const handleReingestClick = () => {
        setDocumentToReingest(document);
        setShowReingestConfirmDialog(true);
    };

    const handleDeleteClick = () => {
        setDocumentToDelete(document);
        setShowDeleteConfirmDialog(true);
    };

    const handleExecuteStage = async (stage: string) => {
        try {
            setIsExecutingStage(true);

            const response = await fetch('/api/stages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentId: document.id,
                    stage: stage,
                }),
                credentials: 'include', // Include cookies for authentication
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Handle authentication errors specifically
                if (response.status === 401) {
                    ToastService.error(
                        'Authentication required',
                        {
                            description: 'Please log in to execute processing stages'
                        }
                    );
                    // Redirect to login page
                    window.location.href = '/login';
                    return;
                }

                throw new Error(errorData.error || 'Failed to execute stage');
            }

            await response.json();
            ToastService.success(`Stage ${stage} execution started successfully`);

            // Refresh the page to show updated status
            window.location.reload();
        } catch (error) {
            console.error('Failed to execute stage:', error);
            ToastService.error(
                'Failed to execute stage',
                {
                    description: error instanceof Error ? error.message : 'An unexpected error occurred'
                }
            );
        } finally {
            setIsExecutingStage(false);
        }
    };

    // Processing workflow handlers
    const handleProcessingModeChange = async (mode: 'MANUAL' | 'AUTOMATIC') => {
        setProcessingMode(mode);
        // TODO: Save mode preference to backend
    };

    const handleContinueProcessing = async () => {
        // Find the next stage that needs to be executed
        const nextStage = getNextStage();
        if (nextStage) {
            await handleExecuteStage(nextStage);
        }
    };

    const handleExecuteChain = async (fromStage: string) => {
        setIsProcessing(true);
        try {
            // Execute remaining stages starting from the specified stage
            const response = await fetch('/api/stages/chain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: document.id,
                    fromStage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start stage chain execution');
            }

            ToastService.success('Stage chain execution started');
            // Refresh to show updated status
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Failed to execute stage chain:', error);
            ToastService.error('Failed to execute stage chain');
        } finally {
            setIsProcessing(false);
        }
    };

    const hasNextStage = (): boolean => {
        return getNextStage() !== null;
    };

    const getNextStage = (): string | null => {
        const stageOrder = ['MARKDOWN_CONVERSION', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
        const completedStages = stageInfos
            .filter(stage => stage.status === 'COMPLETED')
            .map(stage => stage.stage);

        return stageOrder.find(stage => !completedStages.includes(stage)) || null;
    };

    const handleViewFile = async (fileId: string) => {
        try {
            const response = await fetch(`/api/files/${fileId}?includeContent=true`);

            if (!response.ok) {
                throw new Error('Failed to fetch file details');
            }

            const fileData = await response.json();
            setViewingFile(fileData);
        } catch (error) {
            console.error('Failed to view file:', error);
            ToastService.error('Failed to view file');
        }
    };

    const handleDownloadFile = async (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        const fileName = file?.originalName || file?.filename || 'download';

        try {
            ToastService.info('Starting download...', { description: `Downloading ${fileName}` });

            const response = await fetch(`/api/files/${fileId}/download`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Check if the response has content-length for progress tracking
            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;

            if (total > 0) {
                // Use ReadableStream for progress tracking
                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('Failed to get response reader');
                }

                const chunks: Uint8Array[] = [];
                let received = 0;

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    chunks.push(value);
                    received += value.length;

                    // Update progress (throttled to avoid too many updates)
                    const progress = Math.round((received / total) * 100);
                    if (progress % 10 === 0 || progress === 100) {
                        ToastService.info(`Downloading ${fileName}...`, {
                            description: `${progress}% complete (${(received / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB)`
                        });
                    }
                }

                // Combine chunks into blob
                const blob = new Blob(chunks as BlobPart[]);

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = window.document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.style.display = 'none';
                window.document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                window.document.body.removeChild(a);

                ToastService.success('Download completed', { description: `${fileName} has been downloaded successfully` });
            } else {
                // Fallback for responses without content-length
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = window.document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.style.display = 'none';
                window.document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                window.document.body.removeChild(a);

                ToastService.success('Download completed', { description: `${fileName} has been downloaded successfully` });
            }
        } catch (error) {
            console.error('Failed to download file:', error);

            let errorMessage = 'Failed to download file';
            let errorDescription = 'An unexpected error occurred';

            if (error instanceof Error) {
                errorDescription = error.message;

                // Provide specific error messages
                if (error.message.includes('404')) {
                    errorMessage = 'File Not Found';
                    errorDescription = 'The requested file could not be found. It may have been deleted or moved.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Access Denied';
                    errorDescription = 'You do not have permission to download this file.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'Network Error';
                    errorDescription = 'Unable to connect to the server. Please check your internet connection and try again.';
                } else if (error.message.includes('quota') || error.message.includes('storage')) {
                    errorMessage = 'Storage Error';
                    errorDescription = 'Insufficient storage space to download the file.';
                }
            }

            ToastService.error(errorMessage, { description: errorDescription });
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'ingesting':
                return 'bg-blue-100 text-blue-800';
            case 'ingested':
                return 'bg-green-100 text-green-800';
            case 'deleted':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderDocumentEmbed = () => {
        const docType = document.type?.toLowerCase() || '';
        const docName = document.name?.toLowerCase() || '';

        // Handle markdown files
        if (docType === 'markdown' || docName.includes('.md') || docName.includes('.markdown')) {
            // Use actual document markdown content or fallback message
            const markdownContent = document.markdown || `# ${document.name}

## Document Preview

This document is still being processed. The markdown content will appear here once processing is complete.

### Processing Information
- **Status**: ${document.state}
- **Chunks**: ${document.chunks || 0}
- **Quality**: ${document.quality ? (document.quality * 100).toFixed(1) : '0'}%

Please check back later or refresh the page to see the processed content.`;

            return (
                <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Markdown Preview</span>
                    </div>
                    <div className="p-6 bg-white max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown 
                                components={{
                                h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                                h2: ({children}) => <h2 className="text-xl font-semibold mb-3 text-gray-800">{children}</h2>,
                                h3: ({children}) => <h3 className="text-lg font-medium mb-2 text-gray-700">{children}</h3>,
                                p: ({children}) => <p className="mb-3 text-gray-600 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-inside mb-3 text-gray-600">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside mb-3 text-gray-600">{children}</ol>,
                                li: ({children}) => <li className="mb-1">{children}</li>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
                                code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
                                pre: ({children}) => <pre className="bg-gray-100 p-3 rounded overflow-x-auto mb-3">{children}</pre>,
                                a: ({children, href}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline">{children}</a>,
                                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                em: ({children}) => <em className="italic">{children}</em>
                            }}
                            >
                            {markdownContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            );
        }

        // Handle PDF files
        if (docType === 'pdf' || docName.includes('.pdf')) {
            // Find the original PDF file
            const originalFile = files.find(f => f.fileType === 'ORIGINAL_DOCUMENT' && f.contentType === 'application/pdf');

            if (originalFile) {
                // Use the actual uploaded PDF file with the view endpoint
                const pdfUrl = `/api/files/${originalFile.id}/view`;
                return (
                    <div className="w-full h-96 sm:h-[500px] lg:h-[600px] border border-gray-300 rounded-lg overflow-hidden">
                        <iframe
                            src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(window.location.origin + pdfUrl)}`}
                            className="w-full h-full"
                            title={`PDF Viewer - ${document.name}`}
                        />
                    </div>
                );
            } else {
                // Fallback if no original file found
                return (
                    <div className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="text-4xl mb-4">📄</div>
                            <p className="text-gray-600">PDF file is being processed</p>
                            <p className="text-sm text-gray-500 mt-2">Please check back later</p>
                        </div>
                    </div>
                );
            }
        }

        if (docType === 'youtube' || docName.includes('youtube')) {
            // Using a sample educational YouTube video
            const videoId = 'dQw4w9WgXcQ'; // Sample video ID
            return (
                <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        if (docType === 'website' || docType === 'url' || docName.includes('http')) {
            // Using a sample website
            const websiteUrl = 'https://example.com';
            return (
                <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-gray-600">Preview not available for this document type</p>
                    <p className="text-sm text-gray-500 mt-2">Type: {document.type}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center space-x-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Documents</span>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words" title={document.name}>
                        {document.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500">
                            Type: {getDocumentTypeDescription(document.type, document.subType)}
                            {document.subType && ` (${document.subType})`}
                        </span>
                        <span className="text-sm text-gray-500">Version: v{document.version}</span>
                        <span className="text-sm text-gray-500">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Processing Workflow Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Processing Workflow</h2>
                        <p className="text-sm text-gray-600">
                            Execute stages in order to process your document. Optional stages can be skipped.
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <ProcessingModeToggle
                            mode={processingMode}
                            onModeChange={handleProcessingModeChange}
                            disabled={isProcessing}
                        />
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleContinueProcessing}
                            disabled={isProcessing || !hasNextStage()}
                            className="flex items-center space-x-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    <span>Continue Processing</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Stage Control Panel */}
                <StageControlPanel
                    documentId={document.id}
                    stages={stageInfos}
                    processingMode={processingMode}
                    onExecuteStage={handleExecuteStage}
                    onExecuteChain={handleExecuteChain}
                    isLoading={isProcessing}
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Original File Display */}
                    {files.find(f => f.fileType === 'ORIGINAL_DOCUMENT') && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Original File</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const originalFile = files.find(f => f.fileType === 'ORIGINAL_DOCUMENT');
                                    return originalFile ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium break-words">{originalFile.originalName || originalFile.filename}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {(originalFile.filesize / 1024 / 1024).toFixed(2)} MB • {originalFile.contentType}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadFile(originalFile.id)}
                                                className="flex-shrink-0"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    ) : null;
                                })()}
                            </CardContent>
                        </Card>
                    )}

                    {/* Document Statistics */}
                    <DocumentStatistics documentId={document.id} />

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="w-5 h-5" />
                                <span>Actions</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleReingestClick}
                                    disabled={document.state === 'ingesting'}
                                    className="flex items-center space-x-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Reingest Document</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onSupersede(document)}
                                    disabled={document.state === 'deleted'}
                                    className="flex items-center space-x-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Supersede Version</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteClick}
                                    disabled={document.state === 'deleted'}
                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Document</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="processing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-5 h-5" />
                                    <span>Processing Status</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Badge variant={(document.processingMode || 'AUTOMATIC') === 'AUTOMATIC' ? 'default' : 'secondary'}>
                                        {document.processingMode || 'AUTOMATIC'} Mode
                                    </Badge>
                                    <ProcessingModeToggle
                                        mode={document.processingMode || 'AUTOMATIC'}
                                        onModeChange={async (mode) => {
                                            try {
                                                const response = await fetch(`/api/documents/${document.id}/processing`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        processingMode: mode
                                                    })
                                                });

                                                if (!response.ok) {
                                                    throw new Error('Failed to update processing mode');
                                                }

                                                const result = await response.json();
                                                console.log('Processing mode updated:', result.message);

                                                // Refresh the document data to show updated mode
                                                window.location.reload();
                                            } catch (error) {
                                                console.error('Failed to update processing mode:', error);
                                                ToastService.error(
                                                    'Failed to update processing mode',
                                                    {
                                                        description: error instanceof Error ? error.message : 'An unexpected error occurred'
                                                    }
                                                );
                                            }
                                        }}
                                        disabled={document.state === 'ingesting'}
                                        size="sm"
                                    />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Processing Status Display */}
                                <ProcessingStatusDisplay
                                    documentId={document.id}
                                    processingMode={processingMode}
                                    stages={stageInfos}
                                    currentStage={stageInfos.find(s => s.status === 'RUNNING')?.stage}
                                    compact={false}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Processing History */}
                    <ProcessingHistory
                        documentId={document.id}
                        onExecuteStage={handleExecuteStage}
                        onViewOutput={handleViewFile}
                        onDownloadOutput={handleDownloadFile}
                    />

                    {/* Quick Stage Execution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="w-5 h-5" />
                                <span>Quick Stage Execution</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {['MARKDOWN_CONVERSION', 'CHUNKER', 'INGESTOR'].map((stage) => (
                                    <Button
                                        key={stage}
                                        variant="outline"
                                        onClick={() => handleExecuteStage(stage)}
                                        disabled={isExecutingStage}
                                        className="flex items-center space-x-2 h-auto py-3"
                                    >
                                        <Activity className="w-4 h-4" />
                                        <span className="text-sm">{stage.replace('_', ' ')}</span>
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Click any stage to execute it for this document. Make sure you&apos;re logged in.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="files" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="w-5 h-5" />
                                <span>All Files</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingFiles ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-sm text-gray-600">Loading files...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {files.map((file) => (
                                        <div key={file.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                <FileText className="w-6 h-6 text-gray-600 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium break-words">{file.originalName || file.filename}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {file.fileType} {file.stage && `• ${file.stage}`} •
                                                        {(file.filesize / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownloadFile(file.id)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {files.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">No files found</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Eye className="w-5 h-5" />
                                <span>Document Preview</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderDocumentEmbed()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* File Viewing Modal */}
            <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="break-words">
                            {viewingFile?.originalName || viewingFile?.filename}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {viewingFile && (
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600">
                                    <p><strong>Type:</strong> {viewingFile.contentType}</p>
                                    <p><strong>Size:</strong> {(viewingFile.filesize / 1024).toFixed(2)} KB</p>
                                    <p><strong>Stage:</strong> {viewingFile.stage || 'N/A'}</p>
                                    <p><strong>Created:</strong> {new Date(viewingFile.createdAt).toLocaleString()}</p>
                                </div>

                                {viewingFile.content && (
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <h4 className="font-medium mb-2">Content Preview:</h4>
                                        <pre className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                                            {viewingFile.content}
                                        </pre>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownloadFile(viewingFile.id)}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button onClick={() => setViewingFile(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
