'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Users, Plus, Trash2, Edit, Crown, Shield, User as UserIcon, Eye } from 'lucide-react';
import { RealmRole } from '../../types';
import Image from 'next/image';

interface RealmUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: RealmRole;
    createdAt: string;
    updatedAt: string;
}

interface AddUserData {
    email: string;
    role: RealmRole;
}

export default function UsersPage() {
    const { currentRealm, user } = useApp();
    const [users, setUsers] = useState<RealmUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [addUserData, setAddUserData] = useState<AddUserData>({ email: '', role: 'MEMBER' });
    const [addingUser, setAddingUser] = useState(false);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<RealmRole>('MEMBER');

    const loadUsers = useCallback(async () => {
        if (!currentRealm) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`/api/realms/${currentRealm.id}/users`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load users');
            }
            
            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error('Error loading users:', err);
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [currentRealm]);

    useEffect(() => {
        if (currentRealm) {
            loadUsers();
        }
    }, [currentRealm, loadUsers]);

    const handleAddUser = async () => {
        if (!currentRealm || !addUserData.email.trim()) return;
        
        try {
            setAddingUser(true);
            
            const response = await fetch(`/api/realms/${currentRealm.id}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(addUserData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add user');
            }
            
            await loadUsers();
            setShowAddUser(false);
            setAddUserData({ email: '', role: 'MEMBER' });
        } catch (err) {
            console.error('Error adding user:', err);
            setError(err instanceof Error ? err.message : 'Failed to add user');
        } finally {
            setAddingUser(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: RealmRole) => {
        if (!currentRealm) return;
        
        try {
            const response = await fetch(`/api/realms/${currentRealm.id}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role: newRole }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user role');
            }
            
            await loadUsers();
            setEditingUser(null);
        } catch (err) {
            console.error('Error updating user role:', err);
            setError(err instanceof Error ? err.message : 'Failed to update user role');
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!currentRealm || !confirm('Are you sure you want to remove this user from the realm?')) return;
        
        try {
            const response = await fetch(`/api/realms/${currentRealm.id}/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove user');
            }
            
            await loadUsers();
        } catch (err) {
            console.error('Error removing user:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove user');
        }
    };

    const getRoleIcon = (role: RealmRole) => {
        switch (role) {
            case 'OWNER':
                return <Crown className="w-4 h-4 text-purple-600" />;
            case 'ADMIN':
                return <Shield className="w-4 h-4 text-blue-600" />;
            case 'MEMBER':
                return <UserIcon className="w-4 h-4 text-green-600" />;
            case 'VIEWER':
                return <Eye className="w-4 h-4 text-gray-600" />;
            default:
                return <UserIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRoleBadgeClass = (role: RealmRole) => {
        switch (role) {
            case 'OWNER':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'ADMIN':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'MEMBER':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'VIEWER':
                return 'bg-gray-50 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const canManageUsers = user && currentRealm && (
        users.find(u => u.email === user.email)?.role === 'OWNER' ||
        users.find(u => u.email === user.email)?.role === 'ADMIN'
    );

    if (!currentRealm) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Realm Selected</h2>
                    <p className="text-gray-600">Please select a realm to manage its users.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 mt-1">Manage users in {currentRealm.name}</p>
                </div>
                {canManageUsers && (
                    <button
                        onClick={() => setShowAddUser(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add User
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Add User Form */}
            {showAddUser && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add User to Realm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={addUserData.email}
                                onChange={(e) => setAddUserData({ ...addUserData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="user@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={addUserData.role}
                                onChange={(e) => setAddUserData({ ...addUserData, role: e.target.value as RealmRole })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="MEMBER">Member</option>
                                <option value="ADMIN">Admin</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => {
                                setShowAddUser(false);
                                setAddUserData({ email: '', role: 'MEMBER' });
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddUser}
                            disabled={addingUser || !addUserData.email.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {addingUser && <LoadingSpinner />}
                            Add User
                        </button>
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">This realm doesn&apos;t have any users yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Added
                                    </th>
                                    {canManageUsers && (
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((realmUser) => (
                                    <tr key={realmUser.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {realmUser.avatar ? (
                                                        <Image
                                                            className="h-10 w-10 rounded-full"
                                                            src={realmUser.avatar}
                                                            alt={realmUser.name}
                                                            width={40}
                                                            height={40}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <UserIcon className="w-5 h-5 text-gray-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {realmUser.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {realmUser.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUser === realmUser.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={editRole}
                                                        onChange={(e) => setEditRole(e.target.value as RealmRole)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                    >
                                                        <option value="MEMBER">Member</option>
                                                        <option value="ADMIN">Admin</option>
                                                        <option value="VIEWER">Viewer</option>
                                                        {realmUser.role === 'OWNER' && (
                                                            <option value="OWNER">Owner</option>
                                                        )}
                                                    </select>
                                                    <button
                                                        onClick={() => handleUpdateUserRole(realmUser.id, editRole)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUser(null)}
                                                        className="text-gray-600 hover:text-gray-800"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(realmUser.role)}`}>
                                                    {getRoleIcon(realmUser.role)}
                                                    <span className="ml-1">{realmUser.role}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(realmUser.createdAt).toLocaleDateString()}
                                        </td>
                                        {canManageUsers && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    {realmUser.role !== 'OWNER' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(realmUser.id);
                                                                    setEditRole(realmUser.role);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveUser(realmUser.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}