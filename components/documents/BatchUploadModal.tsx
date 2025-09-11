'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Progress,
  Badge,
  Card,
  CardContent,
  Separator,
  Checkbox,
  Select,
  Input,
  Label,
  Textarea
} from '@/components/ui';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Loader2,
  Plus,
  Settings
} from 'lucide-react';
// Using CSS transitions instead of framer-motion for animations
import { useDocumentUpload } from '@/lib/hooks/useDocuments';
import type { UploadProgress } from '@/lib/mockData/documentMockData';

export interface BatchUploadModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Target realm ID for uploads */
  realmId: string;
  /** Available realms for selection */
  availableRealms?: Array<{ id: string; name: string }>;
  /** Callback when upload completes successfully */
  onUploadComplete?: (documentIds: string[]) => void;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Allowed file types */
  allowedTypes?: string[];
  /** Whether to auto-process uploaded documents */
  autoProcess?: boolean;
}

interface UploadItem extends UploadProgress {
  file: File;
  documentId?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
  if (type.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
  if (type.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
  if (type === 'application/pdf' || type.startsWith('text/')) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  open,
  onClose,
  realmId,
  availableRealms = [],
  onUploadComplete,
  maxFiles = 20,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'image/*',
    'video/*',
    'audio/*'
  ],
  autoProcess = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [selectedRealm, setSelectedRealm] = useState(realmId);
  const [uploadMetadata, setUploadMetadata] = useState({
    tags: '',
    description: '',
    autoProcess
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { uploadDocuments, isUploading } = useDocumentUpload();

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        console.warn(`File ${file.name} exceeds maximum size`);
        return false;
      }

      // Check file type
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        console.warn(`File type ${file.type} not allowed for ${file.name}`);
        return false;
      }

      return true;
    });

    // Limit total files
    const totalFiles = selectedFiles.length + validFiles.length;
    const filesToAdd = totalFiles > maxFiles 
      ? validFiles.slice(0, maxFiles - selectedFiles.length)
      : validFiles;

    setSelectedFiles(prev => [...prev, ...filesToAdd]);
  }, [selectedFiles.length, maxFiles, maxFileSize, allowedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Initialize upload items
      const items: UploadItem[] = selectedFiles.map((file, index) => ({
        fileId: `upload-${Date.now()}-${index}`,
        filename: file.name,
        progress: 0,
        status: 'uploading' as const,
        speed: undefined,
        eta: undefined,
        error: undefined,
        file
      }));

      setUploadItems(items);

      // Prepare metadata
      const metadata = {
        tags: uploadMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        description: uploadMetadata.description || undefined
      };

      // Start upload
      const response = await uploadDocuments(
        selectedFiles,
        selectedRealm,
        {
          metadata,
          autoProcess: uploadMetadata.autoProcess,
          onProgress: (fileId, progress) => {
            setUploadItems(prev => prev.map(item => 
              item.fileId === fileId ? { ...item, progress } : item
            ));
          },
          onFileComplete: (fileId, documentId) => {
            setUploadItems(prev => prev.map(item => 
              item.fileId === fileId 
                ? { ...item, status: 'completed', documentId }
                : item
            ));
          },
          onFileError: (fileId, error) => {
            setUploadItems(prev => prev.map(item => 
              item.fileId === fileId 
                ? { ...item, status: 'failed', error: error.message }
                : item
            ));
          }
        }
      );

      if (response) {
        const documentIds = response.documents.map(doc => doc.id);
        onUploadComplete?.(documentIds);
        
        // Auto-close on successful completion
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [selectedFiles, selectedRealm, uploadMetadata, uploadDocuments, onUploadComplete]);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFiles([]);
      setUploadItems([]);
      setUploadMetadata({
        tags: '',
        description: '',
        autoProcess: true
      });
      setShowAdvanced(false);
      onClose();
    }
  }, [isUploading, onClose]);

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const completedUploads = uploadItems.filter(item => item.status === 'completed').length;
  const failedUploads = uploadItems.filter(item => item.status === 'failed').length;
  const overallProgress = uploadItems.length > 0 
    ? Math.round(uploadItems.reduce((sum, item) => sum + item.progress, 0) / uploadItems.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Batch Upload Documents</DialogTitle>
          <DialogDescription>
            Upload multiple documents to {availableRealms.find(r => r.id === selectedRealm)?.name || 'the selected realm'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Upload Configuration */}
          <div className="space-y-4">
            {availableRealms.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="realm-select">Target Realm</Label>
                <Select
                  value={selectedRealm}
                  onValueChange={setSelectedRealm}
                  disabled={isUploading}
                >
                  {availableRealms.map(realm => (
                    <option key={realm.id} value={realm.id}>
                      {realm.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Advanced Settings Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-process"
                  checked={uploadMetadata.autoProcess}
                  onCheckedChange={(checked) => 
                    setUploadMetadata(prev => ({ ...prev, autoProcess: !!checked }))
                  }
                  disabled={isUploading}
                />
                <Label htmlFor="auto-process" className="text-sm">
                  Auto-process documents after upload
                </Label>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={isUploading}
              >
                <Settings className="h-4 w-4 mr-1" />
                Advanced
              </Button>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-4 pt-4 border-t transition-all duration-200 animate-in fade-in-0 slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={uploadMetadata.tags}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="document, batch-upload, 2024"
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadMetadata.description}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description for all uploaded documents..."
                      disabled={isUploading}
                      rows={3}
                    />
                  </div>
                </div>
              )}
          </div>

          {/* File Selection Area */}
          {!isUploading && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Maximum {maxFiles} files, {formatFileSize(maxFileSize)} each
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                accept={allowedTypes.join(',')}
              />
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="text-xs text-muted-foreground">
                  Total: {formatFileSize(totalSize)}
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const uploadItem = uploadItems.find(item => item.file === file);
                  
                  return (
                    <Card key={`${file.name}-${index}`} className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">
                          {getFileIcon(file.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </span>
                              
                              {uploadItem ? (
                                <div className="flex items-center gap-1">
                                  {uploadItem.status === 'completed' && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  {uploadItem.status === 'failed' && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  {uploadItem.status === 'uploading' && (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                  )}
                                </div>
                              ) : !isUploading && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {uploadItem && (
                            <div className="mt-2 space-y-1">
                              <Progress value={uploadItem.progress} className="h-1" />
                              {uploadItem.error && (
                                <p className="text-xs text-red-500">{uploadItem.error}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Progress Summary */}
          {isUploading && uploadItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Upload Progress</h3>
                <div className="text-sm text-muted-foreground">
                  {completedUploads} of {uploadItems.length} completed
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={overallProgress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Overall Progress: {overallProgress}%</span>
                  {failedUploads > 0 && (
                    <span className="text-red-500">{failedUploads} failed</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Cancel'}
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchUploadModal;