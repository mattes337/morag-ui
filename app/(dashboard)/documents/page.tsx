'use client';

import React from 'react';
import { 
  Card, 
  CardContent,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Upload
} from 'lucide-react';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { 
  mockDocumentStats,
  formatFileSize
} from '@/lib/mockData/documentMockData';

export default function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleUploadComplete = React.useCallback((files: File[]) => {
    // Trigger a refresh of the document list
    setRefreshTrigger(prev => prev + 1);
    console.log('Upload completed for files:', files.map(f => f.name));
  }, []);

  const handleUploadProgress = React.useCallback((progress: { [fileId: string]: number }) => {
    console.log('Upload progress:', progress);
  }, []);

  const handlePipelineUpdate = React.useCallback((fileId: string, stage: string, status: string) => {
    console.log('Pipeline update:', { fileId, stage, status });
  }, []);

  const handleDocumentClick = React.useCallback((document: any) => {
    console.log('Document clicked:', document);
    // Could navigate to document detail page or open preview
  }, []);


  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Documents
          </h1>
          <p className="text-muted-foreground">
            Upload, manage, and process your document library
          </p>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{mockDocumentStats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">{mockDocumentStats.processing}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{mockDocumentStats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold">{formatFileSize(mockDocumentStats.totalSize)}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload and Document Management */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="manage">Manage Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Document Upload with Error Boundary */}
            <ErrorBoundary
              fallback={({ onRetry }) => (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-6 text-center space-y-4">
                    <Upload className="h-8 w-8 text-destructive mx-auto" />
                    <h3 className="text-lg font-semibold text-destructive">Upload Error</h3>
                    <p className="text-sm text-muted-foreground">
                      There was a problem with the document upload component. Please try again.
                    </p>
                    <Button onClick={onRetry} variant="outline">
                      Retry Upload Component
                    </Button>
                  </CardContent>
                </Card>
              )}
              onError={(error, errorInfo) => {
                console.error('Document upload error:', error, errorInfo);
              }}
            >
              <DocumentUpload 
                onUploadComplete={handleUploadComplete}
                onUploadProgress={handleUploadProgress}
                onPipelineUpdate={handlePipelineUpdate}
                showPipeline={true}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Document List with Error Boundary */}
            <ErrorBoundary
              fallback={({ onRetry }) => (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-6 text-center space-y-4">
                    <FileText className="h-8 w-8 text-destructive mx-auto" />
                    <h3 className="text-lg font-semibold text-destructive">Document List Error</h3>
                    <p className="text-sm text-muted-foreground">
                      There was a problem loading the document list. Please try again.
                    </p>
                    <Button onClick={onRetry} variant="outline">
                      Retry Document List
                    </Button>
                  </CardContent>
                </Card>
              )}
              onError={(error, errorInfo) => {
                console.error('Document list error:', error, errorInfo);
              }}
            >
              <DocumentList 
                key={refreshTrigger}
                onDocumentClick={handleDocumentClick}
                showPipeline={true}
                searchEnabled={true}
                className="w-full"
              />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}