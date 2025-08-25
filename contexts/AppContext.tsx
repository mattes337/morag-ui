'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Document, ApiKey, Server, UserSettings, User, Job, Realm } from '../types';
import { checkApiHealth, type SearchResult } from '../lib/vectorSearch';

// Utility function to safely handle API responses that should be arrays
function ensureArray<T>(data: any, errorContext: string): T[] {
    if (Array.isArray(data)) {
        return data;
    }
    console.error(`❌ [AppContext] ${errorContext} data is not an array:`, data);
    return [];
}

interface AppContextType {
    // API Health
    apiHealthy: boolean | null;

    // User & Settings
    user: User | null;
    setUser: (user: User | null) => void;
    userSettings: UserSettings;
    setUserSettings: (settings: UserSettings) => void;
    servers: Server[];
    setServers: (servers: Server[]) => void;

    // Realm Management
    currentRealm: Realm | null;
    setCurrentRealm: (realm: Realm | null) => void;
    realms: Realm[];
    setRealms: (realms: Realm[]) => void;

    // Data
    documents: Document[];
    setDocuments: (documents: Document[]) => void;
    apiKeys: ApiKey[];
    setApiKeys: (apiKeys: ApiKey[]) => void;
    jobs: Job[];
    setJobs: (jobs: Job[]) => void;
    isDataLoading: boolean;

    // Realm operations
    updateRealm: (id: string, data: Partial<Realm>) => Promise<void>;
    createDocument: (data: { name: string; type: string; realmId: string; processingMode?: string }) => Promise<void>;
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
    selectedDocument: Document | null;
    setSelectedDocument: (document: Document | null) => void;

    // Dialog states
    showAddDocumentDialog: boolean;
    setShowAddDocumentDialog: (show: boolean) => void;
    showSupersedeDocumentDialog: boolean;
    setShowSupersedeDocumentDialog: (show: boolean) => void;
    documentToSupersede: Document | null;
    setDocumentToSupersede: (document: Document | null) => void;
    showCreateRealmDialog: boolean;
    setShowCreateRealmDialog: (show: boolean) => void;
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

    showEditPromptDialog: boolean;
    setShowEditPromptDialog: (show: boolean) => void;
    editPromptData: { realm: Realm | null; promptType: 'ingestion' | 'system'; currentPrompt: string } | null;
    setEditPromptData: (data: { realm: Realm | null; promptType: 'ingestion' | 'system'; currentPrompt: string } | null) => void;

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

interface AppProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function AppProvider({ children, ...htmlProps }: AppProviderProps) {
    const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

    // User & Settings state
    const [user, setUser] = useState<User | null>(null);

    const [userSettings, setUserSettings] = useState<UserSettings>({
        id: '',
        userId: '',
        theme: 'LIGHT',
        language: 'en',
        notifications: true,
        autoSave: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const [servers, setServers] = useState<Server[]>([]);

    // Realm state
    const [currentRealm, setCurrentRealm] = useState<Realm | null>(null);
    const [realms, setRealms] = useState<Realm[]>([]);

    // Data state
    const [documents, setDocuments] = useState<Document[]>([]);

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Selected items
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    // Dialog states
    const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
    const [showSupersedeDocumentDialog, setShowSupersedeDocumentDialog] = useState(false);
    const [documentToSupersede, setDocumentToSupersede] = useState<Document | null>(null);
    const [showCreateRealmDialog, setShowCreateRealmDialog] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [showApiConfigDialog, setShowApiConfigDialog] = useState(false);
    const [showReingestConfirmDialog, setShowReingestConfirmDialog] = useState(false);
    const [documentToReingest, setDocumentToReingest] = useState<Document | null>(null);
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showServersDialog, setShowServersDialog] = useState(false);

    const [showEditPromptDialog, setShowEditPromptDialog] = useState(false);
    const [editPromptData, setEditPromptData] = useState<{ realm: Realm | null; promptType: 'ingestion' | 'system'; currentPrompt: string } | null>(null);

    // Prompt state
    const [promptText, setPromptText] = useState('');
    const [numDocuments, setNumDocuments] = useState(5);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [promptResponse, setPromptResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check API health on mount
    useEffect(() => {
        const checkHealth = async () => {
            console.log('🏥 [AppContext] Checking API health');
            const healthy = await checkApiHealth();
            setApiHealthy(healthy);
            console.log('✅ [AppContext] API health check completed:', healthy);
        };
        
        checkHealth();
    }, []);

    // Load data when user becomes authenticated
    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) {
                console.log('👤 [AppContext] No user, skipping data load');
                setIsDataLoading(false);
                return;
            }

            console.log('🔄 [AppContext] User authenticated, loading data for:', user.email);
            setIsDataLoading(true);

            try {
                // Load current realm first
                await loadCurrentRealm();
                
                // Load user-specific data
                await loadUserData();
            } catch (error) {
                console.error('❌ [AppContext] Failed to load user data:', error);
            } finally {
                console.log('✅ [AppContext] Data load completed');
                setIsDataLoading(false);
            }
        };

        loadInitialData();
    }, [user?.id]); // Only trigger when user changes from null to authenticated

    // Reload data when realm changes
    useEffect(() => {
        if (user && currentRealm) {
            console.log('🏰 [AppContext] Realm changed, reloading data for realm:', currentRealm.name);
            loadUserData();
        }
    }, [currentRealm?.id, user]);

    const loadUserData = async () => {
        if (!user) {
            console.log('👤 [AppContext] No user available for data loading');
            return;
        }

        try {
            // Build query parameters for realm filtering
            const realmParam = currentRealm ? `?realmId=${currentRealm.id}` : '';

            // Load servers
            console.log('🖥️ [AppContext] Loading servers for realm:', currentRealm?.name || 'default');
            const serversResponse = await fetch(`/api/servers${realmParam}`, {
                credentials: 'include'
            });
            if (serversResponse.ok) {
                const serversData = await serversResponse.json();
                const safeServersData = ensureArray(serversData, 'Servers');
                const formattedServers = safeServersData.map((server: any) => ({
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
                console.log('✅ [AppContext] Loaded', formattedServers.length, 'servers');
                setServers(formattedServers);
            }

            // Database functionality is now part of realms - no separate loading needed

            // Load documents
            console.log('📄 [AppContext] Loading documents for realm:', currentRealm?.name || 'default');
            const documentsResponse = await fetch(`/api/documents${realmParam}`, {
                credentials: 'include'
            });
            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                const safeDocumentsData = ensureArray(documentsData, 'Documents');
                console.log('📄 [AppContext] Raw documents data from API:', safeDocumentsData.slice(0, 2).map((d: any) => ({ id: d.id, name: d.name, processingMode: d.processingMode })));
                const formattedDocuments = safeDocumentsData.map((doc: any) => ({
                    id: doc.id,
                    name: doc.name,
                    type: doc.type,
                    state: doc.state.toLowerCase() as Document['state'],
                    version: doc.version,
                    chunks: doc.chunks,
                    quality: doc.quality,
                    uploadDate: doc.uploadDate
                        ? new Date(doc.uploadDate).toISOString().split('T')[0]
                        : '',
                    processingMode: doc.processingMode || 'AUTOMATIC',
                }));
                console.log('✅ [AppContext] Loaded', formattedDocuments.length, 'documents. First doc processingMode:', formattedDocuments[0]?.processingMode);
                setDocuments(formattedDocuments);
            }

            // Load API keys
            console.log('🔑 [AppContext] Loading API keys for realm:', currentRealm?.name || 'default');
            const apiKeysResponse = await fetch(`/api/api-keys${realmParam}`, {
                credentials: 'include'
            });
            if (apiKeysResponse.ok) {
                const apiKeysData = await apiKeysResponse.json();
                const safeApiKeysData = ensureArray(apiKeysData, 'API Keys');
                const formattedApiKeys = safeApiKeysData.map((key: any) => ({
                    id: key.id,
                    name: key.name,
                    key: key.key,
                    created: key.created
                        ? new Date(key.created).toISOString().split('T')[0]
                        : '',
                    lastUsed: key.lastUsed
                        ? new Date(key.lastUsed).toISOString().split('T')[0]
                        : '',
                }));
                setApiKeys(formattedApiKeys);
            }

            // Load jobs
            console.log('💼 [AppContext] Loading jobs for realm:', currentRealm?.name || 'default');
            const jobsResponse = await fetch(`/api/jobs${realmParam}`, {
                credentials: 'include'
            });
            if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                const safeJobsData = ensureArray(jobsData, 'Jobs');
                const formattedJobs = safeJobsData.map((job: any) => ({
                    id: job.id,
                    documentId: job.documentId,
                    documentName: job.documentName,
                    documentType: job.documentType,
                    startDate: new Date(job.startDate).toISOString(),
                    endDate: job.endDate ? new Date(job.endDate).toISOString() : undefined,
                    status: job.status.toLowerCase().replace('_', '-') as Job['status'],
                    percentage: job.percentage || 0,
                    summary: job.summary || '',
                    progress: {
                        percentage: job.percentage || 0,
                        summary: job.summary || '',
                    },
                    processingDetails: job.processingDetails,
                    metadata: job.metadata,
                    createdAt: new Date(job.createdAt).toISOString(),
                    updatedAt: new Date(job.updatedAt).toISOString(),
                    userId: job.userId,
                    realmId: job.realmId,
                }));
                setJobs(formattedJobs);
            }
        } catch (error) {
            console.error('❌ [AppContext] Failed to load user data:', error);
        }
    };

    // Reload data when realm changes
    useEffect(() => {
        if (user && currentRealm) {
            console.log('🏰 [AppContext] Realm changed, reloading data for realm:', currentRealm.name);
            loadUserData();
        }
    }, [currentRealm?.id, user]);

    const loadCurrentRealm = async () => {
        try {
            console.log('🏰 [AppContext] Loading current realm');
            const response = await fetch('/api/realms/current', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setCurrentRealm(data.currentRealm);
                console.log('✅ [AppContext] Current realm loaded:', data.currentRealm.name);
                
                // Also load all realms
                const realmsResponse = await fetch('/api/realms', {
                    credentials: 'include'
                });
                if (realmsResponse.ok) {
                    const realmsData = await realmsResponse.json();
                    setRealms(realmsData.realms || []);
                    console.log('✅ [AppContext] All realms loaded:', realmsData.realms?.length || 0);
                } else {
                    console.error('❌ [AppContext] Failed to load all realms:', realmsResponse.status);
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('❌ [AppContext] Failed to load current realm:', response.status, errorData.error);
                throw new Error(`Failed to load current realm: ${errorData.error}`);
            }
        } catch (error) {
            console.error('❌ [AppContext] Error loading current realm:', error);
            // Set empty state so UI can show appropriate error state
            setCurrentRealm(null);
            setRealms([]);
            throw error;
        }
    };

    // Realm operation functions
    const updateRealm = async (id: string, data: Partial<Realm>) => {
        try {
            const response = await fetch(`/api/realms/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update realm');

            const updatedRealm = await response.json();
            setRealms((prev) => prev.map((realm) => (realm.id === id ? updatedRealm : realm)));
            
            // Update current realm if it's the one being updated
            if (currentRealm?.id === id) {
                setCurrentRealm(updatedRealm);
            }
        } catch (error) {
            console.error('Failed to update realm:', error);
            throw error;
        }
    };

    const createDocument = async (data: { name: string; type: string; realmId: string; processingMode?: string }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    processingMode: data.processingMode || 'AUTOMATIC'
                }), // userId is now handled by authentication
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
                uploadDate: newDoc.uploadDate
                    ? new Date(newDoc.uploadDate).toISOString().split('T')[0]
                    : '',
            };
            setDocuments((prev) => [...prev, formattedDoc]);

            // Refresh realms to update document count
            if (data.realmId) {
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
                uploadDate: updatedDoc.uploadDate
                    ? new Date(updatedDoc.uploadDate).toISOString().split('T')[0]
                    : '',
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

            // Refresh realms to update document count
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
                created: newKey.created
                    ? new Date(newKey.created).toISOString().split('T')[0]
                    : '',
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
            const formattedJob: Job = {
                id: newJob.id,
                documentId: newJob.documentId,
                documentName: newJob.documentName,
                documentType: newJob.documentType,
                taskId: newJob.taskId,
                startDate: new Date(newJob.startDate).toISOString(),
                endDate: newJob.endDate ? new Date(newJob.endDate).toISOString() : undefined,
                status: newJob.status as Job['status'],
                percentage: newJob.percentage || 0,
                summary: newJob.summary || '',
                progress: {
                    percentage: newJob.percentage || 0,
                    summary: newJob.summary || '',
                },
                processingDetails: newJob.processingDetails,
                metadata: newJob.metadata,
                createdAt: new Date(newJob.createdAt).toISOString(),
                updatedAt: new Date(newJob.updatedAt).toISOString(),
                userId: newJob.userId || user.id,
                realmId: newJob.realmId || '',
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
                percentage: updatedJob.percentage || 0,
                summary: updatedJob.summary || '',
                progress: {
                    percentage: updatedJob.percentage || 0,
                    summary: updatedJob.summary || '',
                },
                processingDetails: updatedJob.processingDetails,
                metadata: updatedJob.metadata,
                createdAt: new Date(updatedJob.createdAt).toISOString(),
                updatedAt: new Date(updatedJob.updatedAt).toISOString(),
                userId: updatedJob.userId,
                realmId: updatedJob.realmId,
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
            const [serversResponse, documentsResponse, jobsResponse] =
                await Promise.all([
                    fetch('/api/servers'),
                    fetch('/api/documents'),
                    fetch('/api/jobs'),
                ]);

            if (serversResponse.ok) {
                const serversData = await serversResponse.json();
                const safeServersData = ensureArray(serversData, 'Servers');
                const formattedServers = safeServersData.map((server: any) => ({
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

            // Database functionality is now part of realms

            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                const safeDocumentsData = ensureArray(documentsData, 'Documents');
                const formattedDocuments = safeDocumentsData.map((doc: any) => ({
                    id: doc.id,
                    name: doc.name,
                    type: doc.type,
                    state: doc.state.toLowerCase() as Document['state'],
                    version: doc.version,
                    chunks: doc.chunks,
                    quality: doc.quality,
                    uploadDate: doc.uploadDate
                        ? new Date(doc.uploadDate).toISOString().split('T')[0]
                        : '',
                }));
                setDocuments(formattedDocuments);
            }

            if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                const safeJobsData = ensureArray(jobsData, 'Jobs');
                const formattedJobs = safeJobsData.map((job: any) => ({
                    id: job.id,
                    documentId: job.documentId,
                    documentName: job.documentName,
                    documentType: job.documentType,
                    startDate: new Date(job.startDate).toISOString(),
                    endDate: job.endDate ? new Date(job.endDate).toISOString() : undefined,
                    status: job.status.toLowerCase().replace('_', '-') as Job['status'],
                    percentage: job.percentage || 0,
                    summary: job.summary || '',
                    progress: {
                        percentage: job.percentage || 0,
                        summary: job.summary || '',
                    },
                    processingDetails: job.processingDetails,
                    metadata: job.metadata,
                    createdAt: new Date(job.createdAt).toISOString(),
                    updatedAt: new Date(job.updatedAt).toISOString(),
                    userId: job.userId,
                    realmId: job.realmId,
                }));
                setJobs(formattedJobs);
            }

            if (user) {
                const apiKeysResponse = await fetch(`/api/api-keys?userId=${user.id}`);
                if (apiKeysResponse.ok) {
                    const apiKeysData = await apiKeysResponse.json();
                    const safeApiKeysData = ensureArray(apiKeysData, 'API Keys');
                    const formattedApiKeys = safeApiKeysData.map((key: any) => ({
                        id: key.id,
                        name: key.name,
                        key: key.key,
                        created: key.created
                            ? new Date(key.created).toISOString().split('T')[0]
                            : '',
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
        currentRealm,
        setCurrentRealm,
        realms,
        setRealms,

        documents,
        setDocuments,
        apiKeys,
        setApiKeys,
        jobs,
        setJobs,
        isDataLoading,

        selectedDocument,
        setSelectedDocument,
        showAddDocumentDialog,
        setShowAddDocumentDialog,
        showSupersedeDocumentDialog,
        setShowSupersedeDocumentDialog,
        documentToSupersede,
        setDocumentToSupersede,
        showCreateRealmDialog,
        setShowCreateRealmDialog,
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

        showEditPromptDialog,
        setShowEditPromptDialog,
        editPromptData,
        setEditPromptData,
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
        updateRealm,
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
        <div {...htmlProps}>
            <AppContext.Provider value={value}>
                {children}
            </AppContext.Provider>
        </div>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
