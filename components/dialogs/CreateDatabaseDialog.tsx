'use client';

import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

interface CreateDatabaseDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateDatabaseDialog({ isOpen, onClose }: CreateDatabaseDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [serverId, setServerId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { createDatabase, servers } = useApp();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || !serverId) return;

        try {
            setIsLoading(true);
            await createDatabase({
                name: name.trim(),
                description: description.trim(),
                serverId: serverId,
            });
            setName('');
            setDescription('');
            setServerId('');
            onClose();
        } catch (error) {
            console.error('Failed to create database:', error);
            // You could add error handling UI here
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setName('');
            setDescription('');
            setServerId('');
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="t61oj33"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid=":cql-5a">
                <h3 className="text-lg font-semibold mb-4" data-oid="mf4tvxb">
                    Create Database
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" data-oid="g.-k0ei">
                    <div data-oid="jmxfhrn">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="grxmiir"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Database name..."
                            disabled={isLoading}
                            required
                            data-oid="-0i.67e"
                        />
                    </div>
                    <div data-oid="qsx0ol.">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="4fqrl95"
                        >
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Database description..."
                            disabled={isLoading}
                            required
                            data-oid="pq442dx"
                        />
                    </div>
                    <div data-oid="26ldled">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="gehrt_2"
                        >
                            Database Server
                        </label>
                        <select
                            value={serverId}
                            onChange={(e) => setServerId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                            required
                            data-oid="709y.ck"
                        >
                            <option value="" data-oid="y_qt.c3">
                                Select a server...
                            </option>
                            {servers.map((server) => (
                                <option key={server.id} value={server.id} data-oid="newtf.:">
                                    {server.name} ({server.type.toLowerCase()}) - {server.host}:
                                    {server.port}
                                </option>
                            ))}
                        </select>
                        {servers.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1" data-oid="c0_uqeb">
                                No servers available. Please configure a server first.
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6" data-oid="k:zdr34">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={isLoading}
                            data-oid="x:ee41j"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading || !name.trim() || !description.trim() || !serverId}
                            data-oid="flnwa01"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
