'use client';

import { useState, useEffect, useMemo } from 'react';
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

    const documentTypes: DocumentType[] = useMemo(
        () => [
            { type: 'pdf', label: 'PDF Document', icon: '📄' },
            { type: 'word', label: 'Word Document', icon: '📝' },
            { type: 'youtube', label: 'YouTube Video', icon: '📺' },
            { type: 'video', label: 'Video File', icon: '🎬' },
            { type: 'audio', label: 'Audio File', icon: '🎵' },
            { type: 'website', label: 'Website', icon: '🌐' },
        ],

        [],
    );

    // Auto-select document type and set defaults when in supersede mode
    useEffect(() => {
        if (mode === 'supersede' && documentToSupersede) {
            console.log(
                '🔄 [AddDocumentDialog] Setting up supersede mode for:',
                documentToSupersede.name,
            );
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

    // Reset form when dialog opens (unless in supersede mode)
    useEffect(() => {
        if (isOpen && mode === 'add') {
            setSelectedDocumentType(null);
            setChunkSize('1000');
            setChunkingMethod('Semantic');
            setGpuProcessing(false);
            setContextualEmbedding(false);
        }
    }, [isOpen, mode]);

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
            data-oid="hqeb_mz"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="nsskquk">
                <h3 className="text-lg font-semibold mb-4" data-oid="gzvpwf3">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="2:97pmt"
                    >
                        <div className="flex items-start space-x-3" data-oid="var6jbb">
                            <div className="text-yellow-600 text-xl" data-oid="eoixxpv">
                                ⚠️
                            </div>
                            <div data-oid="ijv.:m.">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="4bsvrdq">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="tug1-xf">
                                    This action will replace the existing document &ldquo;
                                    {documentToSupersede.name}&rdquo; and remove it from the vector
                                    store. This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid=":kawpwj">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="jus0-8v">
                        <p className="text-gray-600 mb-4" data-oid="srcd35:">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="qkgumrr">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="069371-"
                                >
                                    <div className="text-2xl mb-2" data-oid="30rl83x">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="wkcuoqc">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="qorak12">
                        <div className="flex items-center space-x-2 mb-4" data-oid="oxwiu_b">
                            <span className="text-2xl" data-oid="6tkdpb5">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="dd6829z">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="d_778v_"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="wdf5ud.">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="c6wv53b"
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
                                    data-oid="v0mwzcq"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="grxsgnt"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="_xojy34">
                            <div data-oid="k.j.uhe">
                                <label
                                    htmlFor="gpu-processing"
                                    className="flex items-center space-x-2"
                                    data-oid="1_ae2pf"
                                >
                                    <input
                                        id="gpu-processing"
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="rwl4inz"
                                    />

                                    <span className="text-sm" data-oid="f69-0o2">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="etvj_rz">
                                <label
                                    htmlFor="contextual-embedding"
                                    className="flex items-center space-x-2"
                                    data-oid="yu-vsi6"
                                >
                                    <input
                                        id="contextual-embedding"
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="s8a3kj4"
                                    />

                                    <span className="text-sm" data-oid="ng4r643">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="tzc5h9s">
                            <div data-oid="u90mn:v">
                                <label
                                    htmlFor="chunk-size"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="l:tdu_8"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    id="chunk-size"
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="1dk.ajf"
                                >
                                    <option value="1000" data-oid="djbxc4x">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="pj8g8b8">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="6tc-m_:">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="tarxb5-">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="nyp._0q">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="4vc5o7t">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="qiv6w-m">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="pjypg.t">
                                <label
                                    htmlFor="chunking-method"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="jag94v1"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    id="chunking-method"
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="wzq3wlz"
                                >
                                    <option value="Semantic" data-oid="iyg55.9">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid=".8ev9tx">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="msibk6m">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="2mlrhwd">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="ua-gixl"
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
                            data-oid=":qxkxq6"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
