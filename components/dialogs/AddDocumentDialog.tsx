'use client';

import { useState, useEffect } from 'react';
import { DocumentType, Document } from '../../types';

interface AddDocumentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'add' | 'supersede';
    documentToSupersede?: Document | null;
}

export function AddDocumentDialog({
    isOpen,
    onClose,
    mode = 'add',
    documentToSupersede,
}: AddDocumentDialogProps) {
    const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
    const [chunkSize, setChunkSize] = useState('1000');
    const [chunkingMethod, setChunkingMethod] = useState('Semantic');
    const [gpuProcessing, setGpuProcessing] = useState(false);
    const [contextualEmbedding, setContextualEmbedding] = useState(false);

    const documentTypes: DocumentType[] = [
        { type: 'pdf', label: 'PDF Document', icon: '📄' },
        { type: 'word', label: 'Word Document', icon: '📝' },
        { type: 'youtube', label: 'YouTube Video', icon: '📺' },
        { type: 'video', label: 'Video File', icon: '🎬' },
        { type: 'audio', label: 'Audio File', icon: '🎵' },
        { type: 'website', label: 'Website', icon: '🌐' },
    ];

    // Auto-select document type and set defaults when in supersede mode
    useEffect(() => {
        if (mode === 'supersede' && documentToSupersede) {
            const docType = documentToSupersede.type.toLowerCase();
            const matchingType = documentTypes.find(
                (type) =>
                    type.type === docType ||
                    type.label.toLowerCase().includes(docType) ||
                    (docType === 'youtube' && type.type === 'youtube') ||
                    (docType === 'website' && type.type === 'website'),
            );

            if (matchingType) {
                setSelectedDocumentType(matchingType);
            } else {
                // Default fallback for unknown types
                setSelectedDocumentType({
                    type: docType,
                    label: documentToSupersede.type,
                    icon: '📄',
                });
            }

            // Set default values based on current document (these would typically come from the document's metadata)
            setChunkSize('1000'); // Default, could be extracted from document metadata
            setChunkingMethod('Semantic'); // Default, could be extracted from document metadata
            setGpuProcessing(false); // Default
            setContextualEmbedding(true); // Default for supersede
        }
    }, [mode, documentToSupersede, documentTypes]);

    const handleClose = () => {
        setSelectedDocumentType(null);
        setChunkSize('1000');
        setChunkingMethod('Semantic');
        setGpuProcessing(false);
        setContextualEmbedding(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="vl5y1kx"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="z2ikfbr">
                <h3 className="text-lg font-semibold mb-4" data-oid="6374_rr">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="supersede-warning"
                    >
                        <div className="flex items-start space-x-3" data-oid="warning-content">
                            <div className="text-yellow-600 text-xl" data-oid="warning-icon">
                                ⚠️
                            </div>
                            <div data-oid="warning-text">
                                <h4
                                    className="font-medium text-yellow-800 mb-1"
                                    data-oid="warning-title"
                                >
                                    Document Supersede Warning
                                </h4>
                                <p
                                    className="text-sm text-yellow-700 mb-2"
                                    data-oid="warning-description"
                                >
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="document-info">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid=".gkrayq">
                        <p className="text-gray-600 mb-4" data-oid="h0m8-uw">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="fg0x4pk">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="108yoyq"
                                >
                                    <div className="text-2xl mb-2" data-oid="dpge:t0">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="ovs8ozm">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="ph5mlhy">
                        <div className="flex items-center space-x-2 mb-4" data-oid="lqp1aup">
                            <span className="text-2xl" data-oid="yw2pk_m">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="47x2fqk">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="p:ig9sc"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="f5mqox4">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="5y9heuc"
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
                                    data-oid="z-d07qf"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="rg_zqbu"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="z:3dffc">
                            <div data-oid="ke5swkv">
                                <label className="flex items-center space-x-2" data-oid="gig79o4">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="si_.rz5"
                                    />

                                    <span className="text-sm" data-oid="zm4lnof">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="rrjv5ky">
                                <label className="flex items-center space-x-2" data-oid="kdjs9fa">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="nn-o-bm"
                                    />

                                    <span className="text-sm" data-oid="sb-pd8d">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="67j30lg">
                            <div data-oid="h8xj6zt">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="z_v.2os"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="7fyan5y"
                                >
                                    <option value="1000" data-oid="a25qqwd">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="s4oip-v">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="iw12lr6">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="-oe_k4z">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="7nw0d2u">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="yorep4t">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="xdp-6dz">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="2nkrmt9">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="odf_o2k"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="lbzd8nn"
                                >
                                    <option value="Semantic" data-oid="8msnyrz">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="ufifs7z">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="eqkxclv">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="ficpqzx">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="k0-0:qt"
                    >
                        Cancel
                    </button>
                    {(selectedDocumentType || mode === 'supersede') && (
                        <button
                            className={`px-4 py-2 text-white rounded-md ${
                                mode === 'supersede'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            data-oid="1cpzg6e"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
