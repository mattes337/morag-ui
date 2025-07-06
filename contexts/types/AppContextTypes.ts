import { ReactNode } from 'react';
import { Document, ApiKey, DatabaseServer, UserSettings, User, Job, Realm } from '../../types';
import { SearchResult } from '../../lib/vectorSearch';

export interface AppContextType {
    // API Health
    apiHealthy: boolean | null;

    // User & Settings
    user: User | null;
    setUser: (user: User | null) => void;
    userSettings: UserSettings;
    setUserSettings: (settings: UserSettings) => void;
    servers: DatabaseServer[];
    setServers: (servers: DatabaseServer[]) => void;

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
    createDocument: (data: { name: string; type: string; realmId: string }) => Promise<void>;
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

    // Realm server management
    getAvailableServersForRealm: (realmId: string) => Promise<DatabaseServer[]>;
    addServerToRealm: (realmId: string, serverId: string) => Promise<void>;
    removeServerFromRealm: (realmId: string, serverId: string) => Promise<void>;

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
    showRealmManagementDialog: boolean;
    setShowRealmManagementDialog: (show: boolean) => void;
    realmManagementDialogMode: 'manage' | 'create' | 'edit';
    setRealmManagementDialogMode: (mode: 'manage' | 'create' | 'edit') => void;
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

export interface AppProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
