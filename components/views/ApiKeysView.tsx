'use client';

import { ApiKey } from '../../types';

interface ApiKeysViewProps {
    apiKeys: ApiKey[];
    onGenerateApiKey: () => void;
}

export function ApiKeysView({ apiKeys, onGenerateApiKey }: ApiKeysViewProps) {
    return (
        <div className="space-y-6" data-oid="fs::.s_">
            <div className="flex justify-between items-center" data-oid="wq6:-z1">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="vbdr.k_">
                    API Keys
                </h2>
                <button
                    onClick={onGenerateApiKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="qfecrq6"
                >
                    Generate API Key
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="2bn2m4f"
            >
                <table className="w-full" data-oid="1:9ij-o">
                    <thead className="bg-gray-50" data-oid="p70kwal">
                        <tr data-oid=".k_pdmv">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="3nuwiiw"
                            >
                                Name
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="9797k7s"
                            >
                                Key
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="qilj37f"
                            >
                                Created
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="bi4yuxz"
                            >
                                Last Used
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="jlbp_pu"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="z4fcu3c">
                        {apiKeys.map((key) => (
                            <tr key={key.id} data-oid="-q-3v_x">
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                    data-oid="prdgfb9"
                                >
                                    {key.name}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono"
                                    data-oid="76p6tg5"
                                >
                                    {key.key}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="t9jbr06"
                                >
                                    {key.created}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="7w3nv1x"
                                >
                                    {key.lastUsed}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="s7pnbao"
                                >
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="pj17fl1"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="h3d.dox"
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
