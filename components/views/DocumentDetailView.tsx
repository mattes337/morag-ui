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
                    data-oid="yza5qra"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="101th-1"
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
                    data-oid="1cy0mz0"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="wo5nr1w"
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
                    data-oid="2_okp08"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="y9cyuh_"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="f:zwgmh"
            >
                <div className="text-center" data-oid="0.bmqc2">
                    <div className="text-4xl mb-4" data-oid=".eum22j">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="se3krh2">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="l879g_2">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="ec2r0-g">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="m1h7ahy">
                <div data-oid="bmfafxh">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="viy:hav"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="op4o6zw">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="gr:v:0-">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="gdil5x2"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="02s12jp">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="i0rrm6d">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="67yhx4d">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="lb.5o-r">
                    <button
                        onClick={() => onReingest(document)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="aee1e9e"
                    >
                        Reingest
                    </button>
                    <button
                        onClick={() => onSupersede(document)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        disabled={document.state === 'deprecated' || document.state === 'deleted'}
                        data-oid="gepfc7."
                    >
                        Supersede
                    </button>
                    <button
                        onClick={() => onDelete(document)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="twqma__"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="7tho9:b">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="c4g858d">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="d7m8ri0">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="zinew73">
                        <div className="flex justify-between" data-oid="uv5agl6">
                            <span className="text-gray-600" data-oid="-taxyag">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="tjtcg8_">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="xcpwkl0">
                            <span className="text-gray-600" data-oid="8c800ud">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="0in3od1">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="_n-cbid">
                            <span className="text-gray-600" data-oid="cwo:648">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="93e9ko8">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="4.52eys">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="lzdp_ye">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid=".4k6vmp">
                        <div className="flex justify-between" data-oid="0icuawq">
                            <span className="text-gray-600" data-oid="rn13hd:">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="lu:firo">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="-w_01k6">
                            <span className="text-gray-600" data-oid="aw0n9-9">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="y6zosw4"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="j86jx6c">
                            <span className="text-gray-600" data-oid="3:t7f:y">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="0v41esn">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="v.2k89s">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="u5mu138">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="2jk:ihy">
                        <button
                            onClick={() => onReingest(document)}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="takyqf0"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="zoy832k"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={() => onDelete(document)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="_d4zyh8"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="qsz-h2a">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="i68f:4i">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
