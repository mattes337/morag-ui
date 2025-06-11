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
            data-oid="iyoe7di"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" data-oid="uc9w5r-">
                <h3 className="text-lg font-semibold mb-4" data-oid="63588o_">
                    {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                </h3>

                {mode === 'supersede' && documentToSupersede && (
                    <div
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
                        data-oid="-w_1wtl"
                    >
                        <div className="flex items-start space-x-3" data-oid="j48jnvu">
                            <div className="text-yellow-600 text-xl" data-oid="90.cdxk">
                                ⚠️
                            </div>
                            <div data-oid="navgnpy">
                                <h4 className="font-medium text-yellow-800 mb-1" data-oid="frco9uq">
                                    Document Supersede Warning
                                </h4>
                                <p className="text-sm text-yellow-700 mb-2" data-oid="wm4jx-7">
                                    This action will replace the existing document "
                                    {documentToSupersede.name}" and remove it from the vector store.
                                    This action cannot be undone.
                                </p>
                                <div className="text-xs text-yellow-600" data-oid="qzbu0t5">
                                    Current document: {documentToSupersede.chunks} chunks, Quality:{' '}
                                    {(documentToSupersede.quality * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedDocumentType && mode === 'add' ? (
                    <div data-oid="2b0jzsq">
                        <p className="text-gray-600 mb-4" data-oid="70amtza">
                            Select document type:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-oid="n5wvik1">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedDocumentType(type)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                    data-oid="z96.ur."
                                >
                                    <div className="text-2xl mb-2" data-oid="d14l14q">
                                        {type.icon}
                                    </div>
                                    <div className="text-sm font-medium" data-oid="tfa81n0">
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedDocumentType ? (
                    <div className="space-y-4" data-oid="0x_f5s_">
                        <div className="flex items-center space-x-2 mb-4" data-oid="0f5h86w">
                            <span className="text-2xl" data-oid="3z665zm">
                                {selectedDocumentType.icon}
                            </span>
                            <span className="font-medium" data-oid="1rjcph3">
                                {selectedDocumentType.label}
                            </span>
                            {mode === 'add' && (
                                <button
                                    onClick={() => setSelectedDocumentType(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    data-oid="qshuwv5"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div data-oid="ttn:96a">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="wbi:8t2"
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
                                    data-oid="v9lwaqr"
                                />
                            ) : (
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="aw3wdu8"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="2evpi87">
                            <div data-oid="r__1cd7">
                                <label className="flex items-center space-x-2" data-oid="dr1:mn0">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={gpuProcessing}
                                        onChange={(e) => setGpuProcessing(e.target.checked)}
                                        data-oid="u839h:9"
                                    />

                                    <span className="text-sm" data-oid="e:._b-5">
                                        GPU Processing
                                    </span>
                                </label>
                            </div>
                            <div data-oid="gx-01nb">
                                <label className="flex items-center space-x-2" data-oid="93uvv-h">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={contextualEmbedding}
                                        onChange={(e) => setContextualEmbedding(e.target.checked)}
                                        data-oid="3qe8abn"
                                    />

                                    <span className="text-sm" data-oid="esium.l">
                                        Contextual Embedding
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-oid="ehz13te">
                            <div data-oid="42:m:cp">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="6z6ya0v"
                                >
                                    Chunk Size
                                </label>
                                <select
                                    value={chunkSize}
                                    onChange={(e) => setChunkSize(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="qt.58fp"
                                >
                                    <option value="1000" data-oid="jm_ymo_">
                                        1000
                                    </option>
                                    <option value="2000" data-oid="hcdtdmy">
                                        2000
                                    </option>
                                    <option value="3000" data-oid="t12pffe">
                                        3000
                                    </option>
                                    <option value="4000" data-oid="n.q:bzl">
                                        4000
                                    </option>
                                    <option value="5000" data-oid="r3ue571">
                                        5000
                                    </option>
                                    <option value="6000" data-oid="._8o1p2">
                                        6000
                                    </option>
                                    <option value="8000" data-oid=".yds6v9">
                                        8000
                                    </option>
                                </select>
                            </div>
                            <div data-oid="gmol98e">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="04bvac:"
                                >
                                    Chunking Method
                                </label>
                                <select
                                    value={chunkingMethod}
                                    onChange={(e) => setChunkingMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="r90w-f_"
                                >
                                    <option value="Semantic" data-oid="1.-5cl4">
                                        Semantic
                                    </option>
                                    <option value="Fixed Size" data-oid=":hgf2yc">
                                        Fixed Size
                                    </option>
                                    <option value="Sentence" data-oid="1:52auu">
                                        Sentence
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end space-x-3 mt-6" data-oid="gupgyof">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="diyuf:6"
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
                            data-oid="8b_qy2x"
                        >
                            {mode === 'supersede' ? 'Supersede Document' : 'Add Document'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
