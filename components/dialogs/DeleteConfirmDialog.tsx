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
            data-oid="v:bhj.w"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="1hm:b8r">
                <div className="flex items-start space-x-3 mb-4" data-oid="w9j--pj">
                    <div className="text-red-600 text-2xl" data-oid="6m6_a27">
                        ⚠️
                    </div>
                    <div data-oid="kiki.nz">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="w-d-jtm">
                            Delete Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="mv:wy5x">
                            Are you sure you want to delete &ldquo;{document.name}&rdquo;?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                    data-oid="idj:ks4"
                >
                    <div className="flex items-start space-x-2" data-oid="x0v-498">
                        <div className="text-red-600 text-lg" data-oid="ezj-p2z">
                            🚨
                        </div>
                        <div data-oid="zgm2tqm">
                            <h4 className="font-medium text-red-800 mb-1" data-oid="jpbpnyg">
                                Warning: This action cannot be undone
                            </h4>
                            <p className="text-sm text-red-700 mb-2" data-oid="tdfj5-l">
                                This will permanently delete the document and remove all associated
                                data from the vector store. You will not be able to recover this
                                document after deletion.
                            </p>
                            <div className="text-xs text-red-600" data-oid="mzdlp33">
                                Document: v{document.version} • {document.chunks} chunks • Type:{' '}
                                {document.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="6-y1-dt">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="c_4slh0"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="q:avzvr"
                    >
                        {document.state === 'deleted' ? 'Already Deleted' : 'Delete Document'}
                    </button>
                </div>
            </div>
        </div>
    );
}
