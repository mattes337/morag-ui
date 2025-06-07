'use client';

import { useState, useEffect } from 'react';
import {
    performVectorSearch,
    executePromptWithContext,
    checkApiHealth,
    type SearchResult,
} from '../lib/vectorSearch';
import { Database, Document, ApiKey } from '../types';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { DatabasesView } from '../components/views/DatabasesView';
import { DocumentsView } from '../components/views/DocumentsView';
import { DocumentDetailView } from '../components/views/DocumentDetailView';
import { PromptView } from '../components/views/PromptView';
import { ApiKeysView } from '../components/views/ApiKeysView';
import { AddDocumentDialog } from '../components/dialogs/AddDocumentDialog';
import { CreateDatabaseDialog } from '../components/dialogs/CreateDatabaseDialog';
import { ApiKeyDialog } from '../components/dialogs/ApiKeyDialog';
import { ApiConfig } from '../components/ApiConfig';

export default function Page() {
    const [activeTab, setActiveTab] = useState('databases');
    const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [viewingDocumentDetail, setViewingDocumentDetail] = useState(false);
    const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
    const [showCreateDatabaseDialog, setShowCreateDatabaseDialog] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [showApiConfigDialog, setShowApiConfigDialog] = useState(false);
    const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

    // Prompt feature state
    const [promptText, setPromptText] = useState('');
    const [numDocuments, setNumDocuments] = useState(5);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [promptResponse, setPromptResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check API health on component mount
    useEffect(() => {
        const checkHealth = async () => {
            const healthy = await checkApiHealth();
            setApiHealthy(healthy);
        };
        checkHealth();
    }, []);

    // Mock data
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

    const handlePromptSubmit = async () => {
        if (!promptText.trim()) return;

        setIsLoading(true);

        try {
            // Perform vector search first
            const searchOptions = {
                query: promptText,
                numResults: numDocuments,
                documentId: selectedDocument?.id?.toString(),
                databaseId: selectedDatabase?.id?.toString(),
            };

            const results = await performVectorSearch(searchOptions);
            setSearchResults(results);

            // Execute prompt with context
            const promptOptions = {
                prompt: promptText,
                context: results,
            };

            const response = await executePromptWithContext(promptOptions);
            setPromptResponse(response);
        } catch (error) {
            console.error('Error processing prompt:', error);
            setPromptResponse(
                'Sorry, there was an error processing your request. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectDatabase = (database: Database) => {
        setSelectedDatabase(database);
        setActiveTab('documents');
    };

    const handlePromptDatabase = (database: Database) => {
        setSelectedDatabase(database);
        setSelectedDocument(null);
        setActiveTab('prompt');
    };

    const handlePromptDocument = (document: Document) => {
        setSelectedDocument(document);
        setActiveTab('prompt');
    };

    const handleBackToDatabases = () => {
        setActiveTab('databases');
    };

    const handleClearDocumentFilter = () => {
        setSelectedDocument(null);
    };

    const handleClearDatabaseFilter = () => {
        setSelectedDatabase(null);
    };

    const handleViewDocumentDetail = (document: Document) => {
        setSelectedDocument(document);
        setViewingDocumentDetail(true);
    };

    const handleBackFromDocumentDetail = () => {
        setViewingDocumentDetail(false);
        setSelectedDocument(null);
    };

    const handleReingestDocument = (document: Document) => {
        // Update document state to ingesting
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === document.id ? { ...doc, state: 'ingesting' as const } : doc,
            ),
        );
        console.log('Reingesting document:', document.name);
    };

    const handleSupersedeDocument = (document: Document) => {
        // Update document state to deprecated and create new version
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === document.id ? { ...doc, state: 'deprecated' as const } : doc,
            ),
        );
        console.log('Superseding document:', document.name);
    };

    const handleDeleteDocument = (document: Document) => {
        // Update document state to deleted
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === document.id ? { ...doc, state: 'deleted' as const } : doc,
            ),
        );
        console.log('Deleting document:', document.name);
    };

    return (
        <div className="min-h-screen bg-gray-50" data-oid="6hftfki">
            <Header
                apiHealthy={apiHealthy}
                onConfigClick={() => setShowApiConfigDialog(true)}
                data-oid="5xk8s72"
            />

            <Navigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                viewingDocumentDetail={viewingDocumentDetail}
                data-oid="0je9x-e"
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-oid=":59v6m6">
                {activeTab === 'databases' && (
                    <DatabasesView
                        databases={databases}
                        onCreateDatabase={() => setShowCreateDatabaseDialog(true)}
                        onSelectDatabase={handleSelectDatabase}
                        onPromptDatabase={handlePromptDatabase}
                        data-oid="hj:c2c5"
                    />
                )}
                {activeTab === 'documents' && !viewingDocumentDetail && (
                    <DocumentsView
                        documents={documents}
                        selectedDatabase={selectedDatabase}
                        onBackToDatabases={handleBackToDatabases}
                        onAddDocument={() => setShowAddDocumentDialog(true)}
                        onPromptDocument={handlePromptDocument}
                        onViewDocumentDetail={handleViewDocumentDetail}
                        data-oid="6zl097g"
                    />
                )}
                {activeTab === 'documents' && viewingDocumentDetail && selectedDocument && (
                    <DocumentDetailView
                        document={selectedDocument}
                        onBack={handleBackFromDocumentDetail}
                        onReingest={handleReingestDocument}
                        onSupersede={handleSupersedeDocument}
                        onDelete={handleDeleteDocument}
                        data-oid="doc-detail-view"
                    />
                )}
                {activeTab === 'prompt' && (
                    <PromptView
                        selectedDatabase={selectedDatabase}
                        selectedDocument={selectedDocument}
                        promptText={promptText}
                        numDocuments={numDocuments}
                        searchResults={searchResults}
                        promptResponse={promptResponse}
                        isLoading={isLoading}
                        onPromptTextChange={setPromptText}
                        onNumDocumentsChange={setNumDocuments}
                        onSubmitPrompt={handlePromptSubmit}
                        onClearDocumentFilter={handleClearDocumentFilter}
                        onClearDatabaseFilter={handleClearDatabaseFilter}
                        data-oid="_6z5_yp"
                    />
                )}
                {activeTab === 'apikeys' && (
                    <ApiKeysView
                        apiKeys={apiKeys}
                        onGenerateApiKey={() => setShowApiKeyDialog(true)}
                        data-oid="ufxtlec"
                    />
                )}
            </main>

            {/* Dialogs */}
            <AddDocumentDialog
                isOpen={showAddDocumentDialog}
                onClose={() => setShowAddDocumentDialog(false)}
                data-oid="vlb_ta9"
            />

            <CreateDatabaseDialog
                isOpen={showCreateDatabaseDialog}
                onClose={() => setShowCreateDatabaseDialog(false)}
                data-oid="0uwru0k"
            />

            <ApiKeyDialog
                isOpen={showApiKeyDialog}
                onClose={() => setShowApiKeyDialog(false)}
                data-oid="msaqgpo"
            />

            <ApiConfig
                isOpen={showApiConfigDialog}
                onClose={() => setShowApiConfigDialog(false)}
                data-oid="w59r4ju"
            />
        </div>
    );
}
