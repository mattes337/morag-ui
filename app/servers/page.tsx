'use client';

import { useApp } from '../../contexts/AppContext';
import { DatabaseServer } from '../../types';
import { useState } from 'react';
import { Server, Plus } from 'lucide-react';

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
        <div className="max-w-6xl mx-auto" data-oid="ngib3uz">
            <div className="bg-white shadow rounded-lg" data-oid="mqz6s_d">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="ds0tegn">
                    <div className="flex justify-between items-center" data-oid="3j2cl51">
                        <div data-oid="1cu_nb0">
                            <h1 className="text-2xl font-semibold text-gray-900" data-oid="b_vwfzd">
                                Database Servers
                            </h1>
                            <p className="text-gray-600 mt-1" data-oid="uq2z5_s">
                                Manage your database server connections
                            </p>
                        </div>
                        <button
                            onClick={handleAddServer}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                            data-oid="2t0g.fl"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                data-oid="yhu.g3k"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                    data-oid="l71gvjo"
                                />
                            </svg>
                            <span data-oid="6hy4644">Add Server</span>
                        </button>
                    </div>
                </div>

                <div className="p-6" data-oid="73.o_ks">
                    {!showAddForm && !editingServer && (
                        <div className="space-y-4" data-oid="ck:ylvn">
                            {servers.map((server) => (
                                <div
                                    key={server.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    data-oid="0do.8x:"
                                >
                                    <div
                                        className="flex items-center justify-between"
                                        data-oid="9ojd0pd"
                                    >
                                        <div
                                            className="flex items-center space-x-4"
                                            data-oid="f:jc5yp"
                                        >
                                            <span className="text-3xl" data-oid="q539y5c">
                                                {getServerTypeIcon(server.type)}
                                            </span>
                                            <div data-oid="fluizsi">
                                                <h3
                                                    className="font-medium text-gray-900 text-lg"
                                                    data-oid="zwd3x64"
                                                >
                                                    {server.name}
                                                </h3>
                                                <p
                                                    className="text-sm text-gray-500"
                                                    data-oid="dei1n4z"
                                                >
                                                    {server.type.toUpperCase()} • {server.host}:
                                                    {server.port}
                                                </p>
                                                {server.lastConnected && (
                                                    <p
                                                        className="text-xs text-gray-400 mt-1"
                                                        data-oid="s08ryac"
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
                                            data-oid="zi2nyx1"
                                        >
                                            <span
                                                className={`px-3 py-1 text-sm rounded-full font-medium ${
                                                    server.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                                data-oid="u_nkdvo"
                                            >
                                                {server.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => testConnection(server)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                data-oid="weuq31s"
                                            >
                                                Test
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(server.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                data-oid="btt4wja"
                                            >
                                                {server.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setEditingServer(server)}
                                                className="text-gray-600 hover:text-gray-800 p-1"
                                                data-oid="c62237l"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="a:uird1"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        data-oid="fs7xk9:"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteServer(server.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                data-oid="g7:lmmz"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="f721_4u"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        data-oid="sf3_19e"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {servers.length === 0 && (
                                <div
                                    className="flex flex-col items-center justify-center py-16 px-4"
                                    data-oid="servers-empty-state"
                                >
                                    <div
                                        className="bg-gray-100 rounded-full p-6 mb-6"
                                        data-oid="servers-icon-container"
                                    >
                                        <Server
                                            className="w-16 h-16 text-gray-400"
                                            data-oid="servers-icon"
                                        />
                                    </div>
                                    <h3
                                        className="text-xl font-semibold text-gray-900 mb-2"
                                        data-oid="servers-empty-title"
                                    >
                                        No servers yet
                                    </h3>
                                    <p
                                        className="text-gray-600 text-center mb-8 max-w-md"
                                        data-oid="servers-empty-description"
                                    >
                                        Connect to your vector database servers to store and search
                                        through your documents. Configure connections to Qdrant,
                                        Neo4j, Pinecone, Weaviate, or Chroma.
                                    </p>
                                    <button
                                        onClick={handleAddServer}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                        data-oid="servers-add-button"
                                    >
                                        <Plus
                                            className="w-5 h-5 mr-2"
                                            data-oid="servers-plus-icon"
                                        />
                                        Add Your First Server
                                    </button>
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
                            data-oid="c8uh66z"
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
        <div className="bg-gray-50 rounded-lg p-6" data-oid="1xij9o1">
            <form onSubmit={handleSubmit} className="space-y-6" data-oid="9kk:6y9">
                <h3 className="text-lg font-medium text-gray-900" data-oid="cj1tv8y">
                    {server?.id ? 'Edit Server' : 'Add New Server'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-oid="xp-.r-m">
                    <div data-oid="jzzfb:1">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="2mkbpvi"
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
                            data-oid="g3qh4da"
                        />
                    </div>

                    <div data-oid="__p8hxv">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="2_9h2uv"
                        >
                            Database Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="de2jb2_"
                        >
                            <option value="qdrant" data-oid="18qcsf5">
                                Qdrant
                            </option>
                            <option value="neo4j" data-oid="303iqco">
                                Neo4j
                            </option>
                            <option value="pinecone" data-oid="stcahbv">
                                Pinecone
                            </option>
                            <option value="weaviate" data-oid="hilktiz">
                                Weaviate
                            </option>
                            <option value="chroma" data-oid="4.kxsgu">
                                Chroma
                            </option>
                        </select>
                    </div>

                    <div data-oid="n1k9mjd">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="m71_nn6"
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
                            data-oid="ybg-vpk"
                        />
                    </div>

                    <div data-oid="tou5pol">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="g_jafyo"
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
                            data-oid="7j.n6d4"
                        />
                    </div>

                    {(formData.type === 'neo4j' || formData.type === 'weaviate') && (
                        <>
                            <div data-oid="bzfx1zh">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid="sqf.mvu"
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
                                    data-oid="47fww5f"
                                />
                            </div>

                            <div data-oid="kcc5ed_">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid=".u_15z3"
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
                                    data-oid="6ngixwa"
                                />
                            </div>
                        </>
                    )}

                    {formData.type === 'pinecone' && (
                        <div className="md:col-span-2" data-oid="phybha.">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="f896:je"
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
                                data-oid="lti6jpg"
                            />
                        </div>
                    )}

                    {(formData.type === 'qdrant' || formData.type === 'chroma') && (
                        <div data-oid="_8n_psn">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="uw02m:z"
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
                                data-oid="j3vbu3n"
                            />
                        </div>
                    )}

                    {formData.type === 'neo4j' && (
                        <div data-oid="jooea:z">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="rli.mdt"
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
                                data-oid="jf:j06c"
                            />
                        </div>
                    )}
                </div>

                <div
                    className="flex justify-end space-x-3 pt-4 border-t border-gray-200"
                    data-oid="94f.i8:"
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                        data-oid="0at9otp"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="s-wz_ot"
                    >
                        {server?.id ? 'Update Server' : 'Add Server'}
                    </button>
                </div>
            </form>
        </div>
    );
}
