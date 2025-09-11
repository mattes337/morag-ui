'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/Separator'
import { Checkbox } from '@/components/ui/Checkbox'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useUserSettings, ApiKeyCreateRequest } from '@/lib/hooks/useUserSettings'
import { availableApiPermissions } from '@/lib/mockData/userSettings'
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff,
  Trash2, 
  RotateCcw,
  Calendar,
  TrendingUp,
  Shield,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Code,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CreateApiKeyDialog: React.FC<CreateApiKeyDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { createApiKey, isLoading } = useUserSettings()
  const [formData, setFormData] = useState<ApiKeyCreateRequest>({
    name: '',
    permissions: [],
    ipRestrictions: []
  })
  const [ipInput, setIpInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    // Validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'API key name is required'
    }
    
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required'
    }

    // Validate IP restrictions
    if (ipInput.trim()) {
      const ips = ipInput.split('\n').filter(ip => ip.trim())
      const invalidIps = ips.filter(ip => {
        // Basic IP/CIDR validation
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
        return !ipRegex.test(ip.trim())
      })
      
      if (invalidIps.length > 0) {
        newErrors.ipRestrictions = `Invalid IP addresses: ${invalidIps.join(', ')}`
      }
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const ipRestrictions = ipInput.trim() 
          ? ipInput.split('\n').filter(ip => ip.trim()).map(ip => ip.trim())
          : []
          
        await createApiKey({
          ...formData,
          ipRestrictions
        })
        
        // Reset form
        setFormData({
          name: '',
          permissions: [],
          ipRestrictions: []
        })
        setIpInput('')
        setErrors({})
        onSuccess()
        onOpenChange(false)
      } catch (error) {
        setErrors({ submit: 'Failed to create API key' })
      }
    }
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create API Key
          </DialogTitle>
          <DialogDescription>
            Create a new API key to access the MoRAG API programmatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key-name">
                API Key Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="api-key-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Production Integration"
                className={cn(errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Choose a descriptive name to identify this API key
              </p>
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">
                Permissions <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Select which operations this API key can perform
              </p>
            </div>
            
            {errors.permissions && (
              <div className="text-sm text-destructive">{errors.permissions}</div>
            )}

            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {availableApiPermissions.map((permission) => (
                <div
                  key={permission.value}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                >
                  <Checkbox
                    id={permission.value}
                    checked={formData.permissions.includes(permission.value)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission.value, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={permission.value} 
                      className="font-medium cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* IP Restrictions */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="ip-restrictions" className="text-base font-medium">
                IP Restrictions (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Limit access to specific IP addresses or ranges (CIDR notation)
              </p>
            </div>
            
            <Textarea
              id="ip-restrictions"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="192.168.1.0/24&#10;203.0.113.0/24"
              rows={3}
              className={cn(errors.ipRestrictions && 'border-destructive')}
            />
            
            {errors.ipRestrictions && (
              <p className="text-sm text-destructive">{errors.ipRestrictions}</p>
            )}
            
            <p className="text-sm text-muted-foreground">
              Enter one IP address or CIDR range per line. Leave empty to allow all IPs.
            </p>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ApiKeyCardProps {
  apiKey: any // APIKey type from mock data
  onRevoke: (id: string) => void
  onRegenerate: (id: string) => void
  onUpdatePermissions: (id: string, permissions: string[]) => void
}

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  apiKey,
  onRevoke,
  onRegenerate,
  onUpdatePermissions
}) => {
  const [showKey, setShowKey] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'expired': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'revoked': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100)
  }

  return (
    <Card className={cn(
      "transition-all duration-200",
      apiKey.status === 'revoked' && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{apiKey.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(apiKey.status)}>
                {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {formatDate(apiKey.createdAt)}
              </span>
            </div>
          </div>
          
          {apiKey.status === 'active' && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerate(apiKey.id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRevoke(apiKey.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Key
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={showKey ? apiKey.key : apiKey.keyPreview}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(apiKey.key, 'key')}
            >
              {copiedField === 'key' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Usage Statistics
          </Label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Requests</p>
              <p className="font-medium">{apiKey.usageStats.totalRequests.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">This Month</p>
              <p className="font-medium">{apiKey.usageStats.requestsThisMonth.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Daily Average</p>
              <p className="font-medium">{apiKey.usageStats.averageRequestsPerDay}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Used</p>
              <p className="font-medium">
                {apiKey.usageStats.lastUsed 
                  ? formatDate(apiKey.usageStats.lastUsed)
                  : 'Never'
                }
              </p>
            </div>
          </div>

          {/* Rate Limit Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Usage</span>
              <span>
                {apiKey.rateLimit.currentDailyUsage} / {apiKey.rateLimit.requestsPerDay.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(apiKey.rateLimit.currentDailyUsage, apiKey.rateLimit.requestsPerDay)}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hourly Usage</span>
              <span>
                {apiKey.rateLimit.currentHourlyUsage} / {apiKey.rateLimit.requestsPerHour.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(apiKey.rateLimit.currentHourlyUsage, apiKey.rateLimit.requestsPerHour)}
              className="h-2"
            />
          </div>
        </div>

        <Separator />

        {/* Permissions */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </Label>
          <div className="flex flex-wrap gap-1">
            {apiKey.permissions.map((permission: string) => (
              <Badge key={permission} variant="outline" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </div>

        {/* IP Restrictions */}
        {apiKey.ipRestrictions.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              IP Restrictions
            </Label>
            <div className="flex flex-wrap gap-1">
              {apiKey.ipRestrictions.map((ip: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs font-mono">
                  {ip}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expiration */}
        {apiKey.expiresAt && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiration
            </Label>
            <p className="text-sm">
              Expires on {formatDate(apiKey.expiresAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function APIKeySettings() {
  const {
    apiKeys,
    createApiKey,
    revokeApiKey,
    regenerateApiKey,
    updateApiKeyPermissions,
    isLoading,
    error,
    clearError
  } = useUserSettings()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleRevoke = async (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      await revokeApiKey(keyId)
    }
  }

  const handleRegenerate = async (keyId: string) => {
    if (confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      try {
        const newKey = await regenerateApiKey(keyId)
        // Show the new key to the user
        setCopiedText(newKey.key)
        setTimeout(() => setCopiedText(null), 10000) // Hide after 10 seconds
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const activeKeys = apiKeys.filter(key => key.status === 'active')
  const inactiveKeys = apiKeys.filter(key => key.status !== 'active')

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Create and manage API keys for programmatic access to MoRAG
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* API Documentation Link */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-800">Getting Started with the API</p>
              <p className="text-sm text-blue-700 mt-1">
                Learn how to authenticate and make your first API requests with our comprehensive documentation.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                  <Code className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  API Examples
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Key Alert */}
      {copiedText && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800">New API Key Generated</p>
                <p className="text-sm text-green-700 mt-1">
                  Your new API key has been generated. Make sure to copy it now as you won't be able to see it again.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    value={copiedText}
                    readOnly
                    className="font-mono text-sm bg-green-100 border-green-300"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => navigator.clipboard.writeText(copiedText)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active API Keys */}
      {activeKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Active API Keys</h3>
          <div className="grid gap-4">
            {activeKeys.map((apiKey) => (
              <ApiKeyCard
                key={apiKey.id}
                apiKey={apiKey}
                onRevoke={handleRevoke}
                onRegenerate={handleRegenerate}
                onUpdatePermissions={updateApiKeyPermissions}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive API Keys */}
      {inactiveKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-muted-foreground">Inactive API Keys</h3>
          <div className="grid gap-4">
            {inactiveKeys.map((apiKey) => (
              <ApiKeyCard
                key={apiKey.id}
                apiKey={apiKey}
                onRevoke={handleRevoke}
                onRegenerate={handleRegenerate}
                onUpdatePermissions={updateApiKeyPermissions}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {apiKeys.length === 0 && (
        <Card className="text-center p-8">
          <div className="space-y-4">
            <Key className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No API Keys</h3>
              <p className="text-muted-foreground">
                Create your first API key to start integrating with MoRAG
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First API Key
            </Button>
          </div>
        </Card>
      )}

      {/* Rate Limits Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rate Limits & Usage
          </CardTitle>
          <CardDescription>
            Understand your API usage limits and best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">1,000</p>
              <p className="text-sm text-muted-foreground">Requests per hour</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">10,000</p>
              <p className="text-sm text-muted-foreground">Requests per day</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">100MB</p>
              <p className="text-sm text-muted-foreground">Upload size limit</p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Rate limits are applied per API key</p>
            <p>• Unused quotas don't roll over to the next period</p>
            <p>• Contact support for higher limits if needed</p>
            <p>• Use webhooks instead of polling to reduce API calls</p>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <CreateApiKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          // Refresh handled by the hook
        }}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">
                  API Key Operation Failed
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="flex-shrink-0"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}