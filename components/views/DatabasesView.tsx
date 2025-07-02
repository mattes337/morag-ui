'use client';

import { Database } from '../../types';
import { Database as DatabaseIcon, Plus, FileText, Server, Clock, Activity } from 'lucide-react';

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
                        onClick={() => onViewDatabase && onViewDatabase(db)}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                                    <DatabaseIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{db.name}</h3>
                                    <p className="text-gray-600 text-sm">{db.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{db.lastUpdated}</span>
                            </div>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-medium text-gray-700">Documents</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">{db.documentCount || 0}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Server className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-medium text-gray-700">Servers</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">{db.servers?.length || 0}</div>
                            </div>
                        </div>
                        
                        {/* Server Tags */}
                        {db.servers && db.servers.length > 0 && (
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {db.servers.slice(0, 2).map((server) => (
                                        <span
                                            key={server.id}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200"
                                        >
                                            <Server className="w-3 h-3 mr-1" />
                                            {server.name}
                                        </span>
                                    ))}
                                    {db.servers.length > 2 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                                            +{db.servers.length - 2} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Prompts Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                        db.ingestionPrompt ? 'bg-green-400' : 'bg-gray-300'
                                    }`} />
                                    <span className="text-xs text-gray-600">Ingestion</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                        db.systemPrompt ? 'bg-green-400' : 'bg-gray-300'
                                    }`} />
                                    <span className="text-xs text-gray-600">System</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Activity className="w-3 h-3" />
                                <span>Active</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
