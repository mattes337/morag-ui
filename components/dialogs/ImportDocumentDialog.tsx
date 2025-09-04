'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Upload, FileText, Zap, Scissors, Brain, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useApp } from '../../contexts/AppContext';
import { ToastService } from '../../lib/services/toastService';

interface ImportDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProcessingStage = 'MARKDOWN_CONVERSION' | 'MARKDOWN_OPTIMIZER' | 'CHUNKER' | 'FACT_GENERATOR' | 'INGESTOR';

interface StageFile {
  stage: ProcessingStage;
  file: File | null;
  isValid: boolean;
  error?: string;
}

const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Markdown Conversion',
    icon: FileText,
    description: 'Converted markdown content',
    expectedExtensions: ['.md', '.txt'],
    color: 'text-blue-500'
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Markdown Optimizer',
    icon: Zap,
    description: 'Optimized markdown content',
    expectedExtensions: ['.opt.md', '.md'],
    color: 'text-yellow-500'
  },
  CHUNKER: {
    name: 'Text Chunking',
    icon: Scissors,
    description: 'Chunked text data',
    expectedExtensions: ['.chunks.json'],
    color: 'text-green-500'
  },
  FACT_GENERATOR: {
    name: 'Fact Generation',
    icon: Brain,
    description: 'Extracted facts and entities',
    expectedExtensions: ['.facts.json'],
    color: 'text-purple-500'
  },
  INGESTOR: {
    name: 'Document Ingestion',
    icon: Database,
    description: 'Ingestion completion marker',
    expectedExtensions: ['.ingested', '.json'],
    color: 'text-indigo-500'
  }
};

export function ImportDocumentDialog({ isOpen, onClose }: ImportDocumentDialogProps) {
  const { currentRealm, refreshData } = useApp();
  const [documentName, setDocumentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stageFiles, setStageFiles] = useState<StageFile[]>(() =>
    Object.keys(STAGE_CONFIG).map(stage => ({
      stage: stage as ProcessingStage,
      file: null,
      isValid: false
    }))
  );

  const validateFile = (file: File, stage: ProcessingStage): { isValid: boolean; error?: string } => {
    const config = STAGE_CONFIG[stage];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!config.expectedExtensions.some(ext => extension.endsWith(ext.toLowerCase()))) {
      return {
        isValid: false,
        error: `Expected ${config.expectedExtensions.join(' or ')} file, got ${extension}`
      };
    }

    // Additional validation for JSON files
    if (extension === '.json' && (stage === 'CHUNKER' || stage === 'FACT_GENERATOR')) {
      // We'll validate JSON structure when reading the file
      return { isValid: true };
    }

    return { isValid: true };
  };

  const handleFileSelect = (stage: ProcessingStage, file: File) => {
    const validation = validateFile(file, stage);
    
    setStageFiles(prev => prev.map(sf => 
      sf.stage === stage 
        ? { ...sf, file, isValid: validation.isValid, error: validation.error }
        : sf
    ));
  };

  // Create dropzone configurations for each stage
  const dropzoneConfigs = Object.keys(STAGE_CONFIG).reduce((acc, stage) => {
    const config = STAGE_CONFIG[stage as ProcessingStage];
    acc[stage as ProcessingStage] = {
      onDrop: (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
          handleFileSelect(stage as ProcessingStage, acceptedFiles[0]);
        }
      },
      accept: {
        'text/*': ['.md', '.txt'],
        'application/json': ['.json'],
        '*/*': config.expectedExtensions
      },
      maxFiles: 1,
      multiple: false
    };
    return acc;
  }, {} as Record<ProcessingStage, any>);

  const handleSubmit = async () => {
    if (!documentName.trim()) {
      ToastService.error('Please enter a document name');
      return;
    }

    if (!currentRealm) {
      ToastService.error('No realm selected');
      return;
    }

    // Check if at least one file is provided
    const validFiles = stageFiles.filter(sf => sf.file && sf.isValid);
    if (validFiles.length === 0) {
      ToastService.error('Please provide at least one valid stage file');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the document first
      const documentData = {
        name: documentName.trim(),
        type: 'imported',
        subType: 'manual',
        realmId: currentRealm.id,
        processingMode: 'MANUAL' // Always manual for imported documents
      };

      const documentResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!documentResponse.ok) {
        const errorData = await documentResponse.json();
        throw new Error(errorData.error || 'Failed to create document');
      }

      const { document } = await documentResponse.json();

      // Upload each stage file
      for (const stageFile of validFiles) {
        const formData = new FormData();
        formData.append('file', stageFile.file!);
        formData.append('documentId', document.id);
        formData.append('stage', stageFile.stage);
        formData.append('fileType', 'STAGE_OUTPUT');

        const uploadResponse = await fetch('/api/documents/import-stage-file', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(`Failed to upload ${stageFile.stage} file: ${errorData.error}`);
        }
      }

      ToastService.success(`Document "${documentName}" imported successfully with ${validFiles.length} stage files`);
      
      // Refresh the documents list
      await refreshData();
      
      handleClose();
    } catch (error) {
      console.error('Failed to import document:', error);
      ToastService.error(error instanceof Error ? error.message : 'Failed to import document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDocumentName('');
      setStageFiles(Object.keys(STAGE_CONFIG).map(stage => ({
        stage: stage as ProcessingStage,
        file: null,
        isValid: false
      })));
      onClose();
    }
  };

  const validFilesCount = stageFiles.filter(sf => sf.file && sf.isValid).length;
  const canSubmit = documentName.trim() && validFilesCount > 0 && !isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-500" />
            Import Document
          </DialogTitle>
          <DialogDescription>
            Import a document with pre-processed stage files. All processing will be set to manual mode.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name..."
              disabled={isSubmitting}
            />
          </div>

          {/* Stage Files */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Stage Files</h3>
              <span className="text-sm text-gray-500">({validFilesCount} files selected)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(STAGE_CONFIG).map(([stage, config]) => {
                const stageFile = stageFiles.find(sf => sf.stage === stage);
                const Icon = config.icon;

                return (
                  <StageFileCard
                    key={stage}
                    stage={stage as ProcessingStage}
                    config={config}
                    stageFile={stageFile!}
                    dropzoneConfig={dropzoneConfigs[stage as ProcessingStage]}
                    isSubmitting={isSubmitting}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {validFilesCount > 0 ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {validFilesCount} stage file{validFilesCount !== 1 ? 's' : ''} ready
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Select at least one stage file
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isSubmitting ? 'Importing...' : 'Import Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StageFileCardProps {
  stage: ProcessingStage;
  config: typeof STAGE_CONFIG[ProcessingStage];
  stageFile: StageFile;
  dropzoneConfig: any;
  isSubmitting: boolean;
}

function StageFileCard({ stage, config, stageFile, dropzoneConfig, isSubmitting }: StageFileCardProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);
  const Icon = config.icon;

  return (
    <Card className={`transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${config.color}`} />
          {config.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : stageFile.file && stageFile.isValid
              ? 'border-green-500 bg-green-50'
              : stageFile.file && !stageFile.isValid
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} disabled={isSubmitting} />
          
          {stageFile.file ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                {stageFile.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium">{stageFile.file.name}</p>
              <p className="text-xs text-gray-500">
                {(stageFile.file.size / 1024).toFixed(1)} KB
              </p>
              {stageFile.error && (
                <p className="text-xs text-red-500">{stageFile.error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-6 w-6 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop file here' : 'Click or drag file'}
              </p>
              <p className="text-xs text-gray-500">
                {config.expectedExtensions.join(', ')}
              </p>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">{config.description}</p>
      </CardContent>
    </Card>
  );
}
