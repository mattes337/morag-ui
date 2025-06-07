'use client';

import { useState } from 'react';
import { DocumentType } from '../../types';

interface AddDocumentDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddDocumentDialog({ isOpen, onClose }: AddDocumentDialogProps) {
    const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);

    const documentTypes: DocumentType[] = [
        { type: 'pdf', label: 'PDF Document', icon: '📄' },
        { type: 'word', label: 'Word Document', icon: '📝' },
        { type: 'youtube', label: 'YouTube Video', icon: '📺' },
        { type: 'video', label: 'Video File', icon: '🎬' },
        { type: 'audio', label: 'Audio File', icon: '🎵' },
        { type: 'website', label: 'Website', icon: '🌐' },
    ];

    const handleClose = () => {
        setSelectedDocumentType(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="_4iy83."
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="d9u5kgm">
                <h3 className="text-lg font-semibold mb-4" data-oid="ip9oooc">
                    Add Document
                </h3>

                {!selectedDocumentType ? (
                    <div data-oid="q3opymp">
                        <p className="text-gray-600 mb-4" data-oid="vsk.c03">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="4u.qtge">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="-jusg9t"
                                >
                                    <div className="text-2xl mb-2" data-oid="oouiujb">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="qjn18dh">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4" data-oid="vgum247">
                        <div className="flex items-center space-x-2 mb-4" data-oid="5axjppn">
                            <span className="text-2xl" data-oid="0so36wt">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid=".0wf45u">
                                {selectedDocumentType.label}
                            </span>
                            <button
                                onClick={() => setSelectedDocumentType(null)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                data-oid="zuhtnx4"
                            >
                                Change
                            </button>
                        </div>

                        <div data-oid="_614zag">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="9:s3-z_"
                            >
                                {selectedDocumentType.type === 'youtube' ||
                                selectedDocumentType.type === 'website'
                                    ? 'URL'
                                    : 'File'}
                            </label>
                            {selectedDocumentType.type === 'youtube' ||
                            selectedDocumentType.type === 'website' ? (
                                <input
                                    type="url"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter URL..."
                                    data-oid="wsko578"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="_l7:ycl"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="5wjbx_z">
                            <div data-oid=".6idzdh">
                                <label className="flex items-center space-x-2" data-oid="gsciy5q">
                                    <input type="checkbox" className="rounded" data-oid="6p4x3aa" />
                                    <span className="text-sm" data-oid="q::ck8b">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="6bz.3r9">
                                <label className="flex items-center space-x-2" data-oid="ntbsfum">
                                    <input type="checkbox" className="rounded" data-oid="4ceb2qa" />
                                    <span className="text-sm" data-oid="x06i73a">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="79-7wpv">
                            <div data-oid="22txrw5">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="vx23.ro"
                                >
                                    Chunk Size
                                </label>
                                <input
                                    type="number"
                                    defaultValue="512"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="zts0gzd"
                                />
                            </div>
                            <div data-oid="-9--lt_">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="be45odr"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="ev3amzr"
                                >
                                    <option data-oid="2.45ziz">Semantic</option>
                                    <option data-oid="8sehwlv">Fixed Size</option>
                                    <option data-oid="mql240p">Sentence</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6" data-oid="ssiwcd7">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="0b8--.9"
                    >
                        Cancel
                    </button>
                    {selectedDocumentType && (
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            data-oid="dgkp377"
                        >
                            Add Document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
