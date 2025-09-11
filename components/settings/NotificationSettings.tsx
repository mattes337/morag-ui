'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/badge'
import { useUserSettings } from '@/lib/hooks/useUserSettings'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Volume2,
  VolumeX,
  CheckCircle2,
  Loader2,
  Send,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationRowProps {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  badge?: string
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
  badge
}) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-1">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={`Toggle ${title}`}
    />
  </div>
)

interface QuietHoursSettingProps {
  enabled: boolean
  start: string
  end: string
  timezone: string
  onChange: (settings: { enabled: boolean; start: string; end: string; timezone: string }) => void
}

const QuietHoursSetting: React.FC<QuietHoursSettingProps> = ({
  enabled,
  start,
  end,
  timezone,
  onChange
}) => {
  const generateTimeOptions = () => {
    const times = []
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i.toString().padStart(2, '0')
        const minute = j.toString().padStart(2, '0')
        const time = `${hour}:${minute}`
        const displayTime = new Date(`2024-01-01T${time}`).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        times.push({ value: time, label: displayTime })
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Quiet Hours</p>
            <p className="text-sm text-muted-foreground">
              Pause non-critical notifications during these hours
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked, start, end, timezone })}
        />
      </div>

      {enabled && (
        <div className="ml-8 space-y-4 pt-2 border-l-2 border-muted pl-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select
                value={start}
                onValueChange={(value) => onChange({ enabled, start: value, end, timezone })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Select
                value={end}
                onValueChange={(value) => onChange({ enabled, start, end: value, timezone })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Quiet hours: {new Date(`2024-01-01T${start}`).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })} - {new Date(`2024-01-01T${end}`).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })} ({timezone})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function NotificationSettings() {
  const {
    notifications,
    updateNotifications,
    testNotification,
    isLoading,
    error,
    clearError
  } = useUserSettings()

  const [testingNotification, setTestingNotification] = React.useState<string | null>(null)

  const handleEmailNotificationChange = async (key: keyof typeof notifications.email, value: boolean) => {
    await updateNotifications({
      email: {
        ...notifications.email,
        [key]: value
      }
    })
  }

  const handleInAppNotificationChange = async (key: keyof typeof notifications.inApp, value: boolean) => {
    await updateNotifications({
      inApp: {
        ...notifications.inApp,
        [key]: value
      }
    })
  }

  const handlePushNotificationChange = async (key: keyof typeof notifications.push, value: boolean) => {
    await updateNotifications({
      push: {
        ...notifications.push,
        [key]: value
      }
    })
  }

  const handleDigestFrequencyChange = async (frequency: typeof notifications.digestFrequency) => {
    await updateNotifications({ digestFrequency: frequency })
  }

  const handleQuietHoursChange = async (quietHours: typeof notifications.quietHours) => {
    await updateNotifications({ quietHours })
  }

  const handleTestNotification = async (type: keyof typeof notifications.email) => {
    setTestingNotification(type)
    try {
      await testNotification(type)
      // Show success feedback
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setTestingNotification(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 divide-y">
            <NotificationRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Document Processing Complete"
              description="Get notified when your documents finish processing"
              checked={notifications.email.documentProcessingComplete}
              onChange={(checked) => handleEmailNotificationChange('documentProcessingComplete', checked)}
            />

            <NotificationRow
              icon={<AlertCircle className="h-4 w-4" />}
              title="Document Processing Failed"
              description="Get alerted when document processing encounters errors"
              checked={notifications.email.documentProcessingFailed}
              onChange={(checked) => handleEmailNotificationChange('documentProcessingFailed', checked)}
              badge="Recommended"
            />

            <NotificationRow
              icon={<Send className="h-4 w-4" />}
              title="New Document Shared"
              description="Notification when someone shares a document with you"
              checked={notifications.email.newDocumentShared}
              onChange={(checked) => handleEmailNotificationChange('newDocumentShared', checked)}
            />

            <NotificationRow
              icon={<Bell className="h-4 w-4" />}
              title="Realm Invitations"
              description="Get notified when you're invited to join a realm"
              checked={notifications.email.realmInvitations}
              onChange={(checked) => handleEmailNotificationChange('realmInvitations', checked)}
            />

            <NotificationRow
              icon={<AlertCircle className="h-4 w-4" />}
              title="System Maintenance"
              description="Important system updates and maintenance notifications"
              checked={notifications.email.systemMaintenance}
              onChange={(checked) => handleEmailNotificationChange('systemMaintenance', checked)}
            />

            <NotificationRow
              icon={<AlertCircle className="h-4 w-4" />}
              title="Security Alerts"
              description="Login attempts, security changes, and suspicious activity"
              checked={notifications.email.securityAlerts}
              onChange={(checked) => handleEmailNotificationChange('securityAlerts', checked)}
              badge="Important"
            />

            <NotificationRow
              icon={<Mail className="h-4 w-4" />}
              title="Weekly Digest"
              description="Summary of your activity and important updates"
              checked={notifications.email.weeklyDigest}
              onChange={(checked) => handleEmailNotificationChange('weeklyDigest', checked)}
            />

            <NotificationRow
              icon={<Mail className="h-4 w-4" />}
              title="Monthly Report"
              description="Comprehensive analytics and usage reports"
              checked={notifications.email.monthlyReport}
              onChange={(checked) => handleEmailNotificationChange('monthlyReport', checked)}
            />
          </div>

          <Separator className="my-6" />

          {/* Test Email Notification */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Test Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Send a test email to verify your notification settings
              </p>
            </div>
            <Button
              onClick={() => handleTestNotification('documentProcessingComplete')}
              disabled={testingNotification !== null}
              size="sm"
            >
              {testingNotification ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Control which notifications appear in the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 divide-y">
            <NotificationRow
              icon={<Send className="h-4 w-4" />}
              title="Document Updates"
              description="Changes to documents you're following"
              checked={notifications.inApp.documentUpdates}
              onChange={(checked) => handleInAppNotificationChange('documentUpdates', checked)}
            />

            <NotificationRow
              icon={<Bell className="h-4 w-4" />}
              title="Collaboration Requests"
              description="Invitations to collaborate on documents or realms"
              checked={notifications.inApp.collaborationRequests}
              onChange={(checked) => handleInAppNotificationChange('collaborationRequests', checked)}
            />

            <NotificationRow
              icon={<AlertCircle className="h-4 w-4" />}
              title="System Notifications"
              description="System-wide announcements and updates"
              checked={notifications.inApp.systemNotifications}
              onChange={(checked) => handleInAppNotificationChange('systemNotifications', checked)}
            />

            <NotificationRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Job Status Updates"
              description="Real-time updates on processing job status"
              checked={notifications.inApp.jobStatusUpdates}
              onChange={(checked) => handleInAppNotificationChange('jobStatusUpdates', checked)}
            />

            <NotificationRow
              icon={<AlertCircle className="h-4 w-4" />}
              title="Error Alerts"
              description="Immediate notifications for system errors"
              checked={notifications.inApp.errorAlerts}
              onChange={(checked) => handleInAppNotificationChange('errorAlerts', checked)}
              badge="Critical"
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications on your device even when the app is closed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <NotificationRow
              icon={notifications.push.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              title="Enable Push Notifications"
              description="Allow the app to send push notifications to your device"
              checked={notifications.push.enabled}
              onChange={(checked) => handlePushNotificationChange('enabled', checked)}
            />

            {notifications.push.enabled && (
              <div className="ml-8 pt-2 border-l-2 border-muted pl-4">
                <NotificationRow
                  icon={<AlertCircle className="h-4 w-4" />}
                  title="Critical Notifications Only"
                  description="Only send push notifications for urgent alerts"
                  checked={notifications.push.criticalOnly}
                  onChange={(checked) => handlePushNotificationChange('criticalOnly', checked)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Digest Frequency
          </CardTitle>
          <CardDescription>
            How often you want to receive summary emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Digest Frequency</p>
              <p className="text-sm text-muted-foreground">
                Combine multiple notifications into periodic digest emails
              </p>
            </div>
            <Select
              value={notifications.digestFrequency}
              onValueChange={handleDigestFrequencyChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set quiet hours to pause non-critical notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuietHoursSetting
            enabled={notifications.quietHours.enabled}
            start={notifications.quietHours.start}
            end={notifications.quietHours.end}
            timezone={notifications.quietHours.timezone}
            onChange={handleQuietHoursChange}
          />
        </CardContent>
      </Card>

      {/* Notification Preview */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preview
          </CardTitle>
          <CardDescription>
            This is how notifications will appear in your app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock notifications */}
            <div className="flex items-start gap-3 p-3 bg-background border rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Document processing complete</p>
                <p className="text-xs text-muted-foreground">
                  "Q4-Financial-Report.pdf" has been successfully processed
                </p>
                <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background border rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New document shared</p>
                <p className="text-xs text-muted-foreground">
                  Sarah shared "Marketing Strategy 2024" with you
                </p>
                <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
              </div>
            </div>

            {notifications.quietHours.enabled && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Moon className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">Quiet Hours Active</p>
                  <p className="text-xs text-yellow-700">
                    Non-critical notifications are paused until{' '}
                    {new Date(`2024-01-01T${notifications.quietHours.end}`).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">
                  Failed to update notification settings
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