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
            data-oid="ltm_ukr"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="xoru4le">
                <h3 className="text-lg font-semibold mb-4" data-oid="x0kz_ss">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="p1a:.9g"
                    >
                        <div className="flex items-start space-x-3" data-oid=":341-wc">
                            <div className="text-yellow-600 text-xl" data-oid="zrh9835">
                                ⚠️
                            </div>
                            <div data-oid="h_2jsd:">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="4iylo_:">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="usuntae">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="x86i377">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="o86orse">
                        <p className="text-gray-600 mb-4" data-oid="hx0knc4">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="eub2kss">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="62tj:qu"
                                >
                                    <div className="text-2xl mb-2" data-oid=".2b2dpp">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="2-1q.g3">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="1fqz0uk">
                        <div className="flex items-center space-x-2 mb-4" data-oid="pzk2b_5">
                            <span className="text-2xl" data-oid="g:hc5o.">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="9tgi9n4">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="9g5yrp3"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="w1qavjw">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="1i3y.sd"
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
                                    data-oid="f0rxtis"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="scbt8:d"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="2sbaaub">
                            <div data-oid="qfevoj.">
                                <label className="flex items-center space-x-2" data-oid="nj0pfhz">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="-qilkf."
                                    />

                                    <span className="text-sm" data-oid="x0s.0wl">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="q07cg0_">
                                <label className="flex items-center space-x-2" data-oid="r.v6o_5">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="_uqtv00"
                                    />

                                    <span className="text-sm" data-oid="qq58k2.">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="u.2xyud">
                            <div data-oid="wn6bfo8">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="gq3wwz0"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid=":18:eu2"
                                >
                                    <option value="1000" data-oid="jqy8yro">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="91cu:dr">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="ik__zu6">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="f_n3w0w">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="ndlwgdn">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="f:zvxel">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="v.c.h3n">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="p8lyz--">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="1a8lcyu"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="gn7cpjb"
                                >
                                    <option value="Semantic" data-oid="4bnq.p-">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="97eef1.">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="2uvul-k">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="wdrxd5b">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="hek1oq:"
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
                            data-oid="l6wz2h7"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
