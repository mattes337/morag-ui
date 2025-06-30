# Phase 4: Frontend Integration

## Overview

Implement the frontend components and user interface for realm management, including realm switching, creation, management dialogs, and integration with the existing application layout. This phase focuses on providing a seamless user experience for realm operations.

## UI/UX Design Principles

### User Experience
- Intuitive realm switching in header dropdown
- Clear visual indication of current realm
- Seamless realm creation and management
- Consistent design with existing application
- Responsive design for all screen sizes

### Performance
- Optimistic UI updates
- Efficient state management
- Minimal re-renders
- Progressive loading
- Proper error boundaries

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management
- ARIA labels and descriptions

## Component Architecture

### Core Components
1. **RealmSelector** - Dropdown in header for realm switching
2. **RealmManagementDialog** - Modal for creating/editing realms
3. **RealmProvider** - Context provider for realm state
4. **RealmGuard** - Component for realm-based access control

### Integration Points
- Header component updates
- AppContext enhancements
- Navigation updates
- Page-level realm filtering

## Implementation Steps

### Step 1: Create Realm Context Provider

#### 1.1 Create Realm Context
Create `contexts/RealmContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Realm } from '../types';

interface RealmContextType {
    currentRealm: Realm | null;
    realms: Realm[];
    isLoading: boolean;
    error: string | null;
    switchRealm: (realmId: string) => Promise<void>;
    createRealm: (data: { name: string; description?: string }) => Promise<Realm>;
    updateRealm: (realmId: string, data: Partial<Realm>) => Promise<Realm>;
    deleteRealm: (realmId: string) => Promise<void>;
    refreshRealms: () => Promise<void>;
}

const RealmContext = createContext<RealmContextType | undefined>(undefined);

interface RealmProviderProps {
    children: ReactNode;
}

export function RealmProvider({ children }: RealmProviderProps) {
    const [currentRealm, setCurrentRealm] = useState<Realm | null>(null);
    const [realms, setRealms] = useState<Realm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load initial realm data
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Load current realm and all realms in parallel
            const [currentRealmResponse, realmsResponse] = await Promise.all([
                fetch('/api/realms/current', {
                    credentials: 'include'
                }),
                fetch('/api/realms', {
                    credentials: 'include'
                })
            ]);

            if (!currentRealmResponse.ok || !realmsResponse.ok) {
                throw new Error('Failed to load realm data');
            }

            const currentRealmData = await currentRealmResponse.json();
            const realmsData = await realmsResponse.json();

            setCurrentRealm(currentRealmData.currentRealm);
            setRealms(realmsData.realms);
        } catch (err) {
            console.error('Error loading realm data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load realm data');
        } finally {
            setIsLoading(false);
        }
    };

    const switchRealm = async (realmId: string) => {
        try {
            setError(null);

            const response = await fetch('/api/realms/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ realmId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to switch realm');
            }

            const data = await response.json();
            setCurrentRealm(data.currentRealm);

            // Trigger page refresh to reload data for new realm
            window.location.reload();
        } catch (err) {
            console.error('Error switching realm:', err);
            setError(err instanceof Error ? err.message : 'Failed to switch realm');
            throw err;
        }
    };

    const createRealm = async (data: { name: string; description?: string }): Promise<Realm> => {
        try {
            setError(null);

            const response = await fetch('/api/realms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create realm');
            }

            const result = await response.json();
            const newRealm = result.realm;

            // Update local state
            setRealms(prev => [...prev, newRealm]);

            return newRealm;
        } catch (err) {
            console.error('Error creating realm:', err);
            setError(err instanceof Error ? err.message : 'Failed to create realm');
            throw err;
        }
    };

    const updateRealm = async (realmId: string, data: Partial<Realm>): Promise<Realm> => {
        try {
            setError(null);

            const response = await fetch(`/api/realms/${realmId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update realm');
            }

            const result = await response.json();
            const updatedRealm = result.realm;

            // Update local state
            setRealms(prev => prev.map(realm => 
                realm.id === realmId ? updatedRealm : realm
            ));

            // Update current realm if it was updated
            if (currentRealm?.id === realmId) {
                setCurrentRealm(updatedRealm);
            }

            return updatedRealm;
        } catch (err) {
            console.error('Error updating realm:', err);
            setError(err instanceof Error ? err.message : 'Failed to update realm');
            throw err;
        }
    };

    const deleteRealm = async (realmId: string): Promise<void> => {
        try {
            setError(null);

            const response = await fetch(`/api/realms/${realmId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete realm');
            }

            // Update local state
            setRealms(prev => prev.filter(realm => realm.id !== realmId));

            // If deleted realm was current, switch to default
            if (currentRealm?.id === realmId) {
                const defaultRealm = realms.find(r => r.isDefault && r.id !== realmId);
                if (defaultRealm) {
                    await switchRealm(defaultRealm.id);
                }
            }
        } catch (err) {
            console.error('Error deleting realm:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete realm');
            throw err;
        }
    };

    const refreshRealms = async (): Promise<void> => {
        await loadInitialData();
    };

    const value: RealmContextType = {
        currentRealm,
        realms,
        isLoading,
        error,
        switchRealm,
        createRealm,
        updateRealm,
        deleteRealm,
        refreshRealms,
    };

    return (
        <RealmContext.Provider value={value}>
            {children}
        </RealmContext.Provider>
    );
}

export function useRealm(): RealmContextType {
    const context = useContext(RealmContext);
    if (context === undefined) {
        throw new Error('useRealm must be used within a RealmProvider');
    }
    return context;
}
```

### Step 2: Create Realm Selector Component

#### 2.1 Create Realm Selector
Create `components/realm/RealmSelector.tsx`:

```typescript
import React, { useState } from 'react';
import { ChevronDownIcon, PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import { useRealm } from '../../contexts/RealmContext';
import { RealmManagementDialog } from './RealmManagementDialog';

interface RealmSelectorProps {
    className?: string;
}

export function RealmSelector({ className = '' }: RealmSelectorProps) {
    const { currentRealm, realms, switchRealm, isLoading } = useRealm();
    const [isOpen, setIsOpen] = useState(false);
    const [showManagement, setShowManagement] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleRealmSwitch = async (realmId: string) => {
        if (realmId === currentRealm?.id) {
            setIsOpen(false);
            return;
        }

        try {
            await switchRealm(realmId);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to switch realm:', error);
            // Error is handled by the context
        }
    };

    const handleCreateRealm = () => {
        setIsCreating(true);
        setShowManagement(true);
        setIsOpen(false);
    };

    const handleManageRealms = () => {
        setIsCreating(false);
        setShowManagement(true);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
        );
    }

    return (
        <>
            <div className={`relative ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <span className="truncate max-w-32">
                        {currentRealm?.name || 'Select Realm'}
                    </span>
                    <ChevronDownIcon 
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                            {/* Current Realm Header */}
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                                Current Realm
                            </div>
                            
                            {/* Realm List */}
                            <div className="max-h-60 overflow-y-auto">
                                {realms.map((realm) => (
                                    <button
                                        key={realm.id}
                                        onClick={() => handleRealmSwitch(realm.id)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                                            realm.id === currentRealm?.id
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">
                                                {realm.name}
                                                {realm.isDefault && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        (Default)
                                                    </span>
                                                )}
                                            </div>
                                            {realm.description && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {realm.description}
                                                </div>
                                            )}
                                        </div>
                                        {realm.id === currentRealm?.id && (
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full ml-2"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="border-t border-gray-100 py-1">
                                <button
                                    onClick={handleCreateRealm}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Create New Realm
                                </button>
                                <button
                                    onClick={handleManageRealms}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <CogIcon className="h-4 w-4 mr-2" />
                                    Manage Realms
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Click outside to close */}
                {isOpen && (
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                )}
            </div>

            {/* Realm Management Dialog */}
            {showManagement && (
                <RealmManagementDialog
                    isOpen={showManagement}
                    onClose={() => {
                        setShowManagement(false);
                        setIsCreating(false);
                    }}
                    initialMode={isCreating ? 'create' : 'manage'}
                />
            )}
        </>
    );
}
```

### Step 3: Create Realm Management Dialog

#### 3.1 Create Management Dialog
Create `components/realm/RealmManagementDialog.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRealm } from '../../contexts/RealmContext';
import { Realm } from '../../types';

interface RealmManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'create' | 'manage';
}

type DialogMode = 'manage' | 'create' | 'edit';

export function RealmManagementDialog({ 
    isOpen, 
    onClose, 
    initialMode = 'manage' 
}: RealmManagementDialogProps) {
    const { realms, createRealm, updateRealm, deleteRealm, currentRealm } = useRealm();
    const [mode, setMode] = useState<DialogMode>(initialMode);
    const [editingRealm, setEditingRealm] = useState<Realm | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError(null);
            if (initialMode === 'create') {
                setFormData({ name: '', description: '' });
            }
        }
    }, [isOpen, initialMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (mode === 'create') {
                await createRealm({
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                });
                setFormData({ name: '', description: '' });
                setMode('manage');
            } else if (mode === 'edit' && editingRealm) {
                await updateRealm(editingRealm.id, {
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                });
                setEditingRealm(null);
                setMode('manage');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (realm: Realm) => {
        setEditingRealm(realm);
        setFormData({
            name: realm.name,
            description: realm.description || '',
        });
        setMode('edit');
        setError(null);
    };

    const handleDelete = async (realm: Realm) => {
        if (realm.isDefault) {
            setError('Cannot delete default realm');
            return;
        }

        if (!confirm(`Are you sure you want to delete the realm "${realm.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await deleteRealm(realm.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete realm');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (mode === 'create' || mode === 'edit') {
            setMode('manage');
            setEditingRealm(null);
            setFormData({ name: '', description: '' });
            setError(null);
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Dialog */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
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
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Content */}
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            Default
                                                        </span>
                                                    )}
                                                    {realm.id === currentRealm?.id && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                {realm.description && (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {realm.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-1">
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
    );
}
```

### Step 4: Update Header Component

#### 4.1 Modify Header Component
Update `components/layout/Header.tsx`:

```typescript
// Add these imports at the top
import { RealmSelector } from '../realm/RealmSelector';
import { useRealm } from '../../contexts/RealmContext';

// In the Header component, add realm selector before user dropdown
export function Header() {
    const { user, logout } = useAppContext();
    const { currentRealm } = useRealm();
    // ... existing code ...

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* ... existing logo and nav code ... */}
                    </div>

                    {/* Right side - Realm Selector and User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* API Health Status */}
                        {/* ... existing health status code ... */}

                        {/* Realm Selector */}
                        <RealmSelector className="hidden sm:block" />

                        {/* User Dropdown */}
                        <div className="relative">
                            {/* ... existing user dropdown code ... */}
                            
                            {/* Add realm info to user dropdown */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    <div className="py-1">
                                        {/* User Info */}
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                            {currentRealm && (
                                                <p className="text-xs text-indigo-600 mt-1">
                                                    Realm: {currentRealm.name}
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Mobile Realm Selector */}
                                        <div className="sm:hidden px-4 py-2 border-b border-gray-100">
                                            <RealmSelector />
                                        </div>
                                        
                                        {/* ... existing menu items ... */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
```

### Step 5: Update App Context and Layout

#### 5.1 Update AppContext
Modify `contexts/AppContext.tsx`:

```typescript
// Add realm-related state and functions
import { RealmProvider } from './RealmContext';

// In AppContextProvider, wrap children with RealmProvider
export function AppContextProvider({ children }: { children: React.ReactNode }) {
    // ... existing code ...

    return (
        <AppContext.Provider value={value}>
            <RealmProvider>
                {children}
            </RealmProvider>
        </AppContext.Provider>
    );
}
```

#### 5.2 Update AuthWrapper
Modify `components/layout/AuthWrapper.tsx`:

```typescript
// Add realm loading state handling
import { useRealm } from '../../contexts/RealmContext';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, isLoading: userLoading } = useAppContext();
    const { isLoading: realmLoading, error: realmError } = useRealm();
    const pathname = usePathname();

    // Show loading while user or realm data is loading
    if (userLoading || (user && realmLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Show realm error if it occurs
    if (user && realmError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Realm Error</h2>
                    <p className="text-gray-600 mb-4">{realmError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ... rest of existing logic ...
}
```

### Step 6: Create Realm Guard Component

#### 6.1 Create Realm Guard
Create `components/realm/RealmGuard.tsx`:

```typescript
import React, { ReactNode } from 'react';
import { useRealm } from '../../contexts/RealmContext';

interface RealmGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    requireRealm?: boolean;
}

export function RealmGuard({ 
    children, 
    fallback = null, 
    requireRealm = true 
}: RealmGuardProps) {
    const { currentRealm, isLoading, error } = useRealm();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">Error loading realm: {error}</p>
            </div>
        );
    }

    if (requireRealm && !currentRealm) {
        return fallback || (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-600">No realm selected</p>
            </div>
        );
    }

    return <>{children}</>;
}
```

### Step 7: Update Page Components for Realm Filtering

#### 7.1 Update Database Page
Modify `app/databases/page.tsx`:

```typescript
import { RealmGuard } from '../../components/realm/RealmGuard';
import { useRealm } from '../../contexts/RealmContext';

export default function DatabasesPage() {
    const { currentRealm } = useRealm();
    const { databases, isLoading, error } = useDatabases(); // This should now filter by realm

    return (
        <RealmGuard>
            <div className="space-y-6">
                {/* Page Header with Realm Info */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Databases</h1>
                        {currentRealm && (
                            <p className="text-sm text-gray-500 mt-1">
                                Realm: {currentRealm.name}
                            </p>
                        )}
                    </div>
                    <button className="btn-primary">
                        Add Database
                    </button>
                </div>

                {/* Database List */}
                {/* ... existing database list code ... */}
            </div>
        </RealmGuard>
    );
}
```

### Step 8: Update API Hooks for Realm Context

#### 8.1 Update Database Hook
Modify `hooks/useDatabases.ts`:

```typescript
import { useRealm } from '../contexts/RealmContext';

export function useDatabases() {
    const { currentRealm } = useRealm();
    const [databases, setDatabases] = useState<Database[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentRealm) {
            loadDatabases();
        }
    }, [currentRealm]);

    const loadDatabases = async () => {
        if (!currentRealm) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/databases', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to load databases');
            }

            const data = await response.json();
            setDatabases(data.databases);
        } catch (err) {
            console.error('Error loading databases:', err);
            setError(err instanceof Error ? err.message : 'Failed to load databases');
        } finally {
            setIsLoading(false);
        }
    };

    // ... rest of hook implementation ...

    return {
        databases,
        isLoading,
        error,
        loadDatabases,
        // ... other functions ...
    };
}
```

## Testing Requirements

### Component Tests
1. **RealmSelector Tests**
   - Render with realms
   - Handle realm switching
   - Show/hide dropdown
   - Create and manage actions

2. **RealmManagementDialog Tests**
   - Create realm form
   - Edit realm form
   - Delete realm confirmation
   - Validation errors

3. **RealmContext Tests**
   - Load initial data
   - Switch realms
   - CRUD operations
   - Error handling

### Integration Tests
1. **User Workflows**
   - Complete realm creation flow
   - Realm switching with data refresh
   - Realm management operations

2. **Error Scenarios**
   - Network failures
   - Invalid realm data
   - Permission errors

### Manual Testing Checklist

#### Realm Selector
- [ ] Displays current realm name
- [ ] Shows all user realms in dropdown
- [ ] Highlights current realm
- [ ] Switches realm on selection
- [ ] Shows create and manage options
- [ ] Responsive design works
- [ ] Keyboard navigation works

#### Realm Management
- [ ] Create new realm form works
- [ ] Edit existing realm works
- [ ] Delete realm with confirmation
- [ ] Cannot delete default realm
- [ ] Form validation works
- [ ] Error messages display correctly

#### Integration
- [ ] Header shows realm selector
- [ ] User dropdown shows current realm
- [ ] Page data filters by realm
- [ ] Realm switching refreshes data
- [ ] Loading states work correctly
- [ ] Error states handled gracefully

## Performance Optimization

### State Management
- Minimize unnecessary re-renders
- Use React.memo for expensive components
- Implement proper dependency arrays
- Cache realm data appropriately

### API Calls
- Debounce realm switching
- Implement optimistic updates
- Cache realm lists
- Batch related API calls

### UI Performance
```typescript
// Example optimization for RealmSelector
const RealmSelector = React.memo(function RealmSelector({ className }: RealmSelectorProps) {
    // Component implementation
});

// Memoize expensive calculations
const sortedRealms = useMemo(() => {
    return realms.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return a.name.localeCompare(b.name);
    });
}, [realms]);
```

## Accessibility Features

### Keyboard Navigation
- Tab navigation through realm selector
- Arrow keys for dropdown navigation
- Enter/Space for selection
- Escape to close dropdowns

### Screen Reader Support
```typescript
// Example ARIA attributes
<button
    aria-expanded={isOpen}
    aria-haspopup="true"
    aria-label={`Current realm: ${currentRealm?.name}. Click to switch realms.`}
>
    {currentRealm?.name}
</button>

<div
    role="menu"
    aria-label="Realm selection menu"
>
    {realms.map((realm) => (
        <button
            key={realm.id}
            role="menuitem"
            aria-selected={realm.id === currentRealm?.id}
        >
            {realm.name}
        </button>
    ))}
</div>
```

### Focus Management
- Proper focus trapping in dialogs
- Focus restoration after modal close
- Visible focus indicators
- Logical tab order

## Error Handling

### User-Friendly Messages
```typescript
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    REALM_NOT_FOUND: 'The selected realm could not be found.',
    PERMISSION_DENIED: 'You do not have permission to access this realm.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};
```

### Error Boundaries
```typescript
class RealmErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Realm component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
                    <p className="text-sm text-red-600 mt-2">
                        There was an error with the realm system. Please refresh the page.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
```

## Deployment Checklist

- [ ] All components implemented
- [ ] Realm context provider integrated
- [ ] Header component updated
- [ ] Page components use realm filtering
- [ ] API hooks updated for realm context
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Accessibility features included
- [ ] Performance optimizations applied
- [ ] Tests written and passing
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

## Next Phase

Once Phase 4 is complete and the frontend integration is functional, proceed to **Phase 5: Data Filtering** to ensure all existing APIs and data operations properly respect realm boundaries and implement comprehensive realm-based filtering throughout the application.