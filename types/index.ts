export interface Database {
    id: number;
    name: string;
    description: string;
    documentCount: number;
    lastUpdated: string;
}

export interface Document {
    id: number;
    name: string;
    type: string;
    state: 'pending' | 'ingesting' | 'ingested' | 'deprecated' | 'deleted';
    version: number;
    chunks: number;
    quality: number;
    uploadDate: string;
}

export interface ApiKey {
    id: number;
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
    id: number;
    documentId: number;
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
}
