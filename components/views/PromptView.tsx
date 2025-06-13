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
        <div className="space-y-6" data-oid="_34b1z0">
            <div className="flex justify-between items-center" data-oid="qx214-u">
                <div data-oid="hyz6ar8">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="p8awm5c">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="1owu_gv">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="83hy9an">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="ajwgp0i"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="k-a_6og"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="7-ewphe">
                <div className="space-y-4" data-oid="qmyus6z">
                    <div data-oid="egu-0cc">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="7axh85v"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="2jkg0uv"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="lz4writ">
                        <div className="flex items-center space-x-4" data-oid="h:j_31j">
                            <div data-oid="b655xkx">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="32zss4-"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="u:cwdlu"
                                >
                                    <option value={3} data-oid="6ow50:2">
                                        3
                                    </option>
                                    <option value={5} data-oid="3scw9rq">
                                        5
                                    </option>
                                    <option value={10} data-oid="fx:nx1a">
                                        10
                                    </option>
                                    <option value={15} data-oid="4nn8q0-">
                                        15
                                    </option>
                                    <option value={20} data-oid="_icovu6">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid=":c_e8_h"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="h3oorbl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="yu_0l0u">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="-r.10fg">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="va07fk5"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="4v40vz4"
                                >
                                    <div data-oid="9fxmwi1">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="r35mp2-"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="-vud-74"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="mj.dlue">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="58.o8k5"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="3w2q5dz"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="pexd7da">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="w7kc9zj">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="hwhm28h">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="dltyvvn">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="jzkso4o">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid=".w5d5yz">
                    <div className="flex items-center justify-center space-x-2" data-oid="uaqzyou">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="1pejkq2"
                        ></div>
                        <span className="text-gray-600" data-oid=".qx6x50">
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
