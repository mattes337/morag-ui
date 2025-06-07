'use client';

import { Database, Document } from '../../types';

interface DocumentsViewProps {
    documents: Document[];
    selectedDatabase: Database | null;
    onBackToDatabases: () => void;
    onAddDocument: () => void;
    onPromptDocument: (document: Document) => void;
}

export function DocumentsView({
    documents,
    selectedDatabase,
    onBackToDatabases,
    onAddDocument,
    onPromptDocument,
}: DocumentsViewProps) {
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

    return (
        <div className="space-y-6" data-oid="-q6u:m-">
            <div className="flex justify-between items-center" data-oid="zahpxry">
                <div data-oid="vxpknjz">
                    <h2 className="text-2xl font-bold text-gray-900" data-oid="ybnwkxf">
                        Documents {selectedDatabase && `- ${selectedDatabase.name}`}
                    </h2>
                    <button
                        onClick={onBackToDatabases}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-oid=".s5myfp"
                    >
                        ← Back to Databases
                    </button>
                </div>
                <button
                    onClick={onAddDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="sfd83po"
                >
                    Add Document
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="ky649ca"
            >
                <table className="w-full" data-oid="hz7l1kj">
                    <thead className="bg-gray-50" data-oid="24:uswp">
                        <tr data-oid="ca61b91">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="r9cdpeb"
                            >
                                Document
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="p0m5ywc"
                            >
                                Type
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="6vnvg:0"
                            >
                                State
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="vb.9-hr"
                            >
                                Version
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="07eql8b"
                            >
                                Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="j8996cd"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="6h3.nmu">
                        {documents.map((doc) => (
                            <tr key={doc.id} data-oid="uqwbpgn">
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="qal5li:">
                                    <div
                                        className="text-sm font-medium text-gray-900"
                                        data-oid="g8y-q79"
                                    >
                                        {doc.name}
                                    </div>
                                    <div className="text-sm text-gray-500" data-oid="fwey-o3">
                                        {doc.uploadDate}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="4gs1ji-"
                                >
                                    {doc.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" data-oid="ti4ezv8">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(doc.state)}`}
                                        data-oid="2w3ytys"
                                    >
                                        {doc.state}
                                    </span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="djwh0fa"
                                >
                                    v{doc.version}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="u7l00:p"
                                >
                                    {doc.chunks} chunks, {(doc.quality * 100).toFixed(0)}% quality
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="icdpht1"
                                >
                                    <button
                                        onClick={() => onPromptDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
                                        data-oid="prompt-doc-btn"
                                    >
                                        Prompt
                                    </button>
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="m3t_3wt"
                                    >
                                        Re-ingest
                                    </button>
                                    <button
                                        className="text-yellow-600 hover:text-yellow-900"
                                        data-oid=":ujm:a-"
                                    >
                                        Supersede
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="lckapmu"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
