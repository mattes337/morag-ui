'use client';

import { Document } from '../../types';

interface ReingestConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    document: Document | null;
}

export function ReingestConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    document,
}: ReingestConfirmDialogProps) {
    if (!isOpen || !document) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="5f7j7n3"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid=":36lrqq">
                <div className="flex items-start space-x-3 mb-4" data-oid="00ay13y">
                    <div className="text-blue-600 text-2xl" data-oid="xqhpf49">
                        🔄
                    </div>
                    <div data-oid="74_bq5o">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="-v6mxm_">
                            Reingest Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="sif:5rv">
                            Are you sure you want to reingest "{document.name}"?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                    data-oid="6m:86fe"
                >
                    <div className="flex items-start space-x-2" data-oid=".j8xl61">
                        <div className="text-blue-600 text-lg" data-oid="t89k03x">
                            ℹ️
                        </div>
                        <div data-oid="28zbyig">
                            <h4 className="font-medium text-blue-800 mb-1" data-oid="mnw2wjf">
                                Important Information
                            </h4>
                            <p className="text-sm text-blue-700 mb-2" data-oid="gze-skt">
                                The current version will be deleted when the new version is added.
                                This process might take some time depending on the document size.
                            </p>
                            <div className="text-xs text-blue-600" data-oid=":l8:qng">
                                Current version: v{document.version} • {document.chunks} chunks •
                                Quality: {(document.quality * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="zgx9wag">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="s_y:dmh"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="xkpqgbz"
                    >
                        {document.state === 'ingesting'
                            ? 'Currently Ingesting...'
                            : 'Reingest Document'}
                    </button>
                </div>
            </div>
        </div>
    );
}
