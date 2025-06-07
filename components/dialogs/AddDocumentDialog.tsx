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
            data-oid="bp0-zb1"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="j9m3del">
                <h3 className="text-lg font-semibold mb-4" data-oid="h.9uh0p">
                    Add Document
                </h3>

                {!selectedDocumentType ? (
                    <div data-oid="7fcs_:4">
                        <p className="text-gray-600 mb-4" data-oid="cmpngn.">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="xf1.:5i">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="3mv-3_h"
                                >
                                    <div className="text-2xl mb-2" data-oid="j41miob">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="ixmi2_0">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4" data-oid=":1qzzmz">
                        <div className="flex items-center space-x-2 mb-4" data-oid="1.2e-4-">
                            <span className="text-2xl" data-oid="k_o7a7:">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="d_radqn">
                                {selectedDocumentType.label}
                            </span>
                            <button
                                onClick={() => setSelectedDocumentType(null)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                data-oid="uu0ckye"
                            >
                                Change
                            </button>
                        </div>

                        <div data-oid="d4qusc6">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid=".iw26qr"
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
                                    data-oid="rinusnb"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="y0vzqow"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="wkvhg4t">
                            <div data-oid="5skut62">
                                <label className="flex items-center space-x-2" data-oid="dskoecz">
                                    <input type="checkbox" className="rounded" data-oid="1ej6:rf" />
                                    <span className="text-sm" data-oid="4j13crt">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="7u47i0r">
                                <label className="flex items-center space-x-2" data-oid="o-v5y_j">
                                    <input type="checkbox" className="rounded" data-oid="ui7v:i:" />
                                    <span className="text-sm" data-oid="7m8l35-">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="-q4xy-3">
                            <div data-oid="c72mo.h">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid=".zy73wy"
                                >
                                    Chunk Size
                                </label>
                                <input
                                    type="number"
                                    defaultValue="512"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid=":hgbyk9"
                                />
                            </div>
                            <div data-oid="fbz2638">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="kd0xi_v"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="pup1d-z"
                                >
                                    <option data-oid="whi0n-g">Semantic</option>
                                    <option data-oid=":wysqkt">Fixed Size</option>
                                    <option data-oid="7.3legh">Sentence</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6" data-oid="9sz-fp4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="g09wmc4"
                    >
                        Cancel
                    </button>
                    {selectedDocumentType && (
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            data-oid="hprz8:y"
                        >
                            Add Document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
