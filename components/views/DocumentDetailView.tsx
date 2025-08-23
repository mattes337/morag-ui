'use client';

import React, { useState, useEffect } from 'react';
import { Document } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { getDocumentTypeDescription } from '../../lib/utils/documentTypeDetection';
import { ProcessingStatusDisplay } from '../ui/processing-status-display';
import { ProcessingModeToggle } from '../ui/processing-mode-toggle';
import { ProcessingWorkflowManager } from '../ui/processing-workflow-manager';
import { ProcessingHistory } from '../ui/processing-history';
import { DocumentStatistics } from '../ui/document-statistics';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Activity,
  Settings,
  FileText,
  Download,
  Eye,
  Clock,
  User,
  Database,
  BarChart3,
  RotateCcw,
  Trash2
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
    const {
        setShowReingestConfirmDialog,
        setDocumentToReingest,
        setShowDeleteConfirmDialog,
        setDocumentToDelete,
    } = useApp();

    const [activeTab, setActiveTab] = useState('overview');
    const [files, setFiles] = useState<DocumentFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);

    useEffect(() => {
        loadDocumentFiles();
    }, [document.id]);

    const loadDocumentFiles = async () => {
        try {
          setIsLoadingFiles(true);
          const response = await fetch(`/api/files?documentId=${document.id}`);
          if (response.ok) {
            const data = await response.json();
            setFiles(data.files || []);
          }
        } catch (error) {
          console.error('Failed to load document files:', error);
        } finally {
          setIsLoadingFiles(false);
        }
    };

    const handleReingestClick = () => {
        setDocumentToReingest(document);
        setShowReingestConfirmDialog(true);
    };

    const handleDeleteClick = () => {
        setDocumentToDelete(document);
        setShowDeleteConfirmDialog(true);
    };

    const handleDownloadFile = async (fileId: string) => {
        try {
          const response = await fetch(`/api/files/${fileId}/download`);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = files.find(f => f.id === fileId)?.originalName || 'download';
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
          }
        } catch (error) {
          console.error('Failed to download file:', error);
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
        const docType = document.type.toLowerCase();
        const docName = document.name.toLowerCase();

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

        // For testing purposes, using publicly available files
        if (docType === 'pdf' || docName.includes('.pdf')) {
            // Using a sample PDF from Mozilla
            const pdfUrl =
                'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
            return (
                <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                    />
                </div>
            );
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{document.name}</h1>
                    <div className="flex items-center space-x-4 mt-2">
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

                {/* Action Buttons */}
                <div className="flex space-x-3"></div>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
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
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-8 h-8 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">{originalFile.originalName || originalFile.filename}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {(originalFile.filesize / 1024 / 1024).toFixed(2)} MB • {originalFile.contentType}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadFile(originalFile.id)}
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
                                                // TODO: Show error toast to user
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
                                    processingMode={document.processingMode || 'AUTOMATIC'}
                                    stages={[
                                        {
                                            stage: 'MARKDOWN_CONVERSION',
                                            status: document.state === 'ingested' ? 'COMPLETED' :
                                                   document.state === 'ingesting' ? 'RUNNING' : 'PENDING'
                                        },
                                        {
                                            stage: 'CHUNKER',
                                            status: document.state === 'ingested' ? 'COMPLETED' :
                                                   document.state === 'ingesting' ? 'PENDING' : 'PENDING'
                                        },
                                        {
                                            stage: 'INGESTOR',
                                            status: document.state === 'ingested' ? 'COMPLETED' :
                                                   document.state === 'ingesting' ? 'PENDING' : 'PENDING'
                                        }
                                    ]}
                                    currentStage={document.state === 'ingesting' ? 'MARKDOWN_CONVERSION' : undefined}
                                    compact={false}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Processing History */}
                    <ProcessingHistory
                        documentId={document.id}
                        onExecuteStage={async (stage) => {
                            // TODO: Implement stage execution
                            console.log('Execute stage:', stage);
                        }}
                        onViewOutput={(fileId) => {
                            // TODO: Implement file viewing
                            console.log('View file:', fileId);
                        }}
                        onDownloadOutput={handleDownloadFile}
                    />
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
                                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-6 h-6 text-gray-600" />
                                                <div>
                                                    <p className="font-medium">{file.originalName || file.filename}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {file.fileType} {file.stage && `• ${file.stage}`} •
                                                        {(file.filesize / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
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
        </div>
    );
}
