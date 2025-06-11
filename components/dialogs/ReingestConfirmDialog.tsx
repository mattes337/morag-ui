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
            data-oid="t2mmh7z"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="q17vbg:">
                <div className="flex items-start space-x-3 mb-4" data-oid="dg:c68_">
                    <div className="text-blue-600 text-2xl" data-oid="4usgvnl">
                        🔄
                    </div>
                    <div data-oid="ju6f7s4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="jyd4b98">
                            Reingest Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="t27drjd">
                            Are you sure you want to reingest "{document.name}"?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                    data-oid="ebl2j64"
                >
                    <div className="flex items-start space-x-2" data-oid="yvc0t9v">
                        <div className="text-blue-600 text-lg" data-oid="6jkfgyl">
                            ℹ️
                        </div>
                        <div data-oid="xpgbdmz">
                            <h4 className="font-medium text-blue-800 mb-1" data-oid="aoigbij">
                                Important Information
                            </h4>
                            <p className="text-sm text-blue-700 mb-2" data-oid="e2i3rs.">
                                The current version will be deleted when the new version is added.
                                This process might take some time depending on the document size.
                            </p>
                            <div className="text-xs text-blue-600" data-oid="xu6zstq">
                                Current version: v{document.version} • {document.chunks} chunks •
                                Quality: {(document.quality * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="pk:s:s7">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="1ug8x9r"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="9ugj.kt"
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
