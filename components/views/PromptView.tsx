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
        <div className="space-y-6" data-oid="hnq1c1o">
            <div className="flex justify-between items-center" data-oid="vt2l5r2">
                <div data-oid="g.fd-60">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="brl847m">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="bs4.-6-">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="gc631-l">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="ftugwqm"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="bykk.qp"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="opvcrli">
                <div className="space-y-4" data-oid="dxu6nxo">
                    <div data-oid="1d_4x9z">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="wsx-1o7"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="byyna5e"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="0-f-:j.">
                        <div className="flex items-center space-x-4" data-oid="087_f:w">
                            <div data-oid="ysuzj.:">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="penxb3f"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="yt.svov"
                                >
                                    <option value={3} data-oid="rejt9qk">
                                        3
                                    </option>
                                    <option value={5} data-oid="b3rmohg">
                                        5
                                    </option>
                                    <option value={10} data-oid="ocxyogr">
                                        10
                                    </option>
                                    <option value={15} data-oid="-cm3jdz">
                                        15
                                    </option>
                                    <option value={20} data-oid="7os:5dt">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="0et9qd2"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="1n3.4r8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="2_-5bkr">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="ebq2gak">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="pt9_rg9"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="-d3nual"
                                >
                                    <div data-oid="53pzo1j">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="i3935wd"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="huv5a22"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="82du7lx">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="ing6hpg"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="87_a4iq"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="g-84n.2">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid=".ntzyv1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="029sl7a">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="d34h6ju">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="gogwgyq">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="_bdnyeg">
                    <div className="flex items-center justify-center space-x-2" data-oid="fig57px">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid=":-c.255"
                        ></div>
                        <span className="text-gray-600" data-oid="ohx:b34">
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
