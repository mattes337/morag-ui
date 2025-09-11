'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { input } from '@/components/ui/input'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { 
  Plug, 
  Database, 
  Brain,
  TestTube,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Zap,
  Globe,
  Server,
  Clock,
  BarChart3,
  ExternalLink,
  Copy,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface IntegrationSettingsProps {
  className?: string
}

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  lastChecked?: string
  error?: string
  responseTime?: number
}

interface VectorDBConfig {
  id: string
  name: string
  type: 'qdrant' | 'pinecone' | 'weaviate' | 'chromadb'
  host: string
  port: string
  apiKey: string
  isDefault: boolean
  status: ConnectionStatus
  collections?: number
  totalVectors?: number
}

interface LLMConfig {
  id: string
  name: string
  provider: 'openai' | 'google' | 'anthropic' | 'local'
  model: string
  apiKey: string
  isDefault: boolean
  status: ConnectionStatus
  maxTokens: number
  temperature: number
}

const mockVectorDBs: VectorDBConfig[] = [
  {
    id: '1',
    name: 'Production Qdrant',
    type: 'qdrant',
    host: 'localhost',
    port: '6333',
    apiKey: 'qdrant_api_key_xxx',
    isDefault: true,
    status: { status: 'connected', lastChecked: '2 minutes ago', responseTime: 45 },
    collections: 12,
    totalVectors: 158420
  },
  {
    id: '2',
    name: 'Pinecone Development',
    type: 'pinecone',
    host: 'dev-index.pinecone.io',
    port: '443',
    apiKey: 'pinecone_api_key_xxx',
    isDefault: false,
    status: { status: 'disconnected', lastChecked: '1 hour ago' }
  },
  {
    id: '3',
    name: 'Local ChromaDB',
    type: 'chromadb',
    host: 'localhost',
    port: '8000',
    apiKey: '',
    isDefault: false,
    status: { status: 'error', lastChecked: '5 minutes ago', error: 'Connection timeout' }
  }
]

const mockLLMs: LLMConfig[] = [
  {
    id: '1',
    name: 'GPT-4',
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    apiKey: 'sk-xxx...xxx',
    isDefault: true,
    status: { status: 'connected', lastChecked: '1 minute ago', responseTime: 1200 },
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: '2',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    apiKey: 'sk-ant-xxx...xxx',
    isDefault: false,
    status: { status: 'connected', lastChecked: '3 minutes ago', responseTime: 800 },
    maxTokens: 3000,
    temperature: 0.5
  },
  {
    id: '3',
    name: 'Gemini Pro',
    provider: 'google',
    model: 'gemini-pro',
    apiKey: 'AIza...xxx',
    isDefault: false,
    status: { status: 'testing', lastChecked: 'Testing now' },
    maxTokens: 2000,
    temperature: 0.8
  }
]

interface StatusBadgeProps {
  status: ConnectionStatus
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: ConnectionStatus) => {
    switch (status.status) {
      case 'connected':
        return {
          variant: 'default' as const,
          icon: <CheckCircle2 className="h-3 w-3" />,
          text: 'Connected',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'disconnected':
        return {
          variant: 'secondary' as const,
          icon: <XCircle className="h-3 w-3" />,
          text: 'Disconnected',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'Error',
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      case 'testing':
        return {
          variant: 'outline' as const,
          icon: <TestTube className="h-3 w-3" />,
          text: 'Testing',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={cn("text-xs", config.className)}>
      {config.icon}
      {config.text}
    </Badge>
  )
}

interface VectorDBCardProps {
  config: VectorDBConfig
  onTest: (id: string) => void
  onUpdate: (id: string, updates: Partial<VectorDBConfig>) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
  isLoading?: boolean
}

const VectorDBCard: React.FC<VectorDBCardProps> = ({
  config,
  onTest,
  onUpdate,
  onDelete,
  onSetDefault,
  isLoading = false
}) => {
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedConfig, setEditedConfig] = React.useState(config)

  const handleSave = () => {
    onUpdate(config.id, editedConfig)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedConfig(config)
    setIsEditing(false)
  }

  const getVectorDBIcon = (type: string) => {
    switch (type) {
      case 'qdrant': return <Database className="h-5 w-5 text-blue-500" />
      case 'pinecone': return <Database className="h-5 w-5 text-green-500" />
      case 'weaviate': return <Database className="h-5 w-5 text-purple-500" />
      case 'chromadb': return <Database className="h-5 w-5 text-orange-500" />
      default: return <Database className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getVectorDBIcon(config.type)}
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="capitalize">
                {config.type} • {config.host}:{config.port}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={config.status} />
            {config.isDefault && (
              <Badge variant="outline" className="text-xs">Default</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.status.status === 'connected' && config.collections && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">{config.collections} Collections</p>
              <p className="text-xs text-muted-foreground">Active indexes</p>
            </div>
            <div>
              <p className="text-sm font-medium">{config.totalVectors?.toLocaleString()} Vectors</p>
              <p className="text-xs text-muted-foreground">Total documents indexed</p>
            </div>
          </div>
        )}

        {config.status.status === 'error' && config.status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{config.status.error}</p>
            <p className="text-xs text-red-600">Last checked: {config.status.lastChecked}</p>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host</Label>
                <input
                  type="text"
                  value={editedConfig.host}
                  onChange={(e) => setEditedConfig(prev => ({ ...prev, host: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <input
                  type="text"
                  value={editedConfig.port}
                  onChange={(e) => setEditedConfig(prev => ({ ...prev, port: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={editedConfig.apiKey}
                  onChange={(e) => setEditedConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last checked: {config.status.lastChecked}</span>
              {config.status.responseTime && (
                <span>• {config.status.responseTime}ms</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTest(config.id)}
                disabled={isLoading}
              >
                <TestTube className="h-4 w-4" />
                Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Settings className="h-4 w-4" />
                Edit
              </Button>
              {!config.isDefault && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefault(config.id)}
                    disabled={isLoading}
                  >
                    Set Default
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(config.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface LLMCardProps {
  config: LLMConfig
  onTest: (id: string) => void
  onUpdate: (id: string, updates: Partial<LLMConfig>) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
  isLoading?: boolean
}

const LLMCard: React.FC<LLMCardProps> = ({
  config,
  onTest,
  onUpdate,
  onDelete,
  onSetDefault,
  isLoading = false
}) => {
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedConfig, setEditedConfig] = React.useState(config)

  const handleSave = () => {
    onUpdate(config.id, editedConfig)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedConfig(config)
    setIsEditing(false)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Brain className="h-5 w-5 text-green-600" />
      case 'anthropic': return <Brain className="h-5 w-5 text-orange-500" />
      case 'google': return <Brain className="h-5 w-5 text-blue-500" />
      case 'local': return <Brain className="h-5 w-5 text-purple-500" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getProviderIcon(config.provider)}
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="capitalize">
                {config.provider} • {config.model}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={config.status} />
            {config.isDefault && (
              <Badge variant="outline" className="text-xs">Default</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.status.status === 'connected' && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Max Tokens</p>
              <p className="text-xs text-muted-foreground">{config.maxTokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Temperature</p>
              <p className="text-xs text-muted-foreground">{config.temperature}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Response Time</p>
              <p className="text-xs text-muted-foreground">{config.status.responseTime}ms</p>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={editedConfig.model} onValueChange={(value) => setEditedConfig(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.provider === 'openai' && (
                      <>
                        <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </>
                    )}
                    {config.provider === 'anthropic' && (
                      <>
                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                      </>
                    )}
                    {config.provider === 'google' && (
                      <>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <input
                  type="number"
                  value={editedConfig.maxTokens}
                  onChange={(e) => setEditedConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  min="100"
                  max="8000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Temperature ({editedConfig.temperature})</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={editedConfig.temperature}
                onChange={(e) => setEditedConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={editedConfig.apiKey}
                  onChange={(e) => setEditedConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last checked: {config.status.lastChecked}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTest(config.id)}
                disabled={isLoading}
              >
                <TestTube className="h-4 w-4" />
                Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Settings className="h-4 w-4" />
                Edit
              </Button>
              {!config.isDefault && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefault(config.id)}
                    disabled={isLoading}
                  >
                    Set Default
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(config.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function IntegrationSettings({ className }: IntegrationSettingsProps) {
  const [vectorDBs, setVectorDBs] = React.useState<VectorDBConfig[]>(mockVectorDBs)
  const [llmConfigs, setLLMConfigs] = React.useState<LLMConfig[]>(mockLLMs)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showNewIntegration, setShowNewIntegration] = React.useState<'vectordb' | 'llm' | null>(null)

  // Vector DB handlers
  const handleVectorDBTest = async (id: string) => {
    setIsLoading(true)
    setVectorDBs(prev => prev.map(db => 
      db.id === id ? { ...db, status: { ...db.status, status: 'testing' } } : db
    ))
    
    // Simulate API test
    setTimeout(() => {
      setVectorDBs(prev => prev.map(db => 
        db.id === id 
          ? { 
              ...db, 
              status: { 
                status: 'connected', 
                lastChecked: 'Just now', 
                responseTime: Math.floor(Math.random() * 100) + 20 
              } 
            } 
          : db
      ))
      setIsLoading(false)
    }, 2000)
  }

  const handleVectorDBUpdate = (id: string, updates: Partial<VectorDBConfig>) => {
    setVectorDBs(prev => prev.map(db => 
      db.id === id ? { ...db, ...updates } : db
    ))
  }

  const handleVectorDBDelete = (id: string) => {
    setVectorDBs(prev => prev.filter(db => db.id !== id))
  }

  const handleVectorDBSetDefault = (id: string) => {
    setVectorDBs(prev => prev.map(db => ({
      ...db,
      isDefault: db.id === id
    })))
  }

  // LLM handlers
  const handleLLMTest = async (id: string) => {
    setIsLoading(true)
    setLLMConfigs(prev => prev.map(llm => 
      llm.id === id ? { ...llm, status: { ...llm.status, status: 'testing' } } : llm
    ))
    
    // Simulate API test
    setTimeout(() => {
      setLLMConfigs(prev => prev.map(llm => 
        llm.id === id 
          ? { 
              ...llm, 
              status: { 
                status: 'connected', 
                lastChecked: 'Just now', 
                responseTime: Math.floor(Math.random() * 2000) + 500 
              } 
            } 
          : llm
      ))
      setIsLoading(false)
    }, 3000)
  }

  const handleLLMUpdate = (id: string, updates: Partial<LLMConfig>) => {
    setLLMConfigs(prev => prev.map(llm => 
      llm.id === id ? { ...llm, ...updates } : llm
    ))
  }

  const handleLLMDelete = (id: string) => {
    setLLMConfigs(prev => prev.filter(llm => llm.id !== id))
  }

  const handleLLMSetDefault = (id: string) => {
    setLLMConfigs(prev => prev.map(llm => ({
      ...llm,
      isDefault: llm.id === id
    })))
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-blue-600" />
            Integration Overview
          </CardTitle>
          <CardDescription>
            Configure and manage external services and APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">{vectorDBs.length}</div>
              <div className="text-sm text-muted-foreground">Vector Databases</div>
              <div className="text-xs text-green-600 mt-1">
                {vectorDBs.filter(db => db.status.status === 'connected').length} connected
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">{llmConfigs.length}</div>
              <div className="text-sm text-muted-foreground">LLM Providers</div>
              <div className="text-xs text-green-600 mt-1">
                {llmConfigs.filter(llm => llm.status.status === 'connected').length} connected
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-muted-foreground">External Services</div>
              <div className="text-xs text-green-600 mt-1">All operational</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vector Databases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Vector Databases
              </CardTitle>
              <CardDescription>
                Configure vector database connections for document storage and retrieval
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowNewIntegration('vectordb')}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Database
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {vectorDBs.map((config) => (
            <VectorDBCard
              key={config.id}
              config={config}
              onTest={handleVectorDBTest}
              onUpdate={handleVectorDBUpdate}
              onDelete={handleVectorDBDelete}
              onSetDefault={handleVectorDBSetDefault}
              isLoading={isLoading}
            />
          ))}
        </CardContent>
      </Card>

      {/* LLM Configurations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Language Models
              </CardTitle>
              <CardDescription>
                Configure LLM providers for document processing and analysis
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowNewIntegration('llm')}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {llmConfigs.map((config) => (
            <LLMCard
              key={config.id}
              config={config}
              onTest={handleLLMTest}
              onUpdate={handleLLMUpdate}
              onDelete={handleLLMDelete}
              onSetDefault={handleLLMSetDefault}
              isLoading={isLoading}
            />
          ))}
        </CardContent>
      </Card>

      {/* External Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            External Services
          </CardTitle>
          <CardDescription>
            Configure third-party integrations and webhooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">YouTube Processor</span>
                </div>
                <StatusBadge status={{ status: 'connected', lastChecked: '5 mins ago' }} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Process YouTube videos using Apify integration
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>API Key</span>
                  <span className="font-mono">apify_api_xxx...xxx</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Monthly Usage</span>
                  <span>1,240 / 5,000 requests</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Webhook Endpoint</span>
                </div>
                <StatusBadge status={{ status: 'connected', lastChecked: '1 min ago' }} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Receive processing status updates via webhooks
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Endpoint</span>
                  <span className="font-mono">https://api.morag.com/webhooks</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Last Event</span>
                  <span>Document processed (2 mins ago)</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Analytics Export</span>
                </div>
                <StatusBadge status={{ status: 'disconnected' }} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Export analytics data to external BI tools
              </p>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Processing Queue</span>
                </div>
                <StatusBadge status={{ status: 'connected', lastChecked: 'Real-time' }} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Redis-based job queue for document processing
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Active Jobs</span>
                  <span>3</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Completed Today</span>
                  <span>127</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Health */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Connection Health
          </CardTitle>
          <CardDescription>
            Monitor the health and performance of your integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime (30 days)</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-blue-600">45ms</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2.1K</div>
                <div className="text-sm text-muted-foreground">Requests Today</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Vector DB Performance</span>
                <span className="text-green-600">Excellent</span>
              </div>
              <Progress value={95} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>LLM Response Time</span>
                <span className="text-blue-600">Good</span>
              </div>
              <Progress value={78} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>External Services</span>
                <span className="text-green-600">Operational</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

IntegrationSettings.displayName = 'IntegrationSettings'