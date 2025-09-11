'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/Separator'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { AccountSettings } from '@/components/settings/AccountSettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { APIKeySettings } from '@/components/settings/APIKeySettings'
import { useUserSettings } from '@/lib/hooks/useUserSettings'
import { 
  User, 
  Shield, 
  Bell, 
  Key, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsTabProps {
  value: string
  icon: React.ReactNode
  label: string
  description: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const SettingsTab: React.FC<SettingsTabProps> = ({ 
  value, 
  icon, 
  label, 
  description, 
  badge, 
  badgeVariant = 'secondary' 
}) => (
  <TabsTrigger
    value={value}
    className="flex flex-col items-start p-4 h-auto data-[state=active]:bg-accent"
  >
    <div className="flex items-center gap-3 w-full">
      <div className="flex-shrink-0 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {badge && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </div>
    </div>
  </TabsTrigger>
)

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { isSaving, lastSaved, error, clearError } = useUserSettings()

  // Format last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return null
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Saved just now'
    if (diffInSeconds < 3600) return `Saved ${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `Saved ${Math.floor(diffInSeconds / 3600)} hours ago`
    return `Saved on ${date.toLocaleDateString()}`
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings, preferences, and integrations
            </p>
          </div>
          
          {/* Save Status */}
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving changes...</span>
              </div>
            )}
            
            {!isSaving && lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{formatLastSaved(lastSaved)}</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Save failed</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-6 px-2"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <Separator className="mt-6" />
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-1 h-auto p-1 bg-background">
                  <SettingsTab
                    value="profile"
                    icon={<User className="h-5 w-5" />}
                    label="Profile"
                    description="Personal information and preferences"
                  />
                  <SettingsTab
                    value="account"
                    icon={<Shield className="h-5 w-5" />}
                    label="Account & Security"
                    description="Password, 2FA, and login history"
                    badge="2FA Enabled"
                    badgeVariant="outline"
                  />
                  <SettingsTab
                    value="notifications"
                    icon={<Bell className="h-5 w-5" />}
                    label="Notifications"
                    description="Email and in-app notification settings"
                  />
                  <SettingsTab
                    value="api"
                    icon={<Key className="h-5 w-5" />}
                    label="API Keys"
                    description="Manage API access and integrations"
                    badge="3 Active"
                    badgeVariant="secondary"
                  />
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="profile" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Profile Settings</h2>
                  <p className="text-muted-foreground mt-2">
                    Update your personal information and customize your profile
                  </p>
                </div>
                <ProfileSettings />
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Account & Security</h2>
                  <p className="text-muted-foreground mt-2">
                    Manage your account security, password, and authentication settings
                  </p>
                </div>
                <AccountSettings />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Notification Settings</h2>
                  <p className="text-muted-foreground mt-2">
                    Choose how and when you want to receive notifications
                  </p>
                </div>
                <NotificationSettings />
              </div>
            </TabsContent>

            <TabsContent value="api" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">API Keys</h2>
                  <p className="text-muted-foreground mt-2">
                    Create and manage API keys for integrations and automation
                  </p>
                </div>
                <APIKeySettings />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Global Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-destructive">
                    Error saving settings
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="flex-shrink-0 h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}