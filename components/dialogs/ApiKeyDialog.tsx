'use client';

interface ApiKeyDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ApiKeyDialog({ isOpen, onClose }: ApiKeyDialogProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="-snks57"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="8hm37v6">
                <h3 className="text-lg font-semibold mb-4" data-oid="1_hnvd6">
                    Generate API Key
                </h3>
                <div className="space-y-4" data-oid="13lu-yj">
                    <div data-oid="sjxmlc8">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="b5n1uf4"
                        >
                            Key Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="API key name..."
                            data-oid="oqz5d7r"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="tk2.cu3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="f30-5pl"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="fbe8gjh"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
