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
            data-oid="e03y01-"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="hu6.ci6">
                <div className="flex items-start space-x-3 mb-4" data-oid="bt.faw6">
                    <div className="text-blue-600 text-2xl" data-oid="h7vtmcb">
                        🔄
                    </div>
                    <div data-oid="2tkzix9">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid=":m8cisc">
                            Reingest Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="3i3f1j3">
                            Are you sure you want to reingest "{document.name}"?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                    data-oid="cx33nxy"
                >
                    <div className="flex items-start space-x-2" data-oid="i01zm04">
                        <div className="text-blue-600 text-lg" data-oid="9vtkrn_">
                            ℹ️
                        </div>
                        <div data-oid="9k1ns_u">
                            <h4 className="font-medium text-blue-800 mb-1" data-oid="-rhpvqi">
                                Important Information
                            </h4>
                            <p className="text-sm text-blue-700 mb-2" data-oid="0el181h">
                                The current version will be deleted when the new version is added.
                                This process might take some time depending on the document size.
                            </p>
                            <div className="text-xs text-blue-600" data-oid="ygp_gg2">
                                Current version: v{document.version} • {document.chunks} chunks •
                                Quality: {(document.quality * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="di1_xxy">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="_06.y3w"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="06eua64"
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
