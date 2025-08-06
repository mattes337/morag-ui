'use client';

import { Realm } from '../../types';
import { Database as RealmIcon, Plus, FileText, Server, Clock, Activity } from 'lucide-react';

interface RealmsViewProps {
    realms: Realm[];
    onCreateRealm: () => void;
    onSelectRealm: (realm: Realm) => void;
    onPromptRealm: (realm: Realm) => void;
    onViewRealm?: (realm: Realm) => void;
}

export function RealmsView({
    realms,
    onCreateRealm,
    onSelectRealm,
    onPromptRealm,
    onViewRealm,
}: RealmsViewProps) {
    // Show empty state when no realms exist
    if (realms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <RealmIcon className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No realms yet</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                    Get started by creating your first realm. You&apos;ll be able to organize and
                    manage your documents and vector databases within dedicated workspaces.
                </p>
                <button
                    onClick={onCreateRealm}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Realm
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Realms</h2>
                <button
                    onClick={onCreateRealm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create Realm
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realms.map((realm) => (
                    <div
                        key={realm.id}
                        onClick={() => {
                            onSelectRealm(realm);
                            onViewRealm && onViewRealm(realm);
                        }}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                                    <RealmIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{realm.name}</h3>
                                    <p className="text-gray-600 text-sm">{realm.description || 'No description'}</p>
                                </div>
                            </div>
                            {realm.isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-50 text-green-700 border border-green-200">
                                    Default
                                </span>
                            )}
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-medium text-gray-700">Documents</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">0</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Server className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-medium text-gray-700">Members</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">{realm.userCount || 1}</div>
                            </div>
                        </div>
                        
                        {/* Role Badge */}
                        {realm.userRole && (
                            <div className="mb-4">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs border ${
                                        realm.userRole === 'OWNER'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                            : realm.userRole === 'ADMIN'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : realm.userRole === 'MEMBER'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                >
                                    {realm.userRole}
                                </span>
                            </div>
                        )}
                        
                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>Recently accessed</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Activity className="w-3 h-3" />
                                <span>Active</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}