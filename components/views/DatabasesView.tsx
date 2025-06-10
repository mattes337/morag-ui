'use client';

import { Database } from '../../types';

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
    return (
        <div className="space-y-6" data-oid="ol5ths4">
            <div className="flex justify-between items-center" data-oid="n3t4u-o">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="-l.r87v">
                    Vector Databases
                </h2>
                <button
                    onClick={onCreateDatabase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="lg859ul"
                >
                    Create Database
                </button>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="s3h.-4-"
            >
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-oid="e:7yy5:"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="4orpd-h">
                            {db.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4" data-oid="so02eqr">
                            {db.description}
                        </p>
                        <div
                            className="flex justify-between items-center text-sm text-gray-500 mb-4"
                            data-oid="tq2v_l7"
                        >
                            <span data-oid="o53lj2l">{db.documentCount} documents</span>
                            <span data-oid="ljardxk">Updated {db.lastUpdated}</span>
                        </div>
                        <div className="flex space-x-2" data-oid="cfddvpt">
                            <button
                                onClick={() => onPromptDatabase(db)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                data-oid="u42:0vb"
                            >
                                Prompt
                            </button>
                            <button
                                onClick={() => onSelectDatabase(db)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                data-oid="8-lyz0h"
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
