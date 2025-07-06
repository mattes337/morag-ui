import { Document, ApiKey, DatabaseServer, User, Job, Realm } from '../../types';

interface UseAppCrudOperationsProps {
    user: User | null;
    currentRealm: Realm | null;
    setDocuments: (setter: (prev: Document[]) => Document[]) => void;
    setApiKeys: (setter: (prev: ApiKey[]) => ApiKey[]) => void;
    setJobs: (setter: (prev: Job[]) => Job[]) => void;
    setRealms: (setter: (prev: Realm[]) => Realm[]) => void;
    setCurrentRealm: (realm: Realm | null) => void;
    setServers: (servers: DatabaseServer[]) => void;
    setIsDataLoading: (loading: boolean) => void;
    loadCurrentRealm: () => Promise<void>;
    loadUserData: () => Promise<void>;
}

export function useAppCrudOperations({
    user,
    currentRealm,
    setDocuments,
    setApiKeys,
    setJobs,
    setRealms,
    setCurrentRealm,
    setServers,
    setIsDataLoading,
    loadCurrentRealm,
    loadUserData,
}: UseAppCrudOperationsProps) {

    // Realm operations
    const updateRealm = async (id: string, data: Partial<Realm>) => {
        try {
            const response = await fetch(`/api/realms/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update realm');

            const updatedRealm = await response.json();
            setRealms((prev) => prev.map((realm) => (realm.id === id ? updatedRealm : realm)));
            
            // Update current realm if it's the one being updated
            if (currentRealm?.id === id) {
                setCurrentRealm(updatedRealm);
            }
        } catch (error) {
            console.error('Failed to update realm:', error);
            throw error;
        }
    };

    // Document operations
    const createDocument = async (data: { name: string; type: string; realmId: string }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create document');
            }

            const newDoc = await response.json();
            const formattedDoc = {
                id: newDoc.id,
                name: newDoc.name,
                type: newDoc.type,
                state: newDoc.state.toLowerCase() as Document['state'],
                version: newDoc.version,
                chunks: newDoc.chunks,
                quality: newDoc.quality,
                uploadDate: new Date(newDoc.uploadDate).toISOString().split('T')[0],
            };
            setDocuments((prev) => [...prev, formattedDoc]);

            // Refresh realms to update document count
            if (data.realmId) {
                await refreshData();
            }
        } catch (error) {
            console.error('Failed to create document:', error);
            throw error;
        }
    };

    const updateDocument = async (id: string, data: Partial<Document>) => {
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update document');

            const updatedDoc = await response.json();
            const formattedDoc = {
                id: updatedDoc.id,
                name: updatedDoc.name,
                type: updatedDoc.type,
                state: updatedDoc.state.toLowerCase() as Document['state'],
                version: updatedDoc.version,
                chunks: updatedDoc.chunks,
                quality: updatedDoc.quality,
                uploadDate: new Date(updatedDoc.uploadDate).toISOString().split('T')[0],
            };
            setDocuments((prev) => prev.map((doc) => (doc.id === id ? formattedDoc : doc)));
        } catch (error) {
            console.error('Failed to update document:', error);
            throw error;
        }
    };

    const deleteDocument = async (id: string) => {
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete document');

            setDocuments((prev) => prev.filter((doc) => doc.id !== id));

            // Refresh realms to update document count
            await refreshData();
        } catch (error) {
            console.error('Failed to delete document:', error);
            throw error;
        }
    };

    // API Key operations
    const createApiKey = async (data: { name: string; key: string }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create API key');
            }

            const newKey = await response.json();
            const formattedKey = {
                id: newKey.id,
                name: newKey.name,
                key: newKey.key,
                created: new Date(newKey.created).toISOString().split('T')[0],
                lastUsed: newKey.lastUsed
                    ? new Date(newKey.lastUsed).toISOString().split('T')[0]
                    : '',
            };
            setApiKeys((prev) => [...prev, formattedKey]);
        } catch (error) {
            console.error('Failed to create API key:', error);
            throw error;
        }
    };

    const deleteApiKey = async (id: string) => {
        try {
            const response = await fetch(`/api/api-keys/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete API key');

            setApiKeys((prev) => prev.filter((key) => key.id !== id));
        } catch (error) {
            console.error('Failed to delete API key:', error);
            throw error;
        }
    };

    // Job operations
    const createJob = async (data: {
        documentId: string;
        documentName: string;
        documentType: string;
    }) => {
        try {
            if (!user) throw new Error('No user logged in');

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, userId: user.id }),
            });

            if (!response.ok) throw new Error('Failed to create job');

            const newJob = await response.json();
            const formattedJob = {
                id: newJob.id,
                documentId: newJob.documentId,
                documentName: newJob.documentName,
                documentType: newJob.documentType,
                startDate: new Date(newJob.startDate).toISOString(),
                endDate: newJob.endDate ? new Date(newJob.endDate).toISOString() : undefined,
                status: newJob.status.toLowerCase().replace('_', '-') as Job['status'],
                progress: {
                    percentage: newJob.percentage,
                    summary: newJob.summary,
                },
                createdAt: new Date(newJob.createdAt).toISOString(),
                updatedAt: new Date(newJob.updatedAt).toISOString(),
            };
            setJobs((prev) => [...prev, formattedJob]);
        } catch (error) {
            console.error('Failed to create job:', error);
            throw error;
        }
    };

    const updateJobProgress = async (id: string, percentage: number, summary: string) => {
        try {
            const response = await fetch(`/api/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ percentage, summary }),
            });

            if (!response.ok) throw new Error('Failed to update job progress');

            const updatedJob = await response.json();
            const formattedJob = {
                id: updatedJob.id,
                documentId: updatedJob.documentId,
                documentName: updatedJob.documentName,
                documentType: updatedJob.documentType,
                startDate: new Date(updatedJob.startDate).toISOString(),
                endDate: updatedJob.endDate
                    ? new Date(updatedJob.endDate).toISOString()
                    : undefined,
                status: updatedJob.status.toLowerCase().replace('_', '-') as Job['status'],
                progress: {
                    percentage: updatedJob.percentage,
                    summary: updatedJob.summary,
                },
                createdAt: new Date(updatedJob.createdAt).toISOString(),
                updatedAt: new Date(updatedJob.updatedAt).toISOString(),
            };
            setJobs((prev) => prev.map((job) => (job.id === id ? formattedJob : job)));
        } catch (error) {
            console.error('Failed to update job progress:', error);
            throw error;
        }
    };

    // Refresh data function
    const refreshData = async () => {
        try {
            setIsDataLoading(true);
            await loadCurrentRealm();
            await loadUserData();
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

    return {
        updateRealm,
        createDocument,
        updateDocument,
        deleteDocument,
        createApiKey,
        deleteApiKey,
        createJob,
        updateJobProgress,
        refreshData,
    };
}
