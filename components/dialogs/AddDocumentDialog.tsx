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
            data-oid="c2h36.z"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="3_ydoaw">
                <h3 className="text-lg font-semibold mb-4" data-oid="7:8e96s">
                    Add Document
                </h3>

                {!selectedDocumentType ? (
                    <div data-oid="9o:9yc:">
                        <p className="text-gray-600 mb-4" data-oid="ulbo_q9">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="00_v0r3">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="w0ei.u-"
                                >
                                    <div className="text-2xl mb-2" data-oid="t932sjx">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="4y9ghha">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4" data-oid="vtmfoa4">
                        <div className="flex items-center space-x-2 mb-4" data-oid="njpxn-p">
                            <span className="text-2xl" data-oid="p3pd4x2">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="a3c-gz-">
                                {selectedDocumentType.label}
                            </span>
                            <button
                                onClick={() => setSelectedDocumentType(null)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                data-oid="vondif1"
                            >
                                Change
                            </button>
                        </div>

                        <div data-oid="6ql95an">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="3whb7v4"
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
                                    data-oid="0cgn8u-"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="ic9a1im"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="uh9khze">
                            <div data-oid="82f6xg1">
                                <label className="flex items-center space-x-2" data-oid="_-3oe7:">
                                    <input type="checkbox" className="rounded" data-oid="p7dlopr" />
                                    <span className="text-sm" data-oid="_6mo-za">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="t82bvce">
                                <label className="flex items-center space-x-2" data-oid=":yn9lcc">
                                    <input type="checkbox" className="rounded" data-oid="pbda31n" />
                                    <span className="text-sm" data-oid="it-8ptv">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="nhb47zs">
                            <div data-oid="q9oygo2">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="09gq72j"
                                >
                                    Chunk Size
                                </label>
                                <input
                                    type="number"
                                    defaultValue="512"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="pf8t3bf"
                                />
                            </div>
                            <div data-oid="j7_9t9m">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="ep861ox"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="u::ndkr"
                                >
                                    <option data-oid="gy9y9dm">Semantic</option>
                                    <option data-oid="4zypj1i">Fixed Size</option>
                                    <option data-oid="c2tt612">Sentence</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6" data-oid="jfkrzan">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="xy4xnb."
                    >
                        Cancel
                    </button>
                    {selectedDocumentType && (
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            data-oid="cq5m54s"
                        >
                            Add Document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
