'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, Link, Settings, Sparkles, ArrowRight, ArrowLeft, MousePointer2, Save, Download } from 'lucide-react';
import { StageConfigEditor } from '@/components/ui/processing/stage-config-editor';
import { StageConfig } from '@/lib/services/moragService';
import {
  DEFAULT_STAGE_CONFIGS,
  ProcessingTemplateService,
  ProcessingTemplate
} from '@/lib/processing/templates';
import { useApp } from '@/contexts/AppContext';
import { ToastService } from '@/lib/services/toastService';
import { fetchVideoTitleWithFallback, isYouTubeUrl, generateDocumentNameFromTitle } from '@/lib/utils/youtubeUtils';

interface ExpertModeDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToEasy?: () => void;
}

type Step = 'source' | 'configure' | 'review';

const AVAILABLE_STAGES = [
  'markdown-conversion',
  'markdown-optimizer',
  'chunker',
  'fact-generator',
  'ingestor'
];

export function ExpertModeDocumentDialog({
  isOpen,
  onClose,
  onSwitchToEasy
}: ExpertModeDocumentDialogProps) {
  const { currentRealm } = useApp();
  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stage configuration state
  const [enabledStages, setEnabledStages] = useState<{ [stage: string]: boolean }>({
    'markdown-conversion': true,
    'markdown-optimizer': false,
    'chunker': true,
    'fact-generator': true,
    'ingestor': true
  });

  const [stageConfigs, setStageConfigs] = useState<{ [stage: string]: StageConfig }>(() => {
    const configs: { [stage: string]: StageConfig } = {};
    AVAILABLE_STAGES.forEach(stage => {
      configs[stage] = { ...DEFAULT_STAGE_CONFIGS[stage as keyof typeof DEFAULT_STAGE_CONFIGS] };
    });
    return configs;
  });

  const [globalConfig, setGlobalConfig] = useState<StageConfig>({
    language: 'en'
  });

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
      setCurrentStep('configure');
    }
  };

  const handleUrlChange = async (url: string) => {
    setDocumentUrl(url);
    setSelectedFile(null); // Clear file if URL is entered

    if (url) {
      if (isYouTubeUrl(url)) {
        try {
          const title = await fetchVideoTitleWithFallback(url);
          if (title) {
            setDocumentName(generateDocumentNameFromTitle(title));
          } else {
            setDocumentName('YouTube Video');
          }
        } catch (error) {
          console.error('Failed to fetch YouTube title:', error);
          setDocumentName('YouTube Video');
        }
      } else {
        const urlName = url.split('/').pop()?.split('?')[0] || 'Web Document';
        setDocumentName(urlName);
      }
      setCurrentStep('configure');
    }
  };

  const handleUploadCardClick = () => {
    fileInputRef.current?.click();
  };

  const canProceedFromSource = selectedFile || documentUrl;

  const handleStageConfigChange = (stage: string, config: StageConfig) => {
    setStageConfigs(prev => ({
      ...prev,
      [stage]: config
    }));
  };

  const handleStageEnabledChange = (stage: string, enabled: boolean) => {
    setEnabledStages(prev => ({
      ...prev,
      [stage]: enabled
    }));
  };

  const loadTemplate = (template: ProcessingTemplate) => {
    const merged = ProcessingTemplateService.mergeWithDefaults(template);
    
    // Update enabled stages
    const newEnabledStages: { [stage: string]: boolean } = {};
    AVAILABLE_STAGES.forEach(stage => {
      newEnabledStages[stage] = merged.stages.includes(stage);
    });
    setEnabledStages(newEnabledStages);

    // Update stage configs
    setStageConfigs(merged.stageConfigs);
    
    // Update global config
    if (merged.globalConfig) {
      setGlobalConfig(merged.globalConfig);
    }

    ToastService.success(`Loaded template: ${template.name}`);
  };

  const exportConfiguration = () => {
    const config = {
      enabledStages,
      stageConfigs,
      globalConfig,
      metadata: {
        exportedAt: new Date().toISOString(),
        documentName,
        fileType: selectedFile?.type || 'url'
      }
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morag-config-${documentName || 'document'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.enabledStages) setEnabledStages(config.enabledStages);
        if (config.stageConfigs) setStageConfigs(config.stageConfigs);
        if (config.globalConfig) setGlobalConfig(config.globalConfig);
        ToastService.success('Configuration imported successfully');
      } catch (error) {
        ToastService.error('Failed to import configuration');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!currentRealm) {
      ToastService.error('No realm selected');
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

    const activeStages = AVAILABLE_STAGES.filter(stage => enabledStages[stage]);
    if (activeStages.length === 0) {
      ToastService.error('Please enable at least one processing stage');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the document with expert configuration
      const documentData = {
        name: documentName.trim(),
        realmId: currentRealm.id,
        processingMode: 'MANUAL' as const,
        expertConfig: {
          stages: activeStages,
          globalConfig,
          stageConfigs: Object.fromEntries(
            activeStages.map(stage => [stage, stageConfigs[stage]])
          )
        },
        ...(documentUrl ? { url: documentUrl, type: getUrlType(documentUrl) } : {})
      };

      if (selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', documentName.trim());
        formData.append('realmId', currentRealm.id);
        formData.append('processingMode', 'MANUAL');
        formData.append('expertConfig', JSON.stringify(documentData.expertConfig));
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

      ToastService.success(`Document "${documentName}" created successfully with custom configuration`);
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
      setCurrentStep('source');
      // Reset to defaults
      setEnabledStages({
        'markdown-conversion': true,
        'markdown-optimizer': false,
        'chunker': true,
        'fact-generator': true,
        'ingestor': true
      });
      const configs: { [stage: string]: StageConfig } = {};
      AVAILABLE_STAGES.forEach(stage => {
        configs[stage] = { ...DEFAULT_STAGE_CONFIGS[stage as keyof typeof DEFAULT_STAGE_CONFIGS] };
      });
      setStageConfigs(configs);
      setGlobalConfig({ language: 'en' });
      onClose();
    }
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



  const canProceed = (selectedFile || documentUrl) && documentName.trim();
  const activeStages = AVAILABLE_STAGES.filter(stage => enabledStages[stage]);


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Expert Mode - Add Document
              </DialogTitle>
              <DialogDescription>
                Full control over all processing stages and configurations
              </DialogDescription>
            </div>
            {onSwitchToEasy && (
              <Button variant="outline" size="sm" onClick={onSwitchToEasy}>
                <Sparkles className="h-4 w-4 mr-2" />
                Easy Mode
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as Step)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="source" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Document Source
            </TabsTrigger>
            <TabsTrigger value="configure" className="flex items-center gap-2" disabled={!canProceedFromSource}>
              <Settings className="h-4 w-4" />
              Configure Stages
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2" disabled={!canProceedFromSource}>
              <FileText className="h-4 w-4" />
              Review & Create
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="source" className="h-full">
              <ScrollArea className="h-full">
                <div className="p-1">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Add Document - Expert Mode</h3>
                      <p className="text-sm text-gray-600">Choose your document source and configure processing stages</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upload File Card */}
                      <Card
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-purple-300 group"
                        onClick={handleUploadCardClick}
                      >
                        <CardHeader className="text-center pb-4">
                          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <Upload className="h-6 w-6 text-purple-600" />
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
                      <Card className="transition-all duration-200 hover:shadow-md hover:border-purple-300">
                        <CardHeader className="text-center pb-4">
                          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Link className="h-6 w-6 text-purple-600" />
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
                      <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            {selectedFile ? (
                              <>
                                <FileText className="h-5 w-5 text-purple-600" />
                                <div className="flex-1">
                                  <p className="font-medium text-purple-900">{selectedFile.name}</p>
                                  <p className="text-sm text-purple-700">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Link className="h-5 w-5 text-purple-600" />
                                <div className="flex-1">
                                  <p className="font-medium text-purple-900">{documentName}</p>
                                  <p className="text-sm text-purple-700 break-all">{documentUrl}</p>
                                </div>
                              </>
                            )}
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {getUrlType(documentUrl).toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Continue button */}
                    {canProceedFromSource && (
                      <div className="flex justify-end">
                        <Button onClick={() => setCurrentStep('configure')} className="gap-2">
                          Configure Processing
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="configure" className="h-full">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Stage Configuration</h3>
                    <p className="text-sm text-gray-600">Configure each processing stage individually</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportConfiguration}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Config
                    </Button>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importConfiguration}
                        className="hidden"
                        id="import-config"
                      />
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('import-config')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Config
                      </Button>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-4 p-1">
                    {/* Global Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Global Configuration</CardTitle>
                        <CardDescription>Settings that apply to all stages</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="global-language">Language</Label>
                            <Input
                              id="global-language"
                              value={globalConfig.language || 'en'}
                              onChange={(e) => setGlobalConfig((prev: any) => ({ ...prev, language: e.target.value }))}
                              placeholder="en"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stage Configurations */}
                    {AVAILABLE_STAGES.map((stage) => (
                      <StageConfigEditor
                        key={stage}
                        stageName={stage}
                        config={stageConfigs[stage]}
                        onConfigChange={(config) => handleStageConfigChange(stage, config)}
                        isEnabled={enabledStages[stage]}
                        onEnabledChange={(enabled) => handleStageEnabledChange(stage, enabled)}
                      />
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('source')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Source
                  </Button>
                  <Button onClick={() => setCurrentStep('review')}>
                    Review & Create
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="review" className="h-full">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-1">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Review Configuration</h3>

                    <div className="grid gap-6">
                      {/* Document Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Document Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            <div><strong>Name:</strong> {documentName}</div>
                            <div><strong>Type:</strong> {selectedFile ? 'File Upload' : 'URL'}</div>
                            <div><strong>Source:</strong> {selectedFile?.name || documentUrl}</div>
                            <div><strong>Realm:</strong> {currentRealm?.name}</div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Processing Configuration */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Processing Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <strong>Enabled Stages:</strong>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Object.keys(enabledStages)
                                  .filter(stage => enabledStages[stage])
                                  .map(stage => (
                                    <Badge key={stage} variant="secondary">
                                      {stage}
                                    </Badge>
                                  ))}
                              </div>
                            </div>

                            <div>
                              <strong>Global Configuration:</strong>
                              <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto">
                                {JSON.stringify(globalConfig, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setCurrentStep('configure')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Configure
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Document'}
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
