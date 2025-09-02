'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { RealmManagementView } from '../../../components/views/RealmManagementView';
import { ArrowLeft } from 'lucide-react';

interface Realm {
    id: string;
    name: string;
    description?: string;
    domain?: string;
    userRole: string;
    userCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function RealmManagementPage() {
    const router = useRouter();
    const params = useParams();
    const { realms } = useApp();
    const [realm, setRealm] = useState<Realm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const realmId = params.id as string;

    useEffect(() => {
        const loadRealm = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // First try to find the realm in the app context
                const contextRealm = realms.find(r => r.id === realmId);
                if (contextRealm) {
                    setRealm({
                        id: contextRealm.id,
                        name: contextRealm.name,
                        description: contextRealm.description,
                        domain: contextRealm.domain,
                        userRole: contextRealm.userRole || 'VIEWER',
                        userCount: contextRealm.userCount || 0,
                        createdAt: contextRealm.createdAt.toISOString(),
                        updatedAt: contextRealm.updatedAt.toISOString()
                    });
                    setIsLoading(false);
                    return;
                }

                // If not found in context, fetch from API
                const response = await fetch(`/api/realms/${realmId}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Realm not found');
                    } else {
                        throw new Error(`Failed to fetch realm: ${response.statusText}`);
                    }
                    return;
                }

                const realmData = await response.json();
                setRealm(realmData);
            } catch (error) {
                console.error('Failed to load realm:', error);
                setError(error instanceof Error ? error.message : 'Failed to load realm');
            } finally {
                setIsLoading(false);
            }
        };

        if (realmId) {
            loadRealm();
        }
    }, [realmId, realms]);

    const handleBack = () => {
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center min-h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading realm...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !realm) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Realms
                        </button>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="text-red-700">
                            <strong>Error:</strong> {error || 'Realm not found'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Realms
                    </button>
                </div>
                <RealmManagementView realm={realm} onClose={handleBack} />
            </div>
        </div>
    );
}
