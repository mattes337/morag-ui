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
            data-oid="p875311"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" data-oid="g_08ns7">
                <h3 className="text-lg font-semibold mb-4" data-oid="m6-5w_p">
                    API Configuration
                </h3>

                <div className="space-y-4" data-oid="x_4siy0">
                    <div data-oid="vm02ecl">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="o4sl4e8"
                        >
                            API Base URL
                        </label>
                        <input
                            type="url"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="http://localhost:8000/api"
                            data-oid="7cr3vrd"
                        />
                    </div>

                    <div data-oid=":n7_z2j">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="lb.gyer"
                        >
                            API Key (Optional)
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter API key if required"
                            data-oid="_d.9nik"
                        />
                    </div>

                    <div className="flex items-center space-x-2" data-oid="soshx3w">
                        <button
                            onClick={handleHealthCheck}
                            disabled={isChecking}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            data-oid="c:y208p"
                        >
                            {isChecking ? 'Checking...' : 'Test Connection'}
                        </button>

                        {isHealthy !== null && (
                            <span
                                className={`text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}
                                data-oid="t4.s7-s"
                            >
                                {isHealthy ? '✓ API is healthy' : '✗ API is not responding'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="0fns8fk">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        data-oid="zlq7_ye"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        data-oid="07ou32d"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
