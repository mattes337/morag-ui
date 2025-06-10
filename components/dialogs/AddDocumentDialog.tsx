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
            data-oid="3523i1e"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid=".pnwt:r">
                <h3 className="text-lg font-semibold mb-4" data-oid="1ullk9.">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="p979-m8"
                    >
                        <div className="flex items-start space-x-3" data-oid="_pgbclh">
                            <div className="text-yellow-600 text-xl" data-oid="quaa2k5">
                                ⚠️
                            </div>
                            <div data-oid="ajk-61z">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="ykb451k">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="ua6zx5x">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid=".lfvjvd">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="5dndll1">
                        <p className="text-gray-600 mb-4" data-oid="296qgj-">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid=".gy7ito">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid=".6d6o30"
                                >
                                    <div className="text-2xl mb-2" data-oid="fbprgru">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="aa-ihot">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="gxdd6rc">
                        <div className="flex items-center space-x-2 mb-4" data-oid="r08af0.">
                            <span className="text-2xl" data-oid="mnioudr">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="pr7f0g9">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="13fnw3w"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="g7w7qgs">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="uho8a6c"
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
                                    data-oid="2wum92y"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="70g0g6x"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="ko5e_no">
                            <div data-oid="vod_jnx">
                                <label className="flex items-center space-x-2" data-oid=":35sw51">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="2ot5qnx"
                                    />

                                    <span className="text-sm" data-oid="1d:r940">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="9z3geg1">
                                <label className="flex items-center space-x-2" data-oid="cr:oyv3">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="2ynbhkk"
                                    />

                                    <span className="text-sm" data-oid="k4pkonh">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="dah_yvn">
                            <div data-oid="_3311ci">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid=".m-uzaf"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="qr0n802"
                                >
                                    <option value="1000" data-oid="kq8dy82">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="cg54hc4">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="oe5tqts">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="1lu6b97">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="o98fonm">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="p-yhh_5">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="_8dhe90">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="uk1dsit">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="oln0ljf"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="uo2vp8w"
                                >
                                    <option value="Semantic" data-oid="appprrc">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="sd_t19h">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="5zt.qff">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="0h3vest">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="wrg3het"
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
                            data-oid="ni41o0r"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
