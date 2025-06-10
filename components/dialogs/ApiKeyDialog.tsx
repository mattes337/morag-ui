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
            data-oid="o2n1gga"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="7cu3ver">
                <h3 className="text-lg font-semibold mb-4" data-oid="cvv:-qd">
                    Generate API Key
                </h3>
                <div className="space-y-4" data-oid="l_vujgu">
                    <div data-oid="2-eopsm">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="rjcju_d"
                        >
                            Key Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="API key name..."
                            data-oid="f8h1m3-"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="u08q7kc">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid=":d2ekgc"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="-ors6sn"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
