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
        <div className="space-y-6" data-oid="xalt1-w">
            <div className="flex justify-between items-center" data-oid="n.j1h3z">
                <div data-oid="td.q.0g">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="-o1p425">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="7gdai2i">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="cpupiet">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="g.8ixj_"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid=":bitkp9"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="1t5gvaq">
                <div className="space-y-4" data-oid="t58gwf4">
                    <div data-oid="ddh:.51">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="mge7z51"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="4mdtg89"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="oagg9zx">
                        <div className="flex items-center space-x-4" data-oid="so3c.8_">
                            <div data-oid="jjcmtbq">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid=".8r6_zs"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="_q7rwcp"
                                >
                                    <option value={3} data-oid="iss94hg">
                                        3
                                    </option>
                                    <option value={5} data-oid="b.l230v">
                                        5
                                    </option>
                                    <option value={10} data-oid="l:5.xr:">
                                        10
                                    </option>
                                    <option value={15} data-oid="eq5pilk">
                                        15
                                    </option>
                                    <option value={20} data-oid="tf.8cdt">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="b92xbfy"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="_pgioh_">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="0_9k3v3">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="ax793lc">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="ie74w23"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="-aam8jv"
                                >
                                    <div data-oid="-bmf09_">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="9411bzc"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="z-:-tre"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="o4rwytb">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="0c2929h"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid=":j8uqni"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="dmd971s">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid=".8_cmxo">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid=":9v-knw">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="wyb-ozo">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="w.58rcg">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="9-8k1id">
                    <div className="flex items-center justify-center space-x-2" data-oid="gdwzyjt">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="-6ob1ug"
                        ></div>
                        <span className="text-gray-600" data-oid="b-5zt9l">
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
