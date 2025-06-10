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
            data-oid="tf4amsh"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="d5j:y0i">
                <h3 className="text-lg font-semibold mb-4" data-oid="83geq0w">
                    Create Database
                </h3>
                <div className="space-y-4" data-oid="4c5i_40">
                    <div data-oid="n6te-rw">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="l2chtf7"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Database name..."
                            data-oid=":cfj62x"
                        />
                    </div>
                    <div data-oid="d1.3ddu">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="9s58s7:"
                        >
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Database description..."
                            data-oid="woyyxy9"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="4mr.uu5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="k2.k:k-"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="_hh7r9e"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
