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
                    data-oid="n__xyt3"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid=":vmkscu"
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
                    data-oid="8mc2u4n"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="dyb9cys"
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
                    data-oid="suw9ezk"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="98z.e-9"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="tl7o9:k"
            >
                <div className="text-center" data-oid="h.7muk0">
                    <div className="text-4xl mb-4" data-oid="pn9f-iy">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="67us7ip">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="ow.6q_h">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="fny9gtf">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="vzx5bty">
                <div data-oid="vnbem5q">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="lxto0m9"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="0h8gna7">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="cr.bu0a">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="fanx-og"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="m:jk1yp">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="38hr3cs">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="0kn-ys8">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="lgct83a"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid=".u014y2">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="oc.w7ny">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="5-cy4j1">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="rvj2e3e">
                        <div className="flex justify-between" data-oid="tfk-a0c">
                            <span className="text-gray-600" data-oid="wi08v0:">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="opg68_f">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="382m.-p">
                            <span className="text-gray-600" data-oid=".76xv_x">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="bm1rif0">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="88bd9uy">
                            <span className="text-gray-600" data-oid="gtgxhb2">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="nt:prdz">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="3jhtga2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="ofov.rk">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="7iff4mn">
                        <div className="flex justify-between" data-oid="46ydcp.">
                            <span className="text-gray-600" data-oid="z_67tzd">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="_4dnbsl">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="fkan:y6">
                            <span className="text-gray-600" data-oid="6-z5y1a">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="58aon7k"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="us5hz:.">
                            <span className="text-gray-600" data-oid="x:gzp4z">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="hctbbh.">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="in_dj9r">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="nuq:889">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="1hitpoo">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="7j._wcs"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="ao_q1_j"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="r.pljpu"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="jv55kdc">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid=".zaeoxw">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
