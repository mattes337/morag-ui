/**
 * RealmSettings - Comprehensive realm settings management interface
 * Advanced configuration panel for realm administrators
 */
'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MockRealm, getRealmUsageSummary, getRealmMembershipStats } from '@/lib/mockData/realmMockData'
import { useRealm } from '@/lib/hooks/useRealm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/Switch'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/Separator'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import {
  Settings,
  Users,
  Database,
  Shield,
  Activity,
  Trash2,
  UserPlus,
  Mail,
  Copy,
  Save,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  EyeOff,
  Key,
  Globe,
  Lock,
  Zap,
  BarChart3,
  FileText,
  Server
} from 'lucide-react'

interface RealmSettingsProps {
  realm: MockRealm
  className?: string
  onUpdate?: (realmId: string, updates: Partial<MockRealm>) => Promise<boolean>
  onInviteMember?: (realmId: string, email: string, role: string) => Promise<boolean>
  onRemoveMember?: (realmId: string, userId: string) => Promise<boolean>
  onDelete?: (realmId: string) => Promise<boolean>
}

interface InviteMemberForm {
  email: string
  role: 'admin' | 'user' | 'viewer'
  message: string
}

export const RealmSettings: React.FC<RealmSettingsProps> = ({
  realm,
  className,
  onUpdate,
  onInviteMember,
  onRemoveMember,
  onDelete,
}) => {
  const { currentRealm } = useRealm()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState<InviteMemberForm>({
    email: '',
    role: 'user',
    message: ''
  })
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  const usageSummary = getRealmUsageSummary(realm.id)
  const membershipStats = getRealmMembershipStats(realm.id)
  const isCurrentRealm = currentRealm?.id === realm.id

  // Mock API key for demonstration
  const mockApiKey = 'mk_' + Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (onUpdate) {
        await onUpdate(realm.id, {})
      }
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteForm.email.trim()) return

    try {
      const success = await onInviteMember?.(realm.id, inviteForm.email, inviteForm.role)
      if (success) {
        setShowInviteDialog(false)
        setInviteForm({ email: '', role: 'user', message: '' })
      }
    } catch (error) {
      console.error('Failed to invite member:', error)
    }
  }

  const handleDeleteRealm = async () => {
    try {
      const success = await onDelete?.(realm.id)
      if (success) {
        setShowDeleteDialog(false)
      }
    } catch (error) {
      console.error('Failed to delete realm:', error)
    }
  }

  const getStatusIcon = () => {
    switch (realm.status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'maintenance':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-600" />
      case 'archived':
        return <Archive className="w-4 h-4 text-red-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <TooltipProvider>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-xl">
              🏢
            </div>
            <div>
              <h1 className="text-2xl font-bold">{realm.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon()}
                <span className="text-sm text-muted-foreground capitalize">
                  {realm.status}
                </span>
                <Badge variant="outline">{realm.tier}</Badge>
                {isCurrentRealm && (
                  <Badge variant="secondary">Current Realm</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API & Keys</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="realm-name">Realm Name</Label>
                    <Input
                      id="realm-name"
                      value={realm.name}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="realm-description">Description</Label>
                    <Textarea
                      id="realm-description"
                      value={realm.description}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Created</Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {realm.createdAt.toLocaleDateString()} by {realm.createdBy}
                    </div>
                  </div>

                  <div>
                    <Label>Last Updated</Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {realm.updatedAt.toLocaleDateString()}
                    </div>
                  </div>

                  <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              {usageSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Documents</span>
                          <span>{usageSummary.documentsUsage.used}/{usageSummary.documentsUsage.limit}</span>
                        </div>
                        <Progress value={usageSummary.documentsUsage.percentage} />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Storage</span>
                          <span>{usageSummary.storageUsage.used}/{usageSummary.storageUsage.limit}GB</span>
                        </div>
                        <Progress value={usageSummary.storageUsage.percentage} />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>API Usage</span>
                          <span>{usageSummary.apiUsage.used}/{usageSummary.apiUsage.limit}</span>
                        </div>
                        <Progress value={usageSummary.apiUsage.percentage} />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Users</span>
                          <span>{usageSummary.usersUsage.used}/{usageSummary.usersUsage.limit}</span>
                        </div>
                        <Progress value={usageSummary.usersUsage.percentage} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{realm.usage.documentsUploaded}</p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{membershipStats?.active || 0}</p>
                      <p className="text-sm text-muted-foreground">Active Members</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{Math.round(realm.usage.totalStorageUsedMb / 1024 * 10) / 10}</p>
                      <p className="text-sm text-muted-foreground">GB Used</p>
                    </div>
                    <Database className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{realm.integrations.filter(i => i.status === 'active').length}</p>
                      <p className="text-sm text-muted-foreground">Integrations</p>
                    </div>
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Team Members</h3>
                <p className="text-sm text-muted-foreground">
                  Manage access and roles for your realm members
                </p>
              </div>
              
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join this realm
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="colleague@company.com"
                      />
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Select
                        value={inviteForm.role}
                        onValueChange={(value: 'admin' | 'user' | 'viewer') => setInviteForm(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - Read only access</SelectItem>
                          <SelectItem value="user">User - Can read and upload documents</SelectItem>
                          <SelectItem value="admin">Admin - Full realm access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                      <Textarea
                        id="invite-message"
                        value={inviteForm.message}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Welcome to our team realm!"
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {realm.memberships.map((membership) => (
                    <div key={membership.userId} className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">User {membership.userId}</div>
                          <div className="text-sm text-muted-foreground">
                            Joined {membership.joinedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                          {membership.role}
                        </Badge>
                        <Badge variant="outline">
                          {membership.status}
                        </Badge>
                        {onRemoveMember && membership.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveMember(realm.id, membership.userId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Processing Configuration
                </CardTitle>
                <CardDescription>
                  Configure how documents are processed in this realm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label>Processing Mode</Label>
                    <Select value={realm.configuration.processing.mode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Chunking Strategy</Label>
                    <Select value={realm.configuration.processing.chunkingStrategy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semantic">Semantic</SelectItem>
                        <SelectItem value="fixed">Fixed Size</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="chunk-size">Chunk Size</Label>
                    <Input
                      id="chunk-size"
                      type="number"
                      value={realm.configuration.processing.chunkSize}
                    />
                  </div>

                  <div>
                    <Label htmlFor="chunk-overlap">Chunk Overlap</Label>
                    <Input
                      id="chunk-overlap"
                      type="number"
                      value={realm.configuration.processing.chunkOverlap}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Processing Features</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-process on Upload</Label>
                      <div className="text-sm text-muted-foreground">
                        Automatically start processing when documents are uploaded
                      </div>
                    </div>
                    <Switch checked={realm.configuration.processing.autoProcessOnUpload} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Markdown Optimizer</Label>
                      <div className="text-sm text-muted-foreground">
                        Use LLM to improve text quality before processing
                      </div>
                    </div>
                    <Switch checked={realm.configuration.processing.enableMarkdownOptimizer} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Fact Generation</Label>
                      <div className="text-sm text-muted-foreground">
                        Extract structured facts from documents
                      </div>
                    </div>
                    <Switch checked={realm.configuration.processing.enableFactGeneration} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Entity Extraction</Label>
                      <div className="text-sm text-muted-foreground">
                        Identify and extract named entities
                      </div>
                    </div>
                    <Switch checked={realm.configuration.processing.enableEntityExtraction} />
                  </div>
                </div>

                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Processing Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Configure authentication and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Single Sign-On (SSO)</Label>
                      <div className="text-sm text-muted-foreground">
                        {realm.configuration.security.ssoProvider ? `Using ${realm.configuration.security.ssoProvider}` : 'Not configured'}
                      </div>
                    </div>
                    <Switch checked={realm.configuration.security.enableSso} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Multi-Factor Authentication</Label>
                      <div className="text-sm text-muted-foreground">
                        Require MFA for all user accounts
                      </div>
                    </div>
                    <Switch checked={realm.configuration.security.mfaRequired} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <div className="text-sm text-muted-foreground">
                        Log all user activities and system events
                      </div>
                    </div>
                    <Switch checked={realm.configuration.security.enableAuditLog} />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="session-timeout">Session Timeout (Minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={realm.configuration.security.sessionTimeoutMinutes}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Users will be automatically logged out after this period of inactivity
                  </div>
                </div>

                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Keys Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Configuration
                </CardTitle>
                <CardDescription>
                  Manage API access and authentication keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                    <Input
                      id="rate-limit"
                      type="number"
                      value={realm.configuration.api.rateLimitPerMinute}
                    />
                  </div>

                  <div>
                    <Label htmlFor="key-rotation">API Key Rotation (days)</Label>
                    <Input
                      id="key-rotation"
                      type="number"
                      value={realm.configuration.api.apiKeyRotationDays}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Webhooks</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow external systems to receive event notifications
                    </div>
                  </div>
                  <Switch checked={realm.configuration.api.enableWebhooks} />
                </div>

                <Separator />

                <div>
                  <Label>Primary API Key</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type={apiKeyVisible ? "text" : "password"}
                      value={mockApiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    >
                      {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(mockApiKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    This key provides full access to the realm API
                  </div>
                </div>

                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save API Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <h4 className="font-medium text-destructive mb-2">Delete Realm</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a realm, there is no going back. This will permanently 
                    delete all documents, settings, and remove all members.
                  </p>
                  
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" disabled={isCurrentRealm}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Realm
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Realm</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the realm
                          "{realm.name}" and all of its data.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                        <h4 className="font-medium text-destructive mb-2">This will delete:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• All {realm.usage.documentsUploaded} documents and files</li>
                          <li>• All processing jobs and results</li>
                          <li>• All {membershipStats?.total || 0} member accounts and permissions</li>
                          <li>• All integrations and webhooks</li>
                          <li>• All usage history and analytics</li>
                        </ul>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteRealm}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Yes, Delete Realm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {isCurrentRealm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      You cannot delete the currently active realm. Switch to a different realm first.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

export default RealmSettings