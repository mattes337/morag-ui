'use client';

import { useState } from 'react';
import { Realm } from '../../types';
import { Database as RealmIcon, Plus, FileText, Server, Clock, Activity, ChevronDown, ChevronUp, Users, Settings, Trash2, Edit } from 'lucide-react';

interface RealmsViewProps {
    realms: Realm[];
    onCreateRealm: () => void;
    onSelectRealm: (realm: Realm) => void;
    onPromptRealm: (realm: Realm) => void;
    onViewRealm?: (realm: Realm) => void;
    onEditRealm?: (realm: Realm) => void;
    onDeleteRealm?: (realm: Realm) => void;
    onManageUsers?: (realm: Realm) => void;
}

export function RealmsView({
    realms,
    onCreateRealm,
    onSelectRealm,
    onPromptRealm,
    onViewRealm,
    onEditRealm,
    onDeleteRealm,
    onManageUsers,
}: RealmsViewProps) {
    const [expandedRealm, setExpandedRealm] = useState<string | null>(null);

    const toggleExpanded = (realmId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRealm(expandedRealm === realmId ? null : realmId);
    };

    const handleRealmClick = (realm: Realm) => {
        onSelectRealm(realm);
        // Immediately switch to the realm without needing to view details
    };

    const formatDate = (date: string | Date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
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
                {realms.map((realm) => {
                    const isExpanded = expandedRealm === realm.id;
                    return (
                    <div
                        key={realm.id}
                        className="bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
                    >
                        {/* Header - Clickable to switch realm */}
                        <div 
                            onClick={() => handleRealmClick(realm)}
                            className="flex items-start justify-between mb-4 p-6 cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                                    <RealmIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{realm.name}</h3>
                                    <p className="text-gray-600 text-sm">{realm.description || 'No description'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {realm.isDefault && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-50 text-green-700 border border-green-200">
                                        Default
                                    </span>
                                )}
                                <button
                                    onClick={(e) => toggleExpanded(realm.id, e)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Compact Statistics - Always visible */}
                        <div className="px-6 pb-4">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                        <FileText className="w-3 h-3 text-blue-500" />
                                        <span className="text-xs font-medium text-gray-700">Docs</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">{realm.documentCount || 0}</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                        <Users className="w-3 h-3 text-green-500" />
                                        <span className="text-xs font-medium text-gray-700">Users</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">{realm.userCount || 1}</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                        <Server className="w-3 h-3 text-purple-500" />
                                        <span className="text-xs font-medium text-gray-700">Servers</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">{realm.servers?.length || 0}</div>
                                </div>
                            </div>
                            
                            {/* Role Badge */}
                            {realm.userRole && (
                                <div className="flex justify-center mb-2">
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
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="border-t border-gray-100 px-6 py-4 space-y-4">
                                {/* Detailed Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created</label>
                                        <p className="text-sm text-gray-900 mt-1">{formatDate(realm.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Updated</label>
                                        <p className="text-sm text-gray-900 mt-1">{formatDate(realm.updatedAt)}</p>
                                    </div>
                                </div>



                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {onManageUsers && (realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onManageUsers(realm);
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <Users className="w-3 h-3 mr-1" />
                                            Manage Users
                                        </button>
                                    )}
                                    {onEditRealm && (realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditRealm(realm);
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                        </button>
                                    )}
                                    {onDeleteRealm && realm.userRole === 'OWNER' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteRealm(realm);
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>
        </div>
    );
}