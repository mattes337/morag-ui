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
            data-oid="_8zmmbm"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid=".9wicfo">
                <h3 className="text-lg font-semibold mb-4" data-oid="25xu0:4">
                    Generate API Key
                </h3>
                <div className="space-y-4" data-oid="taai2o9">
                    <div data-oid="ju7vwhv">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="kfz5hcc"
                        >
                            Key Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="API key name..."
                            data-oid="cf6dnfz"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="tu540ui">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="i6:bk2s"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="8kofu55"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
