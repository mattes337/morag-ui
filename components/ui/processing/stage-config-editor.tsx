'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Info, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  StageConfig,
  MarkdownConversionConfig,
  MarkdownOptimizerConfig,
  ChunkerConfig,
  FactGeneratorConfig,
  IngestorConfig
} from '@/lib/services/moragService';
import { DEFAULT_STAGE_CONFIGS } from '@/lib/processing/templates';

interface StageConfigEditorProps {
  stageName: string;
  config: StageConfig;
  onConfigChange: (config: StageConfig) => void;
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  className?: string;
}

export function StageConfigEditor({
  stageName,
  config,
  onConfigChange,
  isEnabled,
  onEnabledChange,
  className = ''
}: StageConfigEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState<StageConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigUpdate = (key: string, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const resetToDefaults = () => {
    const defaultConfig = DEFAULT_STAGE_CONFIGS[stageName as keyof typeof DEFAULT_STAGE_CONFIGS] || {};
    setLocalConfig(defaultConfig);
    onConfigChange(defaultConfig);
  };

  const getStageInfo = (stage: string) => {
    const stageInfo = {
      'markdown-conversion': {
        title: 'Markdown Conversion',
        description: 'Convert input files to unified markdown format',
        icon: '📄'
      },
      'markdown-optimizer': {
        title: 'Markdown Optimizer',
        description: 'LLM-based text improvement and error correction',
        icon: '✨'
      },
      'chunker': {
        title: 'Chunker',
        description: 'Split content into semantic chunks',
        icon: '✂️'
      },
      'fact-generator': {
        title: 'Fact Generator',
        description: 'Extract facts, entities, and relations',
        icon: '🧠'
      },
      'ingestor': {
        title: 'Ingestor',
        description: 'Store processed content in databases',
        icon: '💾'
      }
    };
    return stageInfo[stage as keyof typeof stageInfo] || { title: stage, description: '', icon: '⚙️' };
  };

  const renderConfigField = (key: string, value: any, fieldConfig: any) => {
    const fieldId = `${stageName}-${key}`;

    switch (fieldConfig.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {fieldConfig.label}
            </Label>
            <Switch
              id={fieldId}
              checked={value || false}
              onCheckedChange={(checked) => handleConfigUpdate(key, checked)}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {fieldConfig.label}
            </Label>
            <Input
              id={fieldId}
              type="number"
              value={value || ''}
              onChange={(e) => handleConfigUpdate(key, parseFloat(e.target.value) || 0)}
              min={fieldConfig.min}
              max={fieldConfig.max}
              step={fieldConfig.step}
            />
          </div>
        );

      case 'string':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {fieldConfig.label}
            </Label>
            <Input
              id={fieldId}
              value={value || ''}
              onChange={(e) => handleConfigUpdate(key, e.target.value)}
              placeholder={fieldConfig.placeholder}
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {fieldConfig.label}
            </Label>
            <Select value={value || ''} onValueChange={(newValue) => handleConfigUpdate(key, newValue)}>
              <SelectTrigger>
                <SelectValue placeholder={fieldConfig.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {fieldConfig.options.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'array':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {fieldConfig.label}
            </Label>
            <Textarea
              id={fieldId}
              value={Array.isArray(value) ? value.join(', ') : ''}
              onChange={(e) => {
                const arrayValue = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                handleConfigUpdate(key, arrayValue);
              }}
              placeholder={fieldConfig.placeholder}
              rows={3}
            />
            <p className="text-xs text-gray-500">Separate items with commas</p>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {fieldConfig.label}
            </Label>
            <Input
              id={fieldId}
              value={value || ''}
              onChange={(e) => handleConfigUpdate(key, e.target.value)}
            />
          </div>
        );
    }
  };

  const getFieldConfigs = (stage: string) => {
    const configs: { [key: string]: { [field: string]: any } } = {
      'markdown-conversion': {
        include_timestamps: { type: 'boolean', label: 'Include Timestamps', description: 'Add timestamps to audio/video transcriptions' },
        transcription_model: { 
          type: 'select', 
          label: 'Transcription Model',
          options: [
            { value: 'whisper-tiny', label: 'Whisper Tiny (Fast)' },
            { value: 'whisper-base', label: 'Whisper Base' },
            { value: 'whisper-small', label: 'Whisper Small' },
            { value: 'whisper-medium', label: 'Whisper Medium' },
            { value: 'whisper-large', label: 'Whisper Large (Best)' }
          ]
        },
        speaker_diarization: { type: 'boolean', label: 'Speaker Diarization', description: 'Identify different speakers' },
        topic_segmentation: { type: 'boolean', label: 'Topic Segmentation', description: 'Segment content by topics' },
        language: { type: 'string', label: 'Language Code', placeholder: 'en' },
        preserve_formatting: { type: 'boolean', label: 'Preserve Formatting' },
        extract_images: { type: 'boolean', label: 'Extract Images' },
        quality_threshold: { type: 'number', label: 'Quality Threshold', min: 0, max: 1, step: 0.1 },
        extract_text: { type: 'boolean', label: 'Extract Text from Images' },
        generate_descriptions: { type: 'boolean', label: 'Generate Image Descriptions' },
        ocr_engine: { 
          type: 'select', 
          label: 'OCR Engine',
          options: [
            { value: 'tesseract', label: 'Tesseract' },
            { value: 'easyocr', label: 'EasyOCR' }
          ]
        }
      },
      'markdown-optimizer': {
        model: { 
          type: 'select', 
          label: 'LLM Model',
          options: [
            { value: 'gemini-pro', label: 'Gemini Pro' },
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
          ]
        },
        max_tokens: { type: 'number', label: 'Max Tokens', min: 1000, max: 32000 },
        temperature: { type: 'number', label: 'Temperature', min: 0, max: 2, step: 0.1 },
        fix_transcription_errors: { type: 'boolean', label: 'Fix Transcription Errors' },
        improve_readability: { type: 'boolean', label: 'Improve Readability' },
        preserve_timestamps: { type: 'boolean', label: 'Preserve Timestamps' },
        normalize_formatting: { type: 'boolean', label: 'Normalize Formatting' },
        remove_redundancy: { type: 'boolean', label: 'Remove Redundancy' },
        enhance_structure: { type: 'boolean', label: 'Enhance Structure' }
      },
      'chunker': {
        chunk_strategy: { 
          type: 'select', 
          label: 'Chunking Strategy',
          options: [
            { value: 'semantic', label: 'Semantic' },
            { value: 'page-level', label: 'Page Level' },
            { value: 'topic-based', label: 'Topic Based' },
            { value: 'sentence', label: 'Sentence' },
            { value: 'paragraph', label: 'Paragraph' }
          ]
        },
        chunk_size: { type: 'number', label: 'Chunk Size (characters)', min: 100, max: 10000 },
        overlap: { type: 'number', label: 'Overlap (characters)', min: 0, max: 1000 },
        generate_summary: { type: 'boolean', label: 'Generate Summaries' },
        preserve_structure: { type: 'boolean', label: 'Preserve Structure' },
        min_chunk_size: { type: 'number', label: 'Min Chunk Size', min: 50, max: 1000 },
        max_chunk_size: { type: 'number', label: 'Max Chunk Size', min: 1000, max: 20000 },
        split_on_headers: { type: 'boolean', label: 'Split on Headers' },
        include_metadata: { type: 'boolean', label: 'Include Metadata' }
      },
      'fact-generator': {
        max_facts_per_chunk: { type: 'number', label: 'Max Facts per Chunk', min: 1, max: 50 },
        confidence_threshold: { type: 'number', label: 'Confidence Threshold', min: 0, max: 1, step: 0.1 },
        extract_entities: { type: 'boolean', label: 'Extract Entities' },
        entity_types: { 
          type: 'array', 
          label: 'Entity Types',
          placeholder: 'PERSON, ORG, GPE, EVENT, DATE, MONEY'
        },
        extract_relations: { type: 'boolean', label: 'Extract Relations' },
        relation_confidence: { type: 'number', label: 'Relation Confidence', min: 0, max: 1, step: 0.1 },
        extract_keywords: { type: 'boolean', label: 'Extract Keywords' },
        domain: { 
          type: 'select', 
          label: 'Domain',
          options: [
            { value: 'general', label: 'General' },
            { value: 'medical', label: 'Medical' },
            { value: 'legal', label: 'Legal' },
            { value: 'technical', label: 'Technical' }
          ]
        },
        model: { 
          type: 'select', 
          label: 'LLM Model',
          options: [
            { value: 'gemini-pro', label: 'Gemini Pro' },
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
          ]
        }
      },
      'ingestor': {
        databases: { 
          type: 'array', 
          label: 'Target Databases',
          placeholder: 'qdrant, neo4j, pinecone'
        },
        collection_name: { type: 'string', label: 'Collection Name', placeholder: 'documents' },
        batch_size: { type: 'number', label: 'Batch Size', min: 1, max: 1000 },
        enable_deduplication: { type: 'boolean', label: 'Enable Deduplication' },
        dedup_threshold: { type: 'number', label: 'Deduplication Threshold', min: 0, max: 1, step: 0.05 },
        conflict_resolution: { 
          type: 'select', 
          label: 'Conflict Resolution',
          options: [
            { value: 'merge', label: 'Merge' },
            { value: 'replace', label: 'Replace' },
            { value: 'skip', label: 'Skip' }
          ]
        },
        overwrite_existing: { type: 'boolean', label: 'Overwrite Existing' },
        validate_data: { type: 'boolean', label: 'Validate Data' },
        generate_embeddings: { type: 'boolean', label: 'Generate Embeddings' }
      }
    };

    return configs[stage] || {};
  };

  const stageInfo = getStageInfo(stageName);
  const fieldConfigs = getFieldConfigs(stageName);

  return (
    <TooltipProvider>
      <Card className={`${className} ${!isEnabled ? 'opacity-60' : ''}`}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={onEnabledChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-2xl">{stageInfo.icon}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{stageInfo.title}</CardTitle>
                    <CardDescription>{stageInfo.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {Object.keys(fieldConfigs).length} options
                  </Badge>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              {isEnabled && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={resetToDefaults}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset to Defaults
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reset all settings to default values</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(fieldConfigs).map(([key, fieldConfig]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {renderConfigField(key, localConfig[key], fieldConfig)}
                          {fieldConfig.description && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{fieldConfig.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isEnabled && (
                <div className="text-center py-8 text-gray-500">
                  <p>This stage is disabled. Enable it to configure options.</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </TooltipProvider>
  );
}
