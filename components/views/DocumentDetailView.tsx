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
                    data-oid="unfi6q4"
                >
                    <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full"
                        title={`PDF Viewer - ${document.name}`}
                        data-oid="idysib3"
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
                    data-oid="9kwg0ih"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        title={`YouTube Video - ${document.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-oid="ztsul9b"
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
                    data-oid="v54r79k"
                >
                    <iframe
                        src={websiteUrl}
                        className="w-full h-full"
                        title={`Website - ${document.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        data-oid="44whqay"
                    />
                </div>
            );
        }

        // Default fallback for other document types
        return (
            <div
                className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                data-oid="ffp78.o"
            >
                <div className="text-center" data-oid="6.yo:49">
                    <div className="text-4xl mb-4" data-oid="c.moqed">
                        📄
                    </div>
                    <p className="text-gray-600" data-oid="vdamjoc">
                        Preview not available for this document type
                    </p>
                    <p className="text-sm text-gray-500 mt-2" data-oid="_4760jr">
                        Type: {document.type}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" data-oid="m:x2x0b">
            {/* Header */}
            <div className="flex justify-between items-start" data-oid="wz2.2n-">
                <div data-oid="-mp95iv">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                        data-oid="_klf8lv"
                    >
                        ← Back to Documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900" data-oid="6new8c-">
                        {document.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2" data-oid="zs9jcup">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(document.state)}`}
                            data-oid="bs9:sei"
                        >
                            {document.state}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="ffw4j4z">
                            Type: {document.type}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="4as3tt9">
                            Version: v{document.version}
                        </span>
                        <span className="text-sm text-gray-500" data-oid="4qjpj3p">
                            Uploaded: {document.uploadDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3" data-oid="_rf8r67"></div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-oid="t8wsf4y">
                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="zo.f60g">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="3wf9ei4">
                        Processing Stats
                    </h3>
                    <div className="space-y-2" data-oid="eicbezb">
                        <div className="flex justify-between" data-oid="3pkvkgm">
                            <span className="text-gray-600" data-oid="hsladsy">
                                Chunks:
                            </span>
                            <span className="font-medium" data-oid="7ld5rad">
                                {document.chunks}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="_ta8_:4">
                            <span className="text-gray-600" data-oid="56g223x">
                                Quality:
                            </span>
                            <span className="font-medium" data-oid="j_ig447">
                                {(document.quality * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="jy:-31i">
                            <span className="text-gray-600" data-oid="8_9wc-t">
                                Version:
                            </span>
                            <span className="font-medium" data-oid="6lgncyd">
                                v{document.version}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="8vo33wv">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="4.kiq6y">
                        Document Info
                    </h3>
                    <div className="space-y-2" data-oid="w.wipl3">
                        <div className="flex justify-between" data-oid="oyc4dzs">
                            <span className="text-gray-600" data-oid="6eabjmb">
                                Type:
                            </span>
                            <span className="font-medium" data-oid="5jtq33f">
                                {document.type}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="s-1gwk-">
                            <span className="text-gray-600" data-oid="l0asr55">
                                State:
                            </span>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(document.state)}`}
                                data-oid="v54sjd_"
                            >
                                {document.state}
                            </span>
                        </div>
                        <div className="flex justify-between" data-oid="ba7g0zu">
                            <span className="text-gray-600" data-oid="9myhtxr">
                                Uploaded:
                            </span>
                            <span className="font-medium" data-oid="teb789u">
                                {document.uploadDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="giln7fk">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-oid="1w.iqln">
                        Actions
                    </h3>
                    <div className="space-y-2" data-oid="nfnfhi-">
                        <button
                            onClick={handleReingestClick}
                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            disabled={document.state === 'ingesting'}
                            data-oid="fv2bmr5"
                        >
                            🔄 Reingest Document
                        </button>
                        <button
                            onClick={() => onSupersede(document)}
                            className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                            disabled={
                                document.state === 'deprecated' || document.state === 'deleted'
                            }
                            data-oid="3v:351c"
                        >
                            📝 Supersede Version
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            disabled={document.state === 'deleted'}
                            data-oid="c-pg4:t"
                        >
                            🗑️ Delete Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200" data-oid="9bvxl0q">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-oid="n::-ryg">
                    Document Preview
                </h3>
                {renderDocumentEmbed()}
            </div>
        </div>
    );
}
