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
