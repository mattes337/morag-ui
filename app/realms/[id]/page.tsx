'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Realm } from '../../../types';
import { ArrowLeft, Users, FileText, Calendar, Settings, Database } from 'lucide-react';

interface RealmDetailPageProps {
    params: {
        id: string;
    };
}

export default function RealmDetailPage({ params }: RealmDetailPageProps) {
    const router = useRouter();
    const { user, realms, setCurrentRealm } = useApp();
    const [realm, setRealm] = useState<Realm | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRealm = async () => {
            try {
                setLoading(true);
                setError(null);

                // First check if realm is already in the realms list
                const existingRealm = realms.find(r => r.id === params.id);
                if (existingRealm) {
                    setRealm(existingRealm);
                    setLoading(false);
                    return;
                }

                // If not found in list, fetch from API
                console.log('🔍 [RealmDetailPage] Fetching realm from API:', params.id);
                const response = await fetch(`/api/realms/${params.id}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('❌ [RealmDetailPage] Realm not found (404)');
                        setError('Realm not found');
                        setTimeout(() => router.push('/'), 2000);
                        return;
                    }
                    console.log('❌ [RealmDetailPage] API fetch failed:', response.status);
                    throw new Error('Failed to fetch realm');
                }

                const data = await response.json();
                setRealm(data.realm);
            } catch (err) {
                console.error('❌ [RealmDetailPage] Error loading realm:', err);
                setError(err instanceof Error ? err.message : 'Failed to load realm');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadRealm();
        }
    }, [params.id, realms, router]);

    const handleBack = () => {
        router.push('/');
    };

    const handleSwitchToRealm = () => {
        if (realm) {
            setCurrentRealm(realm);
            router.push('/documents');
        }
    };

    const handleViewDocuments = () => {
        if (realm) {
            setCurrentRealm(realm);
            router.push('/documents');
        }
    };

    const handlePromptRealm = () => {
        if (realm) {
            setCurrentRealm(realm);
            router.push('/prompt');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🏰</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The realm you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Realms
                    </button>
                </div>
            </div>
        );
    }

    if (!realm) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🏰</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Realm Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The realm you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Realms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handleBack}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{realm.name}</h1>
                    {realm.description && (
                        <p className="text-gray-600 mt-1">{realm.description}</p>
                    )}
                </div>
            </div>

            {/* Realm Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Documents</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{realm.documentCount || 0}</p>
                    <p className="text-sm text-gray-600">Total documents</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Users className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Users</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{realm.userCount || 0}</p>
                    <p className="text-sm text-gray-600">Total users</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Created</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                        {new Date(realm.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                        {new Date(realm.createdAt).toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={handleSwitchToRealm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Database className="w-4 h-4" />
                    Switch to this Realm
                </button>
                
                <button
                    onClick={handleViewDocuments}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    View Documents
                </button>
                
                <button
                    onClick={handlePromptRealm}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    💬
                    Chat with Realm
                </button>
            </div>

            {/* Realm Details */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Realm Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Realm ID</dt>
                        <dd className="text-sm text-gray-900 font-mono">{realm.id}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Default Realm</dt>
                        <dd className="text-sm text-gray-900">
                            {realm.isDefault ? 'Yes' : 'No'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="text-sm text-gray-900">
                            {new Date(realm.lastUpdated || realm.updatedAt).toLocaleString()}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Your Role</dt>
                        <dd className="text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {realm.userRole || 'Member'}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
