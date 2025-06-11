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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-start space-x-3 mb-4">
                    <div className="text-blue-600 text-2xl">🔄</div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Reingest Document
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Are you sure you want to reingest &ldquo;{document.name}&rdquo;?
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                        <div className="text-blue-600 text-lg">ℹ️</div>
                        <div>
                            <h4 className="font-medium text-blue-800 mb-1">
                                Important Information
                            </h4>
                            <p className="text-sm text-blue-700 mb-2">
                                The current version will be deleted when the new version is added.
                                This process might take some time depending on the document size.
                            </p>
                            <div className="text-xs text-blue-600">
                                Current version: v{document.version} • {document.chunks} chunks •
                                Quality: {(document.quality * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
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
