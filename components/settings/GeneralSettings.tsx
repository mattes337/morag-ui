'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Textarea } from '@/components/ui/Textarea'
import { 
  Palette, 
  Globe, 
  Clock, 
  Monitor,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GeneralSettingsProps {
  isSaving?: boolean
  error?: string | null
  onSave?: () => Promise<void>
  onReset?: () => Promise<void>
}

// Mock data for settings
const themes = [
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> }
]

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'zh', label: '中文', flag: '🇨🇳' }
]

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'Europe/London', label: 'Greenwich Mean Time', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Central European Time', offset: 'UTC+1' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'China Standard Time', offset: 'UTC+8' }
]

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY', example: 'Dec 31, 2024' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '31 Dec 2024' }
]

const timeFormats = [
  { value: '12h', label: '12-hour', example: '2:30 PM' },
  { value: '24h', label: '24-hour', example: '14:30' }
]

export function GeneralSettings({
  isSaving = false,
  error = null,
  onSave,
  onReset
}: GeneralSettingsProps) {
  // State for settings
  const [settings, setSettings] = React.useState({
    theme: 'system',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    autoSave: true,
    enableAnimations: true,
    showAdvancedOptions: false,
    compactMode: false,
    highContrast: false,
    defaultRealm: '',
    defaultProcessingMode: 'manual',
    maxFileSize: '100',
    enablePreviews: true,
    previewQuality: 'medium'
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

  // Handle setting changes
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setHasUnsavedChanges(true)
  }

  // Handle save
  const handleSave = async () => {
    try {
      await onSave?.()
      setHasUnsavedChanges(false)
    } catch (error) {
      // Error handling is managed by parent
    }
  }

  // Handle reset to defaults
  const handleReset = async () => {
    try {
      await onReset?.()
      setHasUnsavedChanges(false)
      // Reset to default values
      setSettings({
        theme: 'system',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        autoSave: true,
        enableAnimations: true,
        showAdvancedOptions: false,
        compactMode: false,
        highContrast: false,
        defaultRealm: '',
        defaultProcessingMode: 'manual',
        maxFileSize: '100',
        enablePreviews: true,
        previewQuality: 'medium'
      })
    } catch (error) {
      // Error handling is managed by parent
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of your interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <RadioGroup 
              value={settings.theme} 
              onValueChange={(value) => updateSetting('theme', value)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {themes.map((theme) => (
                <div key={theme.value} className="relative">
                  <RadioGroupItem
                    value={theme.value}
                    id={theme.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={theme.value}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-checked:border-primary peer-checked:bg-primary/10"
                    )}
                  >
                    <div className="mb-2 text-muted-foreground peer-checked:text-primary">
                      {theme.icon}
                    </div>
                    <span className="text-sm font-medium">{theme.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span>Enable Animations</span>
                <Badge variant="secondary" className="text-xs">Performance</Badge>
              </Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Smooth transitions and animations
                </p>
                <Switch
                  checked={settings.enableAnimations}
                  onCheckedChange={(checked) => updateSetting('enableAnimations', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Compact Mode</Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Reduce spacing for dense layouts
                </p>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>High Contrast</Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Improve readability with higher contrast
                </p>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Configure language, timezone, and regional formatting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tz.label}</span>
                        <span className="text-xs text-muted-foreground">{tz.offset}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{format.label}</span>
                        <span className="text-xs text-muted-foreground">{format.example}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={settings.timeFormat} onValueChange={(value) => updateSetting('timeFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{format.label}</span>
                        <span className="text-xs text-muted-foreground">{format.example}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Default Preferences
          </CardTitle>
          <CardDescription>
            Set default values for common operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Auto-Save</Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Automatically save changes after 2 seconds
                </p>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processingMode">Default Processing Mode</Label>
              <Select 
                value={settings.defaultProcessingMode} 
                onValueChange={(value) => updateSetting('defaultProcessingMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="batch">Batch Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
              <Select 
                value={settings.maxFileSize} 
                onValueChange={(value) => updateSetting('maxFileSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 MB</SelectItem>
                  <SelectItem value="100">100 MB</SelectItem>
                  <SelectItem value="250">250 MB</SelectItem>
                  <SelectItem value="500">500 MB</SelectItem>
                  <SelectItem value="1000">1 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Enable File Previews</Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Show thumbnail previews for supported files
                </p>
                <Switch
                  checked={settings.enablePreviews}
                  onCheckedChange={(checked) => updateSetting('enablePreviews', checked)}
                />
              </div>
            </div>

            {settings.enablePreviews && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="previewQuality">Preview Quality</Label>
                <Select 
                  value={settings.previewQuality} 
                  onValueChange={(value) => updateSetting('previewQuality', value)}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Better Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Advanced Options
          </CardTitle>
          <CardDescription>
            Additional configuration options for power users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Show Advanced Options</Label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Display additional settings and developer tools
              </p>
              <Switch
                checked={settings.showAdvancedOptions}
                onCheckedChange={(checked) => updateSetting('showAdvancedOptions', checked)}
              />
            </div>
          </div>

          {settings.showAdvancedOptions && (
            <div className="pl-4 border-l-2 border-muted space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Export Settings</Label>
                  <Button variant="outline" size="sm" className="w-fit">
                    <Download className="mr-2 h-4 w-4" />
                    Export Config
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Import Settings</Label>
                  <Button variant="outline" size="sm" className="w-fit">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Config
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Settings Management</p>
              <p className="text-sm text-muted-foreground">
                Save your changes or reset to default values
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
                size="sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {hasUnsavedChanges && !isSaving && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You have unsaved changes. Don't forget to save your settings.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

GeneralSettings.displayName = 'GeneralSettings'