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
        <div className="space-y-6" data-oid="5leh2m_">
            <div className="flex justify-between items-center" data-oid="5irmr2p">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="8mji3r4">
                    Vector Databases
                </h2>
                <button
                    onClick={onCreateDatabase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="7m3hzfj"
                >
                    Create Database
                </button>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="7wrzh.z"
            >
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-oid="2bepb.e"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="knfhxmm">
                            {db.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4" data-oid="x_54n83">
                            {db.description}
                        </p>
                        <div
                            className="flex justify-between items-center text-sm text-gray-500 mb-4"
                            data-oid="0iju1:-"
                        >
                            <span data-oid="54je6:2">{db.documentCount} documents</span>
                            <span data-oid="-8dwumb">Updated {db.lastUpdated}</span>
                        </div>
                        <div className="flex space-x-2" data-oid="nnihza1">
                            <button
                                onClick={() => onPromptDatabase(db)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                data-oid="w21li8i"
                            >
                                Prompt
                            </button>
                            <button
                                onClick={() => onSelectDatabase(db)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                data-oid="qrvgvs8"
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
