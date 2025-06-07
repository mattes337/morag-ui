'use client';

import { useState, useEffect } from 'react';
import { checkApiHealth } from '../lib/vectorSearch';

interface ApiConfigProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ApiConfig({ isOpen, onClose }: ApiConfigProps) {
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Load current API configuration
        setApiUrl(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api');
        setApiKey(localStorage.getItem('api_key') || '');
    }, []);

    const handleHealthCheck = async () => {
        setIsChecking(true);
        const healthy = await checkApiHealth();
        setIsHealthy(healthy);
        setIsChecking(false);
    };

    const handleSave = () => {
        // In a real implementation, you might want to update environment variables
        // For now, we'll just store in localStorage
        localStorage.setItem('api_url', apiUrl);
        localStorage.setItem('api_key', apiKey);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="md2az4a"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="859-wvh">
                <h3 className="text-lg font-semibold mb-4" data-oid="_0oin27">
                    API Configuration
                </h3>

                <div className="space-y-4" data-oid="u72ubs0">
                    <div data-oid="apxwson">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid=".w3n8b."
                        >
                            API Base URL
                        </label>
                        <input
                            type="url"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="http://localhost:8000/api"
                            data-oid="ko-hy55"
                        />
                    </div>

                    <div data-oid="yp3ctvf">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid=":7d4.g7"
                        >
                            API Key (Optional)
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter API key if required"
                            data-oid="n.esfn4"
                        />
                    </div>

                    <div className="flex items-center space-x-2" data-oid="mve-u54">
                        <button
                            onClick={handleHealthCheck}
                            disabled={isChecking}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            data-oid="2ftfyj4"
                        >
                            {isChecking ? 'Checking...' : 'Test Connection'}
                        </button>

                        {isHealthy !== null && (
                            <span
                                className={`text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}
                                data-oid="iyfx7ao"
                            >
                                {isHealthy ? '✓ API is healthy' : '✗ API is not responding'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="5gzq_qp">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="9ux0.kn"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="r8_k-4d"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
