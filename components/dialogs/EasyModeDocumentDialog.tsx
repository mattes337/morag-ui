'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Link, Sparkles, Settings, ArrowRight } from 'lucide-react';
import { TemplateSelector } from '@/components/ui/processing/template-selector';
import { ProcessingTemplate, ProcessingTemplateService } from '@/lib/processing/templates';
import { useApp } from '@/contexts/AppContext';
import { ToastService } from '@/lib/services/toastService';

interface EasyModeDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToExpert?: () => void;
}

export function EasyModeDocumentDialog({
  isOpen,
  onClose,
  onSwitchToExpert
}: EasyModeDocumentDialogProps) {
  const { currentRealm } = useApp();
  const [activeTab, setActiveTab] = useState<'upload' | 'template'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessingTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
      }
      setActiveTab('template');
    }
  };

  const handleUrlChange = (url: string) => {
    setDocumentUrl(url);
    if (url && !documentName) {
      try {
        const urlObj = new URL(url);
        setDocumentName(urlObj.hostname + urlObj.pathname);
      } catch {
        setDocumentName(url.substring(0, 50));
      }
    }
    if (url) {
      setActiveTab('template');
    }
  };

  const handleSubmit = async () => {
    if (!currentRealm) {
      ToastService.error('No realm selected');
      return;
    }

    if (!selectedTemplate) {
      ToastService.error('Please select a processing template');
      return;
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
      // Create the document with template configuration
      const documentData = {
        name: documentName.trim(),
        realmId: currentRealm.id,
        processingMode: 'AUTOMATIC' as const,
        templateId: selectedTemplate.id,
        templateConfig: ProcessingTemplateService.mergeWithDefaults(selectedTemplate),
        ...(documentUrl ? { url: documentUrl, type: getUrlType(documentUrl) } : {})
      };

      if (selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', documentName.trim());
        formData.append('realmId', currentRealm.id);
        formData.append('processingMode', 'AUTOMATIC');
        formData.append('templateId', selectedTemplate.id);
        formData.append('templateConfig', JSON.stringify(documentData.templateConfig));
        formData.append('type', getFileType(selectedFile.name));

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload document');
        }
      } else {
        // Handle URL-based document
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

      ToastService.success(`Document "${documentName}" created successfully with ${selectedTemplate.name} template`);
      handleClose();
    } catch (error) {
      console.error('Failed to create document:', error);
      ToastService.error(error instanceof Error ? error.message : 'Failed to create document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocumentUrl('');
    setDocumentName('');
    setSelectedTemplate(null);
    setActiveTab('upload');
    setUploadType('file');
    onClose();
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

  const getUrlType = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    return 'website';
  };

  const canProceed = (selectedFile || documentUrl) && documentName.trim() && selectedTemplate;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Easy Mode - Add Document
              </DialogTitle>
              <DialogDescription>
                Upload your document and choose a processing template. We&apos;ll handle the technical details for you.
              </DialogDescription>
            </div>
            {onSwitchToExpert && (
              <Button variant="outline" size="sm" onClick={onSwitchToExpert}>
                <Settings className="h-4 w-4 mr-2" />
                Expert Mode
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'template')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </TabsTrigger>
            <TabsTrigger value="template" className="flex items-center gap-2" disabled={!selectedFile && !documentUrl}>
              <Sparkles className="h-4 w-4" />
              Choose Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">How would you like to add your document?</Label>
              
              <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as 'file' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <Link className="h-4 w-4 mr-2" />
                    From URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Select File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.docx,.doc,.txt,.md,.mp3,.wav,.mp4,.avi,.jpg,.jpeg,.png"
                      className="mt-2"
                    />
                    {selectedFile && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">{selectedFile.name}</span>
                          <Badge variant="secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="document-url">Document URL</Label>
                    <Input
                      id="document-url"
                      type="url"
                      placeholder="https://example.com/document or YouTube URL"
                      value={documentUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="mt-2"
                    />
                    {documentUrl && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            {getUrlType(documentUrl).toUpperCase()} Content
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <Label htmlFor="document-name">Document Name</Label>
                <Input
                  id="document-name"
                  placeholder="Enter a name for your document"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="mt-2"
                />
              </div>

              {(selectedFile || documentUrl) && (
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab('template')}>
                    Next: Choose Template
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate || undefined}
              onTemplateSelect={setSelectedTemplate}
              fileType={selectedFile ? selectedFile.name.split('.').pop() : getUrlType(documentUrl)}
            />

            {selectedTemplate && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{selectedTemplate.icon}</span>
                    Selected: {selectedTemplate.name}
                  </CardTitle>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Estimated Time:</span> {selectedTemplate.estimatedTime}
                    </div>
                    <div>
                      <span className="font-medium">Stages:</span> {selectedTemplate.stages.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('upload')}>
                Back to Upload
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!canProceed || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Creating...' : 'Create Document'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
