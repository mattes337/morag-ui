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
            data-oid="qt_d01n"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="1668uth">
                <h3 className="text-lg font-semibold mb-4" data-oid="6f6hhoz">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="758ocjd"
                    >
                        <div className="flex items-start space-x-3" data-oid="15ef78k">
                            <div className="text-yellow-600 text-xl" data-oid="v_l_kga">
                                ⚠️
                            </div>
                            <div data-oid="kn5zi9k">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="tdlen.6">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="c27.mqp">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="cs6pw9e">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="lr90m-f">
                        <p className="text-gray-600 mb-4" data-oid="3lpz_1v">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="wgze..w">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="2bchi48"
                                >
                                    <div className="text-2xl mb-2" data-oid="n7ycz:t">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="jxf-:2.">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="p9r6m-k">
                        <div className="flex items-center space-x-2 mb-4" data-oid="kmb2:k9">
                            <span className="text-2xl" data-oid="gu-vrfo">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="kxed8-2">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="7uvdt2k"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="hay9uqb">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="cq1y7ck"
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
                                    data-oid="-hn:bit"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="dd88r.d"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="g:8k9:8">
                            <div data-oid="md-pb6s">
                                <label className="flex items-center space-x-2" data-oid="_td7ii.">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="2lz:bzm"
                                    />

                                    <span className="text-sm" data-oid="3mdz0tl">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="a:jxwoo">
                                <label className="flex items-center space-x-2" data-oid="sy.e1xj">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="_jp4j5a"
                                    />

                                    <span className="text-sm" data-oid="6.q8cj1">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="l.yqzj-">
                            <div data-oid="zmt9t5c">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid=":n8.yhl"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="6pq82d5"
                                >
                                    <option value="1000" data-oid="v36jnnz">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="314e7wh">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="-a6b2im">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="9v_2zca">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="05sniwa">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="yfkdovt">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="b9.8och">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="6gxc_6:">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="nqgms25"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="ex4265i"
                                >
                                    <option value="Semantic" data-oid="1_j732n">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="exe51r6">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="nrypko7">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="a.4eygf">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="3s9oi2-"
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
                            data-oid=".mr:ka6"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
