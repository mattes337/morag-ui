'use client';

import { Database } from '../../types';
import { Database as DatabaseIcon, Plus } from 'lucide-react';

interface DatabasesViewProps {
    databases: Database[];
    onCreateDatabase: () => void;
    onSelectDatabase: (database: Database) => void;
    onPromptDatabase: (database: Database) => void;
}

export function DatabasesView({
    databases,
    onCreateDatabase,
    onSelectDatabase,
    onPromptDatabase,
}: DatabasesViewProps) {
    // Show empty state when no databases exist
    if (databases.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center py-16 px-4"
                data-oid="r49xi-w"
            >
                <div className="bg-gray-100 rounded-full p-6 mb-6" data-oid="6a-4lrh">
                    <DatabaseIcon className="w-16 h-16 text-gray-400" data-oid="9pft6ok" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-oid="acejgyo">
                    No databases yet
                </h3>
                <p className="text-gray-600 text-center mb-8 max-w-md" data-oid="em.5x3v">
                    Get started by creating your first vector database. You'll be able to store and
                    search through your documents using AI-powered semantic search.
                </p>
                <button
                    onClick={onCreateDatabase}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    data-oid="o7v93:d"
                >
                    <Plus className="w-5 h-5 mr-2" data-oid="cxzb3b:" />
                    Create Your First Database
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-oid="fx_ba6a">
            <div className="flex justify-between items-center" data-oid="yd2nast">
                <h2 className="text-2xl font-bold text-gray-900" data-oid=".ch3t0-">
                    Vector Databases
                </h2>
                <button
                    onClick={onCreateDatabase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="ou-pvzv"
                >
                    Create Database
                </button>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="ghee41b"
            >
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-oid="tx2fo0h"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="kjc-opo">
                            {db.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4" data-oid="2heox2c">
                            {db.description}
                        </p>
                        <div
                            className="flex justify-between items-center text-sm text-gray-500 mb-4"
                            data-oid="-3gfv8n"
                        >
                            <span data-oid="gzu00df">{db.documentCount} documents</span>
                            <span data-oid="tdvm.s3">Updated {db.lastUpdated}</span>
                        </div>
                        <div className="flex space-x-2" data-oid="3p:eihl">
                            <button
                                onClick={() => onPromptDatabase(db)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                data-oid="027f1lg"
                            >
                                Prompt
                            </button>
                            <button
                                onClick={() => onSelectDatabase(db)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                data-oid="6ssk91b"
                            >
                                View Docs
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
