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
            data-oid="ky:4ddq"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="37iirx3">
                <h3 className="text-lg font-semibold mb-4" data-oid=":t.z8k5">
                    Create Database
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" data-oid="du6a.7y">
                    <div data-oid="pfm3ekm">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="_3aeyi-"
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
                            data-oid="6tkbk60"
                        />
                    </div>
                    <div data-oid="18t3c:l">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="844bxxd"
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
                            data-oid="im5977f"
                        />
                    </div>
                    <div data-oid="gk9k33i">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="1rnhyp4"
                        >
                            Database Server
                        </label>
                        <select
                            value={serverId}
                            onChange={(e) => setServerId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                            required
                            data-oid="yrpug9n"
                        >
                            <option value="" data-oid="bthr462">
                                Select a server...
                            </option>
                            {servers.map((server) => (
                                <option key={server.id} value={server.id} data-oid="so3czmu">
                                    {server.name} ({server.type.toLowerCase()}) - {server.host}:
                                    {server.port}
                                </option>
                            ))}
                        </select>
                        {servers.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1" data-oid="m99rxff">
                                No servers available. Please configure a server first.
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6" data-oid="q8y_oo8">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={isLoading}
                            data-oid="._-tej1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading || !name.trim() || !description.trim() || !serverId}
                            data-oid="09cbvvh"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
