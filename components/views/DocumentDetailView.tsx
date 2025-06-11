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
                    data-oid="v.:dzh-"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="i-wpyf6"
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
                    data-oid="edi3gps"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="ah8t74p"
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
                    data-oid="u5tl9xr"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="6ztnqvt"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="ezej8_j"
            >
                <div className="text-center" data-oid="73bj5xc">
                    <div className="text-4xl mb-4" data-oid="4l3cw.k">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="8k9zo5c">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="9_30o5o">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="xuemh9:">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="z80hsb3">
                <div data-oid=".la._5g">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="bepo7m:"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="3x22tcj">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="l:h8syn">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid=":3lffjh"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="gksjek6">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="y-xh:7x">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="ofg82io">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="fe64s:v"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="4v6bl:5">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="m07ty0x">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="pjml05v">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="wudh6vk">
                        <div className="flex justify-between" data-oid="cl4hpfd">
                            <span className="text-gray-600" data-oid="2dwpggk">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="wltwvdo">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="tuad8c0">
                            <span className="text-gray-600" data-oid="e6zku4z">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="r9u4tob">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="9wrjd5-">
                            <span className="text-gray-600" data-oid=":0dsxf2">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="wfy_4ux">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="qpq06hy">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="35j6hne">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="eckjy0a">
                        <div className="flex justify-between" data-oid="pkw-:l-">
                            <span className="text-gray-600" data-oid="nqqamqj">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="4806.0y">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="te0dd8x">
                            <span className="text-gray-600" data-oid="9h_kvc.">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid=":rqlryg"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="l:nlmr1">
                            <span className="text-gray-600" data-oid="bzj44ix">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="z8v6gkf">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="fc5:qe-">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="_ktnfwm">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="0edy9w:">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="ai5un91"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="7pw6p8-"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="icvlzbt"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="wc4qf-u">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="54usc54">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
