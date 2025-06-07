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
        <div className="space-y-6" data-oid="gahl50n">
            <div className="flex justify-between items-center" data-oid="11_hjvf">
                <div data-oid="axxvesn">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="jxu1w0s">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid=".edmwpn">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid=":tzo-ly">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="-x.gng4"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="x:58_n7"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="qg3f_vu">
                <div className="space-y-4" data-oid="_n_ps4u">
                    <div data-oid="q05_afq">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="u18u94d"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="dz1dz75"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="g0nnl8l">
                        <div className="flex items-center space-x-4" data-oid="m__3mz0">
                            <div data-oid="cgr83i0">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="gq_xy16"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="10oiqv."
                                >
                                    <option value={3} data-oid="niqhtbn">
                                        3
                                    </option>
                                    <option value={5} data-oid="ysf80co">
                                        5
                                    </option>
                                    <option value={10} data-oid="5t091nt">
                                        10
                                    </option>
                                    <option value={15} data-oid=".yobv.x">
                                        15
                                    </option>
                                    <option value={20} data-oid="k-uwslg">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid=".firuxh"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="zu0:x7m">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="f3j2bsj">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="v6zvohh">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="n7:_kbt"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid=":shmt1v"
                                >
                                    <div data-oid="1ha5bu6">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="okpzmz:"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="1lfoaob"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="xvb.-c7">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="g00u.to"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="fs4.a:."
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="5h6zky5">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="ghkhjaj">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="ehl.e6l">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="ezorw_n">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="s7dfpu3">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="b:b4es.">
                    <div className="flex items-center justify-center space-x-2" data-oid="gnw72lg">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="2r4obd5"
                        ></div>
                        <span className="text-gray-600" data-oid="3lqk5nu">
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
