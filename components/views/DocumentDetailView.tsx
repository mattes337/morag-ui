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
                    data-oid="vo1fivq"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="-27fjy0"
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
                    data-oid="d:waymw"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="3.yew-9"
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
                    data-oid="coucww0"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="eg5hed9"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="f1yjc1o"
            >
                <div className="text-center" data-oid="yd38_jk">
                    <div className="text-4xl mb-4" data-oid="61a1xw9">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="xhu.9u8">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="sjmd15w">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid=":wfepp-">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="onp_kux">
                <div data-oid="uaav4ak">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="8w8sw8t"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="g7up4vu">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="hnzalvt">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="higsg_q"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="-07s708">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="oldbfc7">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="7u7ujex">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="cu67jku"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="y2gvkh7">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="yucm:9z">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid=".6qxqv:">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="kmmqh2q">
                        <div className="flex justify-between" data-oid="g8_9gs6">
                            <span className="text-gray-600" data-oid=":gbo_5l">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="bb:yxbl">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="78hvwl7">
                            <span className="text-gray-600" data-oid="zfd6.ad">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="40:qr6o">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="6mhjvfq">
                            <span className="text-gray-600" data-oid="73u794u">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="2n47vn4">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="6aooe3s">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="jionp1t">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="3g5i4_7">
                        <div className="flex justify-between" data-oid="q:sa.mg">
                            <span className="text-gray-600" data-oid="vj4nm97">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="tr23hkd">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="oif6c5j">
                            <span className="text-gray-600" data-oid="i9czu6a">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="2pxmw5z"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="7f.e2m1">
                            <span className="text-gray-600" data-oid="488e40g">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="izl7tgy">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="g8jkthx">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="6v_c5_3">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="m56g7yv">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="htt-.ke"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="rjs4t7l"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="m8811h9"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="ol6utm5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="58gfz2:">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
