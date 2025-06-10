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
            data-oid="1p:.tx_"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="axvdgfw">
                <h3 className="text-lg font-semibold mb-4" data-oid="uvmqjni">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="tusi51f"
                    >
                        <div className="flex items-start space-x-3" data-oid="kmxut3z">
                            <div className="text-yellow-600 text-xl" data-oid="7w8vndi">
                                ⚠️
                            </div>
                            <div data-oid="q--_830">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="rpdm:zn">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="-wswjtb">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="opnaspf">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="8tw6ay5">
                        <p className="text-gray-600 mb-4" data-oid="vifwn-g">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="vc_cnx1">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="k6lf:wk"
                                >
                                    <div className="text-2xl mb-2" data-oid="oj8y_e.">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="wetznws">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="bo:npgd">
                        <div className="flex items-center space-x-2 mb-4" data-oid="f4:is0m">
                            <span className="text-2xl" data-oid="hih2-uc">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="8-k5d-:">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="dulbzp9"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid=".ndcy7d">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="i0mqn5k"
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
                                    data-oid="knhu1gc"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="pb44e4d"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="qj_tww0">
                            <div data-oid=".n1p-o-">
                                <label className="flex items-center space-x-2" data-oid="k:8qq7s">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="k:wzp4n"
                                    />

                                    <span className="text-sm" data-oid="rqu5rp.">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="3oqd552">
                                <label className="flex items-center space-x-2" data-oid="6vj-d9u">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="1ubx6jc"
                                    />

                                    <span className="text-sm" data-oid="7ogb2:q">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="hiv8dpk">
                            <div data-oid="5315iwi">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="g5-5gwo"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="v:0zreg"
                                >
                                    <option value="1000" data-oid="khq.:ax">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="xmdajnu">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="dlehuc4">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="l.d18aa">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="k8sa6sj">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="qeztbfw">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="0kk484t">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="tsckktu">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="cd67vvk"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="ghczpe:"
                                >
                                    <option value="Semantic" data-oid="4gb2mcx">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="1t_j2gw">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="ngd3ism">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="qaum_fq">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid=":f3mia_"
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
                            data-oid="eip5:pn"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
