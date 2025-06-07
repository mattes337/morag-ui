'use client';

interface CreateDatabaseDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateDatabaseDialog({ isOpen, onClose }: CreateDatabaseDialogProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="o2o73.-"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="6dxmvda">
                <h3 className="text-lg font-semibold mb-4" data-oid="kddvo15">
                    Create Database
                </h3>
                <div className="space-y-4" data-oid="1ea_mla">
                    <div data-oid="23rgzt.">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="-k0qgry"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Database name..."
                            data-oid="k.n8-i_"
                        />
                    </div>
                    <div data-oid="jk45oqi">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="b7d4q64"
                        >
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Database description..."
                            data-oid="a36zm2e"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="3pzn0u4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="nhbvrbv"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="grq6bq-"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
