export interface DocumentMetadata {
    // Common fields for all document types
    filename?: string;
    url?: string;
    file_size?: number;
    file_extension?: string;
    language?: string;
    text_length?: number;
    chunk_count?: number;
    processing_time?: number;
    confidence_score?: number;
    extraction_quality?: number;
    model_used?: string;
    creation_date?: string;
    modification_date?: string;

    // PDF specific
    page_count?: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    has_images?: boolean;
    has_tables?: boolean;

    // Word document specific
    keywords?: string[];
    word_count?: number;
    paragraph_count?: number;

    // Text file specific
    encoding?: string;
    line_count?: number;

    // Audio/Video specific
    duration?: number;
    sample_rate?: number;
    channels?: number;
    bit_depth?: number;
    bitrate?: number;
    format?: string;
    speaker_count?: number;
    topic_count?: number;
    has_music?: boolean;
    noise_level?: string;

    // Video specific
    width?: number;
    height?: number;
    fps?: number;
    video_codec?: string;
    audio_codec?: string;
    audio_sample_rate?: number;
    audio_channels?: number;
    has_audio?: boolean;
    audio_duration?: number;
    frame_count?: number;
    thumbnail_generated?: boolean;

    // Image specific
    mode?: string;
    has_exif?: boolean;
    camera_make?: string;
    camera_model?: string;
    gps_coordinates?: [number, number];
    orientation?: number;
    color_space?: string;
    dpi?: [number, number];
    caption?: string;
    extracted_text?: string;
    objects_detected?: string[];
    text_regions?: number;

    // Web content specific
    description?: string;
    publication_date?: string;
    domain?: string;
    content_type?: string;
    status_code?: number;
    heading_count?: number;
    link_count?: number;
    image_count?: number;
    has_structured_data?: boolean;
    schema_types?: string[];

    // YouTube specific
    video_id?: string;
    channel?: string;
    channel_id?: string;
    upload_date?: string;
    view_count?: number;
    like_count?: number;
    category?: string;
    tags?: string[];
    thumbnail_url?: string;
    audio_extracted?: boolean;
    transcript_available?: boolean;
    auto_generated_captions?: boolean;

    // Error handling
    error?: string;
    error_type?: string;
    partial_processing?: boolean;
    recovered_content?: string;
}

export interface Document {
    id: string;
    name: string;
    type: string; // Main type: document, video, audio, website, youtube
    subType?: string; // Optional subtype: pdf, word, excel, markdown, text, etc.
    state: 'pending' | 'ingesting' | 'ingested' | 'deleted';
    version: number;
    chunks: number;
    quality: number;
    uploadDate: string;
    processingMode?: 'MANUAL' | 'AUTOMATIC';
    metadata?: DocumentMetadata;
}

export interface Entity {
    id: string;
    name: string;
    type: string;
    description?: string;
    metadata?: any;
    isOrphaned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Fact {
    id: string;
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
    source: string;
    metadata?: any;
    entityId?: string;
    documentId: string;
    chunkId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentEntity {
    id: string;
    documentId: string;
    entityId: string;
    relevance: number;
    mentions: number;
    createdAt: Date;
}

export interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    chunkIndex: number;
    embedding?: any;
    metadata?: any;
    createdAt: Date;
}

// Enhanced deletion types
export interface DeletionPlan {
    documentId: string;
    documentName: string;
    chunksToDelete: number;
    factsToDelete: number;
    relationshipsToDelete: number;
    entitiesToPreserve: number;
    orphanedEntities: number;
    estimatedTime: number;
    warnings: string[];
}

export interface DeletionOptions {
    dryRun?: boolean;
    preserveEntities?: boolean;
    createAuditLog?: boolean;
    userId?: string;
}

export interface DeletionResult {
    plan: DeletionPlan;
    executed: boolean;
    success: boolean;
    progress?: DeletionProgressResult;
}

export interface DeletionProgressResult {
    status: string;
    completed: {
        facts: number;
        chunks: number;
        relationships: number;
        orphanedEntities: number;
    };
}

export interface DeletionImpact {
    documents: number;
    chunks: number;
    facts: number;
    affectedEntities: number;
    orphanedEntities: number;
    warnings: string[];
    estimatedTime: number;
}

export interface BatchDeletionOptions extends DeletionOptions {
    onProgress?: (completed: number, total: number) => void;
}

export interface BatchDeletionResult {
    totalRequested: number;
    successful: number;
    failed: number;
    results: DeletionResult[];
    errors: { documentId: string; error: string }[];
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed: string;
}

export interface DocumentType {
    type: string;
    label: string;
    icon: string;
}

export interface SearchResult {
    id: string;
    document: string;
    realm: string; // Changed from database to realm
    similarity: number;
    chunk: number;
    content: string;
}

export interface Server {
    id: string;
    name: string;
    type: 'qdrant' | 'neo4j' | 'pinecone' | 'weaviate' | 'chroma';
    host: string;
    port: number;
    username?: string;
    password?: string;
    apiKey?: string;
    database?: string;
    collection?: string;
    isActive: boolean;
    createdAt: string;
    lastConnected?: string;
}

export interface UserSettings {
    id: string;
    userId: string;
    theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    language: string;
    notifications: boolean;
    autoSave: boolean;
    defaultDatabase?: string;
    currentRealmId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'ADMIN' | 'USER' | 'VIEWER';
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Job {
    id: string;
    documentId: string;
    documentName: string;
    documentType: string;
    startDate: string;
    endDate?: string;
    status:
        | 'pending'
        | 'waiting-for-remote-worker'
        | 'processing'
        | 'finished'
        | 'failed'
        | 'cancelled';
    progress: {
        percentage: number;
        summary: string;
    };
    createdAt: string;
    updatedAt: string;
    metadata?: DocumentMetadata;
    processingDetails?: {
        estimatedTimeRemaining?: number;
        currentStep?: string;
        totalSteps?: number;
        completedSteps?: number;
        errorMessage?: string;
        warnings?: string[];
    };
}

export interface Realm {
    id: string;
    name: string;
    description?: string;
    domain?: string;          // Domain classification for specialized processing
    isDefault: boolean;
    ingestionPrompt?: string; // Optional prompt for document ingestion
    systemPrompt?: string;    // Optional prompt for user queries
    extractionPrompt?: string; // Optional prompt for entity extraction
    domainPrompt?: string;    // Optional domain context prompt
    documentCount?: number;
    lastUpdated?: string;
    servers?: Server[]; // Associated servers for this realm
    userRole?: RealmRole; // User's role in this realm
    userCount?: number; // Number of users in this realm
    createdAt: Date;
    updatedAt: Date;
}

export type RealmRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface CreateRealmData {
    name: string;
    description?: string;
    ownerId: string;
    domain?: string;
    ingestionPrompt?: string;
    systemPrompt?: string;
    extractionPrompt?: string;
    domainPrompt?: string;
}

export interface UpdateRealmData {
    name?: string;
    description?: string;
    isActive?: boolean;
    domain?: string;
    ingestionPrompt?: string;
    systemPrompt?: string;
    extractionPrompt?: string;
    domainPrompt?: string;
}
