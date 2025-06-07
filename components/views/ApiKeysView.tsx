'use client';

import { ApiKey } from '../../types';

interface ApiKeysViewProps {
    apiKeys: ApiKey[];
    onGenerateApiKey: () => void;
}

export function ApiKeysView({ apiKeys, onGenerateApiKey }: ApiKeysViewProps) {
    return (
        <div className="space-y-6" data-oid="oi2znhx">
            <div className="flex justify-between items-center" data-oid="hz79byt">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="ao15aid">
                    API Keys
                </h2>
                <button
                    onClick={onGenerateApiKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="q:r9:mv"
                >
                    Generate API Key
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="by3uwiq"
            >
                <table className="w-full" data-oid="zxum-ss">
                    <thead className="bg-gray-50" data-oid="gc-b._9">
                        <tr data-oid="..6axc4">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="7tk_:7q"
                            >
                                Name
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="68y_geq"
                            >
                                Key
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="v:0h5y9"
                            >
                                Created
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="tu42mfr"
                            >
                                Last Used
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="kswisp1"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="v_.esh1">
                        {apiKeys.map((key) => (
                            <tr key={key.id} data-oid="d0j-4d6">
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                    data-oid="u5bq_jo"
                                >
                                    {key.name}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono"
                                    data-oid="gucl7_t"
                                >
                                    {key.key}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="udd5j0m"
                                >
                                    {key.created}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="_6:qe:s"
                                >
                                    {key.lastUsed}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="5m8wgw9"
                                >
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="jm-b7p:"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="d8i28ly"
                                    >
                                        Revoke
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
