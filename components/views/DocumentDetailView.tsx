'use client';

import { Document } from '../../types';

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
                    data-oid="-xohuv3"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="3-l00ze"
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
                    data-oid="6rf8w1d"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="kn4.7fj"
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
                    data-oid=".96a9y1"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="8iggc63"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="tthlg37"
            >
                <div className="text-center" data-oid="zi5pxp6">
                    <div className="text-4xl mb-4" data-oid="yst9tsc">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="us5ik78">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="w5atwb0">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="-4lylam">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="3_mrvtp">
                <div data-oid="3tartj5">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="qbmvuv7"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="w98hhnp">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="dour9e.">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="jqn6_.-"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="kekp-dl">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="-jern_1">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="h703hu7">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="f1453f4">
                    <button
                        onClick={() => onReingest(document)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="h190x7e"
                    >
                        Reingest
                    </button>
                    <button
                        onClick={() => onSupersede(document)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        disabled={document.state === 'deprecated' || document.state === 'deleted'}
                        data-oid="l.on_71"
                    >
                        Supersede
                    </button>
                    <button
                        onClick={() => onDelete(document)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="9qk51k3"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="qj3t:4u">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="ycp1qfm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="dck2xao">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="p5e_n9f">
                        <div className="flex justify-between" data-oid="_d9_4b4">
                            <span className="text-gray-600" data-oid="2_zzgt_">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="p6p-ixt">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="..gshi8">
                            <span className="text-gray-600" data-oid=".7.gp62">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="itevrt_">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="zgdr61y">
                            <span className="text-gray-600" data-oid="qlwsjdu">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="5t7oh3l">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="ylcedo2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="mms7ko5">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="9sst7sn">
                        <div className="flex justify-between" data-oid="dp:st0p">
                            <span className="text-gray-600" data-oid="mfxarue">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="z7y17.s">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="0u9c2q_">
                            <span className="text-gray-600" data-oid="f0f2ajy">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid=":jl0ory"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="phxs_u-">
                            <span className="text-gray-600" data-oid="pu9aih1">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="9h7r8q4">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="yst9u.j">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="1ucz5:x">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="kwn9vam">
                        <button
                            onClick={() => onReingest(document)}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="irk8kvi"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="i:5sihy"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={() => onDelete(document)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="2ej6puw"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="kmsl5s.">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="qbyhc6e">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
