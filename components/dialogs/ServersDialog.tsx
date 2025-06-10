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
            data-oid=".wwtq-5"
        >
            <div
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                data-oid="uk6njoy"
            >
                <div className="flex justify-between items-center mb-6" data-oid="yb187e1">
                    <h2 className="text-xl font-semibold" data-oid="7ahksaw">
                        Database Servers
                    </h2>
                    <button
                        onClick={() => setShowServersDialog(false)}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="39-8.ff"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="1qxuqq1"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="jet_16u"
                            />
                        </svg>
                    </button>
                </div>

                {!showAddForm && !editingServer && (
                    <>
                        <div className="flex justify-between items-center mb-4" data-oid="6qkfttw">
                            <p className="text-gray-600" data-oid="3od9ips">
                                Manage your database server connections
                            </p>
                            <button
                                onClick={handleAddServer}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                                data-oid="33g_74c"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    data-oid="a8nyhby"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                        data-oid="o4vzw3e"
                                    />
                                </svg>
                                <span data-oid="ec2b5we">Add Server</span>
                            </button>
                        </div>

                        <div className="space-y-4" data-oid="idtlr7l">
                            {servers.map((server) => (
                                <div
                                    key={server.id}
                                    className="border border-gray-200 rounded-lg p-4"
                                    data-oid="a62zmvg"
                                >
                                    <div
                                        className="flex items-center justify-between"
                                        data-oid="eojx7im"
                                    >
                                        <div
                                            className="flex items-center space-x-3"
                                            data-oid=".qket71"
                                        >
                                            <span className="text-2xl" data-oid="k_60cm4">
                                                {getServerTypeIcon(server.type)}
                                            </span>
                                            <div data-oid="qxfl55e">
                                                <h3
                                                    className="font-medium text-gray-900"
                                                    data-oid=":kdpbno"
                                                >
                                                    {server.name}
                                                </h3>
                                                <p
                                                    className="text-sm text-gray-500"
                                                    data-oid="yhkjns9"
                                                >
                                                    {server.type.toUpperCase()} • {server.host}:
                                                    {server.port}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid="uk2w.g."
                                        >
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    server.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                                data-oid="8ss3cb9"
                                            >
                                                {server.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => handleToggleActive(server.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                data-oid="g3_-t:y"
                                            >
                                                {server.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setEditingServer(server)}
                                                className="text-gray-600 hover:text-gray-800"
                                                data-oid="wc4wa94"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="ggylpc1"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        data-oid=".er1187"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteServer(server.id)}
                                                className="text-red-600 hover:text-red-800"
                                                data-oid="5st0y9z"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="7tp-dyq"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        data-oid="6.4w1j6"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    {server.lastConnected && (
                                        <p
                                            className="text-xs text-gray-400 mt-2"
                                            data-oid="8zu75_n"
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
                        data-oid="nx23d_g"
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
        <form onSubmit={handleSubmit} className="space-y-4" data-oid="ix50gzf">
            <h3 className="text-lg font-medium" data-oid="c-7:iam">
                {server?.id ? 'Edit Server' : 'Add New Server'}
            </h3>

            <div className="grid grid-cols-2 gap-4" data-oid="o6d:t41">
                <div data-oid="9.xm6ue">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="vcav9jy"
                    >
                        Server Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        data-oid="5x:7j01"
                    />
                </div>

                <div data-oid="isnehlu">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="oi2jrg-"
                    >
                        Database Type
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-oid="u8ng:rj"
                    >
                        <option value="qdrant" data-oid="37x-e_-">
                            Qdrant
                        </option>
                        <option value="neo4j" data-oid="e4sbsdl">
                            Neo4j
                        </option>
                        <option value="pinecone" data-oid="9yh7r4m">
                            Pinecone
                        </option>
                        <option value="weaviate" data-oid="exnrizv">
                            Weaviate
                        </option>
                        <option value="chroma" data-oid="lvay5ai">
                            Chroma
                        </option>
                    </select>
                </div>

                <div data-oid="idxz6_2">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="z06gon1"
                    >
                        Host
                    </label>
                    <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        data-oid="2x6zko6"
                    />
                </div>

                <div data-oid="5ufsb2s">
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        data-oid="b0h19in"
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
                        data-oid="07o44w-"
                    />
                </div>

                {(formData.type === 'neo4j' || formData.type === 'weaviate') && (
                    <>
                        <div data-oid="4ttvb_e">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-1"
                                data-oid="0x:22._"
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
                                data-oid="7.duy.i"
                            />
                        </div>

                        <div data-oid="1mqp-2a">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-1"
                                data-oid="dipzzi3"
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
                                data-oid="mb6s.iw"
                            />
                        </div>
                    </>
                )}

                {formData.type === 'pinecone' && (
                    <div className="col-span-2" data-oid="445-o..">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="arhf9ku"
                        >
                            API Key
                        </label>
                        <input
                            type="password"
                            value={formData.apiKey || ''}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="cj58kp1"
                        />
                    </div>
                )}

                {(formData.type === 'qdrant' || formData.type === 'chroma') && (
                    <div data-oid="quk853k">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="9pqnqyp"
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
                            data-oid="vct1ug0"
                        />
                    </div>
                )}

                {formData.type === 'neo4j' && (
                    <div data-oid="yh383iy">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            data-oid="je7956q"
                        >
                            Database
                        </label>
                        <input
                            type="text"
                            value={formData.database || ''}
                            onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="7.kf6h5"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4" data-oid="6s4n_ed">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    data-oid="ipg-i5t"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    data-oid="akgq7mk"
                >
                    {server?.id ? 'Update Server' : 'Add Server'}
                </button>
            </div>
        </form>
    );
}
