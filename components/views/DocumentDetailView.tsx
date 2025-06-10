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
                    data-oid="u-b7w78"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="_j.jcb7"
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
                    data-oid="16f:of."
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="opa7k36"
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
                    data-oid="6wywkql"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="efit-rg"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="8kp5t12"
            >
                <div className="text-center" data-oid="r9c018l">
                    <div className="text-4xl mb-4" data-oid="j:v47:u">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="creqpa3">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="d1l1z_h">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="ktclldx">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="0ycnrr9">
                <div data-oid="kc6u6qo">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="bbw7:p8"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="c_.d4o8">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="5rftjud">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="zh4-1:w"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="nmwnbgm">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="oe_x:kl">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="0uy-zeq">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="en7zxws"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="hll7_zb">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="z2ygpmi">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="kiixzq8">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="qtlgf2a">
                        <div className="flex justify-between" data-oid="13:s1v3">
                            <span className="text-gray-600" data-oid="0t7io_3">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="6tst207">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="elkulqs">
                            <span className="text-gray-600" data-oid="lhnt4s:">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="7ebe-63">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="2yuux6p">
                            <span className="text-gray-600" data-oid="bw:q1vu">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="9:9du77">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="st00.zq">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="dr5.15j">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="dlj_fuq">
                        <div className="flex justify-between" data-oid="6bfrc:n">
                            <span className="text-gray-600" data-oid="py1yfbk">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="vnn_3.o">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="u5ugb2n">
                            <span className="text-gray-600" data-oid="8.o4jcs">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="dxv.go2"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="70qppn2">
                            <span className="text-gray-600" data-oid="9pgt:fc">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid=":.v7k:d">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="a544yhf">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="wy5nnz4">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="iihi6dc">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="_trvd68"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid=".jq1dhx"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="y3-llt2"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="4pwrl.-">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="wx1wp9u">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
