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
            data-oid="d8nc2tt"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="dn6-w:-">
                <div className="flex items-start space-x-3 mb-4" data-oid="z0i0m:_">
                    <div className="text-red-600 text-2xl" data-oid="p5n2za3">
                        ⚠️
                    </div>
                    <div data-oid="0:ar7fq">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="6jdnbyc">
                            Delete Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="6y660ho">
                            Are you sure you want to delete "{document.name}"?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                    data-oid="p2diy26"
                >
                    <div className="flex items-start space-x-2" data-oid="7r2aqfa">
                        <div className="text-red-600 text-lg" data-oid="t3_nf_a">
                            🚨
                        </div>
                        <div data-oid="ybe4.7y">
                            <h4 className="font-medium text-red-800 mb-1" data-oid="31.bdh0">
                                Warning: This action cannot be undone
                            </h4>
                            <p className="text-sm text-red-700 mb-2" data-oid="9zg:wxb">
                                This will permanently delete the document and remove all associated
                                data from the vector store. You will not be able to recover this
                                document after deletion.
                            </p>
                            <div className="text-xs text-red-600" data-oid="lb:2zmu">
                                Document: v{document.version} • {document.chunks} chunks • Type:{' '}
                                {document.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="svo9jyn">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="2_6p-r9"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="__9:xau"
                    >
                        {document.state === 'deleted' ? 'Already Deleted' : 'Delete Document'}
                    </button>
                </div>
            </div>
        </div>
    );
}
