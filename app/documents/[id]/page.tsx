'use client';

import { DocumentDetailView } from '../../../components/views/DocumentDetailView';
import { useDocumentDetailController } from '../../../lib/controllers/DocumentDetailController';

interface DocumentDetailPageProps {
    params: {
        id: string;
    };
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
    const { state, actions } = useDocumentDetailController(params.id);

    // Debug logging
    console.log('🔍 [DocumentDetailPage] Current state:', {
        isLoading: state.isLoading,
        hasDocument: !!state.document,
        documentId: state.document?.id,
        documentName: state.document?.name,
        error: state.error
    });

    // Loading state
    if (state.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="fl._5qc">
                <div className="text-center" data-oid="-bpnv.j">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                        data-oid="nwa4y2c"
                    ></div>
                    <p className="text-gray-600" data-oid="hlg7gay">
                        Loading document...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (state.error) {
        const isNotFoundError = state.error.includes('404') || state.error.includes('not found');
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="l_hm87s">
                <div className="text-center" data-oid="9_oy9g:">
                    <div className="text-red-500 text-6xl mb-4" data-oid="aqr.t75">
                        {isNotFoundError ? '📄' : '⚠️'}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="rt1tv6.">
                        {isNotFoundError ? 'Document Not Found' : 'Error Loading Document'}
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="23wudt-">
                        {state.error}
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={() => actions.loadDocument()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => actions.handleBack()}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Back to Documents
                        </button>
                    </div>
                    {isNotFoundError && (
                        <p className="text-sm text-gray-500 mt-4" data-oid="nqfo80g">
                            Redirecting automatically in a few seconds...
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Document not found
    if (!state.document) {
        return (
            <div className="flex items-center justify-center min-h-96" data-oid="f9od37k">
                <div className="text-center" data-oid="l2flp.g">
                    <div className="text-gray-400 text-6xl mb-4" data-oid="jyyrdxk">
                        📄
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-oid="u-7r3em">
                        Document Not Found
                    </h2>
                    <p className="text-gray-600 mb-4" data-oid="g0wdbm4">
                        The document you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        onClick={() => actions.handleBack()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        data-oid="0of7ekw"
                    >
                        Back to Documents
                    </button>
                </div>
            </div>
        );
    }

    return (
        <DocumentDetailView
            document={state.document}
            onBack={actions.handleBack}
            onReingest={() => actions.handleReingest()}
            onSupersede={actions.handleSupersede}
            onDelete={() => actions.handleDelete()}
            onDocumentUpdate={actions.handleDocumentUpdate}
            data-oid="1e07g3x"
        />
    );
}
