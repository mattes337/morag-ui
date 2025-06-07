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

    return (
        <div className="min-h-screen bg-gray-50" data-oid="f8pv73a">
            <Header
                apiHealthy={apiHealthy}
                onConfigClick={() => setShowApiConfigDialog(true)}
                data-oid="ugk6d0b"
            />

            <Navigation activeTab={activeTab} onTabChange={setActiveTab} data-oid="4gcn7s_" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-oid="3fsc6s5">
                {activeTab === 'databases' && (
                    <DatabasesView
                        databases={databases}
                        onCreateDatabase={() => setShowCreateDatabaseDialog(true)}
                        onSelectDatabase={handleSelectDatabase}
                        onPromptDatabase={handlePromptDatabase}
                        data-oid="k9ogx7l"
                    />
                )}
                {activeTab === 'documents' && (
                    <DocumentsView
                        documents={documents}
                        selectedDatabase={selectedDatabase}
                        onBackToDatabases={handleBackToDatabases}
                        onAddDocument={() => setShowAddDocumentDialog(true)}
                        onPromptDocument={handlePromptDocument}
                        data-oid="x339:nl"
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
                        data-oid="z0p:onb"
                    />
                )}
                {activeTab === 'apikeys' && (
                    <ApiKeysView
                        apiKeys={apiKeys}
                        onGenerateApiKey={() => setShowApiKeyDialog(true)}
                        data-oid="79yau6i"
                    />
                )}
            </main>

            {/* Dialogs */}
            <AddDocumentDialog
                isOpen={showAddDocumentDialog}
                onClose={() => setShowAddDocumentDialog(false)}
                data-oid="brjarvn"
            />

            <CreateDatabaseDialog
                isOpen={showCreateDatabaseDialog}
                onClose={() => setShowCreateDatabaseDialog(false)}
                data-oid="habce1g"
            />

            <ApiKeyDialog
                isOpen={showApiKeyDialog}
                onClose={() => setShowApiKeyDialog(false)}
                data-oid="1fqmkf7"
            />

            <ApiConfig
                isOpen={showApiConfigDialog}
                onClose={() => setShowApiConfigDialog(false)}
                data-oid="z.909gb"
            />
        </div>
    );
}
