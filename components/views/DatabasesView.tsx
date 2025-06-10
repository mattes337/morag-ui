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
        <div className="space-y-6" data-oid="fx418t1">
            <div className="flex justify-between items-center" data-oid="0935wwc">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="u23pqmr">
                    Vector Databases
                </h2>
                <button
                    onClick={onCreateDatabase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="srfc39c"
                >
                    Create Database
                </button>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="c__m.u8"
            >
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-oid="3s4ietd"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="cg323rs">
                            {db.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4" data-oid="por8ev:">
                            {db.description}
                        </p>
                        <div
                            className="flex justify-between items-center text-sm text-gray-500 mb-4"
                            data-oid="zz9zl_-"
                        >
                            <span data-oid="q8ht2rt">{db.documentCount} documents</span>
                            <span data-oid="f7u.zox">Updated {db.lastUpdated}</span>
                        </div>
                        <div className="flex space-x-2" data-oid="v5y96y3">
                            <button
                                onClick={() => onPromptDatabase(db)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                data-oid="otehjp3"
                            >
                                Prompt
                            </button>
                            <button
                                onClick={() => onSelectDatabase(db)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                data-oid="8jkkxrb"
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
