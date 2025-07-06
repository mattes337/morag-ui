import { useEffect } from 'react';
import { Document, ApiKey, DatabaseServer, User, Job, Realm } from '../../types';

interface UseAppOperationsProps {
    user: User | null;
    currentRealm: Realm | null;
    setCurrentRealm: (realm: Realm | null) => void;
    setRealms: (realms: Realm[]) => void;
    setDocuments: (documents: Document[]) => void;
    setApiKeys: (apiKeys: ApiKey[]) => void;
    setJobs: (jobs: Job[]) => void;
    setServers: (servers: DatabaseServer[]) => void;
    setIsDataLoading: (loading: boolean) => void;
}

export function useAppOperations({
    user,
    currentRealm,
    setCurrentRealm,
    setRealms,
    setDocuments,
    setApiKeys,
    setJobs,
    setServers,
    setIsDataLoading,
}: UseAppOperationsProps) {

    const loadCurrentRealm = async () => {
        try {
            console.log('🏰 [AppContext] Loading current realm');
            const response = await fetch('/api/realms/current', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setCurrentRealm(data.currentRealm);
                console.log('✅ [AppContext] Current realm loaded:', data.currentRealm.name);
                
                // Also load all realms
                const realmsResponse = await fetch('/api/realms', {
                    credentials: 'include'
                });
                if (realmsResponse.ok) {
                    const realmsData = await realmsResponse.json();
                    setRealms(realmsData.realms || []);
                    console.log('✅ [AppContext] All realms loaded:', realmsData.realms?.length || 0);
                } else {
                    console.error('❌ [AppContext] Failed to load all realms:', realmsResponse.status);
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('❌ [AppContext] Failed to load current realm:', response.status, errorData.error);
                throw new Error(`Failed to load current realm: ${errorData.error}`);
            }
        } catch (error) {
            console.error('❌ [AppContext] Error loading current realm:', error);
            setCurrentRealm(null);
            setRealms([]);
            throw error;
        }
    };

    const loadUserData = async () => {
        if (!user) {
            console.log('👤 [AppContext] No user, skipping data load');
            setIsDataLoading(false);
            return;
        }

        console.log('🔄 [AppContext] User authenticated, loading data for:', user.email);
        setIsDataLoading(true);

        try {
            // Load current realm first
            await loadCurrentRealm();

            const realmParam = currentRealm ? `?realmId=${currentRealm.id}` : '';

            // Load servers
            console.log('🖥️ [AppContext] Loading servers for realm:', currentRealm?.name || 'default');
            const serversResponse = await fetch(`/api/servers${realmParam}`, {
                credentials: 'include'
            });
            if (serversResponse.ok) {
                const serversData = await serversResponse.json();
                const formattedServers = serversData.map((server: any) => ({
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
                console.log('✅ [AppContext] Loaded', formattedServers.length, 'servers');
                setServers(formattedServers);
            }

            // Load documents
            console.log('📄 [AppContext] Loading documents for realm:', currentRealm?.name || 'default');
            const documentsResponse = await fetch(`/api/documents${realmParam}`, {
                credentials: 'include'
            });
            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                const formattedDocuments = documentsData.map((doc: any) => ({
                    id: doc.id,
                    name: doc.name,
                    type: doc.type,
                    state: doc.state.toLowerCase() as Document['state'],
                    version: doc.version,
                    chunks: doc.chunks,
                    quality: doc.quality,
                    uploadDate: new Date(doc.uploadDate).toISOString().split('T')[0],
                }));
                console.log('✅ [AppContext] Loaded', formattedDocuments.length, 'documents');
                setDocuments(formattedDocuments);
            }

            // Load API keys
            console.log('🔑 [AppContext] Loading API keys for realm:', currentRealm?.name || 'default');
            const apiKeysResponse = await fetch(`/api/api-keys${realmParam}`, {
                credentials: 'include'
            });
            if (apiKeysResponse.ok) {
                const apiKeysData = await apiKeysResponse.json();
                const formattedApiKeys = apiKeysData.map((key: any) => ({
                    id: key.id,
                    name: key.name,
                    key: key.key,
                    created: new Date(key.created).toISOString().split('T')[0],
                    lastUsed: key.lastUsed
                        ? new Date(key.lastUsed).toISOString().split('T')[0]
                        : '',
                }));
                console.log('✅ [AppContext] Loaded', formattedApiKeys.length, 'API keys');
                setApiKeys(formattedApiKeys);
            }

            // Load jobs
            console.log('💼 [AppContext] Loading jobs for realm:', currentRealm?.name || 'default');
            const jobsResponse = await fetch(`/api/jobs${realmParam}`, {
                credentials: 'include'
            });
            if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                const formattedJobs = jobsData.map((job: any) => ({
                    id: job.id,
                    documentId: job.documentId,
                    documentName: job.documentName,
                    documentType: job.documentType,
                    startDate: new Date(job.startDate).toISOString(),
                    endDate: job.endDate ? new Date(job.endDate).toISOString() : undefined,
                    status: job.status.toLowerCase().replace('_', '-') as Job['status'],
                    progress: {
                        percentage: job.percentage,
                        summary: job.summary,
                    },
                    createdAt: new Date(job.createdAt).toISOString(),
                    updatedAt: new Date(job.updatedAt).toISOString(),
                }));
                setJobs(formattedJobs);
            }
        } catch (error) {
            console.error('❌ [AppContext] Failed to load user data:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

    // Load data when user becomes authenticated
    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    // Reload data when realm changes
    useEffect(() => {
        if (user && currentRealm) {
            console.log('🏰 [AppContext] Realm changed, reloading data for realm:', currentRealm.name);
            loadUserData();
        }
    }, [currentRealm?.id, user]);

    return {
        loadCurrentRealm,
        loadUserData,
    };
}
