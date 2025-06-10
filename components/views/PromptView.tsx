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
        <div className="space-y-6" data-oid="1gubr:_">
            <div className="flex justify-between items-center" data-oid="_0_:fc1">
                <div data-oid="sm4oi8_">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="2a0xx6-">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="lqk5u2e">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="dbdbzwk">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="foxrd-i"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="owz_j9z"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="myr2ax5">
                <div className="space-y-4" data-oid="x-2dihc">
                    <div data-oid="088pwk5">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="xto96o-"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="0yu81g5"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="7:b5dci">
                        <div className="flex items-center space-x-4" data-oid="2tcak3r">
                            <div data-oid="rxac0jd">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="ddy:l5b"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="tjhh:_j"
                                >
                                    <option value={3} data-oid="y1jq41l">
                                        3
                                    </option>
                                    <option value={5} data-oid="r:v7-2t">
                                        5
                                    </option>
                                    <option value={10} data-oid="tukqswz">
                                        10
                                    </option>
                                    <option value={15} data-oid="1bzoqnt">
                                        15
                                    </option>
                                    <option value={20} data-oid="z6wuyj6">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="nn7b01n"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="5eb.4ht">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="ne9oj.v">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="j7-a:_k">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="_72i1zj"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="a0prghz"
                                >
                                    <div data-oid="ljt_p0p">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="k9yyf7q"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="52zzd86"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="y60eg16">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid=".aq53ar"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="k3x3nr-"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="ig6cn37">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="rciz4k6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="9e4bea3">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="2yw_t5-">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="npuavoj">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="9097.m8">
                    <div className="flex items-center justify-center space-x-2" data-oid="cop:o7e">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="_kmwylk"
                        ></div>
                        <span className="text-gray-600" data-oid="qox03ge">
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
