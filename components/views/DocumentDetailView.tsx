'use client';

import { Document } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface DocumentDetailViewProps {
    document: Document;
    onBack: () => void;
    onReingest: (document: Document) => void;
    onSupersede: (document: Document) => void;
    onDelete: (document: Document) => void;
}

export function DocumentDetailView({
    document,
    onBack,
    onReingest,
    onSupersede,
    onDelete,
}: DocumentDetailViewProps) {
    const {
        setShowReingestConfirmDialog,
        setDocumentToReingest,
        setShowDeleteConfirmDialog,
        setDocumentToDelete,
    } = useApp();

    const handleReingestClick = () => {
        setDocumentToReingest(document);
        setShowReingestConfirmDialog(true);
    };

    const handleDeleteClick = () => {
        setDocumentToDelete(document);
        setShowDeleteConfirmDialog(true);
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'ingesting':
                return 'bg-blue-100 text-blue-800';
            case 'ingested':
                return 'bg-green-100 text-green-800';
            case 'deprecated':
                return 'bg-gray-100 text-gray-800';
            case 'deleted':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderDocumentEmbed = () => {
        const docType = document.type.toLowerCase();
        const docName = document.name.toLowerCase();

        // For testing purposes, using publicly available files
        if (docType === 'pdf' || docName.includes('.pdf')) {
            // Using a sample PDF from Mozilla
            const pdfUrl =
                'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
            return (
                <div
                    className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden"
                    data-oid="2v580e6"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="65vbz7m"
                    />
                </div>
            );
        }

        if (docType === 'youtube' || docName.includes('youtube')) {
            // Using a sample educational YouTube video
            const videoId = 'dQw4w9WgXcQ'; // Sample video ID
            return (
                <div
                    className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden"
                    data-oid="5_2b:_-"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="ldms13a"
                    />
                </div>
            );
        }

        if (docType === 'website' || docType === 'url' || docName.includes('http')) {
            // Using a sample website
            const websiteUrl = 'https://example.com';
            return (
                <div
                    className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden"
                    data-oid="381io-1"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="e0kv1zo"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="h23-u5t"
            >
                <div className="text-center" data-oid="nqsq_g8">
                    <div className="text-4xl mb-4" data-oid="_p__oft">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="-e.uqyq">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="p.8fx.9">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="hw9hrdl">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="_8yp91g">
                <div data-oid="0qrb4:-">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="0cqxtif"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="put3lf6">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="qnsjt7o">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="nvmwi50"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="y6q..5w">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="rrmajou">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="13h-q49">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="wisdowd">
                    <button
                        onClick={handleReingestClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="lrpzs00"
                    >
                        Reingest
                    </button>
                    <button
                        onClick={() => onSupersede(document)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        disabled={document.state === 'deprecated' || document.state === 'deleted'}
                        data-oid="y6bzidq"
                    >
                        Supersede
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid=":6d-xxo"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="t5xrofg">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="neex9.g">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="gnb1py.">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="jey.1w2">
                        <div className="flex justify-between" data-oid="eg30ozy">
                            <span className="text-gray-600" data-oid="n_q:idy">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="junb2m_">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="h9ej13j">
                            <span className="text-gray-600" data-oid="3dsdye2">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="zew0fne">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="jityy__">
                            <span className="text-gray-600" data-oid="d352sfo">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="aosx7kd">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid=".opnhsa">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="-_m8hhg">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="3r77pvm">
                        <div className="flex justify-between" data-oid="pn35_vi">
                            <span className="text-gray-600" data-oid="6lytksa">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="1c9yo3p">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="dysq24v">
                            <span className="text-gray-600" data-oid="i2wc6pf">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="albuoy0"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="23g_65x">
                            <span className="text-gray-600" data-oid="9-asn95">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="p0jxmsw">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="bz-9kc4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="ecfgxq5">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid=".n318a9">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid=":.rietp"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="cc4c23o"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="jtnq3do"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="6rn1ylk">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="ek5a.uy">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
