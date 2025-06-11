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
        <div className="space-y-6" data-oid="ak:2npk">
            <div className="flex justify-between items-center" data-oid="15:6z9v">
                <div data-oid="r83ijvi">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="d6ko0-v">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="tig7rsp">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="qm9pmvm">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid=":l28b3e"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="9jhrix_"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="6f-vq18">
                <div className="space-y-4" data-oid="s_126zh">
                    <div data-oid="tt8d0sn">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="qn.04_6"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="vztos_."
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="l-j7t7.">
                        <div className="flex items-center space-x-4" data-oid="-67kg8n">
                            <div data-oid="b.swhl8">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="fw4nixe"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="w5an3.4"
                                >
                                    <option value={3} data-oid="iekjyv7">
                                        3
                                    </option>
                                    <option value={5} data-oid="n7_rj5h">
                                        5
                                    </option>
                                    <option value={10} data-oid="wv7zbwg">
                                        10
                                    </option>
                                    <option value={15} data-oid="bnnni3o">
                                        15
                                    </option>
                                    <option value={20} data-oid="uyp3a81">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="-c5q5l3"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="nf:sy5j">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="vv6p2ta">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="nnv4.hm">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="7wwe4ic"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="9-6g3tw"
                                >
                                    <div data-oid="0:8ny5t">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="ay0v1d1"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="ndtj5l-"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="6zqxtzx">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="jktzf:8"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="y3ulk6v"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="6dfydlw">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="j2vl9pf">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="gnzk218">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="hb7uar.">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid=":d8qwzj">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="x.0uvzt">
                    <div className="flex items-center justify-center space-x-2" data-oid="qxi0v73">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="11z060u"
                        ></div>
                        <span className="text-gray-600" data-oid="bps2:oo">
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
