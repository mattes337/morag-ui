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
        <div className="space-y-6" data-oid="ydb-wbq">
            <div className="flex justify-between items-center" data-oid="d2:xq.a">
                <div data-oid="4mthga4">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="aojb8cs">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="noaj4a-">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="2t:2ztq">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="y14o06r"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="8a:zkxk"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="h28.8ta">
                <div className="space-y-4" data-oid="of9x-ay">
                    <div data-oid="53i:8ar">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="7er0ves"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="i59bagg"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="5s2qbsc">
                        <div className="flex items-center space-x-4" data-oid="b2:ccg_">
                            <div data-oid="zd_532y">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="ek7jhu3"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="oasep29"
                                >
                                    <option value={3} data-oid="as8r4iu">
                                        3
                                    </option>
                                    <option value={5} data-oid="6rlot1r">
                                        5
                                    </option>
                                    <option value={10} data-oid="wlz78uz">
                                        10
                                    </option>
                                    <option value={15} data-oid="cmi6xj7">
                                        15
                                    </option>
                                    <option value={20} data-oid="s58_o19">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="em7_o-i"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="geiwf0z">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="vyxczdg">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="z7.iew-">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="1e4b_oy"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="9:0q--f"
                                >
                                    <div data-oid="zwnu679">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="1zi0je:"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="tp.rchd"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="z_3:gc7">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="v_.y.s6"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="_165wde"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="uc52qr7">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="b-zjtt5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="m5ytwjq">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="p4izb-o">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="c5qvl6x">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="g15cgm3">
                    <div className="flex items-center justify-center space-x-2" data-oid="-lz-h1q">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="6o-q:cn"
                        ></div>
                        <span className="text-gray-600" data-oid=".melx2m">
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
