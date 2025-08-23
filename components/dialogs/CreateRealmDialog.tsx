'use client';

import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

interface CreateRealmDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateRealmDialog({ isOpen, onClose }: CreateRealmDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [ingestionPrompt, setIngestionPrompt] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { servers } = useApp();
    // Note: createDatabase functionality moved to realm-level configuration

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || selectedServerIds.length === 0) return;

        try {
            setIsLoading(true);

            // Create realm with database configuration
            const response = await fetch('/api/realms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    serverIds: selectedServerIds,
                    prompts: {
                        ingestion: ingestionPrompt.trim() || undefined,
                        system: systemPrompt.trim() || undefined,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create realm');
            }

            const result = await response.json();
            console.log('Realm created successfully:', result);

            // Reset form
            setName('');
            setDescription('');
            setIngestionPrompt('');
            setSystemPrompt('');
            setSelectedServerIds([]);
            onClose();

            // Trigger a refresh of the parent component if needed
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('realm-created', { detail: result }));
            }
        } catch (error) {
            console.error('Failed to create realm:', error);
            // Show error to user - you could integrate with a toast service here
            alert(`Failed to create realm: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setName('');
            setDescription('');
            setIngestionPrompt('');
            setSystemPrompt('');
            setSelectedServerIds([]);
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="gzf19--"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="4coo.5w">
                <h3 className="text-lg font-semibold mb-4" data-oid="v8b.hl0">
                    Create Database
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" data-oid="01gm9x0">
                    <div data-oid="ei6zpgj">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="c2tut_f"
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
                            data-oid="obo1:.4"
                        />
                    </div>
                    <div data-oid="a8.4c79">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="_:fnv5l"
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
                            data-oid="gi7a6-_"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ingestion Prompt (Optional)
                        </label>
                        <textarea
                            value={ingestionPrompt}
                            onChange={(e) => setIngestionPrompt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Prompt used when ingesting documents (e.g., for graph generation or contextual RAG)..."
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            System Prompt (Optional)
                        </label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Prompt used when executing user queries on this database..."
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database Servers *
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {servers.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No servers available. Please configure a server first.
                                </p>
                            ) : (
                                servers.map((server) => (
                                    <label key={server.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedServerIds.includes(server.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedServerIds([...selectedServerIds, server.id]);
                                                } else {
                                                    setSelectedServerIds(selectedServerIds.filter(id => id !== server.id));
                                                }
                                            }}
                                            disabled={isLoading}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">
                                            {server.name} ({server.type.toLowerCase()}) - {server.host}:{server.port}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                        {selectedServerIds.length === 0 && servers.length > 0 && (
                            <p className="text-sm text-red-500 mt-1">
                                Please select at least one server.
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6" data-oid="smksx44">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={isLoading}
                            data-oid="loe_96l"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading || !name.trim() || !description.trim() || selectedServerIds.length === 0}
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
