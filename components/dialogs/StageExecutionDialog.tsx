'use client';

import React, { useState } from 'react';
import { ProcessingStage } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Zap,
  Scissors,
  Brain,
  Database,
  Settings,
  AlertCircle,
  Info,
} from 'lucide-react';

interface StageExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: ProcessingStage | null;
  documentId: string;
  onExecute: (stage: ProcessingStage, options: StageExecutionOptions) => Promise<void>;
  isExecuting?: boolean;
}

interface StageExecutionOptions {
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
  retryCount?: number;
  skipValidation?: boolean;
  customParameters?: Record<string, any>;
  metadata?: Record<string, any>;
}

const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Converter',
    description: 'Convert input files to unified markdown format',
    icon: FileText,
    color: 'bg-blue-500',
    defaultTimeout: 300, // 5 minutes
    parameters: [
      {
        key: 'preserveFormatting',
        label: 'Preserve Original Formatting',
        type: 'boolean',
        default: true,
        description: 'Maintain original document formatting where possible',
      },
      {
        key: 'extractImages',
        label: 'Extract Images',
        type: 'boolean',
        default: true,
        description: 'Extract and process embedded images',
      },
      {
        key: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        options: ['markdown', 'commonmark', 'gfm'],
        default: 'markdown',
        description: 'Markdown format variant to use',
      },
    ],
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Optimizer',
    description: 'LLM-based text improvement and error correction',
    icon: Zap,
    color: 'bg-yellow-500',
    defaultTimeout: 600, // 10 minutes
    parameters: [
      {
        key: 'model',
        label: 'LLM Model',
        type: 'select',
        options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet'],
        default: 'gpt-4',
        description: 'Language model to use for optimization',
      },
      {
        key: 'optimizationLevel',
        label: 'Optimization Level',
        type: 'select',
        options: ['light', 'moderate', 'aggressive'],
        default: 'moderate',
        description: 'How extensively to modify the text',
      },
      {
        key: 'fixGrammar',
        label: 'Fix Grammar',
        type: 'boolean',
        default: true,
        description: 'Correct grammatical errors',
      },
      {
        key: 'improveClarity',
        label: 'Improve Clarity',
        type: 'boolean',
        default: true,
        description: 'Enhance text clarity and readability',
      },
    ],
  },
  CHUNKER: {
    name: 'Chunker',
    description: 'Create summary, chunks, and contextual embeddings',
    icon: Scissors,
    color: 'bg-green-500',
    defaultTimeout: 180, // 3 minutes
    parameters: [
      {
        key: 'chunkSize',
        label: 'Chunk Size',
        type: 'number',
        default: 1000,
        min: 100,
        max: 5000,
        description: 'Maximum characters per chunk',
      },
      {
        key: 'chunkOverlap',
        label: 'Chunk Overlap',
        type: 'number',
        default: 200,
        min: 0,
        max: 1000,
        description: 'Character overlap between chunks',
      },
      {
        key: 'generateSummary',
        label: 'Generate Summary',
        type: 'boolean',
        default: true,
        description: 'Create document summary',
      },
      {
        key: 'embeddingModel',
        label: 'Embedding Model',
        type: 'select',
        options: ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'],
        default: 'text-embedding-3-small',
        description: 'Model for generating embeddings',
      },
    ],
  },
  FACT_GENERATOR: {
    name: 'Fact Generator',
    description: 'Extract facts, entities, relations, and keywords',
    icon: Brain,
    color: 'bg-purple-500',
    defaultTimeout: 900, // 15 minutes
    parameters: [
      {
        key: 'extractEntities',
        label: 'Extract Entities',
        type: 'boolean',
        default: true,
        description: 'Identify and extract named entities',
      },
      {
        key: 'extractRelations',
        label: 'Extract Relations',
        type: 'boolean',
        default: true,
        description: 'Identify relationships between entities',
      },
      {
        key: 'extractKeywords',
        label: 'Extract Keywords',
        type: 'boolean',
        default: true,
        description: 'Extract important keywords and phrases',
      },
      {
        key: 'confidenceThreshold',
        label: 'Confidence Threshold',
        type: 'number',
        default: 0.7,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        description: 'Minimum confidence for extracted facts',
      },
    ],
  },
  INGESTOR: {
    name: 'Ingestor',
    description: 'Database ingestion and storage',
    icon: Database,
    color: 'bg-indigo-500',
    defaultTimeout: 120, // 2 minutes
    parameters: [
      {
        key: 'batchSize',
        label: 'Batch Size',
        type: 'number',
        default: 100,
        min: 10,
        max: 1000,
        description: 'Number of records to process in each batch',
      },
      {
        key: 'validateData',
        label: 'Validate Data',
        type: 'boolean',
        default: true,
        description: 'Validate data before ingestion',
      },
      {
        key: 'createBackup',
        label: 'Create Backup',
        type: 'boolean',
        default: false,
        description: 'Create backup before ingestion',
      },
    ],
  },
};

export function StageExecutionDialog({
  open,
  onOpenChange,
  stage,
  documentId,
  onExecute,
  isExecuting = false,
}: StageExecutionDialogProps) {
  const [options, setOptions] = useState<StageExecutionOptions>({
    priority: 'normal',
    timeout: stage ? STAGE_CONFIG[stage].defaultTimeout : 300,
    retryCount: 3,
    skipValidation: false,
    customParameters: {},
    metadata: {},
  });

  const [customMetadata, setCustomMetadata] = useState('');

  if (!stage) return null;

  const config = STAGE_CONFIG[stage];
  const StageIcon = config.icon;

  const handleParameterChange = (key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      customParameters: {
        ...prev.customParameters,
        [key]: value,
      },
    }));
  };

  const handleExecute = async () => {
    try {
      // Parse custom metadata if provided
      let metadata = {};
      if (customMetadata.trim()) {
        try {
          metadata = JSON.parse(customMetadata);
        } catch (e) {
          // Invalid JSON, ignore
        }
      }

      await onExecute(stage, {
        ...options,
        metadata: {
          ...options.metadata,
          ...metadata,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to execute stage:', error);
    }
  };

  const renderParameterInput = (param: any) => {
    const value = options.customParameters?.[param.key] ?? param.default;

    switch (param.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={param.key}
              checked={value}
              onCheckedChange={(checked) => handleParameterChange(param.key, checked)}
            />
            <Label htmlFor={param.key} className="text-sm">
              {param.label}
            </Label>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={param.key} className="text-sm font-medium">
              {param.label}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleParameterChange(param.key, newValue)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {param.options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={param.key} className="text-sm font-medium">
              {param.label}
            </Label>
            <Input
              id={param.key}
              type="number"
              value={value}
              min={param.min}
              max={param.max}
              step={param.step || 1}
              onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={param.key} className="text-sm font-medium">
              {param.label}
            </Label>
            <Input
              id={param.key}
              value={value}
              onChange={(e) => handleParameterChange(param.key, e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${config.color} text-white`}>
              <StageIcon className="w-5 h-5" />
            </div>
            <span>Execute {config.name}</span>
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <h3 className="text-sm font-medium">Execution Options</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </Label>
                <Select
                  value={options.priority}
                  onValueChange={(value: 'low' | 'normal' | 'high') => 
                    setOptions(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout" className="text-sm font-medium">
                  Timeout (seconds)
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  value={options.timeout}
                  min={30}
                  max={3600}
                  onChange={(e) => 
                    setOptions(prev => ({ ...prev, timeout: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryCount" className="text-sm font-medium">
                  Retry Count
                </Label>
                <Input
                  id="retryCount"
                  type="number"
                  value={options.retryCount}
                  min={0}
                  max={10}
                  onChange={(e) => 
                    setOptions(prev => ({ ...prev, retryCount: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="skipValidation"
                  checked={options.skipValidation}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, skipValidation: checked }))
                  }
                />
                <Label htmlFor="skipValidation" className="text-sm">
                  Skip Validation
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stage-specific Parameters */}
          {config.parameters && config.parameters.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <StageIcon className="w-4 h-4" />
                <h3 className="text-sm font-medium">Stage Parameters</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {config.parameters.map((param) => (
                  <div key={param.key} className="space-y-2">
                    {renderParameterInput(param)}
                    {param.description && (
                      <div className="flex items-start space-x-2">
                        <Info className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">
                          {param.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Custom Metadata */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <h3 className="text-sm font-medium">Custom Metadata (JSON)</h3>
            </div>
            <Textarea
              placeholder='{"key": "value", "note": "Custom execution metadata"}'
              value={customMetadata}
              onChange={(e) => setCustomMetadata(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-600">
              Optional JSON metadata to attach to this execution
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExecuting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center space-x-2"
          >
            {isExecuting && <LoadingSpinner className="w-4 h-4" />}
            <span>{isExecuting ? 'Executing...' : 'Execute Stage'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StageExecutionDialog;