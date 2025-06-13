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
                data-oid="yoetzk7"
            >
                <div className="bg-gray-100 rounded-full p-6 mb-6" data-oid="x18fsqn">
                    <DatabaseIcon className="w-16 h-16 text-gray-400" data-oid="4t6l9md" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-oid="70:3cwo">
                    No databases yet
                </h3>
                <p className="text-gray-600 text-center mb-8 max-w-md" data-oid="6qhyrc3">
                    Get started by creating your first vector database. You'll be able to store and
                    search through your documents using AI-powered semantic search.
                </p>
                <button
                    onClick={onCreateDatabase}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    data-oid="uqqsejy"
                >
                    <Plus className="w-5 h-5 mr-2" data-oid="9762036" />
                    Create Your First Database
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-oid="f4lw-ep">
            <div className="flex justify-between items-center" data-oid="5b0b6k9">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="k5po420">
                    Vector Databases
                </h2>
                <button
                    onClick={onCreateDatabase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="72d01tl"
                >
                    Create Database
                </button>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="owun6yy"
            >
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-oid="u59s1i_"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="9i3-gnu">
                            {db.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4" data-oid="w15z1ub">
                            {db.description}
                        </p>
                        <div
                            className="flex justify-between items-center text-sm text-gray-500 mb-4"
                            data-oid="yw7u86_"
                        >
                            <span data-oid="j43ijzt">{db.documentCount} documents</span>
                            <span data-oid="l.xrso8">Updated {db.lastUpdated}</span>
                        </div>
                        <div className="flex space-x-2" data-oid="z0zlzh9">
                            <button
                                onClick={() => onPromptDatabase(db)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                data-oid="x5-u-1f"
                            >
                                Prompt
                            </button>
                            <button
                                onClick={() => onSelectDatabase(db)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                data-oid="lc03jfn"
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
