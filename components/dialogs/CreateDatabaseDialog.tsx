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
            data-oid="awhepdz"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="4x6h3y-">
                <h3 className="text-lg font-semibold mb-4" data-oid="u5fa44v">
                    Create Database
                </h3>
                <div className="space-y-4" data-oid="h_70yea">
                    <div data-oid="jhlf5cd">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="ztyoedj"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Database name..."
                            data-oid="l6gc9rf"
                        />
                    </div>
                    <div data-oid="ob:foin">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="g-wmy4d"
                        >
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Database description..."
                            data-oid="8gy11j."
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="bi7zrff">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="e9jb7r:"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="t_q:nz5"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
