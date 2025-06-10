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
                    data-oid="6y7_-j9"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="q5o4sef"
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
                    data-oid="mehl57."
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="01iwyfo"
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
                    data-oid="6nu3l4c"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="xutdkdk"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="nm1k3ft"
            >
                <div className="text-center" data-oid="vvu60_1">
                    <div className="text-4xl mb-4" data-oid="jn9olhs">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="jnk3af.">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="s2.daez">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="ud7yuoh">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="837a.sd">
                <div data-oid="wl.dcmn">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="z8qmgme"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid=":m9ap02">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="u7::x8c">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="l9zzlbv"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="f634jzq">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="r2:3z0c">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="xex0cq-">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="u31-m24"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="g79tbty">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="wgvqhie">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="rbsc89o">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="odpqjhk">
                        <div className="flex justify-between" data-oid="i-:g2.-">
                            <span className="text-gray-600" data-oid="94t:wwf">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="95xp:7p">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="f1ml41r">
                            <span className="text-gray-600" data-oid="sup5fa4">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="skk-0kx">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="3xtyx_e">
                            <span className="text-gray-600" data-oid="y0tsw.y">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="qb-r74e">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="y9u19-e">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="m7g1rec">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="xyhtmm_">
                        <div className="flex justify-between" data-oid="jiwad9f">
                            <span className="text-gray-600" data-oid="pa0jh39">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="qwusn.t">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="cl-hsh2">
                            <span className="text-gray-600" data-oid="m62_.un">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="xu-.bzv"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="b_szevs">
                            <span className="text-gray-600" data-oid="72w5ekl">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="bmp04zj">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="8.ggs:6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="_7wptw9">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="mm1c72i">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="zqlp_yp"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="e_1_qcl"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="iv_.9_x"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="ex:0pc3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="twwnnge">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
