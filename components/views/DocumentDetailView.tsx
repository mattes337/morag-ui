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
                    data-oid="orka1-j"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="a5mbonw"
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
                    data-oid="zideioe"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="62zgd2f"
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
                    data-oid=":kqyt5d"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid=":g_wiv5"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="9v7f-xx"
            >
                <div className="text-center" data-oid="k4_ifg.">
                    <div className="text-4xl mb-4" data-oid="rvjjypf">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid=".2r8cv8">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="4nsnv0q">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="msz_kg6">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="9ahsqe:">
                <div data-oid="0v-q49v">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="bfup4d1"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="bi7y4uy">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="3uy0y92">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="qfv_y9t"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="00wkp9e">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="p-8cx4k">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="wy1q:e5">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="tl685cf"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="1rvs11h">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="mwmpn6l">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="6orbi.n">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="7dp6bxe">
                        <div className="flex justify-between" data-oid="sbr-zc.">
                            <span className="text-gray-600" data-oid="0n5s534">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="42koz6x">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="zkccute">
                            <span className="text-gray-600" data-oid="bk28v2p">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="0ca.9wg">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="p3gq.yu">
                            <span className="text-gray-600" data-oid="79t-a:v">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="yl-67:l">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid=".5o140w">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="pbp5t7j">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="j3708_6">
                        <div className="flex justify-between" data-oid="qdevtcr">
                            <span className="text-gray-600" data-oid="k-zb9ye">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="k18:9jh">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="11hnwob">
                            <span className="text-gray-600" data-oid="y8-whj1">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="4oyfxcx"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="-qlhxak">
                            <span className="text-gray-600" data-oid="nkh55g2">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="50-m:9n">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="f04ij8m">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="ghdtc0z">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="jfraxrn">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="3cx46yf"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="3.ocdhn"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="mll_cpt"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="jbstcbn">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="qt_ss9c">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
