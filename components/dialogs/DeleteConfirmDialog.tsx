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
        console.log('🗑️ [DeleteConfirmDialog] Confirming delete for document:', document?.name);
        onConfirm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="9:.oer6"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="pp9sat2">
                <div className="flex items-start space-x-3 mb-4" data-oid="ezp.fmd">
                    <div className="text-red-600 text-2xl" data-oid="rl0-d-k">
                        ⚠️
                    </div>
                    <div data-oid="dv9p9:n">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="pjdc.ib">
                            Delete Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="j8.x0l_">
                            Are you sure you want to delete &ldquo;{document.name}&rdquo;?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                    data-oid="v.6jn0b"
                >
                    <div className="flex items-start space-x-2" data-oid="9a:vp9x">
                        <div className="text-red-600 text-lg" data-oid="kc6ay-2">
                            🚨
                        </div>
                        <div data-oid="0kwa0j9">
                            <h4 className="font-medium text-red-800 mb-1" data-oid="ve62n6v">
                                Warning: This action cannot be undone
                            </h4>
                            <p className="text-sm text-red-700 mb-2" data-oid="zzre84a">
                                This will permanently delete the document and remove all associated
                                data from the vector store. You will not be able to recover this
                                document after deletion.
                            </p>
                            <div className="text-xs text-red-600" data-oid="o481.wp">
                                Document: v{document.version} • {document.chunks} chunks • Type:{' '}
                                {document.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="_w43-4c">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="yk_pmqw"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="30z-t5t"
                    >
                        {document.state === 'deleted' ? 'Already Deleted' : 'Delete Document'}
                    </button>
                </div>
            </div>
        </div>
    );
}
