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
            data-oid="nef2e5l"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="nl4khet">
                <h3 className="text-lg font-semibold mb-4" data-oid="3.f4602">
                    API Configuration
                </h3>

                <div className="space-y-4" data-oid="0cp_f00">
                    <div data-oid="w7uc3yq">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="r7te6ks"
                        >
                            API Base URL
                        </label>
                        <input
                            type="url"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="http://localhost:8000/api"
                            data-oid="w5g12:-"
                        />
                    </div>

                    <div data-oid="pjqhmuu">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="uezsszo"
                        >
                            API Key (Optional)
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter API key if required"
                            data-oid="9d._ico"
                        />
                    </div>

                    <div className="flex items-center space-x-2" data-oid="gfbb27k">
                        <button
                            onClick={handleHealthCheck}
                            disabled={isChecking}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            data-oid="ianh77-"
                        >
                            {isChecking ? 'Checking...' : 'Test Connection'}
                        </button>

                        {isHealthy !== null && (
                            <span
                                className={`text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}
                                data-oid="._rpmy1"
                            >
                                {isHealthy ? '✓ API is healthy' : '✗ API is not responding'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="4zum3x1">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="4lcajda"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="i3s_1o3"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
