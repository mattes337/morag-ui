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
    const [isLoading, setIsLoading] = useState(false);
    const { createDatabase } = useApp();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) return;

        try {
            setIsLoading(true);
            await createDatabase({ name: name.trim(), description: description.trim() });
            setName('');
            setDescription('');
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
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="we.pt3q"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="c0hx.mf">
                <h3 className="text-lg font-semibold mb-4" data-oid="1d9ljyi">
                    Create Database
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" data-oid="o_3gli:">
                    <div data-oid="m.6tt_9">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="gkuc2:j"
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
                            data-oid="9wwz9qq"
                        />
                    </div>
                    <div data-oid="jd:443-">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="b3ezxwk"
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
                            data-oid="gajtfkg"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6" data-oid="vxh2lmm">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={isLoading}
                            data-oid=":u4981h"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading || !name.trim() || !description.trim()}
                            data-oid="i7kuusl"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
