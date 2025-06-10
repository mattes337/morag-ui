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
            data-oid="kakhxwr"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="sdenv:7">
                <h3 className="text-lg font-semibold mb-4" data-oid="g_x.l2w">
                    Create Database
                </h3>
                <div className="space-y-4" data-oid="t.gw4nh">
                    <div data-oid="ojf0ao:">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="207cvy3"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Database name..."
                            data-oid="pxnndpt"
                        />
                    </div>
                    <div data-oid="3tm1x2v">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="93eam0v"
                        >
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Database description..."
                            data-oid="v7abh.o"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6" data-oid="bv9-u_6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="kusk4e3"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="0ri2ycj"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
