'use client';

import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { Upload, AlertCircle } from 'lucide-react';
import FileDropzone from './FileDropzone';
import FileTypeValidator, { SupportedTypesInfo } from './FileTypeValidator';
import UploadProgress, { UploadFileProgress } from './UploadProgress';
import { ProcessingPipeline } from '@/components/pipeline/ProcessingPipeline';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useApi } from '@/lib/hooks/useApi';
import { 
  FileValidationResult,
  MAX_FILES_COUNT 
} from '@/lib/utils/fileValidation';

export interface DocumentUploadProps {
  onUploadComplete?: (files: File[]) => void;
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (progress: { [fileId: string]: number }) => void;
  onPipelineUpdate?: (fileId: string, stage: string, status: string) => void;
  disabled?: boolean;
  className?: string;
  showPipeline?: boolean;
}

export function DocumentUpload({
  onUploadComplete,
  onUploadStart,
  onUploadProgress,
  onPipelineUpdate,
  disabled = false,
  className = '',
  showPipeline = true
}: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadFileProgress[]>([]);
  const [validationResult, setValidationResult] = React.useState<FileValidationResult>({ isValid: true, errors: [] });
  const [isUploading, setIsUploading] = React.useState(false);
  const [showSupportedTypes, setShowSupportedTypes] = React.useState(false);
  const [uploadedDocuments, setUploadedDocuments] = React.useState<{ id: string; name: string; pipelineId: string }[]>([]);

  // API hooks for upload simulation
  const { execute: uploadDocument, error: apiError } = useApi('POST', '/api/documents/upload', {
    enabled: undefined,
    onSuccess: undefined,
    onError: undefined,
    headers: undefined,
    params: undefined,
    body: undefined,
    timeout: undefined,
    retries: undefined,
    cache: undefined,
    cacheTTL: undefined,
    signal: undefined,
    retry: { attempts: 3, delay: 1000, backoff: 'exponential' }
  });

  const handleFilesSelected = React.useCallback((newFiles: File[]) => {
    setSelectedFiles(prev => {
      // Prevent duplicates and respect max files limit
      const existingNames = new Set(prev.map(f => f.name));
      const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
      const totalFiles = prev.length + uniqueNewFiles.length;
      
      if (totalFiles > MAX_FILES_COUNT) {
        const availableSlots = MAX_FILES_COUNT - prev.length;
        const filesToAdd = uniqueNewFiles.slice(0, availableSlots);
        
        if (availableSlots === 0) {
          // Show toast notification
          console.warn(`Maximum ${MAX_FILES_COUNT} files allowed`);
        } else if (uniqueNewFiles.length > availableSlots) {
          console.warn(`Only ${availableSlots} more files can be added (${MAX_FILES_COUNT} maximum)`);
        }
        
        return [...prev, ...filesToAdd];
      }
      
      return [...prev, ...uniqueNewFiles];
    });
  }, []);

  const handleRemoveFile = React.useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleValidationChange = React.useCallback((_isValid: boolean, result: FileValidationResult) => {
    setValidationResult(result);
  }, []);

  const simulateUpload = React.useCallback(async (files: File[]): Promise<void> => {
    const uploadProgressFiles: UploadFileProgress[] = files.map(file => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadingFiles(uploadProgressFiles);
    onUploadStart?.(files);

    // Simulate upload progress for each file using API
    for (let i = 0; i < uploadProgressFiles.length; i++) {
      const fileProgress = uploadProgressFiles[i];
      
      if (!fileProgress) continue;
      
      try {
        // Update status to uploading
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileProgress.id ? { ...f, status: 'uploading' } : f)
        );

        // Create FormData for API call
        const formData = new FormData();
        formData.append('file', fileProgress.file);
        formData.append('filename', fileProgress.file.name);
        formData.append('size', fileProgress.file.size.toString());

        // Simulate upload with API client (which handles the mock internally)
        const uploadDuration = Math.random() * 3000 + 1000; // 1-4 seconds
        const steps = 20;
        const stepDuration = uploadDuration / steps;
      
      for (let step = 0; step <= steps; step++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        
        const progress = Math.min(100, Math.round((step / steps) * 100));
        const speed = fileProgress.file.size / (uploadDuration / 1000); // bytes per second
        const eta = Math.max(0, Math.round((uploadDuration - (step * stepDuration)) / 1000));
        
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileProgress.id ? { 
            ...f, 
            progress, 
            ...(step < steps ? { speed, eta } : {})
          } : f)
        );
      }

        // Use API client for upload simulation  
        const response = await uploadDocument({
          method: undefined,
          headers: { 'Content-Type': 'multipart/form-data' },
          params: undefined,
          body: undefined,
          timeout: undefined,
          retries: undefined,
          cache: undefined,
          cacheTTL: undefined,
          signal: undefined,
          // In a real implementation, you'd pass the FormData to the POST method
          // For our mock, we'll simulate the file upload
        });

        if (response.success) {
          // Move to processing phase
          setUploadingFiles(prev => 
            prev.map(f => f.id === fileProgress.id ? { 
              ...f, 
              status: 'processing' as const
            } : f)
          );

          // Create pipeline for this document
          const pipelineId = `pipeline_${fileProgress.id}`;
          const documentData = {
            id: response.data?.documentId || `doc_${fileProgress.id}`,
            name: fileProgress.file.name,
            pipelineId
          };
          
          setUploadedDocuments(prev => [...prev, documentData]);
          onPipelineUpdate?.(fileProgress.id, 'markdown-conversion', 'running');

          // Simulate processing completion
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

          // Mark as completed
          setUploadingFiles(prev => 
            prev.map(f => f.id === fileProgress.id ? { 
              ...f, 
              status: 'completed' as const
            } : f)
          );
          
          onPipelineUpdate?.(fileProgress.id, 'ingestor', 'completed');

          // Report progress
          onUploadProgress?.({ [fileProgress.id]: 100 });
        } else {
          throw new Error(response.error?.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error for file:', fileProgress.file.name, error);
        
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileProgress.id ? { 
            ...f, 
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Upload failed due to network error. Please try again.'
          } : f)
        );
      }
    }
  }, [onUploadStart, onUploadProgress, onPipelineUpdate, uploadDocument]);

  const handleUpload = React.useCallback(async () => {
    if (!validationResult.isValid || selectedFiles.length === 0 || isUploading) {
      return;
    }

    setIsUploading(true);
    
    try {
      await simulateUpload(selectedFiles);
      
      // Call completion callback with successfully uploaded files
      const completedFiles = uploadingFiles
        .filter(f => f.status === 'completed')
        .map(f => f.file);
      
      onUploadComplete?.(completedFiles);
      
      // Clear selected files after successful upload
      setSelectedFiles([]);
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [validationResult.isValid, selectedFiles, isUploading, simulateUpload, uploadingFiles, onUploadComplete]);

  const handleCancelUpload = React.useCallback((fileId: string) => {
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, status: 'cancelled' as const } : f)
    );
  }, []);

  const handleRetryUpload = React.useCallback(async (fileId: string) => {
    const fileToRetry = uploadingFiles.find(f => f.id === fileId);
    if (!fileToRetry) return;

    await simulateUpload([fileToRetry.file]);
  }, [uploadingFiles, simulateUpload]);

  const handleRemoveFromProgress = React.useCallback((fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const canUpload = validationResult.isValid && selectedFiles.length > 0 && !isUploading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Documents
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSupportedTypes(!showSupportedTypes)}
              className="text-sm text-muted-foreground"
            >
              {showSupportedTypes ? 'Hide' : 'Show'} supported types
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Supported Types Info */}
          {showSupportedTypes && (
            <SupportedTypesInfo className="p-4 bg-gray-50 rounded-lg" />
          )}

          {/* File Dropzone */}
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            selectedFiles={selectedFiles}
            onRemoveFile={handleRemoveFile}
            disabled={disabled || isUploading}
            maxFiles={MAX_FILES_COUNT}
          />

          {/* File Validation */}
          <FileTypeValidator
            files={selectedFiles}
            onValidationChange={handleValidationChange}
            showDetails={true}
          />

          {/* Upload Actions */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFiles([])}
                  disabled={isUploading}
                  size="sm"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!canUpload}
                  className="min-w-[100px]"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <UploadProgress
          files={uploadingFiles}
          onCancel={handleCancelUpload}
          onRetry={handleRetryUpload}
          onRemove={handleRemoveFromProgress}
          showOverallProgress={true}
        />
      )}

      {/* API Error Display */}
      {apiError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-destructive">Upload API Error</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {apiError.message || 'An unexpected error occurred during upload.'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Visualization for Uploaded Documents */}
      {showPipeline && uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Pipeline</CardTitle>
            <CardDescription>
              Track the processing status of your uploaded documents through our 5-stage pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {uploadedDocuments.map((doc) => (
              <ErrorBoundary
                key={doc.id}
                fallback={({ onRetry }) => (
                  <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 text-center space-y-2">
                    <AlertCircle className="h-5 w-5 text-destructive mx-auto" />
                    <div className="text-sm text-destructive">
                      Pipeline visualization error for {doc.name}
                    </div>
                    <Button size="sm" variant="outline" onClick={onRetry}>
                      Retry
                    </Button>
                  </div>
                )}
                onError={(_error, errorInfo) => {
                  console.error('Pipeline visualization error:', _error, errorInfo);
                }}
              >
                <div className="space-y-3">
                  <div className="text-sm font-medium">{doc.name}</div>
                  <ProcessingPipeline
                    pipelineId={doc.pipelineId}
                    size="default"
                    layout="horizontal"
                    className="w-full"
                  />
                </div>
              </ErrorBoundary>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DocumentUpload;