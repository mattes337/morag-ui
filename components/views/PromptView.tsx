'use client';

import { Realm, Document, SearchResult } from '../../types';

interface PromptViewProps {
    selectedRealm: Realm | null;
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
    onClearRealmFilter: () => void;
}

export function PromptView({
    selectedRealm,
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
    onClearRealmFilter,
}: PromptViewProps) {
    return (
        <div className="space-y-6" data-oid="_:-nvoa">
            <div className="flex justify-between items-center" data-oid="qlctpu7">
                <div data-oid="y9g_5b.">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="5btzcjf">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="r9g_w-w">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedRealm
                              ? `Searching in realm: ${selectedRealm.name}`
                              : 'Searching across all realms'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="y9wxrch">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="8.wtv0p"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedRealm && !selectedDocument && (
                        <button
                            onClick={onClearRealmFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="ir9xv25"
                        >
                            ← Clear realm filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="9y_2jh1">
                <div className="space-y-4" data-oid="dg0k9er">
                    <div data-oid="qgxiege">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="080gb5b"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="lstoclb"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="vpezewz">
                        <div className="flex items-center space-x-4" data-oid="hk-n305">
                            <div data-oid="xkvcxir">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="necbo8e"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid=".ntttnb"
                                >
                                    <option value={3} data-oid="yg1orbu">
                                        3
                                    </option>
                                    <option value={5} data-oid="qr8fm.2">
                                        5
                                    </option>
                                    <option value={10} data-oid="o:9a9oi">
                                        10
                                    </option>
                                    <option value={15} data-oid="3a5me24">
                                        15
                                    </option>
                                    <option value={20} data-oid="b45gnql">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="jj3bg7a"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="v4puuht">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="5o4fnhe">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid=":h2igs9">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid="cjc8kpl"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="x-.6v4s"
                                >
                                    <div data-oid="objh.-_">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="wzwt3:."
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="n-f_van"
                                        >
                                            ({result.realm})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="zkehcwe">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="y-5q867"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="f82pzs-"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="vf6evg2">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="-dqcgmv">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="h6mu-or">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="qyctpsz">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="lktf7bu">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="28h1ilf">
                    <div className="flex items-center justify-center space-x-2" data-oid="0dzv.17">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="pj-4.n:"
                        ></div>
                        <span className="text-gray-600" data-oid="n2zvluj">
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
