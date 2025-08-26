'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Document, DeletionImpact } from '../../types';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeletionConfirmationDialogProps {
    documents: Document[];
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeletionConfirmationDialog({
    documents,
    isOpen,
    onConfirm,
    onCancel
}: DeletionConfirmationDialogProps) {
    const [impact, setImpact] = useState<DeletionImpact | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const analyzeImpact = useCallback(async () => {
        setIsAnalyzing(true);
        setError('');
        try {
            const documentIds = documents.map(d => d.id);
            const response = await fetch('/api/documents/deletion/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ documentIds }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze deletion impact');
            }

            const data = await response.json();
            setImpact(data.impact);
        } catch (error) {
            console.error('Failed to analyze deletion impact:', error);
            setError('Failed to analyze deletion impact. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [documents]);

    useEffect(() => {
        if (isOpen && documents.length > 0) {
            analyzeImpact();
        }
    }, [isOpen, documents, analyzeImpact]);

    const handleConfirm = () => {
        onConfirm();
        setConfirmText('');
    };

    const isConfirmEnabled = confirmText === 'DELETE' && impact && !isAnalyzing;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-red-600">
                        Confirm Document Deletion
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-gray-600">
                            This action cannot be undone. Please review the impact below.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {documents.length === 1 
                                ? `You are about to delete "${documents[0].name}"`
                                : `You are about to delete ${documents.length} documents`
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {isAnalyzing ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner className="w-6 h-6 mr-2" />
                            <span>Analyzing deletion impact...</span>
                        </div>
                    ) : impact ? (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3">Deletion Impact</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span>Documents:</span>
                                        <span className="font-medium">{impact.documents}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Chunks:</span>
                                        <span className="font-medium">{impact.chunks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Facts:</span>
                                        <span className="font-medium">{impact.facts}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Affected Entities:</span>
                                        <span className="font-medium">{impact.affectedEntities}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Orphaned Entities:</span>
                                        <span className="font-medium text-orange-600">{impact.orphanedEntities}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estimated Time:</span>
                                        <span className="font-medium">{impact.estimatedTime}s</span>
                                    </div>
                                </div>
                            </div>

                            {impact.warnings.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                        Warnings
                                    </h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        {impact.warnings.slice(0, 5).map((warning, index) => (
                                            <li key={index}>• {warning}</li>
                                        ))}
                                        {impact.warnings.length > 5 && (
                                            <li>• ... and {impact.warnings.length - 5} more warnings</li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                                    Type &quot;DELETE&quot; to confirm deletion:
                                </label>
                                <input
                                    id="confirmText"
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!isConfirmEnabled}
                    >
                        Delete Documents
                    </Button>
                </div>
            </div>
        </div>
    );
}
