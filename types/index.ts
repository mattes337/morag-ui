export interface Database {
    id: string;
    name: string;
    description: string;
    documentCount: number;
    lastUpdated: string;
}

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
    type: string;
    state: 'pending' | 'ingesting' | 'ingested' | 'deprecated' | 'deleted';
    version: number;
    chunks: number;
    quality: number;
    uploadDate: string;
    metadata?: DocumentMetadata;
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
    database: string;
    similarity: number;
    chunk: number;
    content: string;
}

export interface DatabaseServer {
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
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    autoSave: boolean;
    defaultDatabase?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user' | 'viewer';
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
