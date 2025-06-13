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
            data-oid=":l8za9r"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="rbrpt8s">
                <h3 className="text-lg font-semibold mb-4" data-oid="a59-1_t">
                    Create Database
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" data-oid="1vsfprh">
                    <div data-oid="0d5afe8">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="qj-qpz0"
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
                            data-oid="v5cdebr"
                        />
                    </div>
                    <div data-oid="4mqda0_">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="dzmj914"
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
                            data-oid="hm90pi6"
                        />
                    </div>
                    <div data-oid="dwz1dbm">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="gbx.c5:"
                        >
                            Database Server
                        </label>
                        <select
                            value={serverId}
                            onChange={(e) => setServerId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                            required
                            data-oid="ryt_m7r"
                        >
                            <option value="" data-oid="h1kno5g">
                                Select a server...
                            </option>
                            {servers.map((server) => (
                                <option key={server.id} value={server.id} data-oid="uvkxi8r">
                                    {server.name} ({server.type.toLowerCase()}) - {server.host}:
                                    {server.port}
                                </option>
                            ))}
                        </select>
                        {servers.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1" data-oid=".z9qifx">
                                No servers available. Please configure a server first.
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6" data-oid="-dimg6m">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={isLoading}
                            data-oid="1dmo-5u"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading || !name.trim() || !description.trim() || !serverId}
                            data-oid="og220ji"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
