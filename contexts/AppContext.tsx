'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AppContextType } from './types/AppContextTypes';
import { useAppState } from './hooks/useAppState';
import { useAppOperations } from './hooks/useAppOperations';

import { AppProviderProps } from './types/AppContextTypes';
import { useAppCrudOperations } from './hooks/useAppCrudOperations';
import { useAppServerOperations } from './hooks/useAppServerOperations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, ...htmlProps }: AppProviderProps) {
    // Use the state management hook
    const state = useAppState();

    // Use the operations hooks
    const { loadCurrentRealm, loadUserData } = useAppOperations({
        user: state.user,
        currentRealm: state.currentRealm,
        setCurrentRealm: state.setCurrentRealm,
        setRealms: state.setRealms,
        setDocuments: state.setDocuments,
        setApiKeys: state.setApiKeys,
        setJobs: state.setJobs,
        setServers: state.setServers,
        setIsDataLoading: state.setIsDataLoading,
    });

    const crudOperations = useAppCrudOperations({
        user: state.user,
        currentRealm: state.currentRealm,
        setDocuments: state.setDocuments,
        setApiKeys: state.setApiKeys,
        setJobs: state.setJobs,
        setRealms: state.setRealms,
        setCurrentRealm: state.setCurrentRealm,
        setServers: state.setServers,
        setIsDataLoading: state.setIsDataLoading,
        loadCurrentRealm,
        loadUserData,
    });

    const serverOperations = useAppServerOperations({
        loadUserData,
    });

    const value: AppContextType = {
        // API Health
        apiHealthy: state.apiHealthy,

        // User & Settings
        user: state.user,
        setUser: state.setUser,
        userSettings: state.userSettings,
        setUserSettings: state.setUserSettings,
        servers: state.servers,
        setServers: state.setServers,

        // Realm Management
        currentRealm: state.currentRealm,
        setCurrentRealm: state.setCurrentRealm,
        realms: state.realms,
        setRealms: state.setRealms,

        // Data
        documents: state.documents,
        setDocuments: state.setDocuments,
        apiKeys: state.apiKeys,
        setApiKeys: state.setApiKeys,
        jobs: state.jobs,
        setJobs: state.setJobs,
        isDataLoading: state.isDataLoading,

        // Selected items
        selectedDocument: state.selectedDocument,
        setSelectedDocument: state.setSelectedDocument,

        // Dialog states
        showAddDocumentDialog: state.showAddDocumentDialog,
        setShowAddDocumentDialog: state.setShowAddDocumentDialog,
        showSupersedeDocumentDialog: state.showSupersedeDocumentDialog,
        setShowSupersedeDocumentDialog: state.setShowSupersedeDocumentDialog,
        documentToSupersede: state.documentToSupersede,
        setDocumentToSupersede: state.setDocumentToSupersede,
        showCreateRealmDialog: state.showCreateRealmDialog,
        setShowCreateRealmDialog: state.setShowCreateRealmDialog,
        showRealmManagementDialog: state.showRealmManagementDialog,
        setShowRealmManagementDialog: state.setShowRealmManagementDialog,
        realmManagementDialogMode: state.realmManagementDialogMode,
        setRealmManagementDialogMode: state.setRealmManagementDialogMode,
        showApiKeyDialog: state.showApiKeyDialog,
        setShowApiKeyDialog: state.setShowApiKeyDialog,
        showApiConfigDialog: state.showApiConfigDialog,
        setShowApiConfigDialog: state.setShowApiConfigDialog,
        showReingestConfirmDialog: state.showReingestConfirmDialog,
        setShowReingestConfirmDialog: state.setShowReingestConfirmDialog,
        documentToReingest: state.documentToReingest,
        setDocumentToReingest: state.setDocumentToReingest,
        showDeleteConfirmDialog: state.showDeleteConfirmDialog,
        setShowDeleteConfirmDialog: state.setShowDeleteConfirmDialog,
        documentToDelete: state.documentToDelete,
        setDocumentToDelete: state.setDocumentToDelete,
        showUserMenu: state.showUserMenu,
        setShowUserMenu: state.setShowUserMenu,
        showSettingsDialog: state.showSettingsDialog,
        setShowSettingsDialog: state.setShowSettingsDialog,
        showServersDialog: state.showServersDialog,
        setShowServersDialog: state.setShowServersDialog,
        showEditPromptDialog: state.showEditPromptDialog,
        setShowEditPromptDialog: state.setShowEditPromptDialog,
        editPromptData: state.editPromptData,
        setEditPromptData: state.setEditPromptData,

        // Prompt state
        promptText: state.promptText,
        setPromptText: state.setPromptText,
        numDocuments: state.numDocuments,
        setNumDocuments: state.setNumDocuments,
        searchResults: state.searchResults,
        setSearchResults: state.setSearchResults,
        promptResponse: state.promptResponse,
        setPromptResponse: state.setPromptResponse,
        isLoading: state.isLoading,
        setIsLoading: state.setIsLoading,

        // Operations
        updateRealm: crudOperations.updateRealm,
        createDocument: crudOperations.createDocument,
        updateDocument: crudOperations.updateDocument,
        deleteDocument: crudOperations.deleteDocument,
        createApiKey: crudOperations.createApiKey,
        deleteApiKey: crudOperations.deleteApiKey,
        createJob: crudOperations.createJob,
        updateJobProgress: crudOperations.updateJobProgress,
        refreshData: crudOperations.refreshData,

        // Server operations
        getAvailableServersForRealm: serverOperations.getAvailableServersForRealm,
        addServerToRealm: serverOperations.addServerToRealm,
        removeServerFromRealm: serverOperations.removeServerFromRealm,
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
