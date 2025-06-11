'use client';

import { useApp } from '../../contexts/AppContext';
import { DatabaseServer } from '../../types';
import { useState } from 'react';

export function ServersDialog() {
    const { showServersDialog, setShowServersDialog, servers, setServers } = useApp();

    const [editingServer, setEditingServer] = useState<DatabaseServer | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    if (!showServersDialog) return null;

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

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="lldlnrv"
        >
            <div
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                data-oid="7nw.tbx"
            >
                <div className="flex justify-between items-center mb-6" data-oid=".shpd0t">
                    <h2 className="text-xl font-semibold" data-oid="tyfhdg9">
                        Database Servers
                    </h2>
                    <button
                        onClick={() => setShowServersDialog(false)}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="h7izbpg"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="7bgr14-"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="vbwu8::"
                            />
                        </svg>
                    </button>
                </div>

                {!showAddForm && !editingServer && (
                    <>
                        <div className="flex justify-between items-center mb-4" data-oid="s:dofvl">
                            <p className="text-gray-600" data-oid="qd:cswa">
                                Manage your database server connections
                            </p>
                            <button
                                onClick={handleAddServer}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                                data-oid="c339tkn"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    data-oid="9r4erm0"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                        data-oid="fif8mek"
                                    />
                                </svg>
                                <span data-oid="wrbjm42">Add Server</span>
                            </button>
                        </div>

                        <div className="space-y-4" data-oid="d_i3k1q">
                            {servers.map((server) => (
                                <div
                                    key={server.id}
                                    className="border border-gray-200 rounded-lg p-4"
                                    data-oid="mk-zlzr"
                                >
                                    <div
                                        className="flex items-center justify-between"
                                        data-oid=":ep88b."
                                    >
                                        <div
                                            className="flex items-center space-x-3"
                                            data-oid="nm.xqnw"
                                        >
                                            <span className="text-2xl" data-oid="whv5iuq">
                                                {getServerTypeIcon(server.type)}
                                            </span>
                                            <div data-oid="19alre6">
                                                <h3
                                                    className="font-medium text-gray-900"
                                                    data-oid="h7qnrg4"
                                                >
                                                    {server.name}
                                                </h3>
                                                <p
                                                    className="text-sm text-gray-500"
                                                    data-oid="a_7.c7a"
                                                >
                                                    {server.type.toUpperCase()} • {server.host}:
                                                    {server.port}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid=":11u_is"
                                        >
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    server.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                                data-oid="u.y7z_q"
                                            >
                                                {server.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => handleToggleActive(server.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                data-oid="q5yje82"
                                            >
                                                {server.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setEditingServer(server)}
                                                className="text-gray-600 hover:text-gray-800"
                                                data-oid="kdt:9:2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="rwkfcnp"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        data-oid="ihp::uh"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteServer(server.id)}
                                                className="text-red-600 hover:text-red-800"
                                                data-oid="ps5llbe"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="_sm-tvn"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        data-oid="ydhphqk"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    {server.lastConnected && (
                                        <p
                                            className="text-xs text-gray-400 mt-2"
                                            data-oid="fgrk6pd"
                                        >
                                            Last connected:{' '}
                                            {new Date(server.lastConnected).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {(showAddForm || editingServer) && (
                    <ServerForm
                        server={editingServer}
                        onSave={handleSaveServer}
                        onCancel={() => {
                            setEditingServer(null);
                            setShowAddForm(false);
                        }}
                        data-oid="8nc-5yo"
                    />
                )}
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
        <form onSubmit={handleSubmit} className="space-y-4" data-oid="1qjogno">
            <h3 className="text-lg font-medium" data-oid="3.wu88i">
                {server?.id ? 'Edit Server' : 'Add New Server'}
            </h3>

            <div className="grid grid-cols-2 gap-4" data-oid="r0k6g3e">
                <div data-oid="6jsg015">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="slzmzcs"
                    >
                        Server Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        data-oid="08wsarg"
                    />
                </div>

                <div data-oid="_c1ryrg">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="esx3c3r"
                    >
                        Database Type
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-oid="345__it"
                    >
                        <option value="qdrant" data-oid="u2uabsb">
                            Qdrant
                        </option>
                        <option value="neo4j" data-oid="z.hho:d">
                            Neo4j
                        </option>
                        <option value="pinecone" data-oid="c1h:qux">
                            Pinecone
                        </option>
                        <option value="weaviate" data-oid="takav9g">
                            Weaviate
                        </option>
                        <option value="chroma" data-oid="be9cuyg">
                            Chroma
                        </option>
                    </select>
                </div>

                <div data-oid="67yysje">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="fa:zun0"
                    >
                        Host
                    </label>
                    <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        data-oid="ug.osrp"
                    />
                </div>

                <div data-oid="nlmer9_">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="18dfs-z"
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
                        data-oid="0spvjbr"
                    />
                </div>

                {(formData.type === 'neo4j' || formData.type === 'weaviate') && (
                    <>
                        <div data-oid="ghg_066">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-1"
                                data-oid="5db482t"
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
                                data-oid=":7f-4j2"
                            />
                        </div>

                        <div data-oid="rxnb-xs">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-1"
                                data-oid="v-efcqf"
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
                                data-oid="7yhf4l-"
                            />
                        </div>
                    </>
                )}

                {formData.type === 'pinecone' && (
                    <div className="col-span-2" data-oid="koe83un">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="4d-1j1m"
                        >
                            API Key
                        </label>
                        <input
                            type="password"
                            value={formData.apiKey || ''}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="01ij4n9"
                        />
                    </div>
                )}

                {(formData.type === 'qdrant' || formData.type === 'chroma') && (
                    <div data-oid="o16uzey">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="lr31bfa"
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
                            data-oid="4elv17i"
                        />
                    </div>
                )}

                {formData.type === 'neo4j' && (
                    <div data-oid="qda4fc-">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="hq2qg5e"
                        >
                            Database
                        </label>
                        <input
                            type="text"
                            value={formData.database || ''}
                            onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="3235wjp"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4" data-oid="bf7sw:0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    data-oid="yw0jz2b"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    data-oid="w7koy::"
                >
                    {server?.id ? 'Update Server' : 'Add Server'}
                </button>
            </div>
        </form>
    );
}
