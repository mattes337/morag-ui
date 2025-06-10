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
            data-oid="ndhyodu"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="b.4woqb">
                <div className="flex items-start space-x-3 mb-4" data-oid="yy_.6y.">
                    <div className="text-red-600 text-2xl" data-oid=".u6_rio">
                        ⚠️
                    </div>
                    <div data-oid="st.fd2d">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="xsa.7pm">
                            Delete Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="ls8u1at">
                            Are you sure you want to delete "{document.name}"?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                    data-oid="xddp.05"
                >
                    <div className="flex items-start space-x-2" data-oid="ih7a6q6">
                        <div className="text-red-600 text-lg" data-oid="d0lm-0b">
                            🚨
                        </div>
                        <div data-oid="wa:uxjh">
                            <h4 className="font-medium text-red-800 mb-1" data-oid="i14.owm">
                                Warning: This action cannot be undone
                            </h4>
                            <p className="text-sm text-red-700 mb-2" data-oid="vknk9jc">
                                This will permanently delete the document and remove all associated
                                data from the vector store. You will not be able to recover this
                                document after deletion.
                            </p>
                            <div className="text-xs text-red-600" data-oid="ja3-l11">
                                Document: v{document.version} • {document.chunks} chunks • Type:{' '}
                                {document.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="gn47hs9">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="lpg8_1y"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="z25jhs9"
                    >
                        {document.state === 'deleted' ? 'Already Deleted' : 'Delete Document'}
                    </button>
                </div>
            </div>
        </div>
    );
}
