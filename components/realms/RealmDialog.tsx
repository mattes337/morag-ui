/**
 * RealmDialog - Create and edit realm modal dialog
 * Comprehensive form with validation and configuration options
 */
'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MockRealm, RealmTier, ProcessingMode, StorageProvider, VectorDatabase } from '@/lib/mockData/realmMockData'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Building2,
  Palette,
  Settings,
  Database,
  Shield,
  Loader2,
  AlertTriangle,
  Check
} from 'lucide-react'

interface RealmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  realm?: MockRealm
  mode: 'create' | 'edit'
  onSave?: (realmData: RealmFormData) => Promise<boolean>
}

interface RealmFormData {
  name: string
  description: string
  tier: RealmTier
  processing: {
    mode: ProcessingMode
    autoProcessOnUpload: boolean
    enableMarkdownOptimizer: boolean
    chunkingStrategy: 'semantic' | 'fixed' | 'hybrid'
    chunkSize: number
    chunkOverlap: number
    enableFactGeneration: boolean
    enableEntityExtraction: boolean
  }
  storage: {
    provider: StorageProvider
    maxFileSize: number
    allowedFileTypes: string[]
    retentionPolicyDays: number
    enableEncryption: boolean
  }
  vectorDb: {
    provider: VectorDatabase
    dimension: number
    similarityMetric: 'cosine' | 'euclidean' | 'dot_product'
  }
  security: {
    enableSso: boolean
    ssoProvider?: string
    mfaRequired: boolean
    sessionTimeoutMinutes: number
    enableAuditLog: boolean
  }
  access: {
    isPublic: boolean
    requireApproval: boolean
    defaultRole: 'admin' | 'user' | 'viewer'
  }
  quotas: {
    documentsPerMonth: number
    storageGb: number
    usersLimit: number
  }
  tags: string[]
}

const DEFAULT_FORM_DATA: RealmFormData = {
  name: '',
  description: '',
  tier: 'basic',
  processing: {
    mode: 'automatic',
    autoProcessOnUpload: true,
    enableMarkdownOptimizer: false,
    chunkingStrategy: 'semantic',
    chunkSize: 1000,
    chunkOverlap: 200,
    enableFactGeneration: true,
    enableEntityExtraction: true,
  },
  storage: {
    provider: 'local',
    maxFileSize: 50,
    allowedFileTypes: ['pdf', 'docx', 'txt', 'md'],
    retentionPolicyDays: 365,
    enableEncryption: false,
  },
  vectorDb: {
    provider: 'chromadb',
    dimension: 768,
    similarityMetric: 'cosine',
  },
  security: {
    enableSso: false,
    mfaRequired: false,
    sessionTimeoutMinutes: 480,
    enableAuditLog: false,
  },
  access: {
    isPublic: false,
    requireApproval: true,
    defaultRole: 'user',
  },
  quotas: {
    documentsPerMonth: 100,
    storageGb: 10,
    usersLimit: 5,
  },
  tags: [],
}

const TIER_LIMITS = {
  basic: {
    documentsPerMonth: 100,
    storageGb: 10,
    usersLimit: 5,
    apiRequestsPerMonth: 5000,
  },
  professional: {
    documentsPerMonth: 1000,
    storageGb: 100,
    usersLimit: 25,
    apiRequestsPerMonth: 50000,
  },
  enterprise: {
    documentsPerMonth: 10000,
    storageGb: 1000,
    usersLimit: 100,
    apiRequestsPerMonth: 500000,
  },
  custom: {
    documentsPerMonth: 50000,
    storageGb: 5000,
    usersLimit: 500,
    apiRequestsPerMonth: 1000000,
  },
}

export const RealmDialog: React.FC<RealmDialogProps> = ({
  open,
  onOpenChange,
  realm,
  mode,
  onSave,
}) => {
  const [formData, setFormData] = useState<RealmFormData>(DEFAULT_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [newTag, setNewTag] = useState('')

  // Initialize form data when realm changes
  useEffect(() => {
    if (realm && mode === 'edit') {
      setFormData({
        name: realm.name,
        description: realm.description,
        tier: realm.tier,
        processing: realm.configuration.processing,
        storage: realm.configuration.storage,
        vectorDb: realm.configuration.vectorDb,
        security: realm.configuration.security,
        access: {
          isPublic: false, // Derived from realm data
          requireApproval: true,
          defaultRole: 'user',
        },
        quotas: realm.quotas,
        tags: realm.tags,
      })
    } else {
      setFormData(DEFAULT_FORM_DATA)
    }
    setErrors({})
  }, [realm, mode, open])

  // Update quotas when tier changes
  useEffect(() => {
    const limits = TIER_LIMITS[formData.tier]
    setFormData(prev => ({
      ...prev,
      quotas: {
        documentsPerMonth: limits.documentsPerMonth,
        storageGb: limits.storageGb,
        usersLimit: limits.usersLimit,
      },
    }))
  }, [formData.tier])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Realm name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Realm name must be at least 3 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Realm name must be less than 50 characters'
    }

    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    // Processing validation
    if (formData.processing.chunkSize < 100 || formData.processing.chunkSize > 5000) {
      newErrors.chunkSize = 'Chunk size must be between 100 and 5000 characters'
    }

    if (formData.processing.chunkOverlap < 0 || formData.processing.chunkOverlap >= formData.processing.chunkSize) {
      newErrors.chunkOverlap = 'Chunk overlap must be less than chunk size'
    }

    // Storage validation
    if (formData.storage.maxFileSize < 1 || formData.storage.maxFileSize > 1000) {
      newErrors.maxFileSize = 'Max file size must be between 1 and 1000 MB'
    }

    if (formData.storage.retentionPolicyDays < 1 || formData.storage.retentionPolicyDays > 3650) {
      newErrors.retentionPolicyDays = 'Retention policy must be between 1 and 3650 days'
    }

    // Vector DB validation
    if (![384, 512, 768, 1024, 1536, 3072].includes(formData.vectorDb.dimension)) {
      newErrors.vectorDimension = 'Vector dimension must be one of: 384, 512, 768, 1024, 1536, 3072'
    }

    // Security validation
    if (formData.security.sessionTimeoutMinutes < 15 || formData.security.sessionTimeoutMinutes > 1440) {
      newErrors.sessionTimeout = 'Session timeout must be between 15 and 1440 minutes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      const success = await onSave?.(formData)
      if (success) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to save realm:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.')
      const updated = { ...prev }
      let current = updated as any
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return updated
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {mode === 'create' ? 'Create New Realm' : `Edit ${realm?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Configure your new workspace with processing pipeline and security settings.'
              : 'Update realm configuration and settings.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="processing" className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Processing
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Palette className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              {/* Basic Settings */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <CardDescription>
                      Set the realm name, description, and tier level.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Realm Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="Enter realm name"
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Describe the purpose of this realm"
                        rows={3}
                        className={errors.description ? 'border-destructive' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1">{errors.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.description.length}/200 characters
                      </p>
                    </div>

                    <div>
                      <Label>Tier Level</Label>
                      <Select
                        value={formData.tier}
                        onValueChange={(value: RealmTier) => updateFormData('tier', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic - Up to 100 docs/month</SelectItem>
                          <SelectItem value="professional">Professional - Up to 1K docs/month</SelectItem>
                          <SelectItem value="enterprise">Enterprise - Up to 10K docs/month</SelectItem>
                          <SelectItem value="custom">Custom - Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Tier Limits</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Documents: {TIER_LIMITS[formData.tier].documentsPerMonth.toLocaleString()}/month</div>
                        <div>Storage: {TIER_LIMITS[formData.tier].storageGb} GB</div>
                        <div>Users: {TIER_LIMITS[formData.tier].usersLimit}</div>
                        <div>API Requests: {TIER_LIMITS[formData.tier].apiRequestsPerMonth.toLocaleString()}/month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Processing Settings */}
              <TabsContent value="processing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Processing</CardTitle>
                    <CardDescription>
                      Configure how documents are processed in this realm.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Processing Mode</Label>
                      <Select
                        value={formData.processing.mode}
                        onValueChange={(value: ProcessingMode) => updateFormData('processing.mode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic - Process immediately</SelectItem>
                          <SelectItem value="manual">Manual - Process on request</SelectItem>
                          <SelectItem value="hybrid">Hybrid - Smart processing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoProcess"
                        checked={formData.processing.autoProcessOnUpload}
                        onCheckedChange={(checked) => updateFormData('processing.autoProcessOnUpload', checked)}
                      />
                      <Label htmlFor="autoProcess">Auto-process on upload</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="markdownOptimizer"
                        checked={formData.processing.enableMarkdownOptimizer}
                        onCheckedChange={(checked) => updateFormData('processing.enableMarkdownOptimizer', checked)}
                      />
                      <Label htmlFor="markdownOptimizer">Enable markdown optimizer</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="chunkSize">Chunk Size</Label>
                        <Input
                          id="chunkSize"
                          type="number"
                          value={formData.processing.chunkSize}
                          onChange={(e) => updateFormData('processing.chunkSize', parseInt(e.target.value) || 1000)}
                          className={errors.chunkSize ? 'border-destructive' : ''}
                        />
                        {errors.chunkSize && (
                          <p className="text-sm text-destructive mt-1">{errors.chunkSize}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="chunkOverlap">Chunk Overlap</Label>
                        <Input
                          id="chunkOverlap"
                          type="number"
                          value={formData.processing.chunkOverlap}
                          onChange={(e) => updateFormData('processing.chunkOverlap', parseInt(e.target.value) || 200)}
                          className={errors.chunkOverlap ? 'border-destructive' : ''}
                        />
                        {errors.chunkOverlap && (
                          <p className="text-sm text-destructive mt-1">{errors.chunkOverlap}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Chunking Strategy</Label>
                      <Select
                        value={formData.processing.chunkingStrategy}
                        onValueChange={(value: 'semantic' | 'fixed' | 'hybrid') => updateFormData('processing.chunkingStrategy', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semantic">Semantic - Context-aware</SelectItem>
                          <SelectItem value="fixed">Fixed - Fixed size chunks</SelectItem>
                          <SelectItem value="hybrid">Hybrid - Mixed approach</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="factGeneration"
                        checked={formData.processing.enableFactGeneration}
                        onCheckedChange={(checked) => updateFormData('processing.enableFactGeneration', checked)}
                      />
                      <Label htmlFor="factGeneration">Enable fact generation</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="entityExtraction"
                        checked={formData.processing.enableEntityExtraction}
                        onCheckedChange={(checked) => updateFormData('processing.enableEntityExtraction', checked)}
                      />
                      <Label htmlFor="entityExtraction">Enable entity extraction</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Storage Settings */}
              <TabsContent value="storage" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Configuration</CardTitle>
                    <CardDescription>
                      Configure storage provider and file handling settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Storage Provider</Label>
                      <Select
                        value={formData.storage.provider}
                        onValueChange={(value: StorageProvider) => updateFormData('storage.provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Storage</SelectItem>
                          <SelectItem value="aws-s3">AWS S3</SelectItem>
                          <SelectItem value="google-cloud">Google Cloud</SelectItem>
                          <SelectItem value="azure-blob">Azure Blob</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={formData.storage.maxFileSize}
                        onChange={(e) => updateFormData('storage.maxFileSize', parseInt(e.target.value) || 50)}
                        className={errors.maxFileSize ? 'border-destructive' : ''}
                      />
                      {errors.maxFileSize && (
                        <p className="text-sm text-destructive mt-1">{errors.maxFileSize}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="retentionDays">Retention Policy (Days)</Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        value={formData.storage.retentionPolicyDays}
                        onChange={(e) => updateFormData('storage.retentionPolicyDays', parseInt(e.target.value) || 365)}
                        className={errors.retentionPolicyDays ? 'border-destructive' : ''}
                      />
                      {errors.retentionPolicyDays && (
                        <p className="text-sm text-destructive mt-1">{errors.retentionPolicyDays}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="encryption"
                        checked={formData.storage.enableEncryption}
                        onCheckedChange={(checked) => updateFormData('storage.enableEncryption', checked)}
                      />
                      <Label htmlFor="encryption">Enable encryption at rest</Label>
                    </div>

                    <div>
                      <Label>Allowed File Types</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {['pdf', 'docx', 'txt', 'md', 'html', 'json', 'xml', 'csv'].map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Switch
                              checked={formData.storage.allowedFileTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFormData('storage.allowedFileTypes', [...formData.storage.allowedFileTypes, type])
                                } else {
                                  updateFormData('storage.allowedFileTypes', formData.storage.allowedFileTypes.filter(t => t !== type))
                                }
                              }}
                            />
                            <Label className="text-sm">{type}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Configuration</CardTitle>
                    <CardDescription>
                      Configure authentication and security policies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableSSO"
                        checked={formData.security.enableSso}
                        onCheckedChange={(checked) => updateFormData('security.enableSso', checked)}
                      />
                      <Label htmlFor="enableSSO">Enable Single Sign-On (SSO)</Label>
                    </div>

                    {formData.security.enableSso && (
                      <div>
                        <Label>SSO Provider</Label>
                        <Select
                          value={formData.security.ssoProvider || ''}
                          onValueChange={(value) => updateFormData('security.ssoProvider', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select SSO provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="azure-ad">Azure AD</SelectItem>
                            <SelectItem value="okta">Okta</SelectItem>
                            <SelectItem value="google">Google Workspace</SelectItem>
                            <SelectItem value="saml">Generic SAML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mfaRequired"
                        checked={formData.security.mfaRequired}
                        onCheckedChange={(checked) => updateFormData('security.mfaRequired', checked)}
                      />
                      <Label htmlFor="mfaRequired">Require multi-factor authentication (MFA)</Label>
                    </div>

                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={formData.security.sessionTimeoutMinutes}
                        onChange={(e) => updateFormData('security.sessionTimeoutMinutes', parseInt(e.target.value) || 480)}
                        className={errors.sessionTimeout ? 'border-destructive' : ''}
                      />
                      {errors.sessionTimeout && (
                        <p className="text-sm text-destructive mt-1">{errors.sessionTimeout}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auditLog"
                        checked={formData.security.enableAuditLog}
                        onCheckedChange={(checked) => updateFormData('security.enableAuditLog', checked)}
                      />
                      <Label htmlFor="auditLog">Enable audit logging</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Configuration</CardTitle>
                    <CardDescription>
                      Vector database settings and access control.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Vector Database Provider</Label>
                      <Select
                        value={formData.vectorDb.provider}
                        onValueChange={(value: VectorDatabase) => updateFormData('vectorDb.provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chromadb">ChromaDB</SelectItem>
                          <SelectItem value="qdrant">Qdrant</SelectItem>
                          <SelectItem value="pinecone">Pinecone</SelectItem>
                          <SelectItem value="weaviate">Weaviate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Vector Dimension</Label>
                        <Select
                          value={formData.vectorDb.dimension.toString()}
                          onValueChange={(value) => updateFormData('vectorDb.dimension', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="384">384</SelectItem>
                            <SelectItem value="512">512</SelectItem>
                            <SelectItem value="768">768</SelectItem>
                            <SelectItem value="1024">1024</SelectItem>
                            <SelectItem value="1536">1536</SelectItem>
                            <SelectItem value="3072">3072</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Similarity Metric</Label>
                        <Select
                          value={formData.vectorDb.similarityMetric}
                          onValueChange={(value: 'cosine' | 'euclidean' | 'dot_product') => updateFormData('vectorDb.similarityMetric', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cosine">Cosine</SelectItem>
                            <SelectItem value="euclidean">Euclidean</SelectItem>
                            <SelectItem value="dot_product">Dot Product</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mt-2 mb-2 flex-wrap">
                        {formData.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button type="button" onClick={handleAddTag} size="sm">
                          Add
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Access Control</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isPublic"
                            checked={formData.access.isPublic}
                            onCheckedChange={(checked) => updateFormData('access.isPublic', checked)}
                          />
                          <Label htmlFor="isPublic">Make realm publicly accessible</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="requireApproval"
                            checked={formData.access.requireApproval}
                            onCheckedChange={(checked) => updateFormData('access.requireApproval', checked)}
                          />
                          <Label htmlFor="requireApproval">Require approval for new members</Label>
                        </div>

                        <div>
                          <Label>Default Member Role</Label>
                          <Select
                            value={formData.access.defaultRole}
                            onValueChange={(value: 'admin' | 'user' | 'viewer') => updateFormData('access.defaultRole', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer - Read only</SelectItem>
                              <SelectItem value="user">User - Read and write</SelectItem>
                              <SelectItem value="admin">Admin - Full access</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-24"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Realm' : 'Update Realm'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RealmDialog