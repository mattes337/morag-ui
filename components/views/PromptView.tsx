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
        <div className="space-y-6" data-oid="ag:q1b-">
            <div className="flex justify-between items-center" data-oid="0dh89fv">
                <div data-oid="m_o49.0">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="9.k25-4">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="dexz6ui">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid=":yc:ffv">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="xwpvrk8"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="hx4m2tl"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="xbsvz9a">
                <div className="space-y-4" data-oid="sw.nbmk">
                    <div data-oid="auf6pju">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="2oh8_y1"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid=":pw8ayl"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid=":gswfq9">
                        <div className="flex items-center space-x-4" data-oid="l9a97yw">
                            <div data-oid="b3-c5m5">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="ub_g1mw"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="xt22caj"
                                >
                                    <option value={3} data-oid="5sev7hz">
                                        3
                                    </option>
                                    <option value={5} data-oid="vtevqyr">
                                        5
                                    </option>
                                    <option value={10} data-oid="ry:c75x">
                                        10
                                    </option>
                                    <option value={15} data-oid="wnb.-g4">
                                        15
                                    </option>
                                    <option value={20} data-oid="j0bnok0">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="t3zm.hm"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="5knkj_:">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="wg-us_r">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="8cbtwbn">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="p10gpt8"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="l5s-vn9"
                                >
                                    <div data-oid="aag_kul">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="6vyh9o8"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="7lrmy8y"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="t-.uf5-">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="v.6fo7q"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="zql81qe"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="g70j1h2">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="1wz:6-c">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="cxipjg6">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="jn3rq75">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="zik8p:0">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="epbiq9z">
                    <div className="flex items-center justify-center space-x-2" data-oid="t_sk0hh">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="3md41_-"
                        ></div>
                        <span className="text-gray-600" data-oid="20v4u27">
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
