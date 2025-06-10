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
        <div className="space-y-6" data-oid="wiafs4n">
            <div className="flex justify-between items-center" data-oid="a03z60o">
                <div data-oid="ry4hosu">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="5ffabu2">
                        AI Prompt Interface
                    </h2>
                    <p className="text-sm text-gray-600 mt-1" data-oid="2qkawu6">
                        {selectedDocument
                            ? `Searching within: ${selectedDocument.name}`
                            : selectedDatabase
                              ? `Searching in database: ${selectedDatabase.name}`
                              : 'Searching across all databases'}
                    </p>
                </div>
                <div className="flex items-center space-x-4" data-oid="pleulk9">
                    {selectedDocument && (
                        <button
                            onClick={onClearDocumentFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="jj.ucqz"
                        >
                            ← Clear document filter
                        </button>
                    )}
                    {selectedDatabase && !selectedDocument && (
                        <button
                            onClick={onClearDatabaseFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            data-oid="k.n5phd"
                        >
                            ← Clear database filter
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt Input Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="_kn7b4w">
                <div className="space-y-4" data-oid="x3z-pi-">
                    <div data-oid="3wb6jom">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="44yjn-l"
                        >
                            Your Prompt
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => onPromptTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Enter your question or prompt here..."
                            data-oid="4v-56xt"
                        />
                    </div>

                    <div className="flex items-center justify-between" data-oid="t5y:lb8">
                        <div className="flex items-center space-x-4" data-oid="dkwty18">
                            <div data-oid="v2u1.os">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="9aqqjo3"
                                >
                                    Documents to retrieve
                                </label>
                                <select
                                    value={numDocuments}
                                    onChange={(e) => onNumDocumentsChange(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="jbbcbc7"
                                >
                                    <option value={3} data-oid="o9mli1y">
                                        3
                                    </option>
                                    <option value={5} data-oid=".kuo8.q">
                                        5
                                    </option>
                                    <option value={10} data-oid="9c2prgq">
                                        10
                                    </option>
                                    <option value={15} data-oid="b-461l:">
                                        15
                                    </option>
                                    <option value={20} data-oid="f9:htmq">
                                        20
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onSubmitPrompt}
                            disabled={!promptText.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            data-oid="4n6hx6g"
                        >
                            {isLoading ? 'Processing...' : 'Submit Prompt'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="8he23yh">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="4qb0:-o">
                        Retrieved Context ({searchResults.length} documents)
                    </h3>
                    <div className="space-y-4" data-oid="u5x26jk">
                        {searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                data-oid=":up:djc"
                            >
                                <div
                                    className="flex justify-between items-start mb-2"
                                    data-oid="mglgcgt"
                                >
                                    <div data-oid="ft.50.g">
                                        <span
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="lw-2nyd"
                                        >
                                            {result.document}
                                        </span>
                                        <span
                                            className="text-sm text-gray-500 ml-2"
                                            data-oid="z-8s31c"
                                        >
                                            ({result.database})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2" data-oid="iqh75:o">
                                        <span
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            data-oid="o7nbgmw"
                                        >
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </span>
                                        <span
                                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                                            data-oid="qr9kxhm"
                                        >
                                            Chunk {result.chunk}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700" data-oid="xzitqin">
                                    {result.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {promptResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="80k98ek">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="2y1fmgz">
                        AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none" data-oid="ov8ibbs">
                        <div className="whitespace-pre-wrap text-gray-700" data-oid="i26:5ce">
                            {promptResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6" data-oid="abvamga">
                    <div className="flex items-center justify-center space-x-2" data-oid="ms.3wbo">
                        <div
                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                            data-oid="zwiqt7q"
                        ></div>
                        <span className="text-gray-600" data-oid="63bvqdt">
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
