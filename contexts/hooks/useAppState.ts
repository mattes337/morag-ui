import { useState, useEffect } from 'react';
import { Document, ApiKey, DatabaseServer, UserSettings, User, Job, Realm } from '../../types';
import { checkApiHealth, type SearchResult } from '../../lib/vectorSearch';

export function useAppState() {
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
    const [servers, setServers] = useState<DatabaseServer[]>([]);

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
    const [showRealmManagementDialog, setShowRealmManagementDialog] = useState(false);
    const [realmManagementDialogMode, setRealmManagementDialogMode] = useState<'manage' | 'create' | 'edit'>('manage');
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

    return {
        // API Health
        apiHealthy,
        setApiHealthy,

        // User & Settings
        user,
        setUser,
        userSettings,
        setUserSettings,
        servers,
        setServers,

        // Realm Management
        currentRealm,
        setCurrentRealm,
        realms,
        setRealms,

        // Data
        documents,
        setDocuments,
        apiKeys,
        setApiKeys,
        jobs,
        setJobs,
        isDataLoading,
        setIsDataLoading,

        // Selected items
        selectedDocument,
        setSelectedDocument,

        // Dialog states
        showAddDocumentDialog,
        setShowAddDocumentDialog,
        showSupersedeDocumentDialog,
        setShowSupersedeDocumentDialog,
        documentToSupersede,
        setDocumentToSupersede,
        showCreateRealmDialog,
        setShowCreateRealmDialog,
        showRealmManagementDialog,
        setShowRealmManagementDialog,
        realmManagementDialogMode,
        setRealmManagementDialogMode,
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

        // Prompt state
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
}
