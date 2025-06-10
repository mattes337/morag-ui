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
            data-oid="o9azsi5"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="d2:o520">
                <h3 className="text-lg font-semibold mb-4" data-oid="scl6y7.">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="y.8io0z"
                    >
                        <div className="flex items-start space-x-3" data-oid="ffgk3ga">
                            <div className="text-yellow-600 text-xl" data-oid="6f2dlyz">
                                ⚠️
                            </div>
                            <div data-oid="_535.0p">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="5sb4z8i">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="jujshrf">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="psawodv">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="k1s323e">
                        <p className="text-gray-600 mb-4" data-oid="r4:axw-">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="q8844zm">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="6u5bmnk"
                                >
                                    <div className="text-2xl mb-2" data-oid="3rr4w3g">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="bmj1bdh">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="a4j-mcm">
                        <div className="flex items-center space-x-2 mb-4" data-oid="8yd-hd4">
                            <span className="text-2xl" data-oid="d0yvrhz">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="dul45-r">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="_7y7fv0"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="f6:v.4l">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="mn_cso1"
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
                                    data-oid="qt.0s3i"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="uu6f:d3"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid=".3zl2kq">
                            <div data-oid="4br3:ad">
                                <label className="flex items-center space-x-2" data-oid="6oobw9s">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="o6x3b-b"
                                    />

                                    <span className="text-sm" data-oid="u-bfbs4">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="5i0eleu">
                                <label className="flex items-center space-x-2" data-oid=".:dq1-i">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="vsbx-:f"
                                    />

                                    <span className="text-sm" data-oid="l8xdxx2">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="ac1hgy.">
                            <div data-oid="gyqko2o">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="j2juu2p"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="1:ys35_"
                                >
                                    <option value="1000" data-oid="541n1wo">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="niyus93">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="gfatq.7">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="mi-w.af">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="wy75s-q">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="t5ik.kq">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="gk88u88">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="iv5snl8">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid=":8xi110"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="9l50i25"
                                >
                                    <option value="Semantic" data-oid="l6cev.2">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="bhc-qz4">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="nj_gtb0">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="7:1u06n">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="ea3hyt1"
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
                            data-oid="c18heh:"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
