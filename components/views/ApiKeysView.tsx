'use client';

import { ApiKey } from '../../types';
import { Key, Plus } from 'lucide-react';

interface ApiKeysViewProps {
    apiKeys: ApiKey[];
    onGenerateApiKey: () => void;
}

export function ApiKeysView({ apiKeys, onGenerateApiKey }: ApiKeysViewProps) {
    // Show empty state when no API keys exist
    if (apiKeys.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center py-16 px-4"
                data-oid="apikeys-empty-state"
            >
                <div
                    className="bg-gray-100 rounded-full p-6 mb-6"
                    data-oid="apikeys-icon-container"
                >
                    <Key className="w-16 h-16 text-gray-400" data-oid="apikeys-icon" />
                </div>
                <h3
                    className="text-xl font-semibold text-gray-900 mb-2"
                    data-oid="apikeys-empty-title"
                >
                    No API keys yet
                </h3>
                <p
                    className="text-gray-600 text-center mb-8 max-w-md"
                    data-oid="apikeys-empty-description"
                >
                    Generate API keys to access your databases and documents programmatically. API
                    keys provide secure authentication for external applications and integrations.
                </p>
                <button
                    onClick={onGenerateApiKey}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    data-oid="apikeys-generate-button"
                >
                    <Plus className="w-5 h-5 mr-2" data-oid="apikeys-plus-icon" />
                    Generate Your First API Key
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-oid="gybu0-o">
            <div className="flex justify-between items-center" data-oid=".b__t_j">
                <h2 className="text-2xl font-bold text-gray-900" data-oid="_vokcy5">
                    API Keys
                </h2>
                <button
                    onClick={onGenerateApiKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    data-oid="mtxd4j7"
                >
                    Generate API Key
                </button>
            </div>

            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                data-oid="x6kz18h"
            >
                <table className="w-full" data-oid="vp.73xq">
                    <thead className="bg-gray-50" data-oid="brmjm.d">
                        <tr data-oid="1561y8y">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="q:z10cu"
                            >
                                Name
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="n_s.7ad"
                            >
                                Key
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="hc2x6j5"
                            >
                                Created
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="oy.m-7o"
                            >
                                Last Used
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                data-oid="ri:u0eg"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-oid="7:a-nov">
                        {apiKeys.map((key) => (
                            <tr key={key.id} data-oid="o4hw-29">
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                    data-oid=":kobtnl"
                                >
                                    {key.name}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono"
                                    data-oid="2xi5df2"
                                >
                                    {key.key}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="aq8ud55"
                                >
                                    {key.created}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    data-oid="jhnmtsj"
                                >
                                    {key.lastUsed}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                    data-oid="c5l36:1"
                                >
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        data-oid="cgeqzm:"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        data-oid="kf4qdaj"
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
