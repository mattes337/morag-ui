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
        <div className="space-y-6" data-oid="yz_v0kz">
            <div className="flex justify-between items-center" data-oid="6h4zgbw">
                <div data-oid="rphrmbn">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="pp.s3:j">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="f-90xj2">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid=":gd1_pl">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="7p1z-kn"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="u.ex1of"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="_-lt:mq">
                <div className="space-y-4" data-oid="rmd4:k7">
                    <div data-oid="xppi-bi">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="zucr:dv"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid=":.6akl."
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="hc8jjtd">
                        <div className="flex items-center space-x-4" data-oid="ger_ujr">
                            <div data-oid=":1kh9x0">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="sbx:8zj"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="_29_lr_"
                                >
                                    <option value={3} data-oid="r22-lqj">
                                        3
                                    </option>
                                    <option value={5} data-oid="u.j0kqo">
                                        5
                                    </option>
                                    <option value={10} data-oid="pjlnq1.">
                                        10
                                    </option>
                                    <option value={15} data-oid="brovqyw">
                                        15
                                    </option>
                                    <option value={20} data-oid="7c1c:ag">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="_f9c39d"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="0p534b1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="0yhnyhk">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="hzb7_ts">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="zsg5j0."
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="2hwzwtm"
                                >
                                    <div data-oid="aka4ojw">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="wztxgks"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="l6tc-rt"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="n.wiloq">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="kesxbza"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="lry7ey2"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="u3kb.l7">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="t76hq6o">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="m8mcbu-">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="n52ff.t">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="4a._01t">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="4bg_yt.">
                    <div className="flex items-center justify-center space-x-2" data-oid="hbb3q.c">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="b12148u"
                        ></div>
                        <span className="text-gray-600" data-oid="9ks:tgb">
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
