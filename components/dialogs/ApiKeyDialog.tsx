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
            data-oid="c.bcteb"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="i84oyyb">
                <h3 className="text-lg font-semibold mb-4" data-oid="kn6tk1l">
                    Generate API Key
                </h3>
                <div className="space-y-4" data-oid="c6r89jo">
                    <div data-oid="ne65evu">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="j158t5c"
                        >
                            Key Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="API key name..."
                            data-oid="qu7ly9z"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="xseij0q">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="h9s550-"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="wgdaov-"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
