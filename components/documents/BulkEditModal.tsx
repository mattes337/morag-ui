'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
  CardHeader,
  CardTitle,
  Separator,
  Checkbox,
  Select,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Save,
  X,
  Tag,
  FolderOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Minus,
  Settings,
  Target
} from 'lucide-react';
// Using CSS transitions instead of framer-motion for animations
import type { DocumentMetadata } from '@/lib/mockData/documentMockData';

export interface BulkEditModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Array of selected documents to edit */
  selectedDocuments: DocumentMetadata[];
  /** Available realms for realm assignment */
  availableRealms?: Array<{ id: string; name: string }>;
  /** Available tags for suggestions */
  availableTags?: string[];
  /** Callback when bulk edit completes successfully */
  onEditComplete?: (documentIds: string[], changes: BulkEditChanges) => void;
  /** Whether the edit operation is in progress */
  isProcessing?: boolean;
}

export interface BulkEditChanges {
  /** Tags to add to all documents */
  addTags?: string[];
  /** Tags to remove from all documents */
  removeTags?: string[];
  /** New realm assignment for all documents */
  realmId?: string;
  /** New description for all documents (replaces existing) */
  description?: string;
  /** Whether to append description instead of replacing */
  appendDescription?: boolean;
  /** Whether to restart processing for completed documents */
  restartProcessing?: boolean;
  /** Processing configuration */
  processingConfig?: {
    autoProcess: boolean;
    stages: string[];
  };
}

interface BulkEditFormData {
  // Tag operations
  tagsToAdd: string[];
  tagsToRemove: string[];
  newTag: string;

  // Realm assignment
  changeRealm: boolean;
  newRealmId: string;

  // Description changes
  changeDescription: boolean;
  newDescription: string;
  appendDescription: boolean;

  // Processing options
  restartProcessing: boolean;
  autoProcess: boolean;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  open,
  onClose,
  selectedDocuments,
  availableRealms = [],
  availableTags = [],
  onEditComplete,
  isProcessing = false
}) => {
  const [formData, setFormData] = useState<BulkEditFormData>({
    tagsToAdd: [],
    tagsToRemove: [],
    newTag: '',
    changeRealm: false,
    newRealmId: '',
    changeDescription: false,
    newDescription: '',
    appendDescription: false,
    restartProcessing: false,
    autoProcess: true
  });

  const [operationProgress, setOperationProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [activeTab, setActiveTab] = useState('tags');

  // Calculate common values across selected documents
  const documentStats = useMemo(() => {
    const allTags = new Set<string>();
    const commonTags = new Set<string>();
    const realms = new Set<string>();
    const statuses = new Set<string>();
    
    selectedDocuments.forEach((doc, index) => {
      doc.tags.forEach(tag => {
        allTags.add(tag);
        if (index === 0) {
          commonTags.add(tag);
        } else if (!commonTags.has(tag)) {
          // Tag not common to all documents
        }
      });

      // Only keep tags that are in ALL documents
      if (index > 0) {
        const docTags = new Set(doc.tags);
        [...commonTags].forEach(tag => {
          if (!docTags.has(tag)) {
            commonTags.delete(tag);
          }
        });
      }

      realms.add(doc.realmId);
      statuses.add(doc.status);
    });

    return {
      count: selectedDocuments.length,
      allTags: Array.from(allTags),
      commonTags: Array.from(commonTags),
      realms: Array.from(realms),
      statuses: Array.from(statuses),
      hasMultipleRealms: realms.size > 1,
      totalSize: selectedDocuments.reduce((sum, doc) => sum + doc.size, 0)
    };
  }, [selectedDocuments]);

  const addTag = useCallback((tag: string) => {
    if (tag && !formData.tagsToAdd.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tagsToAdd: [...prev.tagsToAdd, tag],
        newTag: ''
      }));
    }
  }, [formData.tagsToAdd]);

  const removeAddedTag = useCallback((tag: string) => {
    setFormData(prev => ({
      ...prev,
      tagsToAdd: prev.tagsToAdd.filter(t => t !== tag)
    }));
  }, []);

  const addTagToRemove = useCallback((tag: string) => {
    if (tag && !formData.tagsToRemove.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tagsToRemove: [...prev.tagsToRemove, tag]
      }));
    }
  }, [formData.tagsToRemove]);

  const removeTagFromRemoval = useCallback((tag: string) => {
    setFormData(prev => ({
      ...prev,
      tagsToRemove: prev.tagsToRemove.filter(t => t !== tag)
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const changes: BulkEditChanges = {};

    // Collect changes based on form data
    if (formData.tagsToAdd.length > 0) {
      changes.addTags = formData.tagsToAdd;
    }

    if (formData.tagsToRemove.length > 0) {
      changes.removeTags = formData.tagsToRemove;
    }

    if (formData.changeRealm && formData.newRealmId) {
      changes.realmId = formData.newRealmId;
    }

    if (formData.changeDescription && formData.newDescription.trim()) {
      changes.description = formData.newDescription.trim();
      changes.appendDescription = formData.appendDescription;
    }

    if (formData.restartProcessing) {
      changes.restartProcessing = true;
      changes.processingConfig = {
        autoProcess: formData.autoProcess,
        stages: ['markdown-conversion', 'chunker', 'fact-generator', 'ingestor']
      };
    }

    try {
      // Simulate progress tracking
      setCurrentOperation('Updating documents...');
      setOperationProgress(0);

      const documentIds = selectedDocuments.map(doc => doc.id);
      
      // Simulate batch operation progress
      for (let i = 0; i <= 100; i += 10) {
        setOperationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      onEditComplete?.(documentIds, changes);
      
      // Auto-close after successful completion
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('Bulk edit failed:', error);
    }
  }, [formData, selectedDocuments, onEditComplete]);

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      setFormData({
        tagsToAdd: [],
        tagsToRemove: [],
        newTag: '',
        changeRealm: false,
        newRealmId: '',
        changeDescription: false,
        newDescription: '',
        appendDescription: false,
        restartProcessing: false,
        autoProcess: true
      });
      setOperationProgress(0);
      setCurrentOperation('');
      onClose();
    }
  }, [isProcessing, onClose]);

  const hasChanges = useMemo(() => {
    return (
      formData.tagsToAdd.length > 0 ||
      formData.tagsToRemove.length > 0 ||
      (formData.changeRealm && formData.newRealmId) ||
      (formData.changeDescription && formData.newDescription.trim()) ||
      formData.restartProcessing
    );
  }, [formData]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Edit Documents</DialogTitle>
          <DialogDescription>
            Edit {documentStats.count} selected document{documentStats.count !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator for operations */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {currentOperation || 'Processing...'}
              </span>
              <span className="font-medium">{operationProgress}%</span>
            </div>
            <Progress value={operationProgress} className="h-2" />
          </div>
        )}

        {/* Document Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">{documentStats.count}</div>
                <div className="text-muted-foreground">Documents</div>
              </div>
              <div>
                <div className="font-medium">{formatFileSize(documentStats.totalSize)}</div>
                <div className="text-muted-foreground">Total Size</div>
              </div>
              <div>
                <div className="font-medium">{documentStats.realms.length}</div>
                <div className="text-muted-foreground">Realm{documentStats.realms.length !== 1 ? 's' : ''}</div>
              </div>
              <div>
                <div className="font-medium">{documentStats.statuses.length}</div>
                <div className="text-muted-foreground">Status{documentStats.statuses.length !== 1 ? 'es' : ''}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="realm">Realm</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="tags" className="space-y-4 mt-4">
                {/* Current Tags */}
                <div className="space-y-2">
                  <Label>Common Tags (across all selected documents)</Label>
                  <div className="flex flex-wrap gap-2">
                    {documentStats.commonTags.length > 0 ? (
                      documentStats.commonTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addTagToRemove(tag)}
                            disabled={isProcessing || formData.tagsToRemove.includes(tag)}
                            className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No common tags</span>
                    )}
                  </div>
                </div>

                {/* Add Tags */}
                <div className="space-y-2">
                  <Label>Add Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.newTag}
                      onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                      placeholder="Enter tag name..."
                      disabled={isProcessing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(formData.newTag);
                        }
                      }}
                    />
                    <Button
                      onClick={() => addTag(formData.newTag)}
                      disabled={!formData.newTag.trim() || isProcessing}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tag suggestions */}
                  {availableTags.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs">Suggested Tags</Label>
                      <div className="flex flex-wrap gap-1">
                        {availableTags
                          .filter(tag => !formData.tagsToAdd.includes(tag))
                          .slice(0, 10)
                          .map(tag => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => addTag(tag)}
                            disabled={isProcessing}
                            className="h-6 text-xs"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags to add */}
                  {formData.tagsToAdd.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs">Will be added:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.tagsToAdd.map(tag => (
                          <Badge key={tag} variant="default" className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAddedTag(tag)}
                              disabled={isProcessing}
                              className="h-4 w-4 p-0 ml-1"
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Remove Tags */}
                {formData.tagsToRemove.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Will be removed:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tagsToRemove.map(tag => (
                        <Badge key={tag} variant="destructive" className="flex items-center gap-1">
                          <Minus className="h-3 w-3" />
                          {tag}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTagFromRemoval(tag)}
                            disabled={isProcessing}
                            className="h-4 w-4 p-0 ml-1"
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="realm" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Realms</Label>
                    <div className="flex flex-wrap gap-2">
                      {documentStats.realms.map(realmId => {
                        const realm = availableRealms.find(r => r.id === realmId);
                        return (
                          <Badge key={realmId} variant="secondary">
                            <FolderOpen className="h-3 w-3 mr-1" />
                            {realm?.name || realmId}
                          </Badge>
                        );
                      })}
                    </div>
                    {documentStats.hasMultipleRealms && (
                      <p className="text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Documents are currently in different realms
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="change-realm"
                        checked={formData.changeRealm}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, changeRealm: !!checked }))
                        }
                        disabled={isProcessing}
                      />
                      <Label htmlFor="change-realm">Move to different realm</Label>
                    </div>

                    {formData.changeRealm && (
                      <Select
                        value={formData.newRealmId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, newRealmId: value }))}
                        disabled={isProcessing}
                      >
                        <option value="">Select realm...</option>
                        {availableRealms.map(realm => (
                          <option key={realm.id} value={realm.id}>
                            {realm.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="description" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="change-description"
                      checked={formData.changeDescription}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, changeDescription: !!checked }))
                      }
                      disabled={isProcessing}
                    />
                    <Label htmlFor="change-description">Update description</Label>
                  </div>

                  {formData.changeDescription && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="append-description"
                          checked={formData.appendDescription}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, appendDescription: !!checked }))
                          }
                          disabled={isProcessing}
                        />
                        <Label htmlFor="append-description" className="text-sm">
                          Append to existing description (instead of replacing)
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-description">
                          {formData.appendDescription ? 'Text to append' : 'New description'}
                        </Label>
                        <Textarea
                          id="new-description"
                          value={formData.newDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, newDescription: e.target.value }))}
                          placeholder={formData.appendDescription 
                            ? 'This text will be appended to existing descriptions...'
                            : 'This will replace all existing descriptions...'
                          }
                          disabled={isProcessing}
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="processing" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Processing Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {documentStats.statuses.map(status => (
                        <Badge 
                          key={status} 
                          variant={status === 'completed' ? 'default' : 'secondary'}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restart-processing"
                        checked={formData.restartProcessing}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, restartProcessing: !!checked }))
                        }
                        disabled={isProcessing}
                      />
                      <Label htmlFor="restart-processing">Restart processing pipeline</Label>
                    </div>

                    {formData.restartProcessing && (
                      <div className="space-y-2 pl-6 border-l-2 border-muted">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="auto-process"
                            checked={formData.autoProcess}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, autoProcess: !!checked }))
                            }
                            disabled={isProcessing}
                          />
                          <Label htmlFor="auto-process" className="text-sm">
                            Enable automatic processing
                          </Label>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          This will restart the entire processing pipeline for all selected documents,
                          regardless of their current status.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditModal;