'use client';

import { ApiKey } from '../../types';

interface ApiKeysViewProps {
    apiKeys: ApiKey[];
    onGenerateApiKey: () => void;
}

export function ApiKeysView({ apiKeys, onGenerateApiKey }: ApiKeysViewProps) {
    return (
        <div className="space-y-6" data-oid="qyn3myd">
            <div className="flex justify-between items-center" data-oid="h25byc7">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="5bso_lo">
                    API Keys
                </h2>
                <button
                    onClick={onGenerateApiKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="2-sj0lj"
                >
                    Generate API Key
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="tmhhgk:"
            >
                <table className="w-full" data-oid="ky2x8vv">
                    <thead className="bg-gray-50" data-oid="lmi1vaj">
                        <tr data-oid="-sr2k00">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="zif7_yk"
                            >
                                Name
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="mhtkznj"
                            >
                                Key
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="uq9ikcp"
                            >
                                Created
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="vgd.:zt"
                            >
                                Last Used
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="nk_ht.a"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="ctixgc8">
                        {apiKeys.map((key) => (
                            <tr key={key.id} data-oid="q4cie98">
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                    data-oid="rqpzqcx"
                                >
                                    {key.name}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono"
                                    data-oid="nyofy6m"
                                >
                                    {key.key}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="o.y_mz3"
                                >
                                    {key.created}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid=":alzb0h"
                                >
                                    {key.lastUsed}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="r9-ycoa"
                                >
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="wt4ed10"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="bxodwex"
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
