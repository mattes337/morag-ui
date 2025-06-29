'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface Realm {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    userRole?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    userCount?: number;
}

export function RealmSelector() {
    const { currentRealm, setCurrentRealm, setShowRealmManagementDialog } = useApp();
    const [realms, setRealms] = useState<Realm[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchRealms();
    }, []);

    const fetchRealms = async () => {
        try {
            const response = await fetch('/api/realms');
            if (response.ok) {
                const data = await response.json();
                setRealms(data.realms || []);
            }
        } catch (error) {
            console.error('Error fetching realms:', error);
        }
    };

    const switchRealm = async (realmId: string) => {
        if (realmId === currentRealm?.id) return;

        setLoading(true);
        try {
            const response = await fetch('/api/realms/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ realmId }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentRealm(data.currentRealm);
                
                // Store in localStorage for persistence
                localStorage.setItem('currentRealmId', realmId);
                
                toast.success(`Switched to realm: ${data.currentRealm.name}`);
                setIsOpen(false);
                
                // The useEffect in AppContext will automatically reload data when currentRealm changes
                // No need for window.location.reload() which breaks the layout
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to switch realm');
            }
        } catch (error) {
            console.error('Error switching realm:', error);
            toast.error('Failed to switch realm');
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role?: string) => {
        switch (role) {
            case 'OWNER':
                return 'bg-purple-100 text-purple-800';
            case 'ADMIN':
                return 'bg-blue-100 text-blue-800';
            case 'MEMBER':
                return 'bg-green-100 text-green-800';
            case 'VIEWER':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!currentRealm) {
        return (
            <div className="flex items-center space-x-2">
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
        );
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center space-x-2 min-w-[200px] justify-between"
                    disabled={loading}
                >
                    <div className="flex items-center space-x-2 truncate">
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-medium truncate">
                                {currentRealm.name}
                            </span>
                            {currentRealm.userRole && (
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${getRoleColor(currentRealm.userRole)}`}
                                >
                                    {currentRealm.userRole}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px]">
                <DropdownMenuLabel>Switch Realm</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {realms.map((realm) => (
                    <DropdownMenuItem
                        key={realm.id}
                        onClick={() => switchRealm(realm.id)}
                        className={`flex items-center justify-between p-3 cursor-pointer ${
                            realm.id === currentRealm?.id ? 'bg-blue-50' : ''
                        }`}
                        disabled={loading}
                    >
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">{realm.name}</span>
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
                                <span className="text-sm text-gray-500 truncate">
                                    {realm.description}
                                </span>
                            )}
                            <div className="flex items-center space-x-2">
                                {realm.userRole && (
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs ${getRoleColor(realm.userRole)}`}
                                    >
                                        {realm.userRole}
                                    </Badge>
                                )}
                                {realm.userCount && (
                                    <span className="text-xs text-gray-500">
                                        {realm.userCount} member{realm.userCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        setShowRealmManagementDialog(true);
                    }}
                    className="flex items-center space-x-2 p-3 cursor-pointer"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Manage Realms</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}