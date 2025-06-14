'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Database, Document, ApiKey, DatabaseServer, UserSettings, User, Job } from '../types';
import { checkApiHealth, type SearchResult } from '../lib/vectorSearch';

interface AppContextType {
    // API Health
    apiHealthy: boolean | null;

    // User & Settings
    user: User | null;
    setUser: (user: User | null) => void;
    userSettings: UserSettings;
    setUserSettings: (settings: UserSettings) => void;
    servers: DatabaseServer[];
    setServers: (servers: DatabaseServer[]) => void;

    // Data
    databases: Database[];
    setDatabases: (databases: Database[]) => void;
    documents: Document[];
    setDocuments: (documents: Document[]) => void;
    apiKeys: ApiKey[];
    setApiKeys: (apiKeys: ApiKey[]) => void;
    jobs: Job[];
    setJobs: (jobs: Job[]) => void;
    isDataLoading: boolean;

    // Data operations
    createDatabase: (data: {
        name: string;
        description: string;
        serverId: string;
    }) => Promise<void>;
    updateDatabase: (id: string, data: Partial<Database>) => Promise<void>;
    deleteDatabase: (id: string) => Promise<void>;
    createDocument: (data: { name: string; type: string; databaseId?: string }) => Promise<void>;
    updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    createApiKey: (data: { name: string; key: string }) => Promise<void>;
    deleteApiKey: (id: string) => Promise<void>;
    createJob: (data: {
        documentId: string;
        documentName: string;
        documentType: string;
    }) => Promise<void>;
    updateJobProgress: (id: string, percentage: number, summary: string) => Promise<void>;
    refreshData: () => Promise<void>;

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
    showReingestConfirmDialog: boolean;
    setShowReingestConfirmDialog: (show: boolean) => void;
    documentToReingest: Document | null;
    setDocumentToReingest: (document: Document | null) => void;
    showDeleteConfirmDialog: boolean;
    setShowDeleteConfirmDialog: (show: boolean) => void;
    documentToDelete: Document | null;
    setDocumentToDelete: (document: Document | null) => void;
    showUserMenu: boolean;
    setShowUserMenu: (show: boolean) => void;
    showSettingsDialog: boolean;
    setShowSettingsDialog: (show: boolean) => void;
    showServersDialog: boolean;
    setShowServersDialog: (show: boolean) => void;

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

    // User & Settings state
    const [user, setUser] = useState<User | null>(null);

    const [userSettings, setUserSettings] = useState<UserSettings>({
        theme: 'light',
        language: 'en',
        notifications: true,
        autoSave: true,
    });

    const [servers, setServers] = useState<DatabaseServer[]>([]);

    // Data state
    const [databases, setDatabases] = useState<Database[]>([]);

    const [documents, setDocuments] = useState<Document[]>([]);

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

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
    const [showReingestConfirmDialog, setShowReingestConfirmDialog] = useState(false);
    const [documentToReingest, setDocumentToReingest] = useState<Document | null>(null);
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showServersDialog, setShowServersDialog] = useState(false);

    // Prompt state
    const [promptText, setPromptText] = useState('');
    const [numDocuments, setNumDocuments] = useState(5);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [promptResponse, setPromptResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            console.log('🔄 [AppContext] Checking authentication and loading data');
            setIsDataLoading(true);

            try {
                // Check API health first
                console.log('🏥 [AppContext] Checking API health');
                const healthy = await checkApiHealth();
                setApiHealthy(healthy);
                console.log('✅ [AppContext] API health check completed:', healthy);

                // Check authentication status
                console.log('🔐 [AppContext] Checking authentication');
                const authResponse = await fetch('/api/auth/me');

                if (authResponse.ok) {
                    const authData = await authResponse.json();
                    setUser(authData.user);
                    console.log('✅ [AppContext] User authenticated:', authData.user.email);

                    // Load user-specific data
                    await loadUserData();
                } else {
                    console.log('❌ [AppContext] User not authenticated');
                    setUser(null);
                }
            } catch (error) {
                console.error('❌ [AppContext] Failed to check auth or load data:', error);
                setUser(null);
            } finally {
                console.log('✅ [AppContext] Auth check and data load completed');
                setIsDataLoading(false);
            }
        };

        const loadUserData = async () => {
            try {
                // Load databases
                console.log('🗄️ [AppContext] Loading databases');
                const databasesResponse = await fetch('/api/databases');
                if (databasesResponse.ok) {
                    const databasesData = await databasesResponse.json();
                    const formattedDatabases = databasesData.map((db: any) => ({
                        id: db.id,
                        name: db.name,
                        description: db.description,
                        documentCount: db._count?.documents || 0,
                        lastUpdated: new Date(db.updatedAt).toISOString().split('T')[0],
                    }));
                    console.log('✅ [AppContext] Loaded', formattedDatabases.length, 'databases');
                    setDatabases(formattedDatabases);
                }

                // Load documents
                console.log('📄 [AppContext] Loading documents');
                const documentsResponse = await fetch('/api/documents');
                if (documentsResponse.ok) {
                    const documentsData = await documentsResponse.json();
                    const formattedDocuments = documentsData.map((doc: any) => ({
                        id: doc.id,
                        name: doc.name,
                        type: doc.type,
                        state: doc.state.toLowerCase() as Document['state'],
                        version: doc.version,
                        chunks: doc.chunks,
                        quality: doc.quality,
                        uploadDate: new Date(doc.uploadDate).toISOString().split('T')[0],
                    }));
                    console.log('✅ [AppContext] Loaded', formattedDocuments.length, 'documents');
                    setDocuments(formattedDocuments);
                }

                // Load API keys
                console.log('🔑 [AppContext] Loading API keys');
                const apiKeysResponse = await fetch('/api/api-keys');
                if (apiKeysResponse.ok) {
                    const apiKeysData = await apiKeysResponse.json();
                    const formattedApiKeys = apiKeysData.map((key: any) => ({
                        id: key.id,
                        name: key.name,
                        key: key.key,
                        created: new Date(key.created).toISOString().split('T')[0],
                        lastUsed: key.lastUsed
                            ? new Date(key.lastUsed).toISOString().split('T')[0]
                            : '',
                    }));
                    setApiKeys(formattedApiKeys);
                }

                // Load jobs
                const jobsResponse = await fetch('/api/jobs');
                if (jobsResponse.ok) {
                    const jobsData = await jobsResponse.json();
                    const formattedJobs = jobsData.map((job: any) => ({
                        id: job.id,
                        documentId: job.documentId,
                        documentName: job.documentName,
                        documentType: job.documentType,
                        startDate: new Date(job.startDate).toISOString(),
                        endDate: job.endDate ? new Date(job.endDate).toISOString() : undefined,
                        status: job.status.toLowerCase().replace('_', '-') as Job['status'],
                        progress: {
                            percentage: job.percentage,
                            summary: job.summary,
                        },
                        createdAt: new Date(job.createdAt).toISOString(),
                        updatedAt: new Date(job.updatedAt).toISOString(),
                    }));
                    setJobs(formattedJobs);
                }
            } catch (error) {
                console.error('❌ [AppContext] Failed to load user data:', error);
            }
        };

        checkAuthAndLoadData();
    }, []);

    // Data operation functions
    const createDatabase = async (data: {
        name: string;
        description: string;
        serverId: string;
    }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/databases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data), // userId is now handled by authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create database');
            }

            const newDb = await response.json();
            const formattedDb = {
                id: newDb.id,
                name: newDb.name,
                description: newDb.description,
                documentCount: newDb._count?.documents || 0,
                lastUpdated: new Date(newDb.updatedAt).toISOString().split('T')[0],
            };
            setDatabases((prev) => [...prev, formattedDb]);
        } catch (error) {
            console.error('Failed to create database:', error);
            throw error;
        }
    };

    const updateDatabase = async (id: string, data: Partial<Database>) => {
        try {
            const response = await fetch(`/api/databases/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update database');

            const updatedDb = await response.json();
            const formattedDb = {
                id: updatedDb.id,
                name: updatedDb.name,
                description: updatedDb.description,
                documentCount: updatedDb._count?.documents || 0,
                lastUpdated: new Date(updatedDb.updatedAt).toISOString().split('T')[0],
            };
            setDatabases((prev) => prev.map((db) => (db.id === id ? formattedDb : db)));
        } catch (error) {
            console.error('Failed to update database:', error);
            throw error;
        }
    };

    const deleteDatabase = async (id: string) => {
        try {
            const response = await fetch(`/api/databases/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete database');

            setDatabases((prev) => prev.filter((db) => db.id !== id));
        } catch (error) {
            console.error('Failed to delete database:', error);
            throw error;
        }
    };

    const createDocument = async (data: { name: string; type: string; databaseId?: string }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data), // userId is now handled by authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create document');
            }

            const newDoc = await response.json();
            const formattedDoc = {
                id: newDoc.id,
                name: newDoc.name,
                type: newDoc.type,
                state: newDoc.state.toLowerCase() as Document['state'],
                version: newDoc.version,
                chunks: newDoc.chunks,
                quality: newDoc.quality,
                uploadDate: new Date(newDoc.uploadDate).toISOString().split('T')[0],
            };
            setDocuments((prev) => [...prev, formattedDoc]);

            // Refresh databases to update document count
            if (data.databaseId) {
                await refreshData();
            }
        } catch (error) {
            console.error('Failed to create document:', error);
            throw error;
        }
    };

    const updateDocument = async (id: string, data: Partial<Document>) => {
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update document');

            const updatedDoc = await response.json();
            const formattedDoc = {
                id: updatedDoc.id,
                name: updatedDoc.name,
                type: updatedDoc.type,
                state: updatedDoc.state.toLowerCase() as Document['state'],
                version: updatedDoc.version,
                chunks: updatedDoc.chunks,
                quality: updatedDoc.quality,
                uploadDate: new Date(updatedDoc.uploadDate).toISOString().split('T')[0],
            };
            setDocuments((prev) => prev.map((doc) => (doc.id === id ? formattedDoc : doc)));
        } catch (error) {
            console.error('Failed to update document:', error);
            throw error;
        }
    };

    const deleteDocument = async (id: string) => {
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete document');

            setDocuments((prev) => prev.filter((doc) => doc.id !== id));

            // Refresh databases to update document count
            await refreshData();
        } catch (error) {
            console.error('Failed to delete document:', error);
            throw error;
        }
    };

    const createApiKey = async (data: { name: string; key: string }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data), // userId is now handled by authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create API key');
            }

            const newKey = await response.json();
            const formattedKey = {
                id: newKey.id,
                name: newKey.name,
                key: newKey.key,
                created: new Date(newKey.created).toISOString().split('T')[0],
                lastUsed: newKey.lastUsed
                    ? new Date(newKey.lastUsed).toISOString().split('T')[0]
                    : '',
            };
            setApiKeys((prev) => [...prev, formattedKey]);
        } catch (error) {
            console.error('Failed to create API key:', error);
            throw error;
        }
    };

    const deleteApiKey = async (id: string) => {
        try {
            const response = await fetch(`/api/api-keys/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete API key');

            setApiKeys((prev) => prev.filter((key) => key.id !== id));
        } catch (error) {
            console.error('Failed to delete API key:', error);
            throw error;
        }
    };

    const createJob = async (data: {
        documentId: string;
        documentName: string;
        documentType: string;
    }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, userId: user.id }),
            });

            if (!response.ok) throw new Error('Failed to create job');

            const newJob = await response.json();
            const formattedJob = {
                id: newJob.id,
                documentId: newJob.documentId,
                documentName: newJob.documentName,
                documentType: newJob.documentType,
                startDate: new Date(newJob.startDate).toISOString(),
                endDate: newJob.endDate ? new Date(newJob.endDate).toISOString() : undefined,
                status: newJob.status.toLowerCase().replace('_', '-') as Job['status'],
                progress: {
                    percentage: newJob.percentage,
                    summary: newJob.summary,
                },
                createdAt: new Date(newJob.createdAt).toISOString(),
                updatedAt: new Date(newJob.updatedAt).toISOString(),
            };
            setJobs((prev) => [...prev, formattedJob]);
        } catch (error) {
            console.error('Failed to create job:', error);
            throw error;
        }
    };

    const updateJobProgress = async (id: string, percentage: number, summary: string) => {
        try {
            const response = await fetch(`/api/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ percentage, summary }),
            });

            if (!response.ok) throw new Error('Failed to update job progress');

            const updatedJob = await response.json();
            const formattedJob = {
                id: updatedJob.id,
                documentId: updatedJob.documentId,
                documentName: updatedJob.documentName,
                documentType: updatedJob.documentType,
                startDate: new Date(updatedJob.startDate).toISOString(),
                endDate: updatedJob.endDate
                    ? new Date(updatedJob.endDate).toISOString()
                    : undefined,
                status: updatedJob.status.toLowerCase().replace('_', '-') as Job['status'],
                progress: {
                    percentage: updatedJob.percentage,
                    summary: updatedJob.summary,
                },
                createdAt: new Date(updatedJob.createdAt).toISOString(),
                updatedAt: new Date(updatedJob.updatedAt).toISOString(),
            };
            setJobs((prev) => prev.map((job) => (job.id === id ? formattedJob : job)));
        } catch (error) {
            console.error('Failed to update job progress:', error);
            throw error;
        }
    };

    const refreshData = async () => {
        try {
            setIsDataLoading(true);

            // Reload all data
            const [serversResponse, databasesResponse, documentsResponse, jobsResponse] =
                await Promise.all([
                    fetch('/api/servers'),
                    fetch('/api/databases'),
                    fetch('/api/documents'),
                    fetch('/api/jobs'),
                ]);

            if (serversResponse.ok) {
                const serversData = await serversResponse.json();
                const formattedServers = serversData.map((server: any) => ({
                    id: server.id,
                    name: server.name,
                    type: server.type.toLowerCase(),
                    host: server.host,
                    port: server.port,
                    username: server.username,
                    password: server.password,
                    apiKey: server.apiKey,
                    database: server.database,
                    collection: server.collection,
                    isActive: server.isActive,
                    createdAt: server.createdAt,
                    lastConnected: server.lastConnected,
                }));
                setServers(formattedServers);
            }

            if (databasesResponse.ok) {
                const databasesData = await databasesResponse.json();
                const formattedDatabases = databasesData.map((db: any) => ({
                    id: db.id,
                    name: db.name,
                    description: db.description,
                    documentCount: db._count?.documents || 0,
                    lastUpdated: new Date(db.updatedAt).toISOString().split('T')[0],
                }));
                setDatabases(formattedDatabases);
            }

            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                const formattedDocuments = documentsData.map((doc: any) => ({
                    id: doc.id,
                    name: doc.name,
                    type: doc.type,
                    state: doc.state.toLowerCase() as Document['state'],
                    version: doc.version,
                    chunks: doc.chunks,
                    quality: doc.quality,
                    uploadDate: new Date(doc.uploadDate).toISOString().split('T')[0],
                }));
                setDocuments(formattedDocuments);
            }

            if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                const formattedJobs = jobsData.map((job: any) => ({
                    id: job.id,
                    documentId: job.documentId,
                    documentName: job.documentName,
                    documentType: job.documentType,
                    startDate: new Date(job.startDate).toISOString(),
                    endDate: job.endDate ? new Date(job.endDate).toISOString() : undefined,
                    status: job.status.toLowerCase().replace('_', '-') as Job['status'],
                    progress: {
                        percentage: job.percentage,
                        summary: job.summary,
                    },
                    createdAt: new Date(job.createdAt).toISOString(),
                    updatedAt: new Date(job.updatedAt).toISOString(),
                }));
                setJobs(formattedJobs);
            }

            if (user) {
                const apiKeysResponse = await fetch(`/api/api-keys?userId=${user.id}`);
                if (apiKeysResponse.ok) {
                    const apiKeysData = await apiKeysResponse.json();
                    const formattedApiKeys = apiKeysData.map((key: any) => ({
                        id: key.id,
                        name: key.name,
                        key: key.key,
                        created: new Date(key.created).toISOString().split('T')[0],
                        lastUsed: key.lastUsed
                            ? new Date(key.lastUsed).toISOString().split('T')[0]
                            : '',
                    }));
                    setApiKeys(formattedApiKeys);
                }
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

    const value: AppContextType = {
        apiHealthy,
        user,
        setUser,
        userSettings,
        setUserSettings,
        servers,
        setServers,
        databases,
        setDatabases,
        documents,
        setDocuments,
        apiKeys,
        setApiKeys,
        jobs,
        setJobs,
        isDataLoading,
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
        showReingestConfirmDialog,
        setShowReingestConfirmDialog,
        documentToReingest,
        setDocumentToReingest,
        showDeleteConfirmDialog,
        setShowDeleteConfirmDialog,
        documentToDelete,
        setDocumentToDelete,
        showUserMenu,
        setShowUserMenu,
        showSettingsDialog,
        setShowSettingsDialog,
        showServersDialog,
        setShowServersDialog,
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
        createDatabase,
        updateDatabase,
        deleteDatabase,
        createDocument,
        updateDocument,
        deleteDocument,
        createApiKey,
        deleteApiKey,
        createJob,
        updateJobProgress,
        refreshData,
    };

    return (
        <AppContext.Provider value={value} data-oid="jh1sm3g">
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
