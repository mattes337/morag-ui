'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RealmManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

type DialogMode = 'manage' | 'create' | 'edit';

interface FormData {
    name: string;
    description: string;
}

export function RealmManagementDialog({ isOpen, onClose }: RealmManagementDialogProps) {
    const { currentRealm, setCurrentRealm, realms, setRealms } = useApp();
    const [mode, setMode] = useState<DialogMode>('manage');
    const [editingRealm, setEditingRealm] = useState<any>(null);
    const [formData, setFormData] = useState<FormData>({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMode('manage');
            setEditingRealm(null);
            setFormData({ name: '', description: '' });
            setError('');
            fetchRealms();
        }
    }, [isOpen]);

    const fetchRealms = async () => {
        try {
            const response = await fetch('/api/realms');
            if (response.ok) {
                const data = await response.json();
                setRealms(data.realms || []);
            }
        } catch (error) {
            console.error('Error fetching realms:', error);
            toast.error('Failed to fetch realms');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (mode === 'create') {
                const response = await fetch('/api/realms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        description: formData.description.trim() || undefined,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create realm');
                }

                toast.success('Realm created successfully');
            } else if (mode === 'edit' && editingRealm) {
                const response = await fetch(`/api/realms/${editingRealm.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        description: formData.description.trim() || undefined,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update realm');
                }

                toast.success('Realm updated successfully');
            }

            await fetchRealms();
            setMode('manage');
            setFormData({ name: '', description: '' });
            setEditingRealm(null);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (realm: any) => {
        setEditingRealm(realm);
        setFormData({ name: realm.name, description: realm.description || '' });
        setMode('edit');
        setError('');
    };

    const handleSelectRealm = async (realm: any) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/realms/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ realmId: realm.id }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentRealm(data.currentRealm);
                toast.success(`Switched to realm "${realm.name}"`);
                // Close the dialog after successful realm switch
                onClose();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to switch realm');
            }
        } catch (error) {
            console.error('Error switching realm:', error);
            toast.error('Failed to switch realm');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (realm: any) => {
        if (realm.isDefault) {
            setError('Cannot delete default realm');
            return;
        }

        if (!confirm(`Are you sure you want to delete the realm "${realm.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/realms/${realm.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete realm');
            }

            toast.success('Realm deleted successfully');
            await fetchRealms();

            // If we deleted the current realm, switch to default
            if (realm.id === currentRealm?.id) {
                const defaultRealm = realms.find(r => r.isDefault);
                if (defaultRealm) {
                    setCurrentRealm(defaultRealm);
                }
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setMode('manage');
        setFormData({ name: '', description: '' });
        setEditingRealm(null);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            {mode === 'create' && 'Create New Realm'}
                            {mode === 'edit' && 'Edit Realm'}
                            {mode === 'manage' && 'Manage Realms'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="px-6 py-4">
                        {/* Create/Edit Form */}
                        {(mode === 'create' || mode === 'edit') && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Realm Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter realm name"
                                        required
                                        maxLength={100}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter realm description (optional)"
                                        rows={3}
                                        maxLength={500}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        disabled={isSubmitting || !formData.name.trim()}
                                    >
                                        {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Manage Mode */}
                        {mode === 'manage' && (
                            <div className="space-y-4">
                                {/* Realm List */}
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {realms.map((realm) => (
                                        <div
                                            key={realm.id}
                                            className={`p-3 border rounded-lg ${
                                                realm.id === currentRealm?.id
                                                    ? 'border-indigo-200 bg-indigo-50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {realm.name}
                                                        </h4>
                                                        {realm.isDefault && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Default
                                                            </Badge>
                                                        )}
                                                        {realm.id === currentRealm?.id && (
                                                            <Badge variant="default" className="text-xs">
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {realm.description && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {realm.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {realm.id !== currentRealm?.id && (
                                                        <Button
                                                            onClick={() => handleSelectRealm(realm)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs px-2 py-1 h-7"
                                                            disabled={isSubmitting}
                                                        >
                                                            Select
                                                        </Button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(realm)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                        title="Edit realm"
                                                        disabled={isSubmitting}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    {!realm.isDefault && (
                                                        <button
                                                            onClick={() => handleDelete(realm)}
                                                            className="p-1 text-gray-400 hover:text-red-600"
                                                            title="Delete realm"
                                                            disabled={isSubmitting}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setMode('create')}
                                        className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        disabled={isSubmitting}
                                    >
                                        Create New Realm
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}