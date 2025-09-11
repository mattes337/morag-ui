'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { SettingsNav } from '@/components/settings/SettingsNav'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { IntegrationSettings } from '@/components/settings/IntegrationSettings'
import { useUserSettings } from '@/lib/hooks/useUserSettings'
import { 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'


export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [isMobileNavCollapsed, setIsMobileNavCollapsed] = useState(true)
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
            <SettingsNav
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              isMobile={true}
              isCollapsed={isMobileNavCollapsed}
              onToggleCollapsed={() => setIsMobileNavCollapsed(!isMobileNavCollapsed)}
              className="lg:block"
            />
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">General Settings</h2>
                <p className="text-muted-foreground mt-2">
                  Configure your theme, language, timezone, and default preferences
                </p>
              </div>
              <GeneralSettings 
                isSaving={isSaving}
                error={error}
                onSave={async () => {
                  // Save general settings logic
                  await new Promise(resolve => setTimeout(resolve, 1000))
                }}
                onReset={async () => {
                  // Reset general settings logic  
                  await new Promise(resolve => setTimeout(resolve, 500))
                }}
              />
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Security Settings</h2>
                <p className="text-muted-foreground mt-2">
                  Manage your password, two-factor authentication, API keys, and active sessions
                </p>
              </div>
              <SecuritySettings />
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Notification Settings</h2>
                <p className="text-muted-foreground mt-2">
                  Configure email, push, and in-app notification preferences
                </p>
              </div>
              <NotificationSettings />
            </div>
          )}

          {/* Integration Settings */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Integration Settings</h2>
                <p className="text-muted-foreground mt-2">
                  Configure vector databases, LLM providers, and external service integrations
                </p>
              </div>
              <IntegrationSettings />
            </div>
          )}
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