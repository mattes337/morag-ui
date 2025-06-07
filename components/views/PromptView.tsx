'use client';

import { Database, Document, SearchResult } from '../../types';

interface PromptViewProps {
    selectedDatabase: Database | null;
    selectedDocument: Document | null;
    promptText: string;
    numDocuments: number;
    searchResults: SearchResult[];
    promptResponse: string;
    isLoading: boolean;
    onPromptTextChange: (text: string) => void;
    onNumDocumentsChange: (num: number) => void;
    onSubmitPrompt: () => void;
    onClearDocumentFilter: () => void;
    onClearDatabaseFilter: () => void;
}

export function PromptView({
    selectedDatabase,
    selectedDocument,
    promptText,
    numDocuments,
    searchResults,
    promptResponse,
    isLoading,
    onPromptTextChange,
    onNumDocumentsChange,
    onSubmitPrompt,
    onClearDocumentFilter,
    onClearDatabaseFilter,
}: PromptViewProps) {
    return (
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
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="clear-document-filter"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
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
                            onChange={(e) => onPromptTextChange(e.target.value)}
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
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
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
                            onClick={onSubmitPrompt}
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
}
