'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Progress
} from '@/components/ui';
import { 
  Search,
  Download,
  Trash2,
  Eye,
  Clock,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { ProcessingPipeline } from '@/components/pipeline/ProcessingPipeline';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import type { DocumentMetadata as Document } from '@/lib/mockData/documentMockData';

export interface DocumentListProps {
  className?: string;
  onDocumentClick?: (document: Document) => void;
  showPipeline?: boolean;
  searchEnabled?: boolean;
}

// Get appropriate icon for file type
const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
      return <FileText className="h-5 w-5" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <FileImage className="h-5 w-5" />;
    case 'mp4':
    case 'webm':
    case 'mov':
      return <FileVideo className="h-5 w-5" />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FileAudio className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get status color for processing state
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'ingested':
      return 'bg-green-100 text-green-800';
    case 'processing':
    case 'ingesting':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const DocumentList: React.FC<DocumentListProps> = ({
  className = '',
  onDocumentClick,
  showPipeline = true,
  searchEnabled = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch documents using data hooks
  const {
    data: documents,
    loading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments
  } = useAsyncData<Document[]>('documents', async () => {
    const response = await fetch('/api/documents');
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  });

  // Get processing statistics
  const {
    data: stats,
    loading: statsLoading
  } = useAsyncData<{
    total: number;
    completed: number;
    processing: number;
    failed: number;
  }>('documents/stats', async () => {
    const response = await fetch('/api/documents/stats');
    if (!response.ok) throw new Error('Failed to fetch document stats');
    return response.json();
  });

  // Filter and sort documents
  const filteredAndSortedDocuments = React.useMemo(() => {
    if (!documents) return [];

    let filtered = documents.filter(doc => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          doc.name.toLowerCase().includes(query) ||
          doc.uploadedBy.toLowerCase().includes(query) ||
          doc.type.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filterType !== 'all' && doc.type.toLowerCase() !== filterType.toLowerCase()) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && doc.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }

      return true;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchQuery, filterType, filterStatus, sortBy, sortOrder]);

  const handleDocumentAction = (action: string, document: Document) => {
    switch (action) {
      case 'view':
        onDocumentClick?.(document);
        break;
      case 'download':
        // Simulate download
        console.log('Downloading document:', document.name);
        break;
      case 'delete':
        // Simulate delete (would show confirmation dialog)
        console.log('Delete document:', document.name);
        break;
    }
  };

  const handleRefresh = () => {
    refetchDocuments();
  };

  if (documentsError) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Failed to load documents</h3>
          <p className="text-sm text-muted-foreground mt-1">{documentsError.message}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Document Statistics */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      {searchEnabled && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name, author, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Document</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="size-desc">Largest First</option>
                  <option value="size-asc">Smallest First</option>
                </select>

                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active filters indicator */}
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filterType}
                  <button
                    onClick={() => setFilterType('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterStatus !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      {documentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload some documents to get started'}
          </p>
          {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="text-muted-foreground">
                      {getFileIcon(document.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate" title={document.name}>
                        {document.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {document.type.toUpperCase()} • {formatFileSize(document.size)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      className={`text-xs ${getStatusColor(document.status)}`}
                      variant="secondary"
                    >
                      {document.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Document Metadata */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Uploaded {new Date(document.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <div>Uploaded by: {document.uploadedBy}</div>
                </div>

                {/* Processing Pipeline */}
                {showPipeline && document.processingStage && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Processing Pipeline:</div>
                    <ProcessingPipeline
                      pipelineId={document.id}
                      size="sm"
                      layout="compact"
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Processing Progress */}
                {document.status === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Processing...</span>
                      <span>{document.progress || 0}%</span>
                    </div>
                    <Progress value={document.progress || 0} className="h-2" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDocumentAction('view', document)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDocumentAction('download', document)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDocumentAction('delete', document)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;