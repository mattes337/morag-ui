import {
  StageConfig,
  MarkdownConversionConfig,
  MarkdownOptimizerConfig,
  ChunkerConfig,
  FactGeneratorConfig,
  IngestorConfig,
  StageChainRequest,
  ExecuteAllStagesRequest
} from '../services/moragService';

// Processing template interface
export interface ProcessingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'quick' | 'quality' | 'specialized' | 'media';
  icon: string;
  estimatedTime: string;
  stages: string[];
  globalConfig?: StageConfig;
  stageConfigs: {
    [stageName: string]: StageConfig;
  };
  recommendedFor: string[];
  tags: string[];
}

// Default configurations for all stages
export const DEFAULT_STAGE_CONFIGS = {
  'markdown-conversion': {
    include_timestamps: false,
    transcription_model: 'whisper-large',
    speaker_diarization: false,
    topic_segmentation: false,
    language: 'en',
    chunk_on_sentences: true,
    preserve_formatting: true,
    extract_images: false,
    quality_threshold: 0.8,
    extract_text: true,
    generate_descriptions: false,
    ocr_engine: 'tesseract',
    resize_max_dimension: 1024,
    follow_links: false,
    max_depth: 1,
    respect_robots: true,
    extract_metadata: true
  } as MarkdownConversionConfig,
  
  'markdown-optimizer': {
    model: 'gemini-pro',
    max_tokens: 8192,
    temperature: 0.1,
    fix_transcription_errors: true,
    improve_readability: true,
    preserve_timestamps: true,
    normalize_formatting: true,
    remove_redundancy: true,
    enhance_structure: true
  } as MarkdownOptimizerConfig,
  
  'chunker': {
    chunk_strategy: 'semantic',
    chunk_size: 4000,
    overlap: 200,
    generate_summary: true,
    preserve_structure: true,
    min_chunk_size: 100,
    max_chunk_size: 8000,
    split_on_headers: true,
    include_metadata: true
  } as ChunkerConfig,
  
  'fact-generator': {
    max_facts_per_chunk: 10,
    confidence_threshold: 0.7,
    extract_entities: true,
    entity_types: ['PERSON', 'ORG', 'GPE', 'EVENT'],
    extract_relations: true,
    relation_confidence: 0.6,
    extract_keywords: true,
    domain: 'general',
    model: 'gemini-pro',
    temperature: 0.1,
    max_tokens: 4096
  } as FactGeneratorConfig,
  
  'ingestor': {
    databases: ['qdrant', 'neo4j'],
    collection_name: 'documents',
    batch_size: 50,
    enable_deduplication: true,
    dedup_threshold: 0.95,
    conflict_resolution: 'merge',
    overwrite_existing: false,
    validate_data: true,
    generate_embeddings: true,
    qdrant_config: {
      host: 'localhost',
      port: 6333,
      grpc_port: 6334,
      prefer_grpc: false,
      https: false,
      api_key: undefined,
      timeout: 30.0,
      collection_name: 'morag_documents',
      vector_size: 384,
      verify_ssl: undefined
    },
    neo4j_config: {
      uri: 'bolt://localhost:7687',
      username: 'neo4j',
      password: 'password',
      database: 'neo4j',
      max_connection_lifetime: 3600,
      max_connection_pool_size: 50,
      connection_acquisition_timeout: 60,
      verify_ssl: true,
      trust_all_certificates: false
    }
  } as IngestorConfig
};

// Predefined processing templates
export const PROCESSING_TEMPLATES: ProcessingTemplate[] = [
  {
    id: 'quick-processing',
    name: 'Quick Processing',
    description: 'Fast processing with minimal optimization for quick results',
    category: 'quick',
    icon: '⚡',
    estimatedTime: '1-3 minutes',
    stages: ['markdown-conversion', 'chunker', 'ingestor'],
    stageConfigs: {
      'chunker': {
        chunk_strategy: 'paragraph',
        chunk_size: 2000,
        overlap: 100,
        generate_summary: false
      }
    },
    recommendedFor: ['Quick prototyping', 'Testing', 'Simple documents'],
    tags: ['fast', 'basic', 'minimal']
  },
  
  {
    id: 'high-quality',
    name: 'High Quality',
    description: 'Comprehensive processing with optimization and fact extraction',
    category: 'quality',
    icon: '💎',
    estimatedTime: '5-10 minutes',
    stages: ['markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'],
    stageConfigs: {
      'markdown-conversion': {
        preserve_formatting: true,
        extract_metadata: true
      },
      'markdown-optimizer': {
        improve_readability: true,
        enhance_structure: true,
        remove_redundancy: true
      },
      'chunker': {
        chunk_strategy: 'semantic',
        chunk_size: 4000,
        generate_summary: true
      },
      'fact-generator': {
        max_facts_per_chunk: 15,
        confidence_threshold: 0.8,
        extract_entities: true,
        extract_relations: true
      }
    },
    recommendedFor: ['Research documents', 'Important content', 'Knowledge bases'],
    tags: ['comprehensive', 'quality', 'detailed']
  },
  
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: 'Optimized for academic papers and research documents',
    category: 'specialized',
    icon: '🎓',
    estimatedTime: '7-12 minutes',
    stages: ['markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'],
    stageConfigs: {
      'markdown-conversion': {
        preserve_formatting: true,
        extract_metadata: true,
        quality_threshold: 0.9
      },
      'chunker': {
        chunk_strategy: 'semantic',
        chunk_size: 6000,
        overlap: 300,
        split_on_headers: true,
        preserve_structure: true
      },
      'fact-generator': {
        domain: 'general',
        max_facts_per_chunk: 20,
        confidence_threshold: 0.75,
        extract_entities: true,
        entity_types: ['PERSON', 'ORG', 'GPE', 'EVENT', 'WORK_OF_ART'],
        extract_relations: true,
        extract_keywords: true
      }
    },
    recommendedFor: ['Academic papers', 'Research documents', 'Scientific literature'],
    tags: ['academic', 'research', 'detailed', 'structured']
  },
  
  {
    id: 'media-transcription',
    name: 'Media Transcription',
    description: 'Specialized for audio and video content with speaker identification',
    category: 'media',
    icon: '🎬',
    estimatedTime: '3-8 minutes',
    stages: ['markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'],
    stageConfigs: {
      'markdown-conversion': {
        include_timestamps: true,
        speaker_diarization: true,
        topic_segmentation: true,
        transcription_model: 'whisper-large'
      },
      'markdown-optimizer': {
        fix_transcription_errors: true,
        preserve_timestamps: true,
        improve_readability: true
      },
      'chunker': {
        chunk_strategy: 'topic',
        chunk_size: 4000,
        generate_summary: true
      }
    },
    recommendedFor: ['Podcasts', 'Interviews', 'Video content', 'Audio recordings'],
    tags: ['audio', 'video', 'transcription', 'speakers']
  },
  
  {
    id: 'web-content',
    name: 'Web Content',
    description: 'Optimized for web pages and online content extraction',
    category: 'specialized',
    icon: '🌐',
    estimatedTime: '2-5 minutes',
    stages: ['markdown-conversion', 'chunker', 'fact-generator', 'ingestor'],
    stageConfigs: {
      'markdown-conversion': {
        extract_metadata: true,
        follow_links: false,
        respect_robots: true
      },
      'chunker': {
        chunk_strategy: 'semantic',
        chunk_size: 3000,
        split_on_headers: true
      }
    },
    recommendedFor: ['Web articles', 'Blog posts', 'Online documentation'],
    tags: ['web', 'online', 'articles', 'metadata']
  },
  
  {
    id: 'legal-documents',
    name: 'Legal Documents',
    description: 'Specialized processing for legal and regulatory documents',
    category: 'specialized',
    icon: '⚖️',
    estimatedTime: '8-15 minutes',
    stages: ['markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'],
    stageConfigs: {
      'markdown-conversion': {
        preserve_formatting: true,
        quality_threshold: 0.95
      },
      'chunker': {
        chunk_strategy: 'semantic',
        chunk_size: 5000,
        overlap: 400,
        preserve_structure: true
      },
      'fact-generator': {
        domain: 'legal',
        confidence_threshold: 0.8,
        max_facts_per_chunk: 25,
        extract_entities: true,
        entity_types: ['PERSON', 'ORG', 'GPE', 'LAW', 'DATE'],
        extract_relations: true
      }
    },
    recommendedFor: ['Legal documents', 'Contracts', 'Regulations', 'Court filings'],
    tags: ['legal', 'formal', 'structured', 'precise']
  }
];

// Utility functions for working with templates
export class ProcessingTemplateService {
  /**
   * Get all available templates
   */
  static getAllTemplates(): ProcessingTemplate[] {
    return PROCESSING_TEMPLATES;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: ProcessingTemplate['category']): ProcessingTemplate[] {
    return PROCESSING_TEMPLATES.filter(template => template.category === category);
  }

  /**
   * Get a template by ID
   */
  static getTemplateById(id: string): ProcessingTemplate | undefined {
    return PROCESSING_TEMPLATES.find(template => template.id === id);
  }

  /**
   * Search templates by tags or name
   */
  static searchTemplates(query: string): ProcessingTemplate[] {
    const lowerQuery = query.toLowerCase();
    return PROCESSING_TEMPLATES.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      template.recommendedFor.some(use => use.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Merge template configuration with defaults
   */
  static mergeWithDefaults(template: ProcessingTemplate): {
    stages: string[];
    globalConfig?: StageConfig;
    stageConfigs: { [stageName: string]: StageConfig };
  } {
    const mergedStageConfigs: { [stageName: string]: StageConfig } = {};

    // For each stage in the template, merge with defaults
    for (const stage of template.stages) {
      const defaultConfig = DEFAULT_STAGE_CONFIGS[stage as keyof typeof DEFAULT_STAGE_CONFIGS];
      const templateConfig = template.stageConfigs[stage] || {};

      mergedStageConfigs[stage] = {
        ...defaultConfig,
        ...templateConfig
      };
    }

    return {
      stages: template.stages,
      globalConfig: template.globalConfig,
      stageConfigs: mergedStageConfigs
    };
  }

  /**
   * Create a stage chain request from a template
   */
  static createStageChainRequest(
    template: ProcessingTemplate,
    options: {
      outputDir?: string;
      webhookUrl?: string;
      stopOnFailure?: boolean;
    } = {}
  ): StageChainRequest {
    const merged = this.mergeWithDefaults(template);

    return {
      stages: merged.stages,
      global_config: merged.globalConfig,
      stage_configs: merged.stageConfigs,
      output_dir: options.outputDir,
      webhook_url: options.webhookUrl,
      stop_on_failure: options.stopOnFailure ?? true
    };
  }

  /**
   * Create an execute-all request from a template
   */
  static createExecuteAllRequest(
    template: ProcessingTemplate,
    options: {
      outputDir?: string;
      webhookUrl?: string;
      stopOnFailure?: boolean;
    } = {}
  ): ExecuteAllStagesRequest {
    const merged = this.mergeWithDefaults(template);

    return {
      stages: merged.stages,
      global_config: merged.globalConfig,
      stage_configs: merged.stageConfigs,
      output_dir: options.outputDir,
      webhook_url: options.webhookUrl,
      stop_on_failure: options.stopOnFailure ?? true
    };
  }

  /**
   * Get recommended templates for a file type
   */
  static getRecommendedTemplates(fileType: string): ProcessingTemplate[] {
    const recommendations: { [key: string]: string[] } = {
      'pdf': ['high-quality', 'academic-research', 'legal-documents'],
      'docx': ['high-quality', 'academic-research'],
      'txt': ['quick-processing', 'high-quality'],
      'md': ['quick-processing', 'high-quality'],
      'mp3': ['media-transcription'],
      'mp4': ['media-transcription'],
      'wav': ['media-transcription'],
      'url': ['web-content'],
      'youtube': ['media-transcription'],
      'website': ['web-content']
    };

    const templateIds = recommendations[fileType.toLowerCase()] || ['quick-processing', 'high-quality'];
    return templateIds.map(id => this.getTemplateById(id)).filter(Boolean) as ProcessingTemplate[];
  }

  /**
   * Validate template configuration
   */
  static validateTemplate(template: ProcessingTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id || template.id.trim() === '') {
      errors.push('Template ID is required');
    }

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.stages || template.stages.length === 0) {
      errors.push('Template must have at least one stage');
    }

    const validStages = Object.keys(DEFAULT_STAGE_CONFIGS);
    for (const stage of template.stages) {
      if (!validStages.includes(stage)) {
        errors.push(`Invalid stage: ${stage}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
