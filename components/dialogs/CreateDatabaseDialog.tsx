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
            data-oid="bgwbrkn"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="52n6ftb">
                <h3 className="text-lg font-semibold mb-4" data-oid="jovr_vk">
                    Create Database
                </h3>
                <div className="space-y-4" data-oid="hf0nnf7">
                    <div data-oid="c9gszk4">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="hqt87on"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Database name..."
                            data-oid="du.cmur"
                        />
                    </div>
                    <div data-oid="fk4ihsl">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="kpy78bm"
                        >
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Database description..."
                            data-oid="n9mfotw"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="lx3tnan">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="lslt3ye"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="lv8xge2"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
