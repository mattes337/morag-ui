import {
  StageConfig,
  MarkdownConversionConfig,
  MarkdownOptimizerConfig,
  ChunkerConfig,
  FactGeneratorConfig,
  IngestorConfig
} from '../services/moragService';
import { DEFAULT_STAGE_CONFIGS } from './templates';

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Field validation rules
export interface FieldValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: string[];
  arrayItemType?: 'string' | 'number';
  customValidator?: (value: any) => string | null;
}

// Stage validation schemas
export const STAGE_VALIDATION_SCHEMAS: { [stageName: string]: { [field: string]: FieldValidationRule } } = {
  'markdown-conversion': {
    include_timestamps: { type: 'boolean' },
    transcription_model: { 
      type: 'string', 
      enum: ['whisper-tiny', 'whisper-base', 'whisper-small', 'whisper-medium', 'whisper-large'] 
    },
    speaker_diarization: { type: 'boolean' },
    topic_segmentation: { type: 'boolean' },
    language: { type: 'string', pattern: /^[a-z]{2}(-[A-Z]{2})?$/ },
    chunk_on_sentences: { type: 'boolean' },
    preserve_formatting: { type: 'boolean' },
    extract_images: { type: 'boolean' },
    quality_threshold: { type: 'number', min: 0, max: 1 },
    extract_text: { type: 'boolean' },
    generate_descriptions: { type: 'boolean' },
    ocr_engine: { type: 'string', enum: ['tesseract', 'easyocr'] },
    resize_max_dimension: { type: 'number', min: 100, max: 4096 },
    follow_links: { type: 'boolean' },
    max_depth: { type: 'number', min: 1, max: 10 },
    respect_robots: { type: 'boolean' },
    extract_metadata: { type: 'boolean' }
  },
  
  'markdown-optimizer': {
    model: { 
      type: 'string', 
      enum: ['gemini-pro', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku'] 
    },
    max_tokens: { type: 'number', min: 100, max: 32000 },
    temperature: { type: 'number', min: 0, max: 2 },
    fix_transcription_errors: { type: 'boolean' },
    improve_readability: { type: 'boolean' },
    preserve_timestamps: { type: 'boolean' },
    normalize_formatting: { type: 'boolean' },
    remove_redundancy: { type: 'boolean' },
    enhance_structure: { type: 'boolean' }
  },
  
  'chunker': {
    chunk_strategy: { 
      type: 'string', 
      enum: ['semantic', 'page-level', 'topic-based', 'sentence', 'paragraph'] 
    },
    chunk_size: { type: 'number', min: 100, max: 20000 },
    overlap: { type: 'number', min: 0, max: 2000 },
    generate_summary: { type: 'boolean' },
    preserve_structure: { type: 'boolean' },
    min_chunk_size: { type: 'number', min: 50, max: 1000 },
    max_chunk_size: { type: 'number', min: 1000, max: 50000 },
    split_on_headers: { type: 'boolean' },
    include_metadata: { type: 'boolean' }
  },
  
  'fact-generator': {
    max_facts_per_chunk: { type: 'number', min: 1, max: 100 },
    confidence_threshold: { type: 'number', min: 0, max: 1 },
    extract_entities: { type: 'boolean' },
    entity_types: { 
      type: 'array', 
      arrayItemType: 'string',
      customValidator: (value: string[]) => {
        const validTypes = ['PERSON', 'ORG', 'GPE', 'EVENT', 'DATE', 'TIME', 'MONEY', 'PERCENT', 'WORK_OF_ART', 'LAW', 'LANGUAGE', 'PRODUCT'];
        const invalidTypes = value.filter(type => !validTypes.includes(type));
        return invalidTypes.length > 0 ? `Invalid entity types: ${invalidTypes.join(', ')}` : null;
      }
    },
    extract_relations: { type: 'boolean' },
    relation_confidence: { type: 'number', min: 0, max: 1 },
    extract_keywords: { type: 'boolean' },
    domain: { 
      type: 'string', 
      enum: ['general', 'medical', 'legal', 'technical', 'academic', 'business'] 
    },
    model: { 
      type: 'string', 
      enum: ['gemini-pro', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku'] 
    },
    temperature: { type: 'number', min: 0, max: 2 },
    max_tokens: { type: 'number', min: 100, max: 32000 }
  },
  
  'ingestor': {
    databases: { 
      type: 'array', 
      arrayItemType: 'string',
      customValidator: (value: string[]) => {
        const validDbs = ['qdrant', 'neo4j', 'pinecone', 'weaviate', 'chroma'];
        const invalidDbs = value.filter(db => !validDbs.includes(db));
        return invalidDbs.length > 0 ? `Invalid databases: ${invalidDbs.join(', ')}` : null;
      }
    },
    collection_name: { type: 'string', minLength: 1, maxLength: 100 },
    batch_size: { type: 'number', min: 1, max: 1000 },
    enable_deduplication: { type: 'boolean' },
    dedup_threshold: { type: 'number', min: 0, max: 1 },
    conflict_resolution: { 
      type: 'string', 
      enum: ['merge', 'replace', 'skip'] 
    },
    overwrite_existing: { type: 'boolean' },
    validate_data: { type: 'boolean' },
    generate_embeddings: { type: 'boolean' },
    qdrant_config: { type: 'object' },
    neo4j_config: { type: 'object' }
  }
};

// Configuration validation service
export class ConfigurationValidator {
  /**
   * Validate a single field value
   */
  static validateField(value: any, rule: FieldValidationRule, fieldName: string): string[] {
    const errors: string[] = [];

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
      return errors;
    }

    // Skip validation if value is undefined/null and not required
    if (value === undefined || value === null) {
      return errors;
    }

    // Type validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldName} must be a string`);
          break;
        }
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${fieldName} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${fieldName} must be at most ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${fieldName} format is invalid`);
        }
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${fieldName} must be a valid number`);
          break;
        }
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${fieldName} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${fieldName} must be at most ${rule.max}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldName} must be a boolean`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${fieldName} must be an array`);
          break;
        }
        if (rule.arrayItemType) {
          value.forEach((item, index) => {
            if (typeof item !== rule.arrayItemType) {
              errors.push(`${fieldName}[${index}] must be a ${rule.arrayItemType}`);
            }
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`${fieldName} must be an object`);
        }
        break;
    }

    // Custom validation
    if (rule.customValidator) {
      const customError = rule.customValidator(value);
      if (customError) {
        errors.push(`${fieldName}: ${customError}`);
      }
    }

    return errors;
  }

  /**
   * Validate stage configuration
   */
  static validateStageConfig(stageName: string, config: StageConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const schema = STAGE_VALIDATION_SCHEMAS[stageName];
    if (!schema) {
      errors.push(`Unknown stage: ${stageName}`);
      return { valid: false, errors, warnings };
    }

    // Validate each field in the config
    for (const [fieldName, value] of Object.entries(config)) {
      const rule = schema[fieldName];
      if (!rule) {
        warnings.push(`Unknown field '${fieldName}' for stage '${stageName}'`);
        continue;
      }

      const fieldErrors = this.validateField(value, rule, fieldName);
      errors.push(...fieldErrors);
    }

    // Check for missing required fields
    for (const [fieldName, rule] of Object.entries(schema)) {
      if (rule.required && !(fieldName in config)) {
        errors.push(`Required field '${fieldName}' is missing for stage '${stageName}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate multiple stage configurations
   */
  static validateStageConfigs(stageConfigs: { [stageName: string]: StageConfig }): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const [stageName, config] of Object.entries(stageConfigs)) {
      const result = this.validateStageConfig(stageName, config);
      allErrors.push(...result.errors.map(error => `[${stageName}] ${error}`));
      allWarnings.push(...result.warnings.map(warning => `[${stageName}] ${warning}`));
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Validate stage execution order
   */
  static validateStageOrder(stages: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validStages = Object.keys(DEFAULT_STAGE_CONFIGS);
    const recommendedOrder = ['markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'];

    // Check for invalid stages
    const invalidStages = stages.filter(stage => !validStages.includes(stage));
    if (invalidStages.length > 0) {
      errors.push(`Invalid stages: ${invalidStages.join(', ')}`);
    }

    // Check for required dependencies
    const stageDependencies: { [stage: string]: string[] } = {
      'markdown-optimizer': ['markdown-conversion'],
      'chunker': ['markdown-conversion'],
      'fact-generator': ['chunker'],
      'ingestor': ['fact-generator']
    };

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const dependencies = stageDependencies[stage];
      
      if (dependencies) {
        const missingDeps = dependencies.filter(dep => {
          const depIndex = stages.indexOf(dep);
          return depIndex === -1 || depIndex > i;
        });
        
        if (missingDeps.length > 0) {
          errors.push(`Stage '${stage}' requires ${missingDeps.join(', ')} to be executed before it`);
        }
      }
    }

    // Check for recommended order
    const stageIndices = stages.map(stage => recommendedOrder.indexOf(stage)).filter(index => index !== -1);
    const sortedIndices = [...stageIndices].sort((a, b) => a - b);
    
    if (JSON.stringify(stageIndices) !== JSON.stringify(sortedIndices)) {
      warnings.push('Stages are not in the recommended order. Consider reordering for optimal performance.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize and apply defaults to configuration
   */
  static sanitizeAndApplyDefaults(stageName: string, config: StageConfig): StageConfig {
    const defaultConfig = DEFAULT_STAGE_CONFIGS[stageName as keyof typeof DEFAULT_STAGE_CONFIGS];
    if (!defaultConfig) {
      return config;
    }

    const sanitized = { ...defaultConfig };

    // Apply user config, sanitizing values
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined && value !== null) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Get configuration recommendations based on file type
   */
  static getRecommendations(fileType: string, stages: string[]): string[] {
    const recommendations: string[] = [];

    // File type specific recommendations
    if (fileType === 'audio' || fileType === 'video') {
      if (stages.includes('markdown-conversion')) {
        recommendations.push('Consider enabling speaker_diarization and include_timestamps for audio/video content');
      }
    }

    if (fileType === 'pdf' || fileType === 'image') {
      if (stages.includes('markdown-conversion')) {
        recommendations.push('Consider enabling extract_text for better OCR results');
      }
    }

    // Stage combination recommendations
    if (stages.includes('markdown-optimizer') && !stages.includes('markdown-conversion')) {
      recommendations.push('markdown-optimizer requires markdown-conversion to be effective');
    }

    if (stages.includes('fact-generator') && !stages.includes('chunker')) {
      recommendations.push('fact-generator works best with chunker for better context');
    }

    return recommendations;
  }
}
