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
            data-oid=".:i:-4g"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="p56l26x">
                <h3 className="text-lg font-semibold mb-4" data-oid="jdw4fx:">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="bnfxb49"
                    >
                        <div className="flex items-start space-x-3" data-oid="g2cwz:m">
                            <div className="text-yellow-600 text-xl" data-oid="uam8yd8">
                                ⚠️
                            </div>
                            <div data-oid="cxl6s-d">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="u-do0xl">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="7hi8cup">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="lx-7uxm">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="73.wosd">
                        <p className="text-gray-600 mb-4" data-oid="6:5hama">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="8-b.17p">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="lt46e5u"
                                >
                                    <div className="text-2xl mb-2" data-oid="026vu8n">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="02f4i8d">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="_q20i_u">
                        <div className="flex items-center space-x-2 mb-4" data-oid="o5iwpu1">
                            <span className="text-2xl" data-oid="k__ta9y">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="19wj7kl">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="4f2r7vx"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid=":n53jwo">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="2dsh_bu"
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
                                    data-oid="ws9mbbn"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="m_l625p"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="4af2239">
                            <div data-oid="uqhu8kb">
                                <label className="flex items-center space-x-2" data-oid="2_az:p-">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="tclqz39"
                                    />

                                    <span className="text-sm" data-oid=".d1374-">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="sjx-ufr">
                                <label className="flex items-center space-x-2" data-oid="dphmgrm">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="-yyycrq"
                                    />

                                    <span className="text-sm" data-oid="fmr5:rm">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="_dmte88">
                            <div data-oid="ws4zf:g">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="whmu62c"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="mx-62_o"
                                >
                                    <option value="1000" data-oid=".esqo4g">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="7gigycp">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="o1:xscf">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="wpz2fsq">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="ui_79nc">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="_vhuqls">
                                        6000
                                    </option>
                                    <option value="8000" data-oid="1gsxw1v">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="dxhuhv9">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="nq4kfay"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="3vwhcei"
                                >
                                    <option value="Semantic" data-oid="pc5oylh">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid="o.6b9-7">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="gh.op74">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="e91ib7w">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="glm3-:j"
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
                            data-oid=":qx1e4g"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
