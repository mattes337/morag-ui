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
                    data-oid="2tyeis_"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="cxrsut7"
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
                    data-oid="1m_xfaz"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="g1df-tw"
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
                    data-oid="ostwoqq"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="5290kx7"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="4ogo_vo"
            >
                <div className="text-center" data-oid="wei4xio">
                    <div className="text-4xl mb-4" data-oid="gjgpy7m">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="_cl_jdo">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="-km6598">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="m1jcfik">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="ds4p2-p">
                <div data-oid="xo8p_xq">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="x7ll649"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="2isjxzh">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="rj-qupr">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid=":pbghec"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="7e_rpdd">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="e4y1opx">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="mzvn2hs">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="petf493"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="r-7bj.q">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="aykukey">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="e0y6tg-">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="cn_wgkz">
                        <div className="flex justify-between" data-oid="uzwa-qs">
                            <span className="text-gray-600" data-oid="f63h5ef">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="7ukwbt_">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="wk1p7kj">
                            <span className="text-gray-600" data-oid="m3rb32u">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="gnw.ww1">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="w.i39km">
                            <span className="text-gray-600" data-oid="owayqmk">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="tm-_fc.">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="la7yurq">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid=".remf08">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="appfpiu">
                        <div className="flex justify-between" data-oid="pr4z_gz">
                            <span className="text-gray-600" data-oid="dwvye9z">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="dqjlv4q">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="9ga2vx1">
                            <span className="text-gray-600" data-oid="jtd_-q3">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="zfz88eq"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="apaka6y">
                            <span className="text-gray-600" data-oid="kk6hiq3">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="rzv:6_y">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="..4f-96">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="2t3sfuj">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="e_2rqmd">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="hd9jntu"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="dz.k.-_"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="c.:11zc"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="oxa1hcv">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="kt9.8v_">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
