'use client';

import { Document } from '../../types';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    document: Document | null;
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    document,
}: DeleteConfirmDialogProps) {
    if (!isOpen || !document) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="6x223ol"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="q.kzcq9">
                <div className="flex items-start space-x-3 mb-4" data-oid="e_u2729">
                    <div className="text-red-600 text-2xl" data-oid="g2usy56">
                        ⚠️
                    </div>
                    <div data-oid="nl9leh-">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="a2x2vax">
                            Delete Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="8qsf1lp">
                            Are you sure you want to delete "{document.name}"?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                    data-oid="sxrn5ti"
                >
                    <div className="flex items-start space-x-2" data-oid="g5rijwq">
                        <div className="text-red-600 text-lg" data-oid="op1yi.i">
                            🚨
                        </div>
                        <div data-oid="5m7w-zo">
                            <h4 className="font-medium text-red-800 mb-1" data-oid="k01.-k0">
                                Warning: This action cannot be undone
                            </h4>
                            <p className="text-sm text-red-700 mb-2" data-oid="62apd2d">
                                This will permanently delete the document and remove all associated
                                data from the vector store. You will not be able to recover this
                                document after deletion.
                            </p>
                            <div className="text-xs text-red-600" data-oid="rkm6zay">
                                Document: v{document.version} • {document.chunks} chunks • Type:{' '}
                                {document.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="n2iid3a">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid=".ox1y7v"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="5vgnz9j"
                    >
                        {document.state === 'deleted' ? 'Already Deleted' : 'Delete Document'}
                    </button>
                </div>
            </div>
        </div>
    );
}
