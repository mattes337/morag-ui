// LLM Model Configuration for different agents
export interface LLMModelConfig {
  default_model?: string;
  fact_extraction_agent_model?: string;
  entity_extraction_agent_model?: string;
  relation_extraction_agent_model?: string;
  keyword_extraction_agent_model?: string;
  summarization_agent_model?: string;
  content_analysis_agent_model?: string;
  markdown_optimizer_agent_model?: string;
  chunking_agent_model?: string;
}

// Stage-specific configuration options
export interface MarkdownConversionConfig {
  // Audio/Video processing
  include_timestamps?: boolean;
  transcription_model?: string;
  speaker_diarization?: boolean;
  topic_segmentation?: boolean;
  language?: string;

  // Document processing
  chunk_on_sentences?: boolean;
  preserve_formatting?: boolean;
  extract_images?: boolean;
  quality_threshold?: number;

  // Image processing
  extract_text?: boolean;
  generate_descriptions?: boolean;
  ocr_engine?: string;
  resize_max_dimension?: number;

  // Web processing
  follow_links?: boolean;
  max_depth?: number;
  respect_robots?: boolean;
  extract_metadata?: boolean;

  // Prompt configuration
  domain?: string;
  custom_instructions?: string;
  include_examples?: boolean;
  include_context?: boolean;
}

export interface MarkdownOptimizerConfig {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  fix_transcription_errors?: boolean;
  improve_readability?: boolean;
  preserve_timestamps?: boolean;
  normalize_formatting?: boolean;
  remove_redundancy?: boolean;
  enhance_structure?: boolean;

  // Prompt configuration
  domain?: string;
  custom_instructions?: string;
  include_examples?: boolean;
  include_context?: boolean;
}

export interface ChunkerConfig {
  chunk_strategy?: 'semantic' | 'page-level' | 'topic-based' | 'sentence' | 'paragraph';
  chunk_size?: number;
  overlap?: number;
  generate_summary?: boolean;
  preserve_structure?: boolean;
  min_chunk_size?: number;
  max_chunk_size?: number;
  split_on_headers?: boolean;
  include_metadata?: boolean;

  // Prompt configuration
  domain?: string;
  custom_instructions?: string;
  include_examples?: boolean;
  include_context?: boolean;
}

export interface FactGeneratorConfig {
  max_facts_per_chunk?: number;
  confidence_threshold?: number;
  extract_entities?: boolean;
  entity_types?: string[];
  extract_relations?: boolean;
  relation_confidence?: number;
  extract_keywords?: boolean;
  domain?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;

  // Quality Gate Configuration
  min_confidence?: number;
  allow_vague_language?: boolean;
  require_entities?: boolean;
  min_fact_length?: number;
  strict_validation?: boolean;

  // Prompt configuration
  custom_instructions?: string;
  include_examples?: boolean;
  include_context?: boolean;
  output_format?: string;
  strict_json?: boolean;
  language?: string;
}

export interface IngestorConfig {
  databases?: string[];
  collection_name?: string;
  batch_size?: number;
  enable_deduplication?: boolean;
  dedup_threshold?: number;
  conflict_resolution?: 'merge' | 'replace' | 'skip';
  overwrite_existing?: boolean;
  validate_data?: boolean;
  generate_embeddings?: boolean;

  // Database-specific configs
  qdrant_config?: any;
  neo4j_config?: any;

  // Prompt configuration
  domain?: string;
  custom_instructions?: string;
  include_examples?: boolean;
  include_context?: boolean;
}

// Stage configurations container
export interface StageConfigs {
  'markdown-conversion'?: MarkdownConversionConfig;
  'markdown-optimizer'?: MarkdownOptimizerConfig;
  'chunker'?: ChunkerConfig;
  'fact-generator'?: FactGeneratorConfig;
  'ingestor'?: IngestorConfig;
  [key: string]: any; // Allow string indexing for dynamic access
}

// Complete realm configuration
export interface RealmConfig {
  llm_model_config?: LLMModelConfig;
  stage_configs?: StageConfigs;
  global_config?: {
    language?: string;
    domain?: string;
  };
}

// Legacy interface for backward compatibility
export interface RealmPromptConfig {
  domain?: string;
  ingestionPrompt?: string;
  systemPrompt?: string;
  extractionPrompt?: string;
  domainPrompt?: string;
}
