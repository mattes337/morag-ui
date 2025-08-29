'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, Link, Sparkles, Settings, ArrowRight, ArrowLeft, MousePointer2 } from 'lucide-react';
import { TemplateSelector } from '@/components/ui/processing/template-selector';
import { ProcessingTemplate, ProcessingTemplateService } from '@/lib/processing/templates';
import { useApp } from '@/contexts/AppContext';
import { ToastService } from '@/lib/services/toastService';
import { fetchVideoTitleWithFallback, isYouTubeUrl, generateDocumentNameFromTitle, YouTubeVideoInfo } from '@/lib/utils/youtubeUtils';
import { YouTubeInputHandler } from '@/components/ui/youtube/YouTubeInputHandler';

interface EasyModeDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToExpert?: () => void;
}

type Step = 'source' | 'youtube' | 'template';

export function EasyModeDocumentDialog({
  isOpen,
  onClose,
  onSwitchToExpert
}: EasyModeDocumentDialogProps) {
  const { currentRealm, refreshData } = useApp();
  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessingTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // YouTube-specific state
  const [youtubeVideoInfo, setYoutubeVideoInfo] = useState<YouTubeVideoInfo | null>(null);

  // Auto-select recommended template when file is selected
  useEffect(() => {
    if (selectedFile && !selectedTemplate) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      const recommended = ProcessingTemplateService.getRecommendedTemplates(fileExtension);
      if (recommended.length > 0) {
        setSelectedTemplate(recommended[0]);
      }
    }
  }, [selectedFile, selectedTemplate]);

  // Auto-select recommended template when URL is entered
  useEffect(() => {
    if (documentUrl && !selectedTemplate) {
      let urlType = 'url';
      if (documentUrl.includes('youtube.com') || documentUrl.includes('youtu.be')) {
        urlType = 'youtube';
      } else if (documentUrl.startsWith('http')) {
        urlType = 'website';
      }
      
      const recommended = ProcessingTemplateService.getRecommendedTemplates(urlType);
      if (recommended.length > 0) {
        setSelectedTemplate(recommended[0]);
      }
    }
  }, [documentUrl, selectedTemplate]);

  const getUrlType = (url: string): string => {
    if (isYouTubeUrl(url)) return 'youtube';
    if (url.match(/\.(pdf|docx?|txt|md)$/i)) return url.split('.').pop()?.toLowerCase() || 'url';
    return 'url';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentUrl(''); // Clear URL if file is selected
      setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
      setCurrentStep('template');
    }
  };

  const handleUrlChange = async (url: string) => {
    setDocumentUrl(url);
    if (url && !documentName) {
      if (isYouTubeUrl(url)) {
        // For YouTube URLs, redirect to YouTube processing step
        setCurrentStep('youtube');
        return;
      } else {
        try {
          const urlObj = new URL(url);
          setDocumentName(urlObj.hostname + urlObj.pathname);
        } catch {
          setDocumentName(url.substring(0, 50));
        }
      }
    }
    if (url) {
      setCurrentStep('template');
    }
  };

  const handleYouTubeProcessed = (data: {
    url: string;
    videoInfo: YouTubeVideoInfo;
    suggestedName: string;
  }) => {
    setYoutubeVideoInfo(data.videoInfo);
    setDocumentName(data.suggestedName);
    setCurrentStep('template');
  };

  const handleYouTubeError = (error: string) => {
    ToastService.error(`YouTube processing failed: ${error}`);
    setCurrentStep('source');
  };

  const handleUploadCardClick = () => {
    fileInputRef.current?.click();
  };

  const canProceedToTemplate = selectedFile || documentUrl;

  const handleSubmit = async (templateFromDoubleClick?: ProcessingTemplate, processingMode: 'AUTOMATIC' | 'MANUAL' = 'AUTOMATIC') => {
    if (!currentRealm) {
      ToastService.error('No realm selected');
      return;
    }

    const templateToUse = templateFromDoubleClick || selectedTemplate;
    if (!templateToUse) {
      ToastService.error('Please select a processing template');
      return;
    }

    // If template was passed from double-click, update the selected template
    if (templateFromDoubleClick) {
      setSelectedTemplate(templateFromDoubleClick);
    }

    if (!selectedFile && !documentUrl) {
      ToastService.error('Please select a file or enter a URL');
      return;
    }

    if (!documentName.trim()) {
      ToastService.error('Please enter a document name');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', documentName.trim());
        formData.append('realmId', currentRealm.id);
        formData.append('processingMode', processingMode);
        formData.append('templateId', templateToUse.id);
        formData.append('templateConfig', JSON.stringify(ProcessingTemplateService.mergeWithDefaults(templateToUse)));
        formData.append('type', getFileType(selectedFile.name));

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload document');
        }
      } else if (youtubeVideoInfo) {
        // Handle YouTube document - just send the URL, backend will handle everything
        const documentData = {
          name: documentName.trim(),
          realmId: currentRealm.id,
          processingMode: processingMode,
          templateId: templateToUse.id,
          templateConfig: ProcessingTemplateService.mergeWithDefaults(templateToUse),
          url: documentUrl,
          type: 'youtube'
        };

        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create YouTube document');
        }
      } else {
        // Handle regular URL-based document
        const documentData = {
          name: documentName.trim(),
          realmId: currentRealm.id,
          processingMode: processingMode,
          templateId: templateToUse.id,
          templateConfig: ProcessingTemplateService.mergeWithDefaults(templateToUse),
          url: documentUrl,
          type: getUrlType(documentUrl)
        };

        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create document');
        }
      }

      const modeText = processingMode === 'AUTOMATIC' ? 'with automatic processing' : 'with manual processing';
      ToastService.success(`Document "${documentName}" created successfully ${modeText} using ${templateToUse.name} template`);

      // Refresh the documents list to show the new document
      await refreshData();

      handleClose();
    } catch (error) {
      console.error('Failed to create document:', error);
      ToastService.error(error instanceof Error ? error.message : 'Failed to create document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedFile(null);
      setDocumentUrl('');
      setDocumentName('');
      setSelectedTemplate(null);
      setYoutubeVideoInfo(null);
      setCurrentStep('source');
      onClose();
    }
  };

  const handleBackToSource = () => {
    setCurrentStep('source');
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'pdf',
      'docx': 'docx',
      'doc': 'docx',
      'txt': 'txt',
      'md': 'markdown',
      'mp3': 'audio',
      'wav': 'audio',
      'mp4': 'video',
      'avi': 'video',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image'
    };
    return typeMap[extension || ''] || 'document';
  };



  const renderSourceStep = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">Add Document</h3>
          <p className="text-sm text-gray-600">Choose how you&apos;d like to add your document</p>
        </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload File Card */}
        <Card
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 group"
          onClick={handleUploadCardClick}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Upload File</CardTitle>
            <CardDescription>
              Select a file from your computer
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, Word, text, audio, video, and image files
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <MousePointer2 className="h-3 w-3" />
              Click to browse files
            </div>
          </CardContent>
        </Card>

        {/* URL Input Card */}
        <Card className="transition-all duration-200 hover:shadow-md hover:border-green-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Link className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">From URL</CardTitle>
            <CardDescription>
              Enter a web URL or YouTube link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="document-url" className="sr-only">Document URL</Label>
              <Input
                id="document-url"
                type="url"
                placeholder="https://example.com/document or YouTube URL"
                value={documentUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="text-center"
              />
              <p className="text-xs text-gray-500 text-center">
                Web pages, PDFs, YouTube videos, and more
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.docx,.doc,.txt,.md,.mp3,.wav,.mp4,.avi,.jpg,.jpeg,.png"
        className="hidden"
      />

      {/* Selected file/URL preview */}
      {(selectedFile || documentUrl) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              {selectedFile ? (
                <>
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-sm text-blue-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Link className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">{documentName}</p>
                    <p className="text-sm text-blue-700 break-all">{documentUrl}</p>
                  </div>
                </>
              )}
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getUrlType(documentUrl).toUpperCase() || 'FILE'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue button */}
      {canProceedToTemplate && (
        <div className="flex justify-end">
          <Button onClick={() => setCurrentStep('template')} className="gap-2">
            Continue to Templates
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
      </div>
    );
  };

  const renderYouTubeStep = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium">YouTube Video Processing</h3>
            <p className="text-sm text-gray-600">
              Configure how you want to process this YouTube video.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleBackToSource} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex-1">
          <YouTubeInputHandler
            initialUrl={documentUrl}
            onUrlProcessed={handleYouTubeProcessed}
            onError={handleYouTubeError}
          />
        </div>
      </div>
    );
  };

  const renderTemplateStep = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium">Choose Processing Template</h3>
            <p className="text-sm text-gray-600">
              Select how you want your document to be processed. Single-click to select, double-click to create immediately.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleBackToSource} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

      <ScrollArea className="flex-1">
        <TemplateSelector
          selectedTemplate={selectedTemplate || undefined}
          onTemplateSelect={setSelectedTemplate}
          onTemplateDoubleClick={(template) => handleSubmit(template)}
          fileType={selectedFile ? selectedFile.name.split('.').pop() : getUrlType(documentUrl)}
        />
      </ScrollArea>

      <div className="flex justify-between items-center pt-4 border-t mt-4">
        <Button
          variant="outline"
          onClick={onSwitchToExpert}
          className="gap-2"
          disabled={isSubmitting}
        >
          <Settings className="h-4 w-4" />
          Expert Mode
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={() => handleSubmit(undefined, 'MANUAL')}
            disabled={!selectedTemplate || isSubmitting}
            variant="outline"
            className="gap-2"
          >
            {isSubmitting ? 'Creating...' : 'Create Manual'}
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleSubmit(undefined, 'AUTOMATIC')}
            disabled={!selectedTemplate || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? 'Creating...' : 'Create Auto'}
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Add Document
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'source'
              ? 'Choose your document source to get started'
              : currentStep === 'youtube'
              ? 'Configure YouTube video processing options'
              : 'Select a processing template for your document'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentStep === 'source' && renderSourceStep()}
          {currentStep === 'youtube' && renderYouTubeStep()}
          {currentStep === 'template' && renderTemplateStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
