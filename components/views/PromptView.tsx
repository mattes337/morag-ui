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
        <div className="space-y-6" data-oid="0bii.je">
            <div className="flex justify-between items-center" data-oid="-1r_lw9">
                <div data-oid="b2ua39i">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="v:dzx6m">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="9wdp5f4">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="rojc_ap">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="lli-0-d"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="4juzw_f"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="kogfasf">
                <div className="space-y-4" data-oid="jho.ews">
                    <div data-oid="nts4sa3">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="9ncoup:"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="k0zyart"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="paxr13y">
                        <div className="flex items-center space-x-4" data-oid="fl2u535">
                            <div data-oid="dhd.tw1">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="9dg0exc"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="-m9fjw6"
                                >
                                    <option value={3} data-oid="5vomd4h">
                                        3
                                    </option>
                                    <option value={5} data-oid="42gls7m">
                                        5
                                    </option>
                                    <option value={10} data-oid="8jzqy60">
                                        10
                                    </option>
                                    <option value={15} data-oid="aejjx1c">
                                        15
                                    </option>
                                    <option value={20} data-oid="we3q64-">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="arc-941"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="3jmtip1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="4biymm8">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="q61j88k">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="00arord"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="9z6.7kx"
                                >
                                    <div data-oid="jtf_8.8">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="6_bv1ta"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="80maxe."
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="5lmr2ba">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="o8xje.p"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="v85cj-q"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="g:tt8i:">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="irphjak">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="v_ww30l">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="q0fq49_">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="-768--9">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="rsg8uf_">
                    <div className="flex items-center justify-center space-x-2" data-oid="x7v-hvz">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="rdss8ax"
                        ></div>
                        <span className="text-gray-600" data-oid="iqdluyw">
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
