'use client';

import { useApp } from '../../contexts/AppContext';
import { DatabaseServer } from '../../types';
import { useState } from 'react';

export default function ServersPage() {
    const { servers, setServers } = useApp();
    const [editingServer, setEditingServer] = useState<DatabaseServer | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddServer = () => {
        setEditingServer({
            id: '',
            name: '',
            type: 'qdrant',
            host: 'localhost',
            port: 6333,
            isActive: false,
            createdAt: new Date().toISOString(),
        });
        setShowAddForm(true);
    };

    const handleSaveServer = (server: DatabaseServer) => {
        if (server.id) {
            // Update existing server
            setServers(servers.map((s) => (s.id === server.id ? server : s)));
        } else {
            // Add new server
            const newServer = {
                ...server,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            setServers([...servers, newServer]);
        }
        setEditingServer(null);
        setShowAddForm(false);
    };

    const handleDeleteServer = (serverId: string) => {
        setServers(servers.filter((s) => s.id !== serverId));
    };

    const handleToggleActive = (serverId: string) => {
        setServers(servers.map((s) => (s.id === serverId ? { ...s, isActive: !s.isActive } : s)));
    };

    const getServerTypeIcon = (type: string) => {
        switch (type) {
            case 'qdrant':
                return '🔍';
            case 'neo4j':
                return '🕸️';
            case 'pinecone':
                return '🌲';
            case 'weaviate':
                return '🧠';
            case 'chroma':
                return '🎨';
            default:
                return '💾';
        }
    };

    const testConnection = async (server: DatabaseServer) => {
        // Dummy connection test
        alert(`Testing connection to ${server.name}... Connection successful!`);
    };

    return (
        <div className="max-w-6xl mx-auto" data-oid="5n8o:3d">
            <div className="bg-white shadow rounded-lg" data-oid="0.m82m9">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="ta2kwsm">
                    <div className="flex justify-between items-center" data-oid="popj21n">
                        <div data-oid="qxzbnfz">
                            <h1 className="text-2xl font-semibold text-gray-900" data-oid="2bf6htd">
                                Database Servers
                            </h1>
                            <p className="text-gray-600 mt-1" data-oid="ioczm96">
                                Manage your database server connections
                            </p>
                        </div>
                        <button
                            onClick={handleAddServer}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                            data-oid="kxa7nnm"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                data-oid="5a0r:2_"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                    data-oid="zcii7vl"
                                />
                            </svg>
                            <span data-oid="i2v6sjx">Add Server</span>
                        </button>
                    </div>
                </div>

                <div className="p-6" data-oid="t64doay">
                    {!showAddForm && !editingServer && (
                        <div className="space-y-4" data-oid="lct0bhf">
                            {servers.map((server) => (
                                <div
                                    key={server.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    data-oid="xv7stev"
                                >
                                    <div
                                        className="flex items-center justify-between"
                                        data-oid="x-3ondl"
                                    >
                                        <div
                                            className="flex items-center space-x-4"
                                            data-oid="q03xqiq"
                                        >
                                            <span className="text-3xl" data-oid="ka:n4mn">
                                                {getServerTypeIcon(server.type)}
                                            </span>
                                            <div data-oid="kde5pzx">
                                                <h3
                                                    className="font-medium text-gray-900 text-lg"
                                                    data-oid="71ajhdc"
                                                >
                                                    {server.name}
                                                </h3>
                                                <p
                                                    className="text-sm text-gray-500"
                                                    data-oid="cr7_ok6"
                                                >
                                                    {server.type.toUpperCase()} • {server.host}:
                                                    {server.port}
                                                </p>
                                                {server.lastConnected && (
                                                    <p
                                                        className="text-xs text-gray-400 mt-1"
                                                        data-oid="p86g2tk"
                                                    >
                                                        Last connected:{' '}
                                                        {new Date(
                                                            server.lastConnected,
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center space-x-3"
                                            data-oid="5p_::y3"
                                        >
                                            <span
                                                className={`px-3 py-1 text-sm rounded-full font-medium ${
                                                    server.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                                data-oid="txyu1nt"
                                            >
                                                {server.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => testConnection(server)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                data-oid="yc9sij."
                                            >
                                                Test
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(server.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                data-oid="mijua6m"
                                            >
                                                {server.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setEditingServer(server)}
                                                className="text-gray-600 hover:text-gray-800 p-1"
                                                data-oid="f:.u8d0"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="fq_zrm:"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        data-oid="2g2-86k"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteServer(server.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                data-oid="6a-q6dn"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="59u4rr0"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        data-oid="sa6cun0"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {servers.length === 0 && (
                                <div className="text-center py-12" data-oid="3vzflgt">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        data-oid="7v7-2bb"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                            data-oid="f07.aqi"
                                        />
                                    </svg>
                                    <h3
                                        className="mt-2 text-sm font-medium text-gray-900"
                                        data-oid="v4clfjq"
                                    >
                                        No servers configured
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500" data-oid="2a5rlp-">
                                        Get started by adding your first database server.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {(showAddForm || editingServer) && (
                        <ServerForm
                            server={editingServer}
                            onSave={handleSaveServer}
                            onCancel={() => {
                                setEditingServer(null);
                                setShowAddForm(false);
                            }}
                            data-oid="h7-1nqy"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

interface ServerFormProps {
    server: DatabaseServer | null;
    onSave: (server: DatabaseServer) => void;
    onCancel: () => void;
}

function ServerForm({ server, onSave, onCancel }: ServerFormProps) {
    const [formData, setFormData] = useState<DatabaseServer>(
        server || {
            id: '',
            name: '',
            type: 'qdrant',
            host: 'localhost',
            port: 6333,
            isActive: false,
            createdAt: new Date().toISOString(),
        },
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const getDefaultPort = (type: string) => {
        switch (type) {
            case 'qdrant':
                return 6333;
            case 'neo4j':
                return 7687;
            case 'pinecone':
                return 443;
            case 'weaviate':
                return 8080;
            case 'chroma':
                return 8000;
            default:
                return 8080;
        }
    };

    const handleTypeChange = (type: string) => {
        setFormData({
            ...formData,
            type: type as DatabaseServer['type'],
            port: getDefaultPort(type),
        });
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6" data-oid="up5ezlj">
            <form onSubmit={handleSubmit} className="space-y-6" data-oid="j_96he2">
                <h3 className="text-lg font-medium text-gray-900" data-oid="8kvsvij">
                    {server?.id ? 'Edit Server' : 'Add New Server'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-oid="ihlf:8u">
                    <div data-oid="x34uegm">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="xlx70n:"
                        >
                            Server Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="My Database Server"
                            data-oid="mkkf1z."
                        />
                    </div>

                    <div data-oid="g5rv4k8">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="i6ofla:"
                        >
                            Database Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="s0un17e"
                        >
                            <option value="qdrant" data-oid="jlml7ue">
                                Qdrant
                            </option>
                            <option value="neo4j" data-oid="yu5sqed">
                                Neo4j
                            </option>
                            <option value="pinecone" data-oid="_n01nx8">
                                Pinecone
                            </option>
                            <option value="weaviate" data-oid="a3q.th_">
                                Weaviate
                            </option>
                            <option value="chroma" data-oid="zos2ly0">
                                Chroma
                            </option>
                        </select>
                    </div>

                    <div data-oid="z-4x59l">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="9irf3ry"
                        >
                            Host
                        </label>
                        <input
                            type="text"
                            value={formData.host}
                            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="localhost"
                            data-oid="hw3sgvq"
                        />
                    </div>

                    <div data-oid="bqwyv2u">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="q7ny8er"
                        >
                            Port
                        </label>
                        <input
                            type="number"
                            value={formData.port}
                            onChange={(e) =>
                                setFormData({ ...formData, port: parseInt(e.target.value) })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            data-oid="u2upjg."
                        />
                    </div>

                    {(formData.type === 'neo4j' || formData.type === 'weaviate') && (
                        <>
                            <div data-oid="b6vipew">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid="8di7byn"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={formData.username || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="26zo8j."
                                />
                            </div>

                            <div data-oid="n3ls-5t">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid="mbyo10w"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.password || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="t4w0vxk"
                                />
                            </div>
                        </>
                    )}

                    {formData.type === 'pinecone' && (
                        <div className="md:col-span-2" data-oid="gpapy.q">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="siqhdjf"
                            >
                                API Key
                            </label>
                            <input
                                type="password"
                                value={formData.apiKey || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, apiKey: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                data-oid="t1lutgq"
                            />
                        </div>
                    )}

                    {(formData.type === 'qdrant' || formData.type === 'chroma') && (
                        <div data-oid="-8g495c">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="vbiz2yk"
                            >
                                Collection
                            </label>
                            <input
                                type="text"
                                value={formData.collection || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, collection: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                data-oid="dybei9t"
                            />
                        </div>
                    )}

                    {formData.type === 'neo4j' && (
                        <div data-oid="vv5owyj">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="k87.upn"
                            >
                                Database
                            </label>
                            <input
                                type="text"
                                value={formData.database || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, database: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                data-oid="wwv-0yc"
                            />
                        </div>
                    )}
                </div>

                <div
                    className="flex justify-end space-x-3 pt-4 border-t border-gray-200"
                    data-oid="d:plkf0"
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                        data-oid="z1bz66h"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="hho_j5n"
                    >
                        {server?.id ? 'Update Server' : 'Add Server'}
                    </button>
                </div>
            </form>
        </div>
    );
}
