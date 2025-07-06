import { DatabaseServer } from '../../types';

interface UseAppServerOperationsProps {
    loadUserData: () => Promise<void>;
}

export function useAppServerOperations({ loadUserData }: UseAppServerOperationsProps) {

    // Realm server management functions
    const getAvailableServersForRealm = async (realmId: string): Promise<DatabaseServer[]> => {
        try {
            const response = await fetch(`/api/realms/${realmId}/servers`, {
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch available servers');
            }

            const data = await response.json();
            return data.servers.map((server: any) => ({
                id: server.id,
                name: server.name,
                type: server.type.toLowerCase(),
                host: server.host,
                port: server.port,
                username: server.username,
                password: server.password,
                apiKey: server.apiKey,
                database: server.database,
                collection: server.collection,
                isActive: server.isActive,
                createdAt: server.createdAt,
                lastConnected: server.lastConnected,
            }));
        } catch (error) {
            console.error('Failed to fetch available servers:', error);
            throw error;
        }
    };

    const addServerToRealm = async (realmId: string, serverId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/realms/${realmId}/servers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ serverId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add server to realm');
            }

            // Refresh data to update the UI
            await loadUserData();
        } catch (error) {
            console.error('Failed to add server to realm:', error);
            throw error;
        }
    };

    const removeServerFromRealm = async (realmId: string, serverId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/realms/${realmId}/servers`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ serverId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove server from realm');
            }

            // Refresh data to update the UI
            await loadUserData();
        } catch (error) {
            console.error('Failed to remove server from realm:', error);
            throw error;
        }
    };

    return {
        getAvailableServersForRealm,
        addServerToRealm,
        removeServerFromRealm,
    };
}
