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
            data-oid="2ai:fpb"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="cyp4eho">
                <h3 className="text-lg font-semibold mb-4" data-oid=".-9g7r8">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="po:x:ye"
                    >
                        <div className="flex items-start space-x-3" data-oid="i4uc5b1">
                            <div className="text-yellow-600 text-xl" data-oid="8rhd:fy">
                                ⚠️
                            </div>
                            <div data-oid="irfmtmg">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="dbb8i-q">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="_foq-q2">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="qnhl4q9">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="0g-ur9-">
                        <p className="text-gray-600 mb-4" data-oid="mb_tya9">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="7q91cu2">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="lr6svvf"
                                >
                                    <div className="text-2xl mb-2" data-oid="c2rsjgw">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="iwskki3">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="2pj0hka">
                        <div className="flex items-center space-x-2 mb-4" data-oid="czc12pc">
                            <span className="text-2xl" data-oid="jf8mlyn">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="2zvuhwo">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid=":lk95bh"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="g56jb75">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="a5r8bum"
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
                                    data-oid="px84q0n"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="-.uzo.d"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="ez1ig17">
                            <div data-oid="r2vp_ey">
                                <label className="flex items-center space-x-2" data-oid="vimpgby">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="4qq3fpm"
                                    />

                                    <span className="text-sm" data-oid="iuqjrtc">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="inj-i92">
                                <label className="flex items-center space-x-2" data-oid="4d1:x9j">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="gsz2j1s"
                                    />

                                    <span className="text-sm" data-oid="s57cgqi">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="dgiw0wj">
                            <div data-oid="x:.9zed">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="l0:0cfm"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="a3d:d._"
                                >
                                    <option value="1000" data-oid="fmhsxg8">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="2f5yieu">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="ecbb1p-">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="betfxzr">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="avf87z0">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="m6au0t5">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="c9zx_4f">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="_zw-wiq">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="fojgcfr"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="uc84v.0"
                                >
                                    <option value="Semantic" data-oid="kc0_54p">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="gjzvpgx">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="h:de_ey">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="602uqdu">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="6jr19yb"
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
                            data-oid="jw7hfxl"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
