'use client';

import { Realm, Document, Job } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Database as DatabaseIcon, FileText, Briefcase, Settings, Server, Edit, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface RealmDetailViewProps {
    realm: Realm;
    documents: Document[];
    servers: Server[];
    onBack: () => void;
    onPrompt: (realm: Realm) => void;
    onAddDocument: (realm: Realm) => void;
    onDeleteDocument: (documentId: string) => void;
    onDeleteRealm: (realm: Realm) => void;
    onEditRealm: (realm: Realm) => void;
    onManageServers: (realm: Realm) => void;
}

export function RealmDetailView({
    realm,
    documents,
    servers,
    onBack,
    onPrompt,
    onAddDocument,
    onDeleteDocument,
    onDeleteRealm,
    onEditRealm,
    onManageServers,
}: RealmDetailViewProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getJobStatusBadge = (status: string) => {
        const statusColors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            WAITING_FOR_REMOTE_WORKER: 'bg-orange-100 text-orange-800',
        };
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    const getDocumentStateBadge = (state: string) => {
        const stateColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            ingesting: 'bg-blue-100 text-blue-800',
            ingested: 'bg-green-100 text-green-800',
            deprecated: 'bg-orange-100 text-orange-800',
            deleted: 'bg-red-100 text-red-800',
        };
        return stateColors[state as keyof typeof stateColors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Databases</span>
                    </Button>
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                            <DatabaseIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{database.name}</h1>
                            <p className="text-gray-600">{database.description}</p>
                        </div>
                    </div>
                </div>
                <Button onClick={onRefresh} variant="outline">
                    Refresh
                </Button>
            </div>

            {/* Database Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Documents</p>
                            <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Servers</p>
                            <p className="text-2xl font-bold text-gray-900">{database.servers?.length || 0}</p>
                        </div>
                        <Server className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Last Updated</p>
                            <p className="text-sm font-medium text-gray-900">
                                {formatDate(database.lastUpdated || database.updatedAt.toISOString())}
                            </p>
                        </div>
                        <Settings className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
                    <TabsTrigger value="prompts">Prompts</TabsTrigger>
                    <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Database Information */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4">Database Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                    <p className="text-gray-900">{database.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Description</label>
                                    <p className="text-gray-900">{database.description}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Document Count</label>
                                    <p className="text-gray-900">{database.documentCount || 0}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Created</label>
                                    <p className="text-gray-900">{formatDate(database.lastUpdated || database.updatedAt.toISOString())}</p>
                                </div>
                            </div>
                        </div>

                        {/* Connected Servers */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4">Connected Servers</h3>
                            {database.servers && database.servers.length > 0 ? (
                                <div className="space-y-3">
                                    {database.servers.map((server) => (
                                        <div key={server.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{server.name}</p>
                                                <p className="text-sm text-gray-600">{server.type} - {server.host}:{server.port}</p>
                                            </div>
                                            <Badge className={server.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {server.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No servers connected</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                    <div className="bg-white rounded-lg border">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">Documents</h3>
                                    <p className="text-gray-600">All documents in this database</p>
                                </div>
                                <div className="flex space-x-2">
                                    {onAddDocument && (
                                        <Button onClick={onAddDocument} size="sm" className="flex items-center space-x-2">
                                            <Plus className="w-4 h-4" />
                                            <span>Add Document</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {documents.length > 0 ? (
                                <div className="space-y-4">
                                    {documents.map((document) => (
                                        <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{document.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {document.type} • {document.chunks} chunks • Quality: {document.quality}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Badge className={getDocumentStateBadge(document.state)}>
                                                    {document.state}
                                                </Badge>
                                                <p className="text-sm text-gray-600">{formatDate(document.uploadDate)}</p>
                                                <div className="flex space-x-2">
                                                    {onReingestDocument && (
                                                        <Button
                                                            onClick={() => onReingestDocument(document)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex items-center space-x-1"
                                                        >
                                                            <RefreshCw className="w-3 h-3" />
                                                            <span>Re-ingest</span>
                                                        </Button>
                                                    )}
                                                    {onDeleteDocument && (
                                                        <Button
                                                            onClick={() => onDeleteDocument(document)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            <span>Delete</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No documents found in this database</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="prompts" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ingestion Prompt */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Ingestion Prompt</h3>
                                {onEditIngestionPrompt && (
                                    <Button
                                        onClick={onEditIngestionPrompt}
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center space-x-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Edit</span>
                                    </Button>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {database.ingestionPrompt ? (
                                    <p className="text-gray-900 whitespace-pre-wrap">{database.ingestionPrompt}</p>
                                ) : (
                                    <p className="text-gray-600 italic">No ingestion prompt configured</p>
                                )}
                            </div>
                        </div>

                        {/* System Prompt */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">System Prompt</h3>
                                {onEditSystemPrompt && (
                                    <Button
                                        onClick={onEditSystemPrompt}
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center space-x-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Edit</span>
                                    </Button>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {database.systemPrompt ? (
                                    <p className="text-gray-900 whitespace-pre-wrap">{database.systemPrompt}</p>
                                ) : (
                                    <p className="text-gray-600 italic">No system prompt configured</p>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="jobs" className="mt-6">
                    <div className="bg-white rounded-lg border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">Jobs</h3>
                            <p className="text-gray-600">Processing jobs for documents in this database</p>
                        </div>
                        <div className="p-6">
                            {jobs.length > 0 ? (
                                <div className="space-y-4">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Briefcase className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{job.documentName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {job.documentType} • Started: {formatDate(job.startDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Badge className={getJobStatusBadge(job.status)}>
                                                    {job.status}
                                                </Badge>
                                                {job.progress?.percentage !== undefined && (
                                                    <div className="text-sm text-gray-600">
                                                        {job.progress.percentage}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No jobs found for this database</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}