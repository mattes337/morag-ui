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
            data-oid="85wt20j"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="svs63f5">
                <h3 className="text-lg font-semibold mb-4" data-oid="9:_qti0">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="iu2flgl"
                    >
                        <div className="flex items-start space-x-3" data-oid="6j8sblf">
                            <div className="text-yellow-600 text-xl" data-oid="ihicfos">
                                ⚠️
                            </div>
                            <div data-oid="v6-xicc">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="iq8mn74">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="vhlczbl">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="z4xn2pt">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="qp4ua_7">
                        <p className="text-gray-600 mb-4" data-oid="54:6hph">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="rjauahe">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="ettrjcb"
                                >
                                    <div className="text-2xl mb-2" data-oid="vlqfcl:">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="2scibij">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="6puq2m7">
                        <div className="flex items-center space-x-2 mb-4" data-oid="dozvfdt">
                            <span className="text-2xl" data-oid="o029ctf">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="2wlj1p2">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="4_koxns"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="310s4mm">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="_-kzyz1"
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
                                    data-oid="70u7_.s"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="0isp6:j"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="k43tf7w">
                            <div data-oid="1gbvbkj">
                                <label className="flex items-center space-x-2" data-oid="9tyl2u_">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="o5w3zwd"
                                    />

                                    <span className="text-sm" data-oid="80cnhht">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="fvxbqwe">
                                <label className="flex items-center space-x-2" data-oid="j96.ex3">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="oq1:nt6"
                                    />

                                    <span className="text-sm" data-oid=".cn8p2d">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="hhxe.hf">
                            <div data-oid="7box_6s">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="bruiy89"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="4pk._qc"
                                >
                                    <option value="1000" data-oid="mzzr1zi">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="val32oe">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="78rqs9h">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="-8c9lrn">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="_gxnsyr">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="wf1ki9o">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="v5cgqkr">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="hptc_-8">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="roqyv98"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="mq5.4qa"
                                >
                                    <option value="Semantic" data-oid="07zkv96">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="b-mvxek">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid=".w6fw9t">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="1ulz3u0">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="jdy33p:"
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
                            data-oid="02e7vjm"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
