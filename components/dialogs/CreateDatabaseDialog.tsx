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
            data-oid="r_k2nfk"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="_6-9rd.">
                <h3 className="text-lg font-semibold mb-4" data-oid="9m:n1j3">
                    Create Database
                </h3>
                <div className="space-y-4" data-oid="i:wrfq5">
                    <div data-oid="74u09o9">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="8_srbhk"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Database name..."
                            data-oid="80ibb13"
                        />
                    </div>
                    <div data-oid="s-9v.yy">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid=".xizxj4"
                        >
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Database description..."
                            data-oid="irxphvo"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid=".8zbua9">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="_4v4oxm"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="wyazin:"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
