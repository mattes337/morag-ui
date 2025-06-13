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
        console.log('🔄 [ReingestConfirmDialog] Confirming reingest for document:', document?.name);
        onConfirm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="lvvei4p"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="j0zg4u9">
                <div className="flex items-start space-x-3 mb-4" data-oid="_gj0m9e">
                    <div className="text-blue-600 text-2xl" data-oid="2d9.fua">
                        🔄
                    </div>
                    <div data-oid="v7sg5ld">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="eyno0pb">
                            Reingest Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" data-oid="9g2w5-4">
                            Are you sure you want to reingest &ldquo;{document.name}&rdquo;?
                        </p>
                    </div>
                </div>

                <div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                    data-oid="9jgn-96"
                >
                    <div className="flex items-start space-x-2" data-oid="zo5d8pm">
                        <div className="text-blue-600 text-lg" data-oid="tktevuh">
                            ℹ️
                        </div>
                        <div data-oid="35dc1n9">
                            <h4 className="font-medium text-blue-800 mb-1" data-oid="_cra4of">
                                Important Information
                            </h4>
                            <p className="text-sm text-blue-700 mb-2" data-oid="s:dki.h">
                                The current version will be deleted when the new version is added.
                                This process might take some time depending on the document size.
                            </p>
                            <div className="text-xs text-blue-600" data-oid="00qmzl6">
                                Current version: v{document.version} • {document.chunks} chunks •
                                Quality: {(document.quality * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3" data-oid="t-jbm-k">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        data-oid="fzi45kx"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="7rte77s"
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
