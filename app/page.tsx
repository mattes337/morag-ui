'use client';

import { useState, useEffect } from 'react';
import {
    performVectorSearch,
    executePromptWithContext,
    checkApiHealth,
    type SearchResult,
} from '../lib/vectorSearch';

export default function Page() {
    const [activeTab, setActiveTab] = useState('databases');
    const [selectedDatabase, setSelectedDatabase] = useState<any>(null);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState<any>(null);
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
    const [databases, setDatabases] = useState([
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

    const [documents, setDocuments] = useState([
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

    const [apiKeys, setApiKeys] = useState([
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

    const documentTypes = [
        { type: 'pdf', label: 'PDF Document', icon: '📄' },
        { type: 'word', label: 'Word Document', icon: '📝' },
        { type: 'youtube', label: 'YouTube Video', icon: '📺' },
        { type: 'video', label: 'Video File', icon: '🎬' },
        { type: 'audio', label: 'Audio File', icon: '🎵' },
        { type: 'website', label: 'Website', icon: '🌐' },
    ];

    const getStateColor = (state: string) => {
        switch (state) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'ingesting':
                return 'bg-blue-100 text-blue-800';
            case 'ingested':
                return 'bg-green-100 text-green-800';
            case 'deprecated':
                return 'bg-gray-100 text-gray-800';
            case 'deleted':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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

    const DatabasesView = () => (
        <div className="space-y-6" data-oid="-j4jfsk">
            <div className="flex justify-between items-center" data-oid="f40uzue">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="3x6nz_s">
                    Vector Databases
                </h2>
                <button
                    onClick={() => setShowCreateDatabaseDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="pmwx:d_"
                >
                    Create Database
                </button>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="yt.qmgl"
            >
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-oid="92:20:6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="xkhx9gr">
                            {db.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4" data-oid="g4z:8h:">
                            {db.description}
                        </p>
                        <div
                            className="flex justify-between items-center text-sm text-gray-500 mb-4"
                            data-oid="ofxu___"
                        >
                            <span data-oid="6d_aku-">{db.documentCount} documents</span>
                            <span data-oid="6.b45in">Updated {db.lastUpdated}</span>
                        </div>
                        <div className="flex space-x-2" data-oid="db-actions">
                            <button
                                onClick={() => {
                                    setSelectedDatabase(db);
                                    setSelectedDocument(null);
                                    setActiveTab('prompt');
                                }}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                data-oid="prompt-db-btn"
                            >
                                Prompt
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedDatabase(db);
                                    setActiveTab('documents');
                                }}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                data-oid="view-docs-btn"
                            >
                                View Docs
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const DocumentsView = () => (
        <div className="space-y-6" data-oid="-q6u:m-">
            <div className="flex justify-between items-center" data-oid="zahpxry">
                <div data-oid="vxpknjz">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="ybnwkxf">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={() => setActiveTab('databases')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-oid=".s5myfp"
                    >
                        ← Back to Databases
                    </button>
                </div>
                <button
                    onClick={() => setShowAddDocumentDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="sfd83po"
                >
                    Add Document
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="ky649ca"
            >
                <table className="w-full" data-oid="hz7l1kj">
                    <thead className="bg-gray-50" data-oid="24:uswp">
                        <tr data-oid="ca61b91">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="r9cdpeb"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="p0m5ywc"
                            >
                                Type
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="6vnvg:0"
                            >
                                State
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="vb.9-hr"
                            >
                                Version
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="07eql8b"
                            >
                                Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="j8996cd"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="6h3.nmu">
                        {documents.map((doc) => (
                            <tr key={doc.id} data-oid="uqwbpgn">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="qal5li:">
                                    <div
                                        className="text-sm font-medium text-gray-900"
                                        data-oid="g8y-q79"
                                    >
                                        {doc.name}
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="fwey-o3">
                                        {doc.uploadDate}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="4gs1ji-"
                                >
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="ti4ezv8">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                        data-oid="2w3ytys"
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="djwh0fa"
                                >
                                    v{doc.version}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="u7l00:p"
                                >
                                    {doc.chunks} chunks, {(doc.quality * 100).toFixed(0)}% quality
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="icdpht1"
                                >
                                    <button
                                        onClick={() => {
                                            setSelectedDocument(doc);
                                            setActiveTab('prompt');
                                        }}
                                        className="text-green-600 hover:text-green-900"
                                        data-oid="prompt-doc-btn"
                                    >
                                        Prompt
                                    </button>
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="m3t_3wt"
                                    >
                                        Re-ingest
                                    </button>
                                    <button
                                        className="text-yellow-600 hover:text-yellow-900"
                                        data-oid=":ujm:a-"
                                    >
                                        Supersede
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="lckapmu"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const PromptView = () => (
        <div className="space-y-6" data-oid="prompt-view">
            <div className="flex justify-between items-center" data-oid="prompt-header">
                <div data-oid="prompt-title-section">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="prompt-title">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="prompt-subtitle">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="prompt-controls">
                    {selectedDocument && (
                        <button
                            onClick={() => setSelectedDocument(null)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="clear-document-filter"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={() => setSelectedDatabase(null)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="clear-database-filter"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div
                className="bg-white border border-gray-200 rounded-lg p-6"
                data-oid="prompt-input-section"
            >
                <div className="space-y-4" data-oid="prompt-form">
                    <div data-oid="prompt-text-area">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="prompt-label"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="prompt-textarea"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="prompt-options">
                        <div className="flex items-center space-x-4" data-oid="prompt-settings">
                            <div data-oid="num-documents-control">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="num-docs-label"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => setNumDocuments(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="num-docs-select"
                                >
                                    <option value={3} data-oid="xqisu-d">
                                        3
                                    </option>
                                    <option value={5} data-oid="_vv9wn3">
                                        5
                                    </option>
                                    <option value={10} data-oid="6bw:3h2">
                                        10
                                    </option>
                                    <option value={15} data-oid="-lf6l3j">
                                        15
                                    </option>
                                    <option value={20} data-oid="652uj-5">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handlePromptSubmit}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="submit-prompt-btn"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div
                    className="bg-white border border-gray-200 rounded-lg p-6"
                    data-oid="search-results-section"
                >
                    <h3
                        className="text-lg font-semibold text-gray-900 mb-4"
                        data-oid="search-results-title"
                    >
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="search-results-list">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid={`search-result-${index}`}
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="result-header"
                                >
                                    <div data-oid="result-meta">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="result-document"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="result-database"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div
                                        className="flex items-center space-x-2"
                                        data-oid="result-stats"
                                    >
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="similarity-score"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="chunk-info"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="result-content">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div
                    className="bg-white border border-gray-200 rounded-lg p-6"
                    data-oid="ai-response-section"
                >
                    <h3
                        className="text-lg font-semibold text-gray-900 mb-4"
                        data-oid="ai-response-title"
                    >
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="ai-response-content">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="response-text">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div
                    className="bg-white border border-gray-200 rounded-lg p-6"
                    data-oid="loading-section"
                >
                    <div
                        className="flex items-center justify-center space-x-2"
                        data-oid="loading-content"
                    >
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="loading-spinner"
                        ></div>
                        <span className="text-gray-600" data-oid="loading-text">
                            {searchResults.length === 0
                                ? 'Searching documents...'
                                : 'Generating response...'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );

    const ApiKeysView = () => (
        <div className="space-y-6" data-oid="oi2znhx">
            <div className="flex justify-between items-center" data-oid="hz79byt">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="ao15aid">
                    API Keys
                </h2>
                <button
                    onClick={() => setShowApiKeyDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="q:r9:mv"
                >
                    Generate API Key
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="by3uwiq"
            >
                <table className="w-full" data-oid="zxum-ss">
                    <thead className="bg-gray-50" data-oid="gc-b._9">
                        <tr data-oid="..6axc4">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="7tk_:7q"
                            >
                                Name
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="68y_geq"
                            >
                                Key
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="v:0h5y9"
                            >
                                Created
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="tu42mfr"
                            >
                                Last Used
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="kswisp1"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="v_.esh1">
                        {apiKeys.map((key) => (
                            <tr key={key.id} data-oid="d0j-4d6">
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                    data-oid="u5bq_jo"
                                >
                                    {key.name}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono"
                                    data-oid="gucl7_t"
                                >
                                    {key.key}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="udd5j0m"
                                >
                                    {key.created}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="_6:qe:s"
                                >
                                    {key.lastUsed}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="5m8wgw9"
                                >
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="jm-b7p:"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="d8i28ly"
                                    >
                                        Revoke
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50" data-oid="f8pv73a">
            {/* Header */}
            <header className="bg-white border-b border-gray-200" data-oid="9b.et-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="alp_49j">
                    <div className="flex justify-between items-center py-6" data-oid="junorlo">
                        <div className="flex items-center space-x-4" data-oid="phr-0nt">
                            <h1 className="text-3xl font-bold text-gray-900" data-oid="o6vop1f">
                                MoRAG
                            </h1>
                            <span className="text-sm text-gray-500" data-oid="m:_spt0">
                                Management Interface
                            </span>
                        </div>
                        <div className="flex items-center space-x-4" data-oid="s_ensf0">
                            <span className="text-sm text-gray-600" data-oid="zwk6asf">
                                Vector Database & RAG Management
                            </span>
                            <div className="flex items-center space-x-2" data-oid="api-status">
                                <div className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`} data-oid="status-indicator"></div>
                                <span className="text-xs text-gray-500" data-oid="status-text">
                                    API {apiHealthy === true ? 'Connected' : apiHealthy === false ? 'Disconnected' : 'Checking...'}
                                </span>
                                <button
                                    onClick={() => setShowApiConfigDialog(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                    data-oid="config-btn"
                                >
                                    Configure
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200" data-oid="cgvwi65">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="4ww-3b:">
                    <div className="flex space-x-8" data-oid="mfrxnvp">
                        {[
                            { id: 'databases', label: 'Databases' },
                            { id: 'documents', label: 'Documents' },
                            { id: 'prompt', label: 'Prompt' },
                            { id: 'apikeys', label: 'API Keys' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                data-oid="etycbig"
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-oid="3fsc6s5">
                {activeTab === 'databases' && <DatabasesView />}
                {activeTab === 'documents' && <DocumentsView />}
                {activeTab === 'prompt' && <PromptView />}
                {activeTab === 'apikeys' && <ApiKeysView />}
            </main>

            {/* Add Document Dialog */}
            {showAddDocumentDialog && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    data-oid="v7jer8y"
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
                        data-oid="xu75.qf"
                    >
                        <h3 className="text-lg font-semibold mb-4" data-oid="8zfo4yf">
                            Add Document
                        </h3>

                        {!selectedDocumentType ? (
                            <div data-oid="-8j2vpt">
                                <p className="text-gray-600 mb-4" data-oid="xeam1f1">
                                    Select document type:
                                </p>
                                <div
                                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                                    data-oid="-x5bgfc"
                                >
                                    {documentTypes.map((type) => (
                                        <button
                                            key={type.type}
                                            onClick={() => setSelectedDocumentType(type)}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                            data-oid="phc5yen"
                                        >
                                            <div className="text-2xl mb-2" data-oid="mxuyghx">
                                                {type.icon}
                                            </div>
                                            <div className="text-sm font-medium" data-oid="-l-tvlu">
                                                {type.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4" data-oid="8:om10v">
                                <div
                                    className="flex items-center space-x-2 mb-4"
                                    data-oid="c7i0oz1"
                                >
                                    <span className="text-2xl" data-oid="pu8or78">
                                        {selectedDocumentType.icon}
                                    </span>
                                    <span className="font-medium" data-oid="n_zj85j">
                                        {selectedDocumentType.label}
                                    </span>
                                    <button
                                        onClick={() => setSelectedDocumentType(null)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                        data-oid="qz2d8y_"
                                    >
                                        Change
                                    </button>
                                </div>

                                <div data-oid="uapy5or">
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                        data-oid="1t5.0fj"
                                    >
                                        {selectedDocumentType.type === 'youtube' ||
                                        selectedDocumentType.type === 'website'
                                            ? 'URL'
                                            : 'File'}
                                    </label>
                                    {selectedDocumentType.type === 'youtube' ||
                                    selectedDocumentType.type === 'website' ? (
                                        <input
                                            type="url"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter URL..."
                                            data-oid="9cc2.ya"
                                        />
                                    ) : (
                                        <input
                                            type="file"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            data-oid="nuqw.mp"
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4" data-oid=".mo_5hq">
                                    <div data-oid="3qbvr9s">
                                        <label
                                            className="flex items-center space-x-2"
                                            data-oid="r3uutds"
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                data-oid="68491ec"
                                            />

                                            <span className="text-sm" data-oid="muozh0k">
                                                GPU Processing
                                            </span>
                                        </label>
                                    </div>
                                    <div data-oid="yhmio0m">
                                        <label
                                            className="flex items-center space-x-2"
                                            data-oid="2uwiwfb"
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                data-oid=":sjhqaz"
                                            />

                                            <span className="text-sm" data-oid="e4sldlg">
                                                Contextual Embedding
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4" data-oid=".ege3w6">
                                    <div data-oid="3huk6as">
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                            data-oid="sydml:-"
                                        >
                                            Chunk Size
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue="512"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            data-oid="k4t779h"
                                        />
                                    </div>
                                    <div data-oid="ip3k165">
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                            data-oid="_u3uieo"
                                        >
                                            Chunking Method
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            data-oid="6-xv70m"
                                        >
                                            <option data-oid="o_nr3-g">Semantic</option>
                                            <option data-oid="gd22waz">Fixed Size</option>
                                            <option data-oid="z3w5e_k">Sentence</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-6" data-oid="gj-up3o">
                            <button
                                onClick={() => {
                                    setShowAddDocumentDialog(false);
                                    setSelectedDocumentType(null);
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                data-oid="xnt6f2_"
                            >
                                Cancel
                            </button>
                            {selectedDocumentType && (
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    data-oid="qbn5t3f"
                                >
                                    Add Document
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Database Dialog */}
            {showCreateDatabaseDialog && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    data-oid="g8uaiy:"
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                        data-oid="fvhvgji"
                    >
                        <h3 className="text-lg font-semibold mb-4" data-oid="p58jvk2">
                            Create Database
                        </h3>
                        <div className="space-y-4" data-oid="_soab57">
                            <div data-oid="c.rwifg">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid="kh2kasd"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Database name..."
                                    data-oid="501o_03"
                                />
                            </div>
                            <div data-oid="sz4vz8l">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid="3a8zp.7"
                                >
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Database description..."
                                    data-oid="fdwzozl"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6" data-oid=".n0.x5t">
                            <button
                                onClick={() => setShowCreateDatabaseDialog(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                data-oid="t.rvwzh"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                data-oid=".q2vw6u"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Dialog */}
            {showApiKeyDialog && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    data-oid="34tfc6l"
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                        data-oid="sn-_abc"
                    >
                        <h3 className="text-lg font-semibold mb-4" data-oid="r_-p3o3">
                            Generate API Key
                        </h3>
                        <div className="space-y-4" data-oid="jk8maci">
                            <div data-oid="ye6_mwv">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid=".gu7l:m"
                                >
                                    Key Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="API key name..."
                                    data-oid=".yeqy4p"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6" data-oid="yf36ws:">
                            <button
                                onClick={() => setShowApiKeyDialog(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                data-oid="2abhwoz"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                data-oid="x1srcji"
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}