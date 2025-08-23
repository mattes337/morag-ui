'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [users, setUsers] = useState<RealmUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: realm.name,
    description: realm.description || '',
    domain: realm.domain || '',
  });

  const loadRealmData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load servers
      const serversResponse = await fetch(`/api/realms/${realm.id}/servers`);
      if (serversResponse.ok) {
        const serversData = await serversResponse.json();
        setServers(serversData.servers || []);
      }
      
      // Load users
      const usersResponse = await fetch(`/api/realms/${realm.id}/users`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Failed to load realm data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [realm.id]);

  useEffect(() => {
    loadRealmData();
  }, [loadRealmData]);

  const handleSaveRealm = async () => {
    try {
      const response = await fetch(`/api/realms/${realm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        setIsEditing(false);
        // Refresh realm data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update realm:', error);
    }
  };

  const handleAddUser = async (email: string, role: string) => {
    try {
      const response = await fetch(`/api/realms/${realm.id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });
      
      if (response.ok) {
        await loadRealmData();
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/realms/${realm.id}/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadRealmData();
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  const getRoleColor = (role: string) => {
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Database Servers</span>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Server
                </Button>
              </CardTitle>
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
                  {servers.map((server) => (
                    <div key={server.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {servers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No servers configured</p>
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
                  <Button size="sm">
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

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Realm Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Realm Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={editForm.domain}
                      onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example.com"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveRealm}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
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
                  {(realm.userRole === 'OWNER' || realm.userRole === 'ADMIN') && (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Settings
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
