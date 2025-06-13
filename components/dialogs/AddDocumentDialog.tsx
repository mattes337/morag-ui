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
            data-oid="vjukagi"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="zk4zavm">
                <h3 className="text-lg font-semibold mb-4" data-oid="0z_9cdu">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="6x81o1-"
                    >
                        <div className="flex items-start space-x-3" data-oid="_74rrma">
                            <div className="text-yellow-600 text-xl" data-oid="b2534ra">
                                ⚠️
                            </div>
                            <div data-oid="7-:j_9l">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="9b.ic8_">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="1rvnv85">
                                    This action will replace the existing document &ldquo;
                                    {documentToSupersede.name}&rdquo; and remove it from the vector
                                    store. This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="sjhi6_0">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="7pcuii9">
                        <p className="text-gray-600 mb-4" data-oid="gkkcahe">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="ejt507e">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="xu_4uf-"
                                >
                                    <div className="text-2xl mb-2" data-oid="89_w08-">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="rzy5yye">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="u2wd1:p">
                        <div className="flex items-center space-x-2 mb-4" data-oid="7x5e5dx">
                            <span className="text-2xl" data-oid="hopgxo-">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="hbuzipi">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="7_mjao5"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="ws7jyd3">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="rquzo4l"
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
                                    data-oid="h::8_uy"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="jvdtds-"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="opzsmff">
                            <div data-oid="hn1bpaq">
                                <label
                                    htmlFor="gpu-processing"
                                    className="flex items-center space-x-2"
                                    data-oid="2swuv.2"
                                >
                                    <input
                                        id="gpu-processing"
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="jvv5n7v"
                                    />

                                    <span className="text-sm" data-oid="79bwjf4">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="pop02l5">
                                <label
                                    htmlFor="contextual-embedding"
                                    className="flex items-center space-x-2"
                                    data-oid=":spgld9"
                                >
                                    <input
                                        id="contextual-embedding"
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="g4ie4zv"
                                    />

                                    <span className="text-sm" data-oid="hk1zy5n">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="uzg:6n6">
                            <div data-oid="wc6wldn">
                                <label
                                    htmlFor="chunk-size"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="nfvegrw"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    id="chunk-size"
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="ay3japq"
                                >
                                    <option value="1000" data-oid="-wfwyl:">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="prjxinq">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="-vkk6i8">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="l76rlra">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="xejv-1q">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="qh6-c:9">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="2zd893b">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="dddis2.">
                                <label
                                    htmlFor="chunking-method"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="gw8fl6_"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    id="chunking-method"
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="0uwpta4"
                                >
                                    <option value="Semantic" data-oid="mf3s5n3">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid=":e..8ie">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="2c9ai._">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="0.b-niv">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="sgravh-"
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
                            data-oid="rkowx:2"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
