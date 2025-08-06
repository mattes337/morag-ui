'use client';

import { useState } from 'react';
import { Realm } from '../../types';

interface EditPromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prompt: string) => void;
    realm: Realm;
    promptType: 'ingestion' | 'system';
    currentPrompt: string;
}

export function EditPromptDialog({
    isOpen,
    onClose,
    onSave,
    realm,
    promptType,
    currentPrompt
}: EditPromptDialogProps) {
    const [prompt, setPrompt] = useState(currentPrompt);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await onSave(prompt);
            onClose();
        } catch (error) {
            console.error('Failed to save prompt:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setPrompt(currentPrompt); // Reset to original value
            onClose();
        }
    };

    const title = promptType === 'ingestion' ? 'Edit Ingestion Prompt' : 'Edit System Prompt';
    const placeholder = promptType === 'ingestion' 
        ? 'Prompt used when ingesting documents (e.g., for graph generation or contextual RAG)...'
        : 'Prompt used when executing user queries in this realm...';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <h3 className="text-lg font-semibold mb-4">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Realm: <span className="font-medium">{realm.name}</span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prompt Content
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={8}
                            placeholder={placeholder}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}