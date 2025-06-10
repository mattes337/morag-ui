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
            data-oid="25nf75m"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="bon0.3n">
                <h3 className="text-lg font-semibold mb-4" data-oid="o1emwf:">
                    Generate API Key
                </h3>
                <div className="space-y-4" data-oid="q_dgrbe">
                    <div data-oid="zetd2wr">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="q7xe.i-"
                        >
                            Key Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="API key name..."
                            data-oid="08yvfrw"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="323:_8c">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="w5f6u1l"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="bfdkhm9"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
