'use client';

import { useState, useEffect, useMemo } from 'react';
import { DocumentType, Document } from '../../types';

interface AddDocumentDialogProps extends React.HTMLAttributes<HTMLDivElement> {
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
    ...htmlProps
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
            {...htmlProps}
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="kl9:7of">
                <h3 className="text-lg font-semibold mb-4" data-oid="mpg8vik">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="al:e38y"
                    >
                        <div className="flex items-start space-x-3" data-oid="umldgy6">
                            <div className="text-yellow-600 text-xl" data-oid="p7w29.n">
                                ⚠️
                            </div>
                            <div data-oid="r6:n7zo">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="5mr8o_o">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="1r5xsx_">
                                    This action will replace the existing document &ldquo;
                                    {documentToSupersede.name}&rdquo; and remove it from the vector
                                    store. This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="no7wmwp">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="z4fit1i">
                        <p className="text-gray-600 mb-4" data-oid=".4kyocb">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="zqhpgb9">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="_:bg3eb"
                                >
                                    <div className="text-2xl mb-2" data-oid="tuzk6v:">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="petjd44">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="qc43r29">
                        <div className="flex items-center space-x-2 mb-4" data-oid="g-k8z1:">
                            <span className="text-2xl" data-oid="pk9:yd-">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="t07-waf">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="ioxuy0g"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid=":q:96kt">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="gnbx0j2"
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
                                    data-oid="v2borhw"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="v9oo-ew"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid=":2cpxom">
                            <div data-oid="z0nrybd">
                                <label
                                    htmlFor="gpu-processing"
                                    className="flex items-center space-x-2"
                                    data-oid="9ev49o3"
                                >
                                    <input
                                        id="gpu-processing"
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid=".1anw1v"
                                    />

                                    <span className="text-sm" data-oid="x5r-g.3">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="b8wf56q">
                                <label
                                    htmlFor="contextual-embedding"
                                    className="flex items-center space-x-2"
                                    data-oid="hng9.xe"
                                >
                                    <input
                                        id="contextual-embedding"
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="ftzs_wu"
                                    />

                                    <span className="text-sm" data-oid="i0_pmze">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="wyei052">
                            <div data-oid="1kdmwp0">
                                <label
                                    htmlFor="chunk-size"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="1t7k-fd"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    id="chunk-size"
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="ow.dqrc"
                                >
                                    <option value="1000" data-oid="muxn-q-">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="7xjshla">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="-vuzldt">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="7fi-nox">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="erbn._9">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="vt_og5.">
                                        6000
                                    </option>
                                    <option value="8000" data-oid=".jk73_2">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="_n83rk4">
                                <label
                                    htmlFor="chunking-method"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="xn5pw72"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    id="chunking-method"
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid=":5xkaid"
                                >
                                    <option value="Semantic" data-oid="92v07lg">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="ap66ty_">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="32nkpzi">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="sfqwgzj">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="r2a1cfs"
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
                            data-oid="fr567.8"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
