'use client';

import React, { useState, useEffect } from 'react';
import { RealmPromptConfig } from '@/lib/types/domain';

interface RealmPromptEditorProps {
    initialPrompts?: RealmPromptConfig;
    onPromptsChange: (prompts: RealmPromptConfig) => void;
}

export function RealmPromptEditor({
    initialPrompts = {},
    onPromptsChange
}: RealmPromptEditorProps) {
    const [prompts, setPrompts] = useState<RealmPromptConfig>(initialPrompts);

    useEffect(() => {
        setPrompts(initialPrompts);
    }, [initialPrompts]);

    const handlePromptChange = (field: keyof RealmPromptConfig, value: string) => {
        const updatedPrompts = {
            ...prompts,
            [field]: value || undefined
        };
        setPrompts(updatedPrompts);
        onPromptsChange(updatedPrompts);
    };

    return (
        <div className="space-y-6">

            {/* Domain */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain
                </label>
                <input
                    type="text"
                    value={prompts.domain || ''}
                    onChange={(e) => handlePromptChange('domain', e.target.value)}
                    placeholder="e.g., legal, medical, technical, academic (optional - defaults to 'general')"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Specify the domain for specialized processing (optional)
                </p>
            </div>

            {/* Ingestion Prompt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingestion Prompt
                </label>
                <textarea
                    value={prompts.ingestionPrompt || ''}
                    onChange={(e) => handlePromptChange('ingestionPrompt', e.target.value)}
                    placeholder="Instructions for processing documents during ingestion (optional - uses default if empty)..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Prompt used when processing documents for ingestion (optional - uses default if empty)
                </p>
            </div>

            {/* System Prompt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt
                </label>
                <textarea
                    value={prompts.systemPrompt || ''}
                    onChange={(e) => handlePromptChange('systemPrompt', e.target.value)}
                    placeholder="Instructions for responding to user queries (optional - uses default if empty)..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Prompt used when responding to user queries (optional - uses default if empty)
                </p>
            </div>

            {/* Extraction Prompt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extraction Prompt
                </label>
                <textarea
                    value={prompts.extractionPrompt || ''}
                    onChange={(e) => handlePromptChange('extractionPrompt', e.target.value)}
                    placeholder="Instructions for extracting entities from content (optional - uses default if empty)..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Prompt used for entity extraction from documents (optional - uses default if empty)
                </p>
            </div>

            {/* Domain Prompt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Context Prompt
                </label>
                <textarea
                    value={prompts.domainPrompt || ''}
                    onChange={(e) => handlePromptChange('domainPrompt', e.target.value)}
                    placeholder="Domain-specific context and guidelines (optional - uses default if empty)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Additional context specific to this domain (optional - uses default if empty)
                </p>
            </div>
        </div>
    );
}
