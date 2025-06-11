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
        <div className="space-y-6" data-oid="zf7cm9o">
            <div className="flex justify-between items-center" data-oid="ojs5yjf">
                <div data-oid="rdym2bm">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="alkn7og">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="h01a4s9">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="zd9v0mb">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="pu1mwve"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="x_9_nme"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid=":i-parf">
                <div className="space-y-4" data-oid="09h9ti.">
                    <div data-oid="o.exsl7">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="f2kbv77"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="ewa:zq-"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="v82918e">
                        <div className="flex items-center space-x-4" data-oid="csxfelj">
                            <div data-oid="0b17ery">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="tnh7qlr"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="eozzwt7"
                                >
                                    <option value={3} data-oid="rm:kdkl">
                                        3
                                    </option>
                                    <option value={5} data-oid="xtksvi8">
                                        5
                                    </option>
                                    <option value={10} data-oid="x07dro2">
                                        10
                                    </option>
                                    <option value={15} data-oid="ehnxpc9">
                                        15
                                    </option>
                                    <option value={20} data-oid="e16adre">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="j6rlsl2"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="q64kmuu">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="k3yhf5e">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="h9or8da">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="onexfkb"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="gcp8ler"
                                >
                                    <div data-oid="9xlftsm">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="bpevw34"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="rikrvxi"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="e_av89c">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="iytd36a"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="ubjhl9s"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="yf15mj6">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="hfl--j:">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="7ycm5tb">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="cuvwu:0">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="_o8rtw9">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="n6kpxsz">
                    <div className="flex items-center justify-center space-x-2" data-oid="9xrjk0f">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="6ib48t5"
                        ></div>
                        <span className="text-gray-600" data-oid="_68wsq0">
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
