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
            data-oid="782d3o_"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="zce2aej">
                <h3 className="text-lg font-semibold mb-4" data-oid="o:jy-kp">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="55vzbfm"
                    >
                        <div className="flex items-start space-x-3" data-oid="6m96y_v">
                            <div className="text-yellow-600 text-xl" data-oid="fhzi7zx">
                                ⚠️
                            </div>
                            <div data-oid="xa0i9qg">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="ly2co22">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="hnqssg8">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="qveoe2r">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="z1.jvy0">
                        <p className="text-gray-600 mb-4" data-oid="sy.kdcq">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="zbwit_1">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="qagr4x-"
                                >
                                    <div className="text-2xl mb-2" data-oid="3g4n0ui">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="eslvniv">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="iyhhc55">
                        <div className="flex items-center space-x-2 mb-4" data-oid="hkuac40">
                            <span className="text-2xl" data-oid="n0vzpbt">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="z80k4qt">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="7ud:iqk"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="-qwam8x">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="8zboi6g"
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
                                    data-oid="vfgqls_"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="v2a61i4"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="rezukz4">
                            <div data-oid="6sbvou-">
                                <label className="flex items-center space-x-2" data-oid="8m:oyuv">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="u-gg.j2"
                                    />

                                    <span className="text-sm" data-oid="8sp4tc:">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="c.3:hzc">
                                <label className="flex items-center space-x-2" data-oid="gzq3tr3">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="1651-6k"
                                    />

                                    <span className="text-sm" data-oid="w2f025s">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="cyo7flx">
                            <div data-oid="cpth7tj">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="_vccy8g"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="yvtqp2k"
                                >
                                    <option value="1000" data-oid="81bu29x">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="ckb.hkz">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="6r--up6">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="5_tu14w">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="c2pufcm">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="0_vas44">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="ngf_vdq">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="5sklmng">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="xxq9-z1"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="_njh.fb"
                                >
                                    <option value="Semantic" data-oid="hiu5_e4">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="3cj:bnc">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="lcfx4k0">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="thhsrmt">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid=".kn0.jo"
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
                            data-oid="j.4o_w_"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
