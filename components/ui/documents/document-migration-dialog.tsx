"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../dialog';
import { Button } from '../button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { Checkbox } from '../checkbox';
import { Label } from '../label';
import { Badge } from '../badge';
import { Progress } from '../progress';
import { Alert, AlertDescription } from '../alert';
import { Loader2, FileText, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Realm {
  id: string;
  name: string;
  description?: string;
}

interface Document {
  id: string;
  title: string;
  filename: string;
  realmId: string;
}

interface MigrationOptions {
  copyStageFiles: boolean;
  reprocessStages: string[];
  preserveOriginal: boolean;
  migrationMode: 'copy' | 'move';
  targetDatabases?: string[];
}

interface MigrationProgress {
  migrationId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalDocuments: number;
  processedDocuments: number;
  currentDocument?: string;
  errors: string[];
  startedAt?: string;
  completedAt?: string;
}

interface DocumentMigrationDialogProps {
  documents: Document[];
  realms: Realm[];
  currentRealmId: string;
  onMigrationComplete?: (migrationId: string) => void;
  trigger?: React.ReactNode;
}

const AVAILABLE_STAGES = [
  { id: 'ingestor', name: 'Document Ingestion', description: 'Re-ingest document content' },
  { id: 'chunker', name: 'Text Chunking', description: 'Re-chunk document text' },
  { id: 'embedder', name: 'Embedding Generation', description: 'Generate new embeddings' },
  { id: 'indexer', name: 'Index Creation', description: 'Create search indexes' },
];

export function DocumentMigrationDialog({
  documents,
  realms,
  currentRealmId,
  onMigrationComplete,
  trigger,
}: DocumentMigrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [targetRealmId, setTargetRealmId] = useState<string>('');
  const [migrationOptions, setMigrationOptions] = useState<MigrationOptions>({
    copyStageFiles: true,
    reprocessStages: ['ingestor'],
    preserveOriginal: true,
    migrationMode: 'copy',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Available target realms (exclude current realm)
  const availableRealms = realms.filter(realm => realm.id !== currentRealmId);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDocuments([]);
      setTargetRealmId('');
      setMigrationOptions({
        copyStageFiles: true,
        reprocessStages: ['ingestor'],
        preserveOriginal: true,
        migrationMode: 'copy',
      });
      setMigrationProgress(null);
      setError(null);
    }
  }, [isOpen]);

  // Poll migration progress
  useEffect(() => {
    if (!migrationProgress || migrationProgress.status === 'COMPLETED' || migrationProgress.status === 'FAILED' || migrationProgress.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/migrations/${migrationProgress.migrationId}/progress`);
        if (response.ok) {
          const data = await response.json();
          setMigrationProgress(data.progress);
          
          if (data.progress.status === 'COMPLETED') {
            onMigrationComplete?.(migrationProgress.migrationId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch migration progress:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [migrationProgress, onMigrationComplete]);

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDocuments(
      selectedDocuments.length === documents.length ? [] : documents.map(doc => doc.id)
    );
  };

  const handleStageToggle = (stageId: string) => {
    setMigrationOptions(prev => ({
      ...prev,
      reprocessStages: prev.reprocessStages.includes(stageId)
        ? prev.reprocessStages.filter(id => id !== stageId)
        : [...prev.reprocessStages, stageId],
    }));
  };

  const handleSubmit = async () => {
    if (selectedDocuments.length === 0 || !targetRealmId) {
      setError('Please select documents and target realm');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/migrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: selectedDocuments,
          sourceRealmId: currentRealmId,
          targetRealmId,
          migrationOptions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start migration');
      }

      setMigrationProgress({
        migrationId: data.migration.id,
        status: 'PENDING',
        totalDocuments: selectedDocuments.length,
        processedDocuments: 0,
        errors: [],
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start migration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!migrationProgress) return;

    try {
      const response = await fetch(`/api/migrations/${migrationProgress.migrationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMigrationProgress(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      }
    } catch (error) {
      console.error('Failed to cancel migration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'IN_PROGRESS':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Migrate Documents
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Migrate Documents Between Realms</DialogTitle>
        </DialogHeader>

        {migrationProgress ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(migrationProgress.status)}
                <span className="font-medium">Migration Status</span>
                <Badge className={cn('text-xs', getStatusColor(migrationProgress.status))}>
                  {migrationProgress.status}
                </Badge>
              </div>
              {migrationProgress.status === 'IN_PROGRESS' && (
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{migrationProgress.processedDocuments} / {migrationProgress.totalDocuments}</span>
              </div>
              <Progress 
                value={(migrationProgress.processedDocuments / migrationProgress.totalDocuments) * 100} 
                className="w-full"
              />
            </div>

            {migrationProgress.currentDocument && (
              <div className="text-sm text-gray-600">
                Currently processing: <span className="font-medium">{migrationProgress.currentDocument}</span>
              </div>
            )}

            {migrationProgress.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Errors occurred during migration:</div>
                    {migrationProgress.errors.map((error, index) => (
                      <div key={index} className="text-sm">{error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {migrationProgress.status === 'COMPLETED' && (
              <div className="flex justify-end">
                <Button onClick={() => setIsOpen(false)}>Close</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Document Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Select Documents</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {documents.map(document => (
                  <div key={document.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={document.id}
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={() => handleDocumentToggle(document.id)}
                    />
                    <Label htmlFor={document.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{document.title}</div>
                      <div className="text-sm text-gray-500">{document.filename}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Realm Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Target Realm</Label>
              <Select value={targetRealmId} onValueChange={setTargetRealmId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target realm" />
                </SelectTrigger>
                <SelectContent>
                  {availableRealms.map(realm => (
                    <SelectItem key={realm.id} value={realm.id}>
                      <div>
                        <div className="font-medium">{realm.name}</div>
                        {realm.description && (
                          <div className="text-sm text-gray-500">{realm.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Migration Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Migration Options</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="copyStageFiles"
                    checked={migrationOptions.copyStageFiles}
                    onCheckedChange={(checked) => 
                      setMigrationOptions(prev => ({ ...prev, copyStageFiles: !!checked }))
                    }
                  />
                  <Label htmlFor="copyStageFiles">Copy stage output files</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserveOriginal"
                    checked={migrationOptions.preserveOriginal}
                    onCheckedChange={(checked) => 
                      setMigrationOptions(prev => ({ ...prev, preserveOriginal: !!checked }))
                    }
                  />
                  <Label htmlFor="preserveOriginal">Preserve original documents</Label>
                </div>

                <div className="space-y-2">
                  <Label>Migration Mode</Label>
                  <Select 
                    value={migrationOptions.migrationMode} 
                    onValueChange={(value: 'copy' | 'move') => 
                      setMigrationOptions(prev => ({ ...prev, migrationMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="copy">Copy (keep originals)</SelectItem>
                      <SelectItem value="move">Move (remove originals)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stages to Reprocess</Label>
                  <div className="space-y-2">
                    {AVAILABLE_STAGES.map(stage => (
                      <div key={stage.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={stage.id}
                          checked={migrationOptions.reprocessStages.includes(stage.id)}
                          onCheckedChange={() => handleStageToggle(stage.id)}
                        />
                        <Label htmlFor={stage.id} className="flex-1">
                          <div className="font-medium">{stage.name}</div>
                          <div className="text-sm text-gray-500">{stage.description}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || selectedDocuments.length === 0 || !targetRealmId}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Start Migration
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}