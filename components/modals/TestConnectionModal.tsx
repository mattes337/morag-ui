import React, { useState, useCallback } from 'react';
import { Server } from '../../types';

interface TestConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    server: Server | null;
}

interface TestResult {
    success: boolean;
    message: string;
    timestamp: string;
}

export function TestConnectionModal({ isOpen, onClose, server }: TestConnectionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);

    const handleClose = () => {
        setResult(null);
        setIsLoading(false);
        onClose();
    };

    const testConnection = useCallback(async () => {
        if (!server) return;
        
        setIsLoading(true);
        setResult(null);
        
        try {
            const response = await fetch(`/api/servers/${server.id}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            setResult({
                success: data.success,
                message: data.message,
                timestamp: data.timestamp || new Date().toISOString()
            });
        } catch (error) {
            setResult({
                success: false,
                message: 'Failed to test connection. Please try again.',
                timestamp: new Date().toISOString()
            });
        } finally {
            setIsLoading(false);
        }
    }, [server]);

    React.useEffect(() => {
        if (isOpen && server) {
            testConnection();
        }
    }, [isOpen, server, testConnection]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Test Connection
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Testing connection to:
                    </p>
                    <p className="font-medium text-gray-900">
                        {server?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                        {server?.host}:{server?.port}
                    </p>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Connecting...</span>
                    </div>
                )}

                {result && (
                    <div className={`p-4 rounded-lg mb-4 ${
                        result.success 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        <div className="flex items-center">
                            {result.success ? (
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className={`font-medium ${
                                result.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {result.success ? 'Connection Successful' : 'Connection Failed'}
                            </span>
                        </div>
                        <p className={`mt-2 text-sm ${
                            result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                            {result.message}
                        </p>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    {result && (
                        <button
                            onClick={testConnection}
                            disabled={isLoading}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
                        >
                            Test Again
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}