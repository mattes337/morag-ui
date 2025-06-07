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
                    data-oid="4801pdc"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="7e.hgzk"
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
                    data-oid="66pb9f1"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="5dvoskq"
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
                    data-oid="52lnex5"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="xv.jw7_"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="s0rrmva"
            >
                <div className="text-center" data-oid="gt6-g2z">
                    <div className="text-4xl mb-4" data-oid="ftea:qv">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="49v:yki">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="mp47bde">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="atp1iz8">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="d1whwpd">
                <div data-oid="6rkj1cq">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="cqkmz2h"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="j7tkn54">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="qt8.q1a">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="13s4q9f"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="-4n3kyt">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="-rpiwjc">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="9btf5dw">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="mx1fsv4">
                    <button
                        onClick={() => onReingest(document)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={document.state === 'ingesting'}
                        data-oid="cdt9-nj"
                    >
                        Reingest
                    </button>
                    <button
                        onClick={() => onSupersede(document)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        disabled={document.state === 'deprecated' || document.state === 'deleted'}
                        data-oid="j9kzij."
                    >
                        Supersede
                    </button>
                    <button
                        onClick={() => onDelete(document)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        disabled={document.state === 'deleted'}
                        data-oid="nei4djg"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="v8g6jla">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="vn_.1p2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="cls.eqm">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="ht8-eo0">
                        <div className="flex justify-between" data-oid="7dna79a">
                            <span className="text-gray-600" data-oid="qq_:4ke">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="bmh303a">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="v05gsa3">
                            <span className="text-gray-600" data-oid="cahnijh">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="lcrl-x9">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="sy:sl8j">
                            <span className="text-gray-600" data-oid="a01y77o">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="7nssraf">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="40j::54">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="pj62sj6">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="akrfpso">
                        <div className="flex justify-between" data-oid="-krk5ws">
                            <span className="text-gray-600" data-oid="il3.u6:">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="tsu0-9p">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="-8r-w38">
                            <span className="text-gray-600" data-oid="egyd9y1">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid=":hbve2-"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="sh9bqkl">
                            <span className="text-gray-600" data-oid="3kwrnay">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="6gmanxm">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="0m7zybr">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="p-_1t1_">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="xic04ga">
                        <button
                            onClick={() => onReingest(document)}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="8izy9-j"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="u8rrtoa"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={() => onDelete(document)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="a.91o_y"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="b-y0grk">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="l-efti4">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
