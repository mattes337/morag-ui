import { Server } from '@prisma/client';

// Stage configuration interfaces based on the new API
export interface StageConfig {
  [key: string]: any;
}

export interface MarkdownConversionConfig extends StageConfig {
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
}

export interface MarkdownOptimizerConfig extends StageConfig {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  fix_transcription_errors?: boolean;
  improve_readability?: boolean;
  preserve_timestamps?: boolean;
  normalize_formatting?: boolean;
  remove_redundancy?: boolean;
  enhance_structure?: boolean;
}

export interface ChunkerConfig extends StageConfig {
  chunk_strategy?: 'semantic' | 'page-level' | 'topic-based' | 'sentence' | 'paragraph';
  chunk_size?: number;
  overlap?: number;
  generate_summary?: boolean;
  preserve_structure?: boolean;
  min_chunk_size?: number;
  max_chunk_size?: number;
  split_on_headers?: boolean;
  include_metadata?: boolean;
}

export interface FactGeneratorConfig extends StageConfig {
  max_facts_per_chunk?: number;
  confidence_threshold?: number;
  extract_entities?: boolean;
  entity_types?: string[];
  extract_relations?: boolean;
  relation_confidence?: number;
  extract_keywords?: boolean;
  domain?: 'general' | 'medical' | 'legal' | 'technical';
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface IngestorConfig extends StageConfig {
  databases?: string[];
  collection_name?: string;
  batch_size?: number;
  enable_deduplication?: boolean;
  dedup_threshold?: number;
  conflict_resolution?: 'merge' | 'replace' | 'skip';
  overwrite_existing?: boolean;
  validate_data?: boolean;
  generate_embeddings?: boolean;
  qdrant_config?: {
    host?: string;
    port?: number;
    grpc_port?: number;
    prefer_grpc?: boolean;
    https?: boolean;
    api_key?: string;
    timeout?: number;
    collection_name?: string;
    vector_size?: number;
    verify_ssl?: boolean;
  };
  neo4j_config?: {
    uri?: string;
    username?: string;
    password?: string;
    database?: string;
    max_connection_lifetime?: number;
    max_connection_pool_size?: number;
    connection_acquisition_timeout?: number;
    verify_ssl?: boolean;
    trust_all_certificates?: boolean;
  };
}

// Stage chain request for executing multiple stages
export interface StageChainRequest {
  stages: string[];
  global_config?: StageConfig;
  stage_configs?: {
    [stageName: string]: StageConfig;
  };
  output_dir?: string;
  stop_on_failure?: boolean;
  webhook_url?: string;
}

// Execute all stages request
export interface ExecuteAllStagesRequest {
  stages: string[];
  global_config?: StageConfig;
  stage_configs?: {
    [stageName: string]: StageConfig;
  };
  webhook_url?: string;
  output_dir?: string;
  stop_on_failure?: boolean;
}

// Legacy unified process request structure (kept for backward compatibility)
export interface UnifiedProcessRequest {
  mode: 'convert' | 'process' | 'ingest';
  source_type: 'file' | 'url' | 'batch';
  url?: string;
  batch_items?: Array<{
    url?: string;
    file_path?: string;
    metadata?: Record<string, any>;
  }>;
  webhook_url?: string;
  webhook_auth_token?: string;
  document_id?: string;
  collection_name?: string;
  language?: string;
  chunking_strategy?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  metadata?: Record<string, any>;
  database_servers?: Array<{
    type: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
    apiKey?: string;
    database?: string;
    collection?: string;
  }>;
}

// Stage execution response structure
export interface StageExecutionResponse {
  success: boolean;
  stage_type: string;
  status: 'completed' | 'failed' | 'running';
  output_files: Array<{
    filename: string;
    file_path: string;
    file_size: number;
    created_at: string;
    stage_type: string;
    content_type: string;
    checksum?: string;
    content?: string;
  }>;
  metadata: {
    execution_time: number;
    start_time: string;
    end_time: string;
    input_files: string[];
    config_used: StageConfig;
    warnings: string[];
  };
  error_message?: string;
  webhook_sent: boolean;
}

// Stage chain response structure
export interface StageChainResponse {
  success: boolean;
  stages_executed: StageExecutionResponse[];
  total_execution_time: number;
  failed_stage?: string;
  final_output_files: Array<{
    filename: string;
    file_path: string;
    file_size: number;
    stage_type: string;
  }>;
}

// Execute all stages response structure
export interface ExecuteAllStagesResponse {
  success: boolean;
  task_id?: string;
  estimated_time_seconds?: number;
  status_url?: string;
  message: string;
  stages_executed?: StageExecutionResponse[];
  total_execution_time?: number;
  failed_stage?: string;
  final_output_files?: Array<{
    filename: string;
    file_path: string;
    file_size: number;
    stage_type: string;
  }>;
}

// Legacy response structures (kept for backward compatibility)
export interface UnifiedProcessResponse {
  success: boolean;
  mode: string;
  markdown?: string;
  metadata?: Record<string, any>;
  processing_time_ms?: number;
  task_id?: string;
  estimated_time_seconds?: number;
  status_url?: string;
  document_id?: string;
  error_message?: string;
  warnings?: string[];
  thumbnails?: string[];
  message?: string;
}

export interface MarkdownConversionResponse {
  success: boolean;
  markdown: string;
  metadata: Record<string, any>;
  processing_time_ms: number;
  error_message?: string;
}

export interface ProcessIngestResponse {
  success: boolean;
  task_id: string;
  document_id?: string;
  estimated_time_seconds: number;
  status_url: string;
  message: string;
}

export interface WebhookPayload {
  task_id: string;
  document_id?: string;
  batch_job_id?: string;
  timestamp: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress: {
    percentage: number;
    current_step: string;
    total_steps: number;
    step_details?: Record<string, any>;
  };
  result?: {
    markdown?: string;
    metadata?: Record<string, any>;
    chunks?: number;
    entities?: any[];
    facts?: any[];
  };
  error?: {
    code: string;
    message: string;
    step: string;
    details?: Record<string, any>;
  };
}

export interface StageProcessRequest {
  documentId: string;
  stage: string;
  executionId: string;
  document: {
    id: string;
    title: string;
    content: string;
    filePath: string;
    realmId: string;
  };
  webhookUrl: string;
  metadata?: Record<string, any>;
}

export interface StageProcessResponse {
  success: boolean;
  taskId: string;
  executionId: string;
  stage: string;
  estimatedTimeSeconds: number;
  statusUrl: string;
  message: string;
  immediateResult?: any; // For synchronous processing results
}

export class MoragService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = process.env.MORAG_API_URL || 'http://localhost:8000', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  private getFormHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }









  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/status/${taskId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/cancel/${taskId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Convert internal stage names to canonical stage names
   */
  private getCanonicalStageName(stage: string): string {
    const stageMapping: Record<string, string> = {
      'MARKDOWN_CONVERSION': 'markdown-conversion',
      'MARKDOWN_OPTIMIZER': 'markdown-optimizer',
      'CHUNKER': 'chunker',
      'FACT_GENERATOR': 'fact-generator',
      'INGESTOR': 'ingestor',
    };
    return stageMapping[stage] || stage.toLowerCase().replace('_', '-');
  }

  /**
   * Determine if a stage should use output files from the previous stage
   */
  private async shouldUsePreviousStageOutput(documentId: string, stage: string): Promise<boolean> {
    console.log(`🔍 [MoRAG] Checking dependencies for stage ${stage} on document ${documentId}`);

    // Define stage dependencies
    const stageDependencies: Record<string, string[]> = {
      'MARKDOWN_OPTIMIZER': ['MARKDOWN_CONVERSION'],
      'CHUNKER': ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER'],
      'FACT_GENERATOR': ['CHUNKER'],
      'INGESTOR': ['FACT_GENERATOR'],
    };

    const dependencies = stageDependencies[stage];
    if (!dependencies || dependencies.length === 0) {
      console.log(`📝 [MoRAG] No dependencies for stage ${stage}, using original file`);
      return false; // No dependencies, use original file
    }

    console.log(`📋 [MoRAG] Dependencies for ${stage}: ${dependencies.join(', ')}`);

    // Import here to avoid circular dependency
    const { stageExecutionService } = await import('./stageExecutionService');

    // Check if any of the dependency stages have completed successfully
    for (const depStage of dependencies) {
      console.log(`🔎 [MoRAG] Checking execution status for dependency stage: ${depStage}`);
      const execution = await stageExecutionService.getLatestExecution(documentId, depStage as any);

      if (execution) {
        console.log(`📊 [MoRAG] Found execution for ${depStage}: status=${execution.status}, outputFiles=${execution.outputFiles?.length || 0}`);
        if (execution.status === 'COMPLETED' && execution.outputFiles && execution.outputFiles.length > 0) {
          console.log(`✅ [MoRAG] Dependency ${depStage} completed with output files, will use previous stage output`);
          return true;
        }
      } else {
        console.log(`❌ [MoRAG] No execution found for dependency stage: ${depStage}`);
      }
    }

    console.log(`⚠️ [MoRAG] No completed dependencies found for ${stage}, using original file`);
    return false;
  }

  /**
   * Get output files from the most recent completed dependency stage
   */
  private async getPreviousStageOutputFiles(documentId: string, stage: string): Promise<string[]> {
    console.log(`🔍 [MoRAG] Getting previous stage output files for ${stage} on document ${documentId}`);

    // Define stage dependencies in order of preference
    const stageDependencies: Record<string, string[]> = {
      'MARKDOWN_OPTIMIZER': ['MARKDOWN_CONVERSION'],
      'CHUNKER': ['MARKDOWN_OPTIMIZER', 'MARKDOWN_CONVERSION'], // Prefer optimizer output, fallback to conversion
      'FACT_GENERATOR': ['CHUNKER'],
      'INGESTOR': ['FACT_GENERATOR'],
    };

    const dependencies = stageDependencies[stage];
    if (!dependencies || dependencies.length === 0) {
      console.log(`📝 [MoRAG] No dependencies defined for stage ${stage}`);
      return [];
    }

    console.log(`📋 [MoRAG] Checking dependencies in order: ${dependencies.join(', ')}`);

    // Import here to avoid circular dependency
    const { stageExecutionService } = await import('./stageExecutionService');

    // Check dependencies in order of preference
    for (const depStage of dependencies) {
      console.log(`🔎 [MoRAG] Checking ${depStage} for output files...`);
      const execution = await stageExecutionService.getLatestExecution(documentId, depStage as any);

      if (execution) {
        console.log(`📊 [MoRAG] Execution found for ${depStage}: status=${execution.status}, outputFiles=${execution.outputFiles?.length || 0}`);
        if (execution.status === 'COMPLETED' && execution.outputFiles && execution.outputFiles.length > 0) {
          // For chunker stage, prioritize optimized markdown files over regular markdown
          if (stage === 'CHUNKER' && execution.outputFiles.length > 1) {
            const optimizedFiles = execution.outputFiles.filter(file => file.includes('.opt.md'));
            const regularFiles = execution.outputFiles.filter(file => file.includes('.md') && !file.includes('.opt.md'));

            if (optimizedFiles.length > 0) {
              console.log(`✅ [MoRAG] Found optimized markdown files from ${depStage}: ${optimizedFiles.join(', ')}`);
              return optimizedFiles;
            } else if (regularFiles.length > 0) {
              console.log(`✅ [MoRAG] Found regular markdown files from ${depStage}: ${regularFiles.join(', ')}`);
              return regularFiles;
            }
          }

          // For fact-generator stage, only accept chunk files (.chunks.json)
          if (stage === 'FACT_GENERATOR') {
            const chunkFiles = execution.outputFiles.filter(file => file.includes('.chunks.json'));

            console.log(`🔍 [MoRAG] Fact-generator dependency check for ${depStage}:`);
            console.log(`   - Execution ID: ${execution.id}`);
            console.log(`   - All output files: ${execution.outputFiles.join(', ')}`);
            console.log(`   - Chunk files found: ${chunkFiles.join(', ')}`);

            if (chunkFiles.length > 0) {
              console.log(`✅ [MoRAG] Found chunk files from ${depStage}: ${chunkFiles.join(', ')}`);
              return chunkFiles;
            } else {
              console.warn(`⚠️ [MoRAG] No chunk files found from ${depStage} for fact-generator. Available files: ${execution.outputFiles.join(', ')}`);
              continue; // Skip this dependency and check the next one
            }
          }

          // For ingestor stage, require both chunk files and fact files
          if (stage === 'INGESTOR') {
            const factFiles = execution.outputFiles.filter(file => file.includes('.facts.json'));

            if (factFiles.length > 0) {
              console.log(`✅ [MoRAG] Found fact files from ${depStage}: ${factFiles.join(', ')}`);
              return factFiles;
            } else {
              console.warn(`⚠️ [MoRAG] No fact files found from ${depStage} for ingestor. Available files: ${execution.outputFiles.join(', ')}`);
              continue; // Skip this dependency and check the next one
            }
          }

          console.log(`✅ [MoRAG] Found output files from ${depStage}: ${execution.outputFiles.join(', ')}`);
          return execution.outputFiles;
        }
      } else {
        console.log(`❌ [MoRAG] No execution found for ${depStage}`);
      }
    }

    // Special handling for stages that require specific file types
    if (stage === 'FACT_GENERATOR') {
      console.error(`❌ [MoRAG] No chunk files (.chunks.json) found for fact-generator stage. This stage requires chunker output.`);
      throw new Error('MISSING_CHUNK_FILES: Fact-generator requires chunk files from chunker stage');
    }

    if (stage === 'INGESTOR') {
      console.error(`❌ [MoRAG] No fact files (.facts.json) found for ingestor stage. This stage requires fact-generator output.`);
      throw new Error('MISSING_FACT_FILES: Ingestor requires fact files from fact-generator stage');
    }

    console.warn(`⚠️ [MoRAG] No output files found from dependency stages for ${stage}`);
    return [];
  }

  /**
   * Check if a stage has missing dependencies and can trigger automatic resolution
   */
  private async checkMissingDependencies(documentId: string, stage: string): Promise<{ hasMissingDeps: boolean; missingStages: string[] }> {
    console.log(`🔍 [MoRAG] Checking missing dependencies for stage ${stage} on document ${documentId}`);

    // Define stage dependencies
    const stageDependencies: Record<string, string[]> = {
      'MARKDOWN_OPTIMIZER': ['MARKDOWN_CONVERSION'],
      'CHUNKER': ['MARKDOWN_CONVERSION'], // Chunker requires markdown conversion (optimizer is optional)
      'FACT_GENERATOR': ['CHUNKER'],
      'INGESTOR': ['FACT_GENERATOR'],
    };

    const dependencies = stageDependencies[stage];
    if (!dependencies || dependencies.length === 0) {
      return { hasMissingDeps: false, missingStages: [] };
    }

    // Import here to avoid circular dependency
    const { stageExecutionService } = await import('./stageExecutionService');

    const missingStages: string[] = [];

    // For chunker, we only require MARKDOWN_CONVERSION (not MARKDOWN_OPTIMIZER)
    if (stage === 'CHUNKER') {
      const execution = await stageExecutionService.getLatestExecution(documentId, 'MARKDOWN_CONVERSION' as any);
      if (!execution || execution.status !== 'COMPLETED' || !execution.outputFiles || execution.outputFiles.length === 0) {
        missingStages.push('MARKDOWN_CONVERSION');
      }
    } else {
      // For other stages, check all dependencies
      for (const depStage of dependencies) {
        const execution = await stageExecutionService.getLatestExecution(documentId, depStage as any);
        if (!execution || execution.status !== 'COMPLETED' || !execution.outputFiles || execution.outputFiles.length === 0) {
          missingStages.push(depStage);
        }
      }
    }

    return {
      hasMissingDeps: missingStages.length > 0,
      missingStages
    };
  }

  /**
   * Process a specific stage for a document using the new API
   */
  async processStage(request: StageProcessRequest): Promise<StageProcessResponse> {
    console.log(`🎯 [MoragService] Processing stage ${request.stage} for document ${request.documentId}`);
    console.log(`🔗 [MoragService] Backend URL: ${this.baseUrl}`);
    console.log(`🔑 [MoragService] Has API Key: ${!!this.apiKey}`);

    const canonicalStage = this.getCanonicalStageName(request.stage);

    // Create form data for the new API according to BACKEND.json specification
    const formData = new FormData();

    // Check if this is a URL-based document
    const isUrlDocument = request.metadata?.isUrlDocument || false;
    const sourceUrl = request.metadata?.sourceUrl;

    // Check if we have document content to upload as a file
    const hasFileContent = !isUrlDocument && request.document.content && request.document.content.trim().length > 0;

    // Determine input files based on stage dependencies
    let inputFiles: string[] = [];

    console.log(`🔍 [MoRAG] Determining input files for stage ${request.stage}, hasFileContent: ${hasFileContent}, isUrlDocument: ${isUrlDocument}`);

    if (isUrlDocument && sourceUrl) {
      // For URL documents, pass the URL in input_files array
      inputFiles = [sourceUrl];
      console.log(`🌐 [MoRAG] Processing URL document: ${sourceUrl}`);
    } else {
      // For stages that depend on previous stages, get output files from previous stage
      const shouldUsePrevious = await this.shouldUsePreviousStageOutput(request.documentId, request.stage);
      console.log(`🔍 [MoRAG] Should use previous stage output: ${shouldUsePrevious}`);

      if (shouldUsePrevious) {
        inputFiles = await this.getPreviousStageOutputFiles(request.documentId, request.stage);
        console.log(`📁 [MoRAG] Using previous stage output files: ${inputFiles.join(', ')}`);

        // Special logging for fact-generator to verify chunk files
        if (request.stage === 'FACT_GENERATOR') {
          console.log(`🔍 [MoRAG] FACT_GENERATOR input verification:`);
          console.log(`   - Stage: ${request.stage}`);
          console.log(`   - Document ID: ${request.documentId}`);
          console.log(`   - Input files: ${JSON.stringify(inputFiles)}`);
          console.log(`   - All files are chunk files: ${inputFiles.every(f => f.includes('.chunks.json'))}`);
        }
      } else if (!hasFileContent && request.document.filePath) {
        // Use the original file path if available
        inputFiles = [request.document.filePath];
        console.log(`📁 [MoRAG] Using document file path: ${request.document.filePath}`);
      } else if (!hasFileContent) {
        // Fallback to a standard path pattern
        inputFiles = [`./uploads/documents/${request.documentId}/original/${request.document.title}`];
        console.log(`📁 [MoRAG] Using fallback path: ${inputFiles[0]}`);
      }
    }

    const stageRequest = {
      input_files: inputFiles,
      config: request.metadata || {},
      output_dir: `./output/${request.documentId}`,
      webhook_config: {
        url: request.webhookUrl,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      skip_if_exists: false // Always process, don't skip
    };

    // Add the request data
    formData.append('request', JSON.stringify(stageRequest));

    // Add the document content as a file if we have content
    if (hasFileContent) {
      const blob = new Blob([request.document.content], { type: 'text/markdown' });
      formData.append('file', blob, `${request.document.title}.md`);
      console.log(`📄 [MoRAG] Uploading file: ${request.document.title}.md (${request.document.content.length} chars)`);
    } else if (inputFiles.length > 0) {
      // If no content, we rely on input_files array
      console.log(`📁 [MoRAG] Using input_files: ${inputFiles.join(', ')}`);
    } else {
      console.warn(`⚠️ [MoRAG] No file content or input_files provided for ${request.document.title}`);
    }

    // Add additional form fields as per API spec
    formData.append('output_dir', `./output/${request.documentId}`);
    formData.append('webhook_url', request.webhookUrl);
    formData.append('return_content', 'false'); // Don't return file content in response

    console.log(`🚀 [MoRAG] Calling ${canonicalStage} stage for document ${request.documentId}`);
    console.log(`🔗 [MoRAG] Endpoint: ${this.baseUrl}/api/v1/stages/${canonicalStage}/execute`);
    console.log(`📋 [MoRAG] Request details:`);
    console.log(`   - Stage: ${canonicalStage}`);
    console.log(`   - Input files: ${JSON.stringify(stageRequest.input_files)}`);
    console.log(`   - Has file content: ${hasFileContent}`);
    console.log(`   - Output dir: ${stageRequest.output_dir}`);

    const response = await fetch(`${this.baseUrl}/api/v1/stages/${canonicalStage}/execute`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - let the browser set it with boundary
        'Authorization': this.getHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [MoRAG] API error details:`, errorText);
      console.error(`❌ [MoRAG] Request details:`, {
        stage: canonicalStage,
        documentId: request.documentId,
        hasFileContent,
        stageRequest
      });

      // Check if this is a validation error that might be due to missing dependencies
      if (response.status === 500 && errorText.includes('Input validation failed')) {
        console.log(`🔍 [MoRAG] Input validation failed for ${canonicalStage}, checking for missing dependencies...`);

        const dependencyCheck = await this.checkMissingDependencies(request.documentId, request.stage);

        if (dependencyCheck.hasMissingDeps) {
          console.log(`🔧 [MoRAG] Missing dependencies detected for ${request.stage}: ${dependencyCheck.missingStages.join(', ')}`);

          // For automatic processing mode, trigger the missing dependencies
          if (request.metadata?.processingMode === 'AUTOMATIC' || request.metadata?.triggeredBy === 'automatic_processing') {
            console.log(`🚀 [MoRAG] Automatically triggering missing dependency: ${dependencyCheck.missingStages[0]}`);

            // Import here to avoid circular dependency
            const { jobOrchestrator } = await import('./jobs');

            // Create a job for the missing dependency stage
            const missingStage = dependencyCheck.missingStages[0]; // Start with the first missing stage
            await jobOrchestrator.scheduleJobForDocument(
              request.documentId,
              missingStage,
              {
                ...request.metadata,
                triggeredBy: 'dependency_resolution',
                originalStage: request.stage,
                originalExecutionId: request.executionId,
                priority: 1 // High priority for dependency resolution
              }
            );

            // Throw a special error that indicates dependency resolution was triggered
            throw new Error(`DEPENDENCY_RESOLUTION_TRIGGERED: Missing dependency ${missingStage} has been automatically scheduled for processing. The original ${request.stage} stage will be retried after dependency completion.`);
          } else {
            // For manual mode, just indicate what's missing
            throw new Error(`MISSING_DEPENDENCIES: Stage ${request.stage} requires ${dependencyCheck.missingStages.join(', ')} to be completed first. Please run the missing stages before retrying.`);
          }
        }
      }

      throw new Error(`MoRAG API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    console.log(`✅ [MoRAG] Backend response for ${canonicalStage}:`, {
      success: result.success,
      task_id: result.task_id,
      taskId: result.taskId, // Check both formats
      estimated_time_seconds: result.estimated_time_seconds,
      status_url: result.status_url,
      message: result.message,
      fullResponse: result
    });

    // Handle both task_id and taskId formats from backend
    const taskId = result.task_id || result.taskId;

    // Check if this is an immediate completion (synchronous processing)
    if (!taskId && result.status === 'completed' && result.success) {
      console.log(`✅ [MoRAG] Stage ${canonicalStage} completed immediately (synchronous processing)`);

      // Return a special response indicating immediate completion
      return {
        success: result.success,
        taskId: 'IMMEDIATE_COMPLETION', // Special marker for immediate completion
        executionId: request.executionId,
        stage: request.stage,
        estimatedTimeSeconds: 0,
        statusUrl: '',
        message: 'Stage completed immediately',
        immediateResult: result, // Include the full result for immediate processing
      };
    }

    if (!taskId) {
      console.error(`❌ [MoRAG] No task ID in response:`, result);
      throw new Error('MoRAG backend did not return a task ID');
    }

    return {
      success: result.success,
      taskId: taskId,
      executionId: request.executionId,
      stage: request.stage,
      estimatedTimeSeconds: result.estimated_time_seconds || 60,
      statusUrl: result.status_url || '',
      message: result.message || 'Stage processing started',
    };
  }

  /**
   * Search for similar content using the new search endpoint
   * Note: Search functionality may not be available in the new stage-based API
   * This method is kept for backward compatibility but may need updating
   */
  async search(query: string, databases: Server[], options?: {
    limit?: number;
    threshold?: number;
    filters?: Record<string, any>;
  }): Promise<any> {
    const databaseConfigs = databases.map(db => ({
      type: db.type.toLowerCase(),
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      apiKey: db.apiKey,
      database: db.database,
      collection: db.collection,
    }));

    // Try the new API first, fall back to old if needed
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query,
          database_servers: databaseConfigs,
          limit: options?.limit || 10,
          threshold: options?.threshold || 0.7,
          filters: options?.filters || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('New search API failed, this may not be implemented in the stage-based API:', error);
      throw error;
    }
  }

  /**
   * Get files for a task
   */
  async getTaskFiles(taskId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/files/${taskId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Download a file from the backend
   */
  async downloadFile(taskId: string, filename: string): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}/api/v1/files/${taskId}/${filename}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Clean up job files in the backend
   */
  async cleanupJob(jobId: string, force: boolean = false): Promise<any> {
    const url = new URL(`${this.baseUrl}/api/v1/stages/cleanup/${jobId}`);
    if (force) {
      url.searchParams.set('force', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute a single stage using the stage-based API
   * This method is used by the new document handlers
   */
  async executeStage(request: {
    stage: string;
    input_files?: string[];
    file_content?: string;
    use_file_upload?: boolean;
    output_dir: string;
    webhook_url?: string;
    metadata?: Record<string, any>;
  }): Promise<{ task_id: string; immediateResult?: any }> {
    const canonicalStage = this.getCanonicalStageName(request.stage);
    const endpoint = `${this.baseUrl}/api/v1/stages/${canonicalStage}/execute`;

    console.log(`🚀 [MoragService] Executing single stage: ${canonicalStage}`);
    console.log(`🔗 [MoragService] Endpoint: ${endpoint}`);
    console.log(`📋 [MoragService] Request details:`);
    console.log(`   - Stage: ${canonicalStage}`);
    console.log(`   - Input files: ${JSON.stringify(request.input_files || [])}`);
    console.log(`   - Has file content: ${!!request.file_content}`);
    console.log(`   - Use file upload: ${request.use_file_upload || false}`);
    console.log(`   - Output dir: ${request.output_dir}`);

    // Create form data according to the backend API guide
    const formData = new FormData();

    // Handle file upload vs input_files according to backend API guide
    if (request.use_file_upload && request.file_content) {
      // For file uploads (first stage with file content)
      const blob = new Blob([request.file_content], { type: 'application/octet-stream' });
      // Use the original filename from metadata if available, otherwise fallback to 'document'
      const filename = request.metadata?.originalFile || 'document';
      formData.append('file', blob, filename);
    } else if (request.input_files && request.input_files.length > 0) {
      // For URL-based documents or subsequent stages
      // Fix URL corruption issues before sending to backend
      const { fixUrlCorruption } = await import('../utils/youtubeUtils');
      const correctedInputFiles = request.input_files.map(file => {
        if (typeof file === 'string' && (file.startsWith('http') || file.startsWith('https'))) {
          const correctedUrl = fixUrlCorruption(file);

          if (correctedUrl !== file) {
            console.log(`🔧 [MoragService] Fixed URL corruption: ${file} -> ${correctedUrl}`);
          }

          return correctedUrl;
        }
        return file;
      });

      const inputFilesJson = JSON.stringify(correctedInputFiles);
      formData.append('input_files', inputFilesJson);
    }

    // Build configuration object with stage-specific settings
    const config: Record<string, any> = {};

    // Extract stage-specific config from metadata
    if (request.metadata) {
      const { jobId, documentName, realmId, sourceUrl, isUrlDocument, hasFileContent, databaseServers, ...stageConfig } = request.metadata;
      Object.assign(config, stageConfig);
    }

    // Add configuration
    formData.append('config', JSON.stringify(config));

    // Add webhook URL if provided
    if (request.webhook_url) {
      formData.append('webhook_url', request.webhook_url);
    }

    // Log what we're sending to the backend
    console.log(`📤 [MoragService] Sending FormData to backend:`);
    console.log(`   - Has input_files: ${formData.has('input_files')}`);
    console.log(`   - Has file: ${formData.has('file')}`);
    console.log(`   - Has config: ${formData.has('config')}`);
    console.log(`   - Has webhook_url: ${formData.has('webhook_url')}`);
    if (formData.has('config')) {
      console.log(`   - Config value: ${formData.get('config')}`);
    }
    if (formData.has('input_files')) {
      console.log(`   - Input files value: ${formData.get('input_files')}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - let the browser set it with boundary
        'Authorization': this.getHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stage execution failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    console.log(`📋 [MoragService] Backend response:`, result);

    // Handle both async and sync responses
    if (result.task_id) {
      // Async response - stage is running in background
      console.log(`✅ [MoragService] Stage execution started with task_id: ${result.task_id}`);
      return result;
    } else if (result.success && (result.status === 'completed' || result.status === 'skipped') && result.output_files) {
      // Sync response - stage completed immediately
      console.log(`✅ [MoragService] Stage completed immediately with status: ${result.status}`);
      console.log(`📁 [MoragService] Output files: ${result.output_files.length} files`);

      // Return a synthetic task_id for immediate completion
      return {
        task_id: 'IMMEDIATE_COMPLETION',
        immediateResult: result
      };
    } else {
      // Unexpected response format
      console.error(`❌ [MoragService] Unexpected backend response format. Full response:`, result);
      throw new Error(`Backend returned unexpected response format: ${JSON.stringify(result)}`);
    }
  }

  /**
   * Execute multiple stages in sequence using the stage chain API
   */
  async executeStageChain(
    file: File | null,
    request: StageChainRequest
  ): Promise<StageChainResponse> {
    console.log(`🔗 [MoragService] Executing stage chain: ${request.stages.join(' -> ')}`);
    console.log(`🔗 [MoragService] Backend URL: ${this.baseUrl}`);

    const formData = new FormData();

    // Add file if provided
    if (file) {
      formData.append('file', file);
      console.log(`📄 [MoRAG] Uploading file: ${file.name} (${file.size} bytes)`);
    }

    // Add request data
    formData.append('request', JSON.stringify(request));

    console.log(`🚀 [MoRAG] Calling stage chain endpoint`);
    console.log(`🔗 [MoRAG] Endpoint: ${this.baseUrl}/api/v1/stages/chain`);

    const response = await fetch(`${this.baseUrl}/api/v1/stages/chain`, {
      method: 'POST',
      headers: {
        'Authorization': this.getHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [MoRAG] Stage chain API error:`, errorText);
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ [MoRAG] Stage chain response:`, {
      success: result.success,
      stagesExecuted: result.stages_executed?.length || 0,
      totalTime: result.total_execution_time,
      failedStage: result.failed_stage
    });

    return result;
  }

  /**
   * Execute all stages with form data using the execute-all API
   */
  async executeAllStages(
    file: File | null,
    request: ExecuteAllStagesRequest
  ): Promise<ExecuteAllStagesResponse> {
    console.log(`🎯 [MoragService] Executing all stages: ${request.stages.join(' -> ')}`);
    console.log(`🔗 [MoragService] Backend URL: ${this.baseUrl}`);

    const formData = new FormData();

    // Add file if provided
    if (file) {
      formData.append('file', file);
      console.log(`📄 [MoRAG] Uploading file: ${file.name} (${file.size} bytes)`);
    }

    // Add form fields as per API spec
    formData.append('stages', JSON.stringify(request.stages));

    if (request.global_config) {
      formData.append('global_config', JSON.stringify(request.global_config));
    }

    if (request.stage_configs) {
      formData.append('stage_configs', JSON.stringify(request.stage_configs));
    }

    if (request.webhook_url) {
      formData.append('webhook_url', request.webhook_url);
    }

    if (request.output_dir) {
      formData.append('output_dir', request.output_dir);
    }

    if (request.stop_on_failure !== undefined) {
      formData.append('stop_on_failure', request.stop_on_failure.toString());
    }

    console.log(`🚀 [MoRAG] Calling execute-all endpoint`);
    console.log(`🔗 [MoRAG] Endpoint: ${this.baseUrl}/api/v1/stages/execute-all`);

    const response = await fetch(`${this.baseUrl}/api/v1/stages/execute-all`, {
      method: 'POST',
      headers: {
        'Authorization': this.getHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [MoRAG] Execute-all API error:`, errorText);
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ [MoRAG] Execute-all response:`, {
      success: result.success,
      taskId: result.task_id,
      estimatedTime: result.estimated_time_seconds,
      message: result.message
    });

    return result;
  }

  /**
   * List available stages and their configurations
   */
  async listStages(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/stages/list`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Health check endpoint using the new API
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/stages/health`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

export const moragService = new MoragService(
  process.env.MORAG_API_URL || 'http://localhost:8000',
  process.env.MORAG_API_KEY
);