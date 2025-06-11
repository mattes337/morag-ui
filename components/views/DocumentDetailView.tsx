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
                    data-oid="u.h.0w2"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="jagzvqp"
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
                    data-oid="ye-bhvr"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="r92_g7v"
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
                    data-oid="ik8hzk:"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="vynd8rz"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid=".-_.6.m"
            >
                <div className="text-center" data-oid="2r0-90k">
                    <div className="text-4xl mb-4" data-oid="xs9udmo">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="69rjac6">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="6mo37vv">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="udby7bn">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="y-ifsnk">
                <div data-oid="1kczuyv">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="f_l7roc"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="j1x57:i">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="3:btb_q">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="g2k0yhx"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="7fkn950">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="j044jkn">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="bk1kb_r">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="4h6g4fi"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="eo7y_ko">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="4kk7qg2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="2h5kx3d">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="2isc_n.">
                        <div className="flex justify-between" data-oid="khh_b73">
                            <span className="text-gray-600" data-oid=":_40iq_">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="y94-bfz">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="9qu4.j_">
                            <span className="text-gray-600" data-oid="7awu_-u">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="24jn3s4">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="99l6zwg">
                            <span className="text-gray-600" data-oid="ox2_x8n">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="63u6u0v">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="4f:deup">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="r5ti6lb">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="6v5o.23">
                        <div className="flex justify-between" data-oid=":7diwsa">
                            <span className="text-gray-600" data-oid="r52g561">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="87bp9mf">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="ffw4ntb">
                            <span className="text-gray-600" data-oid="yyqn:pd">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="nw5rj4p"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="c_ualet">
                            <span className="text-gray-600" data-oid="v2mgu7r">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="x8tbm19">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="kugk48-">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="ugzb3vu">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid=":4wqmk7">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="gd5lm2d"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="y5io::-"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid=".o_.z4p"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="58zqc71">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="ol1etn:">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
