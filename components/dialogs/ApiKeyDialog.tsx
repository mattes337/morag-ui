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
            data-oid="phuu.bx"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="1bs2ofc">
                <h3 className="text-lg font-semibold mb-4" data-oid="bl-702i">
                    Generate API Key
                </h3>
                <div className="space-y-4" data-oid="hkm1:-w">
                    <div data-oid="sz18y4i">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="oj4-7uk"
                        >
                            Key Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="API key name..."
                            data-oid="la.3wwj"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="1zosy7z">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="x:1x8ko"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="sk8no98"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
