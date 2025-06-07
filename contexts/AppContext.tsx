'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Database, Document, ApiKey } from '../types';
import { checkApiHealth, type SearchResult } from '../lib/vectorSearch';

interface AppContextType {
    // API Health
    apiHealthy: boolean | null;

    // Data
    databases: Database[];
    setDatabases: (databases: Database[]) => void;
    documents: Document[];
    setDocuments: (documents: Document[]) => void;
    apiKeys: ApiKey[];
    setApiKeys: (apiKeys: ApiKey[]) => void;

    // Selected items
    selectedDatabase: Database | null;
    setSelectedDatabase: (database: Database | null) => void;
    selectedDocument: Document | null;
    setSelectedDocument: (document: Document | null) => void;

    // Dialog states
    showAddDocumentDialog: boolean;
    setShowAddDocumentDialog: (show: boolean) => void;
    showSupersedeDocumentDialog: boolean;
    setShowSupersedeDocumentDialog: (show: boolean) => void;
    documentToSupersede: Document | null;
    setDocumentToSupersede: (document: Document | null) => void;
    showCreateDatabaseDialog: boolean;
    setShowCreateDatabaseDialog: (show: boolean) => void;
    showApiKeyDialog: boolean;
    setShowApiKeyDialog: (show: boolean) => void;
    showApiConfigDialog: boolean;
    setShowApiConfigDialog: (show: boolean) => void;

    // Prompt state
    promptText: string;
    setPromptText: (text: string) => void;
    numDocuments: number;
    setNumDocuments: (num: number) => void;
    searchResults: SearchResult[];
    setSearchResults: (results: SearchResult[]) => void;
    promptResponse: string;
    setPromptResponse: (response: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

    // Data state
    const [databases, setDatabases] = useState<Database[]>([
        {
            id: 1,
            name: 'Research Papers',
            description: 'Academic papers and research documents',
            documentCount: 24,
            lastUpdated: '2024-01-15',
        },
        {
            id: 2,
            name: 'Company Knowledge Base',
            description: 'Internal documentation and procedures',
            documentCount: 156,
            lastUpdated: '2024-01-14',
        },
    ]);

    const [documents, setDocuments] = useState<Document[]>([
        {
            id: 1,
            name: 'Machine Learning Fundamentals.pdf',
            type: 'PDF',
            state: 'ingested',
            version: 2,
            chunks: 45,
            quality: 0.92,
            uploadDate: '2024-01-10',
        },
        {
            id: 2,
            name: 'AI Ethics Lecture',
            type: 'YouTube',
            state: 'ingesting',
            version: 1,
            chunks: 0,
            quality: 0,
            uploadDate: '2024-01-15',
        },
        {
            id: 3,
            name: 'Company Website Analysis',
            type: 'Website',
            state: 'ingested',
            version: 1,
            chunks: 23,
            quality: 0.87,
            uploadDate: '2024-01-12',
        },
    ]);

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: 1,
            name: 'Production Workflow',
            key: 'mk_prod_****************************',
            created: '2024-01-01',
            lastUsed: '2024-01-15',
        },
        {
            id: 2,
            name: 'Development Environment',
            key: 'mk_dev_****************************',
            created: '2024-01-10',
            lastUsed: '2024-01-14',
        },
    ]);

    // Selected items
    const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    // Dialog states
    const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
    const [showSupersedeDocumentDialog, setShowSupersedeDocumentDialog] = useState(false);
    const [documentToSupersede, setDocumentToSupersede] = useState<Document | null>(null);
    const [showCreateDatabaseDialog, setShowCreateDatabaseDialog] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [showApiConfigDialog, setShowApiConfigDialog] = useState(false);

    // Prompt state
    const [promptText, setPromptText] = useState('');
    const [numDocuments, setNumDocuments] = useState(5);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [promptResponse, setPromptResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check API health on mount
    useEffect(() => {
        const checkHealth = async () => {
            const healthy = await checkApiHealth();
            setApiHealthy(healthy);
        };
        checkHealth();
    }, []);

    const value: AppContextType = {
        apiHealthy,
        databases,
        setDatabases,
        documents,
        setDocuments,
        apiKeys,
        setApiKeys,
        selectedDatabase,
        setSelectedDatabase,
        selectedDocument,
        setSelectedDocument,
        showAddDocumentDialog,
        setShowAddDocumentDialog,
        showSupersedeDocumentDialog,
        setShowSupersedeDocumentDialog,
        documentToSupersede,
        setDocumentToSupersede,
        showCreateDatabaseDialog,
        setShowCreateDatabaseDialog,
        showApiKeyDialog,
        setShowApiKeyDialog,
        showApiConfigDialog,
        setShowApiConfigDialog,
        promptText,
        setPromptText,
        numDocuments,
        setNumDocuments,
        searchResults,
        setSearchResults,
        promptResponse,
        setPromptResponse,
        isLoading,
        setIsLoading,
    };

    return (
        <AppContext.Provider value={value} data-oid="eq81-8_">
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
