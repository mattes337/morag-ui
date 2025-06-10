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
        <div className="space-y-6" data-oid="rt_x_z1">
            <div className="flex justify-between items-center" data-oid="jr0orwy">
                <div data-oid="wyfmmag">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="y_-kvvr">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="7lalxu6">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="e6yn7zk">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="sw64-kk"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="131hs_6"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="afgp6-e">
                <div className="space-y-4" data-oid="4b-gnwh">
                    <div data-oid="o6_gum:">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="r967ps-"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="hkyju4k"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="bi37rr-">
                        <div className="flex items-center space-x-4" data-oid="fbhga5k">
                            <div data-oid="c3ksc1e">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="__mhmd."
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="0-.lkgb"
                                >
                                    <option value={3} data-oid="64534ij">
                                        3
                                    </option>
                                    <option value={5} data-oid="g:158gq">
                                        5
                                    </option>
                                    <option value={10} data-oid="l6xiecz">
                                        10
                                    </option>
                                    <option value={15} data-oid="thfp_dg">
                                        15
                                    </option>
                                    <option value={20} data-oid="2sbcvy2">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="3f8umr9"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="o-2gqkk">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="m5lljo4">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="ql:flfn">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="ovwemyg"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="u2nxxo:"
                                >
                                    <div data-oid="af4b26z">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="l6hqhhj"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="sn2s-ar"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="ksc-tj1">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="47p89zw"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="qo84ymy"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="btq10eb">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="fjnxd9:">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="ni13dyt">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="eicmyp.">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="e5p2.:r">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid=":ynxaee">
                    <div className="flex items-center justify-center space-x-2" data-oid="u1eb.t3">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="zgz233p"
                        ></div>
                        <span className="text-gray-600" data-oid="gw5k_ik">
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
