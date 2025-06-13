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
            data-oid="g81.._j"
        >
            <div
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                data-oid="gnm0:dj"
            >
                <div className="flex justify-between items-center mb-6" data-oid="8ohv2iq">
                    <h2 className="text-xl font-semibold" data-oid="8px2::3">
                        Database Servers
                    </h2>
                    <button
                        onClick={() => setShowServersDialog(false)}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="yk83bxq"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="ecrihe3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="2t_-6is"
                            />
                        </svg>
                    </button>
                </div>

                {!showAddForm && !editingServer && (
                    <>
                        <div className="flex justify-between items-center mb-4" data-oid="tkmu88-">
                            <p className="text-gray-600" data-oid="zov228e">
                                Manage your database server connections
                            </p>
                            <button
                                onClick={handleAddServer}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                                data-oid="m:v1pje"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    data-oid="_3f7li6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                        data-oid="7.oxa:-"
                                    />
                                </svg>
                                <span data-oid="sj3zqcz">Add Server</span>
                            </button>
                        </div>

                        <div className="space-y-4" data-oid=".75axs7">
                            {servers.map((server) => (
                                <div
                                    key={server.id}
                                    className="border border-gray-200 rounded-lg p-4"
                                    data-oid="g9hlyuy"
                                >
                                    <div
                                        className="flex items-center justify-between"
                                        data-oid="q.89_:o"
                                    >
                                        <div
                                            className="flex items-center space-x-3"
                                            data-oid="bh13hzq"
                                        >
                                            <span className="text-2xl" data-oid="cqqx23c">
                                                {getServerTypeIcon(server.type)}
                                            </span>
                                            <div data-oid="6jwijeq">
                                                <h3
                                                    className="font-medium text-gray-900"
                                                    data-oid="ak5-:x-"
                                                >
                                                    {server.name}
                                                </h3>
                                                <p
                                                    className="text-sm text-gray-500"
                                                    data-oid="61jwfgv"
                                                >
                                                    {server.type.toUpperCase()} • {server.host}:
                                                    {server.port}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid="2ijzbv_"
                                        >
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    server.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                                data-oid="gsuoj1f"
                                            >
                                                {server.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => handleToggleActive(server.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                data-oid="xk:zr0r"
                                            >
                                                {server.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setEditingServer(server)}
                                                className="text-gray-600 hover:text-gray-800"
                                                data-oid="2wz8drb"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="wlivg2r"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        data-oid="iapxz7k"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteServer(server.id)}
                                                className="text-red-600 hover:text-red-800"
                                                data-oid="kfh1s_z"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="97w0jq9"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        data-oid="-8o7n86"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    {server.lastConnected && (
                                        <p
                                            className="text-xs text-gray-400 mt-2"
                                            data-oid="cy1k84_"
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
                        data-oid="x0tf_8g"
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
        <form onSubmit={handleSubmit} className="space-y-4" data-oid="4.w3wyl">
            <h3 className="text-lg font-medium" data-oid="jgiy7un">
                {server?.id ? 'Edit Server' : 'Add New Server'}
            </h3>

            <div className="grid grid-cols-2 gap-4" data-oid="fk7q061">
                <div data-oid="yyt5y0-">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="--byugk"
                    >
                        Server Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        data-oid="50exe55"
                    />
                </div>

                <div data-oid="kw:c7oy">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="-qox0cp"
                    >
                        Database Type
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-oid="wc6:ki7"
                    >
                        <option value="qdrant" data-oid="ff1190-">
                            Qdrant
                        </option>
                        <option value="neo4j" data-oid="_hbt6qg">
                            Neo4j
                        </option>
                        <option value="pinecone" data-oid="8x431zh">
                            Pinecone
                        </option>
                        <option value="weaviate" data-oid="g7496zr">
                            Weaviate
                        </option>
                        <option value="chroma" data-oid="5uxg.yx">
                            Chroma
                        </option>
                    </select>
                </div>

                <div data-oid="j1h45sy">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid=".9d168y"
                    >
                        Host
                    </label>
                    <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        data-oid="15fl.2o"
                    />
                </div>

                <div data-oid="x7-mih4">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="9s2lpb6"
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
                        data-oid="og4p2:5"
                    />
                </div>

                {(formData.type === 'neo4j' || formData.type === 'weaviate') && (
                    <>
                        <div data-oid="1o4atxh">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-1"
                                data-oid="i-g5a-r"
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
                                data-oid="r2okzz2"
                            />
                        </div>

                        <div data-oid="mu4gn4:">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-1"
                                data-oid="cnjh4sv"
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
                                data-oid="yqfnoij"
                            />
                        </div>
                    </>
                )}

                {formData.type === 'pinecone' && (
                    <div className="col-span-2" data-oid="nycngzw">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="kly00h3"
                        >
                            API Key
                        </label>
                        <input
                            type="password"
                            value={formData.apiKey || ''}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid=":5snp_v"
                        />
                    </div>
                )}

                {(formData.type === 'qdrant' || formData.type === 'chroma') && (
                    <div data-oid="yyg16ma">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="bnlplqn"
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
                            data-oid="_.0fpd2"
                        />
                    </div>
                )}

                {formData.type === 'neo4j' && (
                    <div data-oid="_tpz2p7">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="xcysx1a"
                        >
                            Database
                        </label>
                        <input
                            type="text"
                            value={formData.database || ''}
                            onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="9spwgle"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4" data-oid="29vr.83">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    data-oid="mf2drwq"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    data-oid=".isju29"
                >
                    {server?.id ? 'Update Server' : 'Add Server'}
                </button>
            </div>
        </form>
    );
}
