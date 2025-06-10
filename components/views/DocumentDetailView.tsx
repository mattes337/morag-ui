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
                    data-oid="iai5g:t"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="j9e1pho"
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
                    data-oid="qzj_lt1"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="jpsxwdo"
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
                    data-oid="4k.z4vg"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="jttc3c6"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="l357gsa"
            >
                <div className="text-center" data-oid="9ljt.b.">
                    <div className="text-4xl mb-4" data-oid="-758hux">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="n_1d1cu">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="n15qno3">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="0xzm34l">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="v68akns">
                <div data-oid="d:rhlt:">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="3euh12e"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid=":4jobxl">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="cyjxhxu">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="13vx19g"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="luahwtu">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="ux50fmj">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="r9pg0js">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid=":_-ijg3"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="3v9j0el">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="y_cckf7">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="un:8wwx">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="2azwepm">
                        <div className="flex justify-between" data-oid="aelp.2v">
                            <span className="text-gray-600" data-oid="qa5xh_h">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="rzzsa3q">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="gr46dm1">
                            <span className="text-gray-600" data-oid="qlve0d7">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="6ehp.fs">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="_tapo:5">
                            <span className="text-gray-600" data-oid="0xndzt1">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="v6vr.yb">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="qshxbk2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="1jyxtkp">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="f8hrbu0">
                        <div className="flex justify-between" data-oid="fi1klcq">
                            <span className="text-gray-600" data-oid="6rzhqs4">
                                Type:
                            </span>
                            <span className="font-medium" data-oid=".58f2jq">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="kzq1w65">
                            <span className="text-gray-600" data-oid="2maevov">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="fpqtgf0"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid=".4ejz..">
                            <span className="text-gray-600" data-oid="5p_2-lw">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="syz:1bq">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="rwu7p8w">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="4m15vap">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="l:bwm2x">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="8ayvpaq"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="ibjv:0q"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="soogwk5"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="h2cztgv">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="i:5ux45">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
