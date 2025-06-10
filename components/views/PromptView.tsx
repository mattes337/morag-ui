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
        <div className="space-y-6" data-oid="xpoc_yk">
            <div className="flex justify-between items-center" data-oid=":ieltkk">
                <div data-oid="51nvs7s">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="ey4eiq5">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="rx39b0g">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid=":81yhrj">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="esd:50p"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="l.rjgaw"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="9ll0q8y">
                <div className="space-y-4" data-oid="fxa37:4">
                    <div data-oid="sey13wr">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="7vx6bns"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="d_56.f_"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="8.wq8p5">
                        <div className="flex items-center space-x-4" data-oid="4cu1jie">
                            <div data-oid="tocn3sx">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="hzb:ak3"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="q4ptfgq"
                                >
                                    <option value={3} data-oid="6_3d0cd">
                                        3
                                    </option>
                                    <option value={5} data-oid="4l:i0fl">
                                        5
                                    </option>
                                    <option value={10} data-oid="s-pbo8i">
                                        10
                                    </option>
                                    <option value={15} data-oid="_ew4e8y">
                                        15
                                    </option>
                                    <option value={20} data-oid="7f1:oge">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="5ik5lwg"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="h:qa28f">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="85mmxz7">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="5.-10yb">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="cywy2k1"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="zwy4lhf"
                                >
                                    <div data-oid="2fdd5k1">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="bq6e:6z"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="9qqa_1."
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="vo_h028">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="ifmp08b"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="81ot9o:"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="4ki6jwz">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid=":wc:cxh">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="7r:gmgb">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="rw5sy_x">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="dpeh4r1">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="3:bikhu">
                    <div className="flex items-center justify-center space-x-2" data-oid="22jbr43">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="c67ni5z"
                        ></div>
                        <span className="text-gray-600" data-oid="q-yu8x-">
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
