'use client';

import { Database } from '../../types';
import { Database as DatabaseIcon, Plus } from 'lucide-react';

interface DatabasesViewProps {
    databases: Database[];
    onCreateDatabase: () => void;
    onSelectDatabase: (database: Database) => void;
    onPromptDatabase: (database: Database) => void;
    onViewDatabase?: (database: Database) => void;
}

export function DatabasesView({
    databases,
    onCreateDatabase,
    onSelectDatabase,
    onPromptDatabase,
    onViewDatabase,
}: DatabasesViewProps) {
    // Show empty state when no databases exist
    if (databases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <DatabaseIcon className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No databases yet</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                    Get started by creating your first vector database. You&apos;ll be able to store and
                    search through your documents using AI-powered semantic search.
                </p>
                <button
                    onClick={onCreateDatabase}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Database
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Vector Databases</h2>
                <button
                    onClick={onCreateDatabase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create Database
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{db.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{db.description}</p>
                        
                        {/* Display associated servers */}
                        {db.servers && db.servers.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">Servers:</p>
                                <div className="flex flex-wrap gap-1">
                                    {db.servers.map((server) => (
                                        <span
                                            key={server.id}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                        >
                                            {server.name} ({server.type.toLowerCase()})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Display prompts if they exist */}
                        {(db.ingestionPrompt || db.systemPrompt) && (
                            <div className="mb-3 text-xs text-gray-600">
                                {db.ingestionPrompt && (
                                    <div className="mb-1">
                                        <span className="font-medium">Ingestion:</span> {db.ingestionPrompt.substring(0, 50)}{db.ingestionPrompt.length > 50 ? '...' : ''}
                                    </div>
                                )}
                                {db.systemPrompt && (
                                    <div>
                                        <span className="font-medium">System:</span> {db.systemPrompt.substring(0, 50)}{db.systemPrompt.length > 50 ? '...' : ''}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                            <span>{db.documentCount} documents</span>
                            <span>Updated {db.lastUpdated}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onPromptDatabase(db)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                            >
                                Prompt
                            </button>
                            <button
                                onClick={() => onSelectDatabase(db)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                                View Docs
                            </button>
                            {onViewDatabase && (
                                <button
                                    onClick={() => onViewDatabase(db)}
                                    className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Details
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
