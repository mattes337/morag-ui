'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RealmConfig, LLMModelConfig, StageConfigs } from '@/lib/types/domain';

interface RealmConfigEditorProps {
  config: RealmConfig;
  onChange: (config: RealmConfig) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function RealmConfigEditor({ config, onChange, onSave, isSaving }: RealmConfigEditorProps) {
  const [activeTab, setActiveTab] = useState<'models' | 'stages' | 'global'>('models');

  const updateLLMConfig = (updates: Partial<LLMModelConfig>) => {
    onChange({
      ...config,
      llm_model_config: {
        ...config.llm_model_config,
        ...updates
      }
    });
  };

  const updateStageConfig = (stage: string, updates: any) => {
    const stageKey = stage as keyof StageConfigs;
    onChange({
      ...config,
      stage_configs: {
        ...config.stage_configs,
        [stageKey]: {
          ...(config.stage_configs?.[stageKey] as any),
          ...updates
        }
      }
    });
  };

  const updateGlobalConfig = (updates: any) => {
    onChange({
      ...config,
      global_config: {
        ...config.global_config,
        ...updates
      }
    });
  };

  const availableModels = [
    'gpt-4o',
    'gpt-4o-mini', 
    'gpt-4-turbo',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];

  const stages = [
    { key: 'markdown-conversion', label: 'Markdown Conversion', description: 'Convert documents to markdown format' },
    { key: 'markdown-optimizer', label: 'Markdown Optimizer', description: 'Optimize and clean markdown content' },
    { key: 'chunker', label: 'Chunker', description: 'Split content into manageable chunks' },
    { key: 'fact-generator', label: 'Fact Generator', description: 'Extract facts and entities' },
    { key: 'ingestor', label: 'Ingestor', description: 'Store processed content in databases' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'models', label: 'LLM Models', description: 'Configure AI models for each agent' },
            { key: 'stages', label: 'Stage Configs', description: 'Configure processing stages' },
            { key: 'global', label: 'Global Settings', description: 'Global configuration options' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div>
                <div>{tab.label}</div>
                <div className="text-xs text-gray-400">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* LLM Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">LLM Model Configuration</h3>
          <p className="text-sm text-gray-600">
            Configure which AI models to use for different agents. Leave empty to use backend defaults.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'default_model', label: 'Default Model', description: 'Fallback model for all agents' },
              { key: 'fact_extraction_agent_model', label: 'Fact Extraction Agent', description: 'Model for extracting facts' },
              { key: 'entity_extraction_agent_model', label: 'Entity Extraction Agent', description: 'Model for extracting entities' },
              { key: 'relation_extraction_agent_model', label: 'Relation Extraction Agent', description: 'Model for extracting relationships' },
              { key: 'keyword_extraction_agent_model', label: 'Keyword Extraction Agent', description: 'Model for extracting keywords' },
              { key: 'summarization_agent_model', label: 'Summarization Agent', description: 'Model for content summarization' },
              { key: 'content_analysis_agent_model', label: 'Content Analysis Agent', description: 'Model for content analysis' },
              { key: 'markdown_optimizer_agent_model', label: 'Markdown Optimizer Agent', description: 'Model for markdown optimization' },
              { key: 'chunking_agent_model', label: 'Chunking Agent', description: 'Model for content chunking' }
            ].map((model) => (
              <div key={model.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {model.label}
                </label>
                <select
                  value={config.llm_model_config?.[model.key as keyof LLMModelConfig] || ''}
                  onChange={(e) => updateLLMConfig({ [model.key]: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Use backend default</option>
                  {availableModels.map((modelName) => (
                    <option key={modelName} value={modelName}>
                      {modelName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">{model.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Configs Tab */}
      {activeTab === 'stages' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Stage Configuration</h3>
          <p className="text-sm text-gray-600">
            Configure processing parameters for each stage. These settings override global defaults.
          </p>
          
          <div className="space-y-6">
            {stages.map((stage) => (
              <div key={stage.key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">{stage.label}</h4>
                <p className="text-sm text-gray-600 mb-4">{stage.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Common fields for all stages */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Domain</label>
                    <input
                      type="text"
                      value={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.domain || ''}
                      onChange={(e) => updateStageConfig(stage.key, { domain: e.target.value || undefined })}
                      placeholder="e.g., medical, legal, technical"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select
                      value={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.language || ''}
                      onChange={(e) => updateStageConfig(stage.key, { language: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Use default</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Custom Instructions</label>
                    <textarea
                      value={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.custom_instructions || ''}
                      onChange={(e) => updateStageConfig(stage.key, { custom_instructions: e.target.value || undefined })}
                      placeholder="Enter custom instructions for this stage..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Stage-specific fields */}
                  {stage.key === 'fact-generator' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Min Confidence</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.min_confidence || ''}
                          onChange={(e) => updateStageConfig(stage.key, { min_confidence: e.target.value ? parseFloat(e.target.value) : undefined })}
                          placeholder="0.7"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Max Facts per Chunk</label>
                        <input
                          type="number"
                          min="1"
                          value={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.max_facts_per_chunk || ''}
                          onChange={(e) => updateStageConfig(stage.key, { max_facts_per_chunk: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="50"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.extract_entities || false}
                            onChange={(e) => updateStageConfig(stage.key, { extract_entities: e.target.checked })}
                            className="mr-2"
                          />
                          Extract Entities
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.extract_relations || false}
                            onChange={(e) => updateStageConfig(stage.key, { extract_relations: e.target.checked })}
                            className="mr-2"
                          />
                          Extract Relations
                        </label>
                      </div>
                    </>
                  )}
                  
                  {stage.key === 'chunker' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Chunk Strategy</label>
                        <select
                          value={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.chunk_strategy || ''}
                          onChange={(e) => updateStageConfig(stage.key, { chunk_strategy: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Use default</option>
                          <option value="semantic">Semantic</option>
                          <option value="page-level">Page Level</option>
                          <option value="topic-based">Topic Based</option>
                          <option value="sentence">Sentence</option>
                          <option value="paragraph">Paragraph</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Chunk Size</label>
                        <input
                          type="number"
                          min="100"
                          value={(config.stage_configs?.[stage.key as keyof StageConfigs] as any)?.chunk_size || ''}
                          onChange={(e) => updateStageConfig(stage.key, { chunk_size: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Settings Tab */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Global Configuration</h3>
          <p className="text-sm text-gray-600">
            Global settings that apply to all stages unless overridden.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Default Domain</label>
              <input
                type="text"
                value={config.global_config?.domain || ''}
                onChange={(e) => updateGlobalConfig({ domain: e.target.value || undefined })}
                placeholder="e.g., medical, legal, technical"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Default Language</label>
              <select
                value={config.global_config?.language || ''}
                onChange={(e) => updateGlobalConfig({ language: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Use backend default</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
