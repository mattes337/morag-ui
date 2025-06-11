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
        <div className="space-y-6" data-oid="mbchn04">
            <div className="flex justify-between items-center" data-oid="yo0zzu9">
                <div data-oid="44m4dho">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="9hkhlzf">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="mluxoyj">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="k_p:pjb">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="0p2omr-"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="q5uiaz6"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid=":1eyffx">
                <div className="space-y-4" data-oid="uezx9nj">
                    <div data-oid="n32uuol">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="-lpi6_x"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="3.dl8fv"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="e_r29mt">
                        <div className="flex items-center space-x-4" data-oid="zzsb4s7">
                            <div data-oid="t4g81mf">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="b-_j7-a"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="4qw16gx"
                                >
                                    <option value={3} data-oid="p:8kfu:">
                                        3
                                    </option>
                                    <option value={5} data-oid="jbg3pj8">
                                        5
                                    </option>
                                    <option value={10} data-oid="iqtw9yw">
                                        10
                                    </option>
                                    <option value={15} data-oid="ef6x-px">
                                        15
                                    </option>
                                    <option value={20} data-oid=".apov0c">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="3zy7gtc"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="_0zu94g">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="j-x811y">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="613:nu_">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="kcv9kb9"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="q6-687s"
                                >
                                    <div data-oid="4:jy9.x">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="x3sujj4"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="d67lhe0"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="dk_ipk:">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="9n0nqd7"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="t_uzdvb"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="oa_xfnh">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="_d0-jv5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="wfzcj5c">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="ohqq9ze">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="hc-uptv">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="5qpm-vd">
                    <div className="flex items-center justify-center space-x-2" data-oid="e8.xbkr">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="rvno3z8"
                        ></div>
                        <span className="text-gray-600" data-oid="mdyf7:w">
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
