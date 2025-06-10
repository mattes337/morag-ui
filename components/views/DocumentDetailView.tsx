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
                    data-oid="4lipja:"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="gmryuwl"
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
                    data-oid="4gb38pz"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="4v05h-i"
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
                    data-oid="x8k-ef."
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="w_nefar"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="pnxj0jp"
            >
                <div className="text-center" data-oid="o:_v-vy">
                    <div className="text-4xl mb-4" data-oid="3evcbpx">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="reuwel3">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="vhcdzyd">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="0xzs2_v">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="7pt-gg8">
                <div data-oid="fcc1qd0">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="3sso5g1"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="76hacys">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="pvi:8u2">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="4utozfu"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="n2..5a3">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="6-3rzs2">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="migcgwc">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="p0h9xa2"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="nlcu2zf">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="b8uen65">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="5z.8wg8">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid=".dur48e">
                        <div className="flex justify-between" data-oid="nie77qx">
                            <span className="text-gray-600" data-oid="h_u-xed">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="it.h..j">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="_97ztxg">
                            <span className="text-gray-600" data-oid="-bbzgf1">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="_vvgo69">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="yo238lk">
                            <span className="text-gray-600" data-oid="omez.nh">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="x5tnb-1">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="62sr8rc">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="6e-qrcf">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="skuffia">
                        <div className="flex justify-between" data-oid="jdd36rs">
                            <span className="text-gray-600" data-oid="z79d3wy">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="q82vtc_">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="98cqf6h">
                            <span className="text-gray-600" data-oid="37-ngmr">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="pec_vk."
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid=":.zucva">
                            <span className="text-gray-600" data-oid="r6saadj">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid=".fd8zb4">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="_m6cgr1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="3tyf15w">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="x3:e29.">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="ab.z1:z"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="ikw:ncn"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="u1z.w30"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="38ow.u_">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="x2a-js9">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
