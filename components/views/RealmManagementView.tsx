'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealmPromptEditor } from '@/components/forms/RealmPromptEditor';
import { RealmConfigEditor } from '@/components/forms/RealmConfigEditor';
import { RealmPromptConfig, RealmConfig } from '@/lib/types/domain';
import { DOMAIN_PROMPT_TEMPLATES, getDomainPromptTemplate } from '@/lib/constants/defaultPrompts';
import { toast } from 'sonner';
import {
  Settings,
  Users,
  Database,
  Key,
  Plus,
  Edit,
  Trash2,
  Shield,
  Globe,
  Server
} from 'lucide-react';

interface Realm {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  userRole: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
  // Prompt configuration
  ingestionPrompt?: string;
  systemPrompt?: string;
  extractionPrompt?: string;
  domainPrompt?: string;
}

interface RealmServer {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  isActive: boolean;
  lastConnected?: string;
}

interface UserServer {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  isActive: boolean;
  lastConnected?: string;
  isLinkedToRealm?: boolean;
}

interface RealmUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface RealmManagementViewProps {
  realm: Realm;
  onClose?: () => void;
}

export function RealmManagementView({ realm, onClose }: RealmManagementViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [servers, setServers] = useState<RealmServer[]>([]);
  const [userServers, setUserServers] = useState<UserServer[]>([]);
  const [users, setUsers] = useState<RealmUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<keyof RealmPromptConfig>('domain');
  const [realmConfig, setRealmConfig] = useState<RealmConfig>({});
  const [configMode, setConfigMode] = useState<'simple' | 'advanced'>('simple');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'USER' | 'VIEWER'>('USER');
  const [editForm, setEditForm] = useState({
    name: realm.name,
    description: realm.description || '',
    domain: realm.domain || '',
    prompts: {
      domain: realm.domain || '',
      ingestionPrompt: realm.ingestionPrompt || '',
      systemPrompt: realm.systemPrompt || '',
      extractionPrompt: realm.extractionPrompt || '',
      domainPrompt: realm.domainPrompt || ''
    } as RealmPromptConfig
  });

  const loadRealmData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load realm servers
      const serversResponse = await fetch(`/api/realms/${realm.id}/servers`);
      if (serversResponse.ok) {
        const serversData = await serversResponse.json();
        setServers(serversData.servers || []);
      }

      // Load all user servers
      const userServersResponse = await fetch('/api/servers');
      if (userServersResponse.ok) {
        const userServersData = await userServersResponse.json();
        // Mark which servers are linked to this realm
        const realmServerIds = new Set((serversResponse.ok ? (await serversResponse.json()).servers : []).map((s: any) => s.id));
        const userServersWithStatus = userServersData.map((server: any) => ({
          ...server,
          isLinkedToRealm: realmServerIds.has(server.id)
        }));
        setUserServers(userServersWithStatus);
      }

      // Load users
      const usersResponse = await fetch(`/api/realms/${realm.id}/users`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Load realm configuration
      const configResponse = await fetch(`/api/realms/${realm.id}/config`);
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setRealmConfig(configData);
      }
    } catch (error) {
      console.error('Failed to load realm data:', error);
      toast.error('Failed to load realm data');
    } finally {
      setIsLoading(false);
    }
  }, [realm.id]);

  useEffect(() => {
    loadRealmData();
  }, [loadRealmData]);

  const handleSaveRealm = async () => {
    try {
      setIsSaving(true);

      const updateData = {
        name: editForm.name?.trim() || realm.name,
        description: editForm.description?.trim() || undefined,
        domain: editForm.prompts?.domain?.trim() || undefined,
        ingestionPrompt: editForm.prompts?.ingestionPrompt?.trim() || undefined,
        systemPrompt: editForm.prompts?.systemPrompt?.trim() || undefined,
        extractionPrompt: editForm.prompts?.extractionPrompt?.trim() || undefined,
        domainPrompt: editForm.prompts?.domainPrompt?.trim() || undefined,
      };

      const response = await fetch(`/api/realms/${realm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update realm');
      }

      toast.success('Realm updated successfully');

      // Refresh the page to get updated data
      if (onClose) {
        onClose();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Failed to update realm:', error);
      toast.error(error.message || 'Failed to update realm');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRealmConfig = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/realms/${realm.id}/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(realmConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update realm configuration');
      }

      toast.success('Realm configuration updated successfully');
    } catch (error: any) {
      console.error('Error updating realm configuration:', error);
      toast.error(error.message || 'Failed to update realm configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = async (email: string, role: string) => {
    try {
      if (!email?.trim() || !role?.trim()) {
        toast.error('Email and role are required');
        return;
      }

      const response = await fetch(`/api/realms/${realm.id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }

      toast.success('User invited successfully');
      await loadRealmData();
    } catch (error: any) {
      console.error('Failed to add user:', error);
      toast.error(error.message || 'Failed to add user');
    }
  };

  const handleToggleServerLink = async (serverId: string, isCurrentlyLinked: boolean) => {
    try {
      if (isCurrentlyLinked) {
        // Unlink server from realm
        const response = await fetch(`/api/realms/${realm.id}/servers/${serverId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to unlink server');
        }

        toast.success('Server unlinked from realm');
      } else {
        // Link server to realm
        const response = await fetch(`/api/realms/${realm.id}/servers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serverId: serverId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to link server');
        }

        toast.success('Server linked to realm');
      }

      await loadRealmData();
    } catch (error: any) {
      console.error('Failed to toggle server link:', error);
      toast.error(error.message || 'Failed to update server link');
    }
  };

  const handleInviteUser = async () => {
    try {
      if (!inviteEmail.trim()) {
        toast.error('Email is required');
        return;
      }

      const response = await fetch(`/api/realms/${realm.id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite user');
      }

      toast.success('User invited successfully');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('USER');
      await loadRealmData();
    } catch (error: any) {
      console.error('Failed to invite user:', error);
      toast.error(error.message || 'Failed to invite user');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/realms/${realm.id}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove user');
      }

      toast.success('User removed successfully');
      await loadRealmData();
    } catch (error: any) {
      console.error('Failed to remove user:', error);
      toast.error(error.message || 'Failed to remove user');
    }
  };

  const getRoleColor = (role: string) => {
    if (!role || typeof role !== 'string') {
      return 'bg-gray-100 text-gray-800';
    }

    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServerTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'qdrant':
        return '🔍';
      case 'neo4j':
        return '🕸️';
      case 'postgresql':
        return '🐘';
      case 'mysql':
        return '🐬';
      default:
        return '💾';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{realm.name}</h1>
          <p className="text-gray-600">{realm.description || 'No description'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getRoleColor(realm.userRole)}>
            {realm.userRole}
          </Badge>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="config">Advanced Config</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Realm Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{realm.userCount}</p>
                    <p className="text-sm text-gray-600">Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Database className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{servers.length}</p>
                    <p className="text-sm text-gray-600">Servers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{servers.filter(s => s.isActive).length}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Realm Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Realm Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-sm">{new Date(realm.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm">{new Date(realm.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Domain</label>
                  <p className="text-sm">{realm.domain || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Your Role</label>
                  <Badge className={getRoleColor(realm.userRole)}>
                    {realm.userRole}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Database Servers</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select servers from your available servers to link them to this realm.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading servers...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userServers.map((server) => (
                    <div
                      key={server.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        server.isLinkedToRealm
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleServerLink(server.id, server.isLinkedToRealm || false)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getServerTypeIcon(server.type)}</span>
                        <div>
                          <p className="font-medium">{server.name}</p>
                          <p className="text-sm text-gray-600">
                            {server.type} • {server.host}:{server.port}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={server.isActive ? 'default' : 'secondary'}>
                          {server.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={server.isLinkedToRealm ? 'default' : 'outline'}>
                          {server.isLinkedToRealm ? 'Linked' : 'Available'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {userServers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No servers available. Create servers in the Servers section first.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Realm Users</span>
                </div>
                {(realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') && (
                  <Button size="sm" onClick={() => setShowInviteDialog(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Invite User
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading users...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        {(realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') && user.role !== 'OWNER' && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No users found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Prompt Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') ? (
                <div className="flex h-96 gap-6">
                  {/* Left side - Prompt selector */}
                  <div className="w-1/3 border-r pr-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Select Prompt</h3>
                    <div className="space-y-2">
                      {[
                        {
                          key: 'domain' as keyof RealmPromptConfig,
                          label: 'Domain',
                          description: 'Domain context (medical, legal, technical, etc.)',
                          stages: 'All stages'
                        },
                        {
                          key: 'ingestionPrompt' as keyof RealmPromptConfig,
                          label: 'Ingestion Prompt',
                          description: 'Document conversion and optimization instructions',
                          stages: 'Markdown conversion, Optimizer'
                        },
                        {
                          key: 'systemPrompt' as keyof RealmPromptConfig,
                          label: 'System Prompt',
                          description: 'User query response instructions',
                          stages: 'Query responses, Ingestor'
                        },
                        {
                          key: 'extractionPrompt' as keyof RealmPromptConfig,
                          label: 'Extraction Prompt',
                          description: 'Fact and entity extraction instructions',
                          stages: 'Fact generator'
                        },
                        {
                          key: 'domainPrompt' as keyof RealmPromptConfig,
                          label: 'Domain Context',
                          description: 'Domain-specific context and guidelines',
                          stages: 'All stages'
                        }
                      ].map((prompt) => (
                        <button
                          key={prompt.key}
                          onClick={() => setSelectedPrompt(prompt.key)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedPrompt === prompt.key
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-sm">{prompt.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{prompt.description}</div>
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                            Used in: {prompt.stages}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right side - Prompt editor */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Edit {[
                          { key: 'domain', label: 'Domain' },
                          { key: 'ingestionPrompt', label: 'Ingestion Prompt' },
                          { key: 'systemPrompt', label: 'System Prompt' },
                          { key: 'extractionPrompt', label: 'Extraction Prompt' },
                          { key: 'domainPrompt', label: 'Domain Context' }
                        ].find(p => p.key === selectedPrompt)?.label}
                      </h3>
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const template = getDomainPromptTemplate(e.target.value);
                              if (template) {
                                setEditForm({
                                  ...editForm,
                                  prompts: {
                                    domain: template.domain,
                                    ingestionPrompt: template.ingestionPrompt,
                                    systemPrompt: template.systemPrompt,
                                    extractionPrompt: template.extractionPrompt,
                                    domainPrompt: template.domainPrompt
                                  }
                                });
                                toast.success(`Applied ${e.target.value} domain template`);
                              }
                            }
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue=""
                        >
                          <option value="">Apply Template</option>
                          <option value="medical">Medical</option>
                          <option value="legal">Legal</option>
                          <option value="technical">Technical</option>
                        </select>
                        <Button
                          onClick={handleSaveRealm}
                          disabled={isSaving}
                          size="sm"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={editForm.prompts[selectedPrompt] || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        prompts: {
                          ...editForm.prompts,
                          [selectedPrompt]: e.target.value
                        }
                      })}
                      className="w-full h-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      placeholder={`Enter ${[
                        { key: 'domain', placeholder: 'e.g., medical, legal, technical, academic, research, financial' },
                        { key: 'ingestionPrompt', placeholder: 'Instructions for document conversion and optimization. Example: "Process medical documents focusing on clinical findings, diagnoses, and treatments. Preserve medical terminology and ICD codes."' },
                        { key: 'systemPrompt', placeholder: 'Instructions for responding to user queries. Example: "Respond to medical queries with evidence-based information. Always cite sources and indicate confidence levels."' },
                        { key: 'extractionPrompt', placeholder: 'Instructions for fact and entity extraction. Example: "Extract medical facts including symptoms, diagnoses, treatments, medications, and dosages. Include confidence scores for clinical assertions."' },
                        { key: 'domainPrompt', placeholder: 'Domain-specific context applied to all stages. Example: "Medical domain context: Focus on clinical accuracy, patient safety, and evidence-based medicine principles."' }
                      ].find(p => p.key === selectedPrompt)?.placeholder || ''}`}
                      disabled={isSaving}
                    />
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      {selectedPrompt === 'domain' && (
                        <div>
                          <p><strong>Domain Context:</strong> Specify the domain for specialized processing (e.g., medical, legal, technical).</p>
                          <p><strong>Backend API:</strong> Passed as <code className="bg-gray-100 px-1 rounded">domain</code> parameter to all stages.</p>
                          <p><strong>Valid values:</strong> general, medical, legal, technical, academic, research, financial, scientific</p>
                        </div>
                      )}
                      {selectedPrompt === 'ingestionPrompt' && (
                        <div>
                          <p><strong>Document Processing:</strong> Instructions for converting and optimizing documents during ingestion.</p>
                          <p><strong>Backend API:</strong> Passed as <code className="bg-gray-100 px-1 rounded">custom_instructions</code> to markdown-conversion and markdown-optimizer stages.</p>
                          <p><strong>Use for:</strong> Document format handling, content preservation, domain-specific processing rules.</p>
                        </div>
                      )}
                      {selectedPrompt === 'systemPrompt' && (
                        <div>
                          <p><strong>Query Responses:</strong> Instructions for how the AI should respond to user queries.</p>
                          <p><strong>Backend API:</strong> Passed as <code className="bg-gray-100 px-1 rounded">custom_instructions</code> to ingestor stage and used for query processing.</p>
                          <p><strong>Use for:</strong> Response style, citation requirements, confidence levels, domain expertise.</p>
                        </div>
                      )}
                      {selectedPrompt === 'extractionPrompt' && (
                        <div>
                          <p><strong>Fact Extraction:</strong> Instructions for extracting facts, entities, and relationships from documents.</p>
                          <p><strong>Backend API:</strong> Passed as <code className="bg-gray-100 px-1 rounded">custom_instructions</code> to fact-generator stage.</p>
                          <p><strong>Use for:</strong> Entity types to extract, confidence thresholds, domain-specific extraction rules.</p>
                        </div>
                      )}
                      {selectedPrompt === 'domainPrompt' && (
                        <div>
                          <p><strong>Domain Context:</strong> Domain-specific context and guidelines applied to all processing stages.</p>
                          <p><strong>Backend API:</strong> Passed as <code className="bg-gray-100 px-1 rounded">domain_context</code> to all stages.</p>
                          <p><strong>Use for:</strong> Domain principles, terminology, quality standards, compliance requirements.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You need OWNER or ADMIN permissions to edit prompts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Advanced Configuration</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure LLM models and processing stages according to the backend API specification.
              </p>
            </CardHeader>
            <CardContent>
              {(realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') ? (
                <RealmConfigEditor
                  config={realmConfig}
                  onChange={setRealmConfig}
                  onSave={handleSaveRealmConfig}
                  isSaving={isSaving}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You need OWNER or ADMIN permissions to edit advanced configuration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Realm Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') ? (
                <div className="space-y-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Realm Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter realm description (optional)"
                        disabled={isSaving}
                      />
                    </div>
                  </div>



                  {/* Save Button */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSaveRealm}
                      disabled={isSaving}
                      className="w-full sm:w-auto"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-sm">{realm.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Domain</label>
                      <p className="text-sm">{realm.domain || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm">{realm.description || 'No description'}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      You need OWNER or ADMIN permissions to edit realm settings.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite User to Realm</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInviteDialog(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'USER' | 'VIEWER')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={!inviteEmail.trim()}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
