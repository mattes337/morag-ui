'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Document, Job } from '../../../types';
import { Plus, FileText, MessageSquare, Briefcase, Settings, Trash2, Edit } from 'lucide-react';

interface RealmDetailPageProps {
    params: {
        id: string;
    };
}

export default function RealmDetailPage({ params }: RealmDetailPageProps) {
    const router = useRouter();
    const { realms, documents, jobs, isDataLoading, setCurrentRealm, createDocument, updateDocument, deleteDocument } = useApp();
    const [realm, setRealm] = useState<any>(null);
    const [realmDocuments, setRealmDocuments] = useState<Document[]>([]);
    const [realmJobs, setRealmJobs] = useState<Job[]>([]);
    const [realmServers, setRealmServers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('documents');
    const [promptText, setPromptText] = useState('');
    const [promptResponse, setPromptResponse] = useState('');
    const [isPromptLoading, setIsPromptLoading] = useState(false);

    // Auto-switch to this realm when page loads
    useEffect(() => {
        if (realms && params.id) {
            const foundRealm = realms.find(r => r.id === params.id);
            if (foundRealm) {
                setRealm(foundRealm);
                // Auto-switch to this realm
                setCurrentRealm(foundRealm);

                // Filter documents for this realm
                const filteredDocs = documents?.filter(doc => (doc as any).realmId === params.id) || [];
                setRealmDocuments(filteredDocs);

                // Filter jobs for this realm
                const filteredJobs = jobs?.filter(job => (job as any).realmId === params.id) || [];
                setRealmJobs(filteredJobs);

                // Get servers from the realm object
                const realmServers = (foundRealm as any).servers || [];
                setRealmServers(realmServers);
            }
        }
    }, [realms, documents, jobs, params.id, setCurrentRealm]);

    const handleBackToRealms = () => {
        router.push('/');
    };

    const handleAddDocument = async () => {
        if (!realm) return;
        try {
            await createDocument({
                name: `New Document ${Date.now()}`,
                type: 'text',
                realmId: realm.id
            });
        } catch (error) {
            console.error('Failed to create document:', error);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                await deleteDocument(documentId);
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        }
    };

    const handleTestPrompt = async () => {
        if (!promptText.trim() || !realm) return;

        setIsPromptLoading(true);
        try {
            const response = await fetch('/api/prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: promptText,
                    realmId: realm.id,
                    useSystemPrompt: true
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPromptResponse(data.response);
            } else {
                setPromptResponse('Error: Failed to get response');
            }
        } catch (error) {
            setPromptResponse('Error: ' + error);
        } finally {
            setIsPromptLoading(false);
        }
    };

    if (isDataLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!realm) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Realm Not Found</h2>
                <p className="text-gray-600">The realm you're looking for doesn't exist or you don't have access to it.</p>
                <button
                    onClick={handleBackToRealms}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    ← Back to Realms
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBackToRealms}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back to Realms
                    </button>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-gray-900">{realm.name}</h1>
                            {realm.isDefault && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    Default
                                </span>
                            )}
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Active
                            </span>
                        </div>
                        {realm.description && (
                            <p className="text-gray-600 mt-1">{realm.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Documents</p>
                            <p className="text-2xl font-bold text-gray-900">{realmDocuments.length}</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Servers</p>
                            <p className="text-2xl font-bold text-gray-900">{realmServers.length}</p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold">�️</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{realmJobs.length}</p>
                        </div>
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {realmJobs.filter(job => job.status === 'processing' || job.status === 'pending').length}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="documents" className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Documents</span>
                    </TabsTrigger>
                    <TabsTrigger value="prompts" className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Prompts & Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Jobs</span>
                    </TabsTrigger>
                    <TabsTrigger value="servers" className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Servers</span>
                    </TabsTrigger>
                </TabsList>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                        <button
                            onClick={handleAddDocument}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Document</span>
                        </button>
                    </div>

                    {realmDocuments.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="divide-y divide-gray-200">
                                {realmDocuments.map((document) => (
                                    <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {document.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {document.type} • {document.uploadDate}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    document.state === 'ingested'
                                                        ? 'bg-green-100 text-green-800'
                                                        : document.state === 'ingesting'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {document.state}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteDocument(document.id)}
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                            <p className="text-gray-600 mb-4">
                                This realm doesn't have any documents yet. Add your first document to get started.
                            </p>
                            <button
                                onClick={handleAddDocument}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add First Document
                            </button>
                        </div>
                    )}
                </TabsContent>

                {/* Prompts & Chat Tab */}
                <TabsContent value="prompts" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Configured Prompts */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configured Prompts</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ingestion Prompt
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                        {realm.ingestionPrompt || 'No ingestion prompt configured'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        System Prompt
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                        {realm.systemPrompt || 'No system prompt configured'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Chat */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Chat</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Question
                                    </label>
                                    <textarea
                                        value={promptText}
                                        onChange={(e) => setPromptText(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={3}
                                        placeholder="Ask a question about your documents..."
                                    />
                                </div>

                                <button
                                    onClick={handleTestPrompt}
                                    disabled={!promptText.trim() || isPromptLoading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isPromptLoading ? 'Processing...' : 'Send Message'}
                                </button>

                                {promptResponse && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Response
                                        </label>
                                        <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                            {promptResponse}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Jobs Tab */}
                <TabsContent value="jobs" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Jobs</h3>
                    </div>

                    {realmJobs.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="divide-y divide-gray-200">
                                {realmJobs.map((job) => (
                                    <div key={job.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {job.documentName}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {job.documentType} • Started {job.startDate}
                                                </p>
                                                {job.progress?.summary && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {job.progress.summary}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        job.status === 'finished'
                                                            ? 'bg-green-100 text-green-800'
                                                            : job.status === 'processing'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : job.status === 'failed'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {job.status}
                                                    </span>
                                                    {job.progress && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {job.progress.percentage}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Yet</h3>
                            <p className="text-gray-600">
                                No processing jobs have been created for this realm yet.
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Servers Tab */}
                <TabsContent value="servers" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Assigned Servers</h3>
                    </div>

                    {realmServers.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="divide-y divide-gray-200">
                                {realmServers.map((server) => (
                                    <div key={server.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {server.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {server.type} • {server.host}:{server.port}
                                                </p>
                                                {server.database && (
                                                    <p className="text-xs text-gray-400">
                                                        Database: {server.database}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    server.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {server.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Settings className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Servers Assigned</h3>
                            <p className="text-gray-600">
                                This realm doesn't have any servers assigned yet.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
