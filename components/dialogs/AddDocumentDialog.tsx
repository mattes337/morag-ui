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
            data-oid="v7jer8y"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="xu75.qf">
                <h3 className="text-lg font-semibold mb-4" data-oid="8zfo4yf">
                    Add Document
                </h3>

                {!selectedDocumentType ? (
                    <div data-oid="-8j2vpt">
                        <p className="text-gray-600 mb-4" data-oid="xeam1f1">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="-x5bgfc">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="phc5yen"
                                >
                                    <div className="text-2xl mb-2" data-oid="mxuyghx">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="-l-tvlu">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4" data-oid="8:om10v">
                        <div className="flex items-center space-x-2 mb-4" data-oid="c7i0oz1">
                            <span className="text-2xl" data-oid="pu8or78">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="n_zj85j">
                                {selectedDocumentType.label}
                            </span>
                            <button
                                onClick={() => setSelectedDocumentType(null)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                data-oid="qz2d8y_"
                            >
                                Change
                            </button>
                        </div>

                        <div data-oid="uapy5or">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="1t5.0fj"
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
                                    data-oid="9cc2.ya"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="nuqw.mp"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid=".mo_5hq">
                            <div data-oid="3qbvr9s">
                                <label className="flex items-center space-x-2" data-oid="r3uutds">
                                    <input type="checkbox" className="rounded" data-oid="68491ec" />
                                    <span className="text-sm" data-oid="muozh0k">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="yhmio0m">
                                <label className="flex items-center space-x-2" data-oid="2uwiwfb">
                                    <input type="checkbox" className="rounded" data-oid=":sjhqaz" />
                                    <span className="text-sm" data-oid="e4sldlg">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid=".ege3w6">
                            <div data-oid="3huk6as">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="sydml:-"
                                >
                                    Chunk Size
                                </label>
                                <input
                                    type="number"
                                    defaultValue="512"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="k4t779h"
                                />
                            </div>
                            <div data-oid="ip3k165">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="_u3uieo"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="6-xv70m"
                                >
                                    <option data-oid="o_nr3-g">Semantic</option>
                                    <option data-oid="gd22waz">Fixed Size</option>
                                    <option data-oid="z3w5e_k">Sentence</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6" data-oid="gj-up3o">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="xnt6f2_"
                    >
                        Cancel
                    </button>
                    {selectedDocumentType && (
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            data-oid="qbn5t3f"
                        >
                            Add Document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
