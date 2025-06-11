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
            data-oid="ebze62h"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="iw:8iz5">
                <h3 className="text-lg font-semibold mb-4" data-oid="g:o.89l">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="i-qlilh"
                    >
                        <div className="flex items-start space-x-3" data-oid="u0xh-m3">
                            <div className="text-yellow-600 text-xl" data-oid="mksk7.1">
                                ⚠️
                            </div>
                            <div data-oid="d3hy946">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="acegj_0">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="v9qqwin">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="wseys.r">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="w7i1jkx">
                        <p className="text-gray-600 mb-4" data-oid="rlk70jt">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="5ig99gd">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="ps9139c"
                                >
                                    <div className="text-2xl mb-2" data-oid="47xu80-">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="_ae.zr9">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="vdu5u42">
                        <div className="flex items-center space-x-2 mb-4" data-oid="hy1_kc8">
                            <span className="text-2xl" data-oid="177rdgp">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="8pzoue:">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="_51vcqf"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="2b_-ezt">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="a46l203"
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
                                    data-oid="jntn70:"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="iaa4ji_"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="w4jkn9t">
                            <div data-oid="kptv6h6">
                                <label className="flex items-center space-x-2" data-oid="yyc-51:">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="3a2e87a"
                                    />

                                    <span className="text-sm" data-oid="97-och9">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="q6509_f">
                                <label className="flex items-center space-x-2" data-oid="u4w0s4v">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="gnfvq7f"
                                    />

                                    <span className="text-sm" data-oid="2giqry0">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="fvu3meu">
                            <div data-oid="37zxhds">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="ldsuiu2"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid=".qyp2au"
                                >
                                    <option value="1000" data-oid="lk:26p5">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="54ybchg">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="e.ibdav">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="gr1ge1a">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="vphf2oz">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="wxl5w7z">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="766km5r">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="xo16:i7">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="hagybo2"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="5e-siui"
                                >
                                    <option value="Semantic" data-oid="0pk3p7m">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="16ogw60">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="mf7kxmf">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="1h0v0.0">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="lbap:w6"
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
                            data-oid="1xp-:36"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
