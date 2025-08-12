'use client';

import { useApp } from '../../contexts/AppContext';
import { Server } from '../../types';
import { useState } from 'react';
import { Server, Plus } from 'lucide-react';
import { TestConnectionModal } from '../../components/modals/TestConnectionModal';

export default function ServersPage() {
    const { servers, setServers } = useApp();
    const [editingServer, setEditingServer] = useState<Server | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [testingServer, setTestingServer] = useState<Server | null>(null);
    const [showTestModal, setShowTestModal] = useState(false);

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

    const handleSaveServer = async (server: Server) => {
        try {
            if (server.id) {
                // Update existing server
                const response = await fetch(`/api/servers/${server.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(server),
                });
                if (!response.ok) throw new Error('Failed to update server');

                const updatedServer = await response.json();
                const formattedServer = {
                    ...updatedServer,
                    type: updatedServer.type.toLowerCase(),
                };
                setServers(servers.map((s) => (s.id === server.id ? formattedServer : s)));
            } else {
                // Add new server
                const response = await fetch('/api/servers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: server.name,
                        type: server.type.toUpperCase(),
                        host: server.host,
                        port: server.port,
                        username: server.username,
                        password: server.password,
                        apiKey: server.apiKey,
                        database: server.database,
                        collection: server.collection,
                    }),
                });
                if (!response.ok) throw new Error('Failed to create server');

                const newServer = await response.json();
                const formattedServer = {
                    ...newServer,
                    type: newServer.type.toLowerCase(),
                };
                setServers([...servers, formattedServer]);
            }
            setEditingServer(null);
            setShowAddForm(false);
        } catch (error) {
            console.error('Failed to save server:', error);
            alert('Failed to save server. Please try again.');
        }
    };

    const handleDeleteServer = async (serverId: string) => {
        try {
            const response = await fetch(`/api/servers/${serverId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete server');

            setServers(servers.filter((s) => s.id !== serverId));
        } catch (error) {
            console.error('Failed to delete server:', error);
            alert('Failed to delete server. Please try again.');
        }
    };

    const handleToggleActive = async (serverId: string) => {
        try {
            const server = servers.find((s) => s.id === serverId);
            if (!server) return;

            const response = await fetch(`/api/servers/${serverId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...server, isActive: !server.isActive }),
            });
            if (!response.ok) throw new Error('Failed to update server');

            const updatedServer = await response.json();
            const formattedServer = {
                ...updatedServer,
                type: updatedServer.type.toLowerCase(),
            };
            setServers(servers.map((s) => (s.id === serverId ? formattedServer : s)));
        } catch (error) {
            console.error('Failed to toggle server status:', error);
            alert('Failed to update server status. Please try again.');
        }
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

    const testConnection = async (server: Server) => {
        setTestingServer(server);
        setShowTestModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto" data-oid="-_l1o6q">
            <div className="bg-white shadow rounded-lg" data-oid="jogb929">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="8tomb3j">
                    <div className="flex justify-between items-center" data-oid="8u0lb6f">
                        <div data-oid="_oiuzho">
                            <h1 className="text-2xl font-semibold text-gray-900" data-oid="bm89zv.">
                                Database Servers
                            </h1>
                            <p className="text-gray-600 mt-1" data-oid=".0m2wt:">
                                Manage your database server connections
                            </p>
                        </div>
                        <button
                            onClick={handleAddServer}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                            data-oid="bbxiorz"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                data-oid="2tr_.qf"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                    data-oid="z1dsbsl"
                                />
                            </svg>
                            <span data-oid="-y7ci.u">Add Server</span>
                        </button>
                    </div>
                </div>

                <div className="p-6" data-oid="abe66qq">
                    {!showAddForm && !editingServer && (
                        <div className="space-y-4" data-oid="7sjivjb">
                            {servers.map((server) => (
                                <div
                                    key={server.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    data-oid="s3ifc1l"
                                >
                                    <div
                                        className="flex items-center justify-between"
                                        data-oid="wqpf8ut"
                                    >
                                        <div
                                            className="flex items-center space-x-4"
                                            data-oid="z7n2_gy"
                                        >
                                            <span className="text-3xl" data-oid="zpit5o5">
                                                {getServerTypeIcon(server.type)}
                                            </span>
                                            <div data-oid="38_y9q4">
                                                <h3
                                                    className="font-medium text-gray-900 text-lg"
                                                    data-oid="0s-gw5a"
                                                >
                                                    {server.name}
                                                </h3>
                                                <p
                                                    className="text-sm text-gray-500"
                                                    data-oid="agr4ujo"
                                                >
                                                    {server.type.toUpperCase()} • {server.host}:
                                                    {server.port}
                                                </p>
                                                {server.lastConnected && (
                                                    <p
                                                        className="text-xs text-gray-400 mt-1"
                                                        data-oid="6n4p1ya"
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
                                            data-oid="dq-471y"
                                        >
                                            <span
                                                className={`px-3 py-1 text-sm rounded-full font-medium ${
                                                    server.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                                data-oid="erx-ie4"
                                            >
                                                {server.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => testConnection(server)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                data-oid="d.ld2q3"
                                            >
                                                Test
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(server.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                data-oid="a2:2glc"
                                            >
                                                {server.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setEditingServer(server)}
                                                className="text-gray-600 hover:text-gray-800 p-1"
                                                data-oid="ug09b88"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="8eijtx0"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        data-oid="9r-7ng9"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteServer(server.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                data-oid="q2gbvrm"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="ecuj0.7"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        data-oid="jl5dynu"
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
                                    data-oid="xcda_7s"
                                >
                                    <div
                                        className="bg-gray-100 rounded-full p-6 mb-6"
                                        data-oid=".--osh8"
                                    >
                                        <Server
                                            className="w-16 h-16 text-gray-400"
                                            data-oid="rjijgcf"
                                        />
                                    </div>
                                    <h3
                                        className="text-xl font-semibold text-gray-900 mb-2"
                                        data-oid=":gs06pk"
                                    >
                                        No servers yet
                                    </h3>
                                    <p
                                        className="text-gray-600 text-center mb-8 max-w-md"
                                        data-oid="dub7q:x"
                                    >
                                        Connect to your vector database servers to store and search
                                        through your documents. Configure connections to Qdrant,
                                        Neo4j, Pinecone, Weaviate, or Chroma.
                                    </p>
                                    <button
                                        onClick={handleAddServer}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                        data-oid="7uqum-z"
                                    >
                                        <Plus className="w-5 h-5 mr-2" data-oid="gv.1:3d" />
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
                            data-oid="1fipklc"
                        />
                    )}
                </div>
            </div>
            
            <TestConnectionModal
                isOpen={showTestModal}
                onClose={() => {
                    setShowTestModal(false);
                    setTestingServer(null);
                }}
                server={testingServer}
            />
        </div>
    );
}

interface ServerFormProps {
    server: Server | null;
    onSave: (server: Server) => void;
    onCancel: () => void;
}

function ServerForm({ server, onSave, onCancel }: ServerFormProps) {
    const [formData, setFormData] = useState<Server>(
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
            type: type as Server['type'],
            port: getDefaultPort(type),
        });
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6" data-oid="tothbm:">
            <form onSubmit={handleSubmit} className="space-y-6" data-oid="2qqi_4r">
                <h3 className="text-lg font-medium text-gray-900" data-oid="ol:tuu3">
                    {server?.id ? 'Edit Server' : 'Add New Server'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-oid="kcc8j5r">
                    <div data-oid="ipnrhgk">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="y_9scwr"
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
                            data-oid="5izs9l."
                        />
                    </div>

                    <div data-oid="m:qujft">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="uvaixf2"
                        >
                            Database Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="kd_oeh4"
                        >
                            <option value="qdrant" data-oid="oj8h_76">
                                Qdrant
                            </option>
                            <option value="neo4j" data-oid="x1o88eo">
                                Neo4j
                            </option>
                            <option value="pinecone" data-oid="kv_ockd">
                                Pinecone
                            </option>
                            <option value="weaviate" data-oid=":m12lwm">
                                Weaviate
                            </option>
                            <option value="chroma" data-oid=":rf2sfb">
                                Chroma
                            </option>
                        </select>
                    </div>

                    <div data-oid="8jgq-qb">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="h.912lc"
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
                            data-oid="5v:22em"
                        />
                    </div>

                    <div data-oid="cg_y7j4">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="sofpny."
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
                            data-oid="9wed249"
                        />
                    </div>

                    {(formData.type === 'neo4j' || formData.type === 'weaviate') && (
                        <>
                            <div data-oid="zh2vkfr">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid="4d9p:02"
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
                                    data-oid="96n5j84"
                                />
                            </div>

                            <div data-oid="nw9h_l6">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    data-oid="kdmevdh"
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
                                    data-oid=":7yjqf."
                                />
                            </div>
                        </>
                    )}

                    {formData.type === 'pinecone' && (
                        <div className="md:col-span-2" data-oid="npv27hy">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="2esbszv"
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
                                data-oid="_tatf5x"
                            />
                        </div>
                    )}

                    {(formData.type === 'qdrant' || formData.type === 'chroma') && (
                        <div data-oid="_qv1tcc">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="5pusebt"
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
                                data-oid="jnd0q3."
                            />
                        </div>
                    )}

                    {formData.type === 'neo4j' && (
                        <div data-oid="5psd3-u">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                data-oid="c4xex_x"
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
                                data-oid="wfoj.in"
                            />
                        </div>
                    )}
                </div>

                <div
                    className="flex justify-end space-x-3 pt-4 border-t border-gray-200"
                    data-oid="-zietzh"
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                        data-oid="_sley0b"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="4oengqf"
                    >
                        {server?.id ? 'Update Server' : 'Add Server'}
                    </button>
                </div>
            </form>
        </div>
    );
}
