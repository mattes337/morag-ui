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
        <div className="space-y-6" data-oid="4ltbkj-">
            <div className="flex justify-between items-center" data-oid="r88:hf0">
                <div data-oid="k-:sxi0">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="d6k_czz">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="rfiaov-">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="6egd5e6">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="9kz3jb."
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="rglj60k"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="ozl:834">
                <div className="space-y-4" data-oid="m6x1s1e">
                    <div data-oid="l4bhr6y">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="94gov.t"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="2gyulw2"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="4nu59mr">
                        <div className="flex items-center space-x-4" data-oid="o65y7zi">
                            <div data-oid=".70pimz">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="g37y6ll"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid=":js_..m"
                                >
                                    <option value={3} data-oid="2y2picu">
                                        3
                                    </option>
                                    <option value={5} data-oid="kkwwezq">
                                        5
                                    </option>
                                    <option value={10} data-oid="jfn680z">
                                        10
                                    </option>
                                    <option value={15} data-oid="7kvwklp">
                                        15
                                    </option>
                                    <option value={20} data-oid="k-lcr6d">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid=".c9_i2w"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="8m6hrfo">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid=":2mfe-u">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="61l-zql">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="w2mg8:m"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="5ry2x1o"
                                >
                                    <div data-oid="eizrexq">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="do_4mkv"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="sjt7gnv"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="ia6bh7u">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid=".10_1vd"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="xkd2.f3"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="yddz.fx">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="18663pm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="qurx5gl">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="s.._3:-">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="krcx.ra">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="3u_fqbg">
                    <div className="flex items-center justify-center space-x-2" data-oid="m6vm0fr">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="gy38kuu"
                        ></div>
                        <span className="text-gray-600" data-oid="l9bk.m3">
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
