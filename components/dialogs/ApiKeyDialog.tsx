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
            data-oid="vg9nq4d"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="0rcka3c">
                <h3 className="text-lg font-semibold mb-4" data-oid="nlhpp4o">
                    Generate API Key
                </h3>
                <div className="space-y-4" data-oid="qj:delj">
                    <div data-oid=".f4:iko">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="rcctye_"
                        >
                            Key Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="API key name..."
                            data-oid="7rij86n"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="56ncg:n">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="1rephqf"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="nv6it9p"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
