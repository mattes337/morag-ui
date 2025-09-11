'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { input } from '@/components/ui/input'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/Separator'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye,
  EyeOff,
  Trash2,
  Copy,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Monitor,
  X,
  Plus,
  ExternalLink,
  QrCode
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserSettings, type PasswordStrength } from '@/lib/hooks/useUserSettings'

interface SecuritySettingsProps {
  className?: string
}

interface SessionRowProps {
  session: {
    id: string
    device: string
    location: string
    ip: string
    lastActive: string
    current: boolean
    browser: string
  }
  onRevoke: (sessionId: string) => void
  disabled?: boolean
}

const SessionRow: React.FC<SessionRowProps> = ({ session, onRevoke, disabled = false }) => {
  const getDeviceIcon = (device: string) => {
    if (device.includes('Mobile')) return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-1">
          {getDeviceIcon(session.device)}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{session.device}</p>
            {session.current && (
              <Badge variant="secondary" className="text-xs">Current</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {session.browser} • {session.location}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{session.ip}</span>
            <span>Last active: {session.lastActive}</span>
          </div>
        </div>
      </div>
      {!session.current && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRevoke(session.id)}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          Revoke
        </Button>
      )}
    </div>
  )
}

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'weak': return 'bg-red-500'
      case 'fair': return 'bg-yellow-500'
      case 'good': return 'bg-blue-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-200'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Password Strength</span>
        <span className={cn(
          "font-medium capitalize",
          strength.level === 'weak' && 'text-red-600',
          strength.level === 'fair' && 'text-yellow-600',
          strength.level === 'good' && 'text-blue-600',
          strength.level === 'strong' && 'text-green-600'
        )}>
          {strength.level}
        </span>
      </div>
      <Progress 
        value={strength.score} 
        className={cn("h-2", getStrengthColor(strength.level))}
      />
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((feedback, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-1 h-1 bg-current rounded-full" />
              {feedback}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SecuritySettings({ className }: SecuritySettingsProps) {
  const {
    security,
    changePassword,
    enable2FA,
    disable2FA,
    generateBackupCodes,
    revokeSession,
    validatePassword,
    isLoading,
    error,
    clearError
  } = useUserSettings()

  // Password change state
  const [passwordForm, setPasswordForm] = React.useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength | null>(null)

  // 2FA state
  const [show2FASetup, setShow2FASetup] = React.useState(false)
  const [qrCode, setQrCode] = React.useState<string>('')
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [confirmationCode, setConfirmationCode] = React.useState('')

  // Handle password validation
  React.useEffect(() => {
    if (passwordForm.new) {
      setPasswordStrength(validatePassword(passwordForm.new))
    } else {
      setPasswordStrength(null)
    }
  }, [passwordForm.new, validatePassword])

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordStrength?.isValid) return
    
    const success = await changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
      confirmPassword: passwordForm.confirm
    })

    if (success) {
      setPasswordForm({ current: '', new: '', confirm: '' })
      setPasswordStrength(null)
    }
  }

  // Handle 2FA setup
  const handle2FASetup = async () => {
    try {
      const { qrCode, backupCodes } = await enable2FA()
      setQrCode(qrCode)
      setBackupCodes(backupCodes)
      setShow2FASetup(true)
    } catch (error) {
      // Error handled by hook
    }
  }

  // Handle 2FA disable
  const handle2FADisable = async () => {
    const success = await disable2FA(confirmationCode)
    if (success) {
      setConfirmationCode('')
    }
  }

  // Generate new backup codes
  const handleGenerateBackupCodes = async () => {
    try {
      const codes = await generateBackupCodes()
      setBackupCodes(codes)
    } catch (error) {
      // Error handled by hook
    }
  }

  // Copy backup codes
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Management
          </CardTitle>
          <CardDescription>
            Change your password and manage password security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    "pr-10"
                  )}
                  placeholder="Enter current password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    "pr-10"
                  )}
                  placeholder="Enter new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordStrength && (
                <PasswordStrengthIndicator strength={passwordStrength} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    "pr-10"
                  )}
                  placeholder="Confirm new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || !passwordStrength?.isValid || passwordForm.new !== passwordForm.confirm}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>

          <Separator className="my-6" />

          <div className="text-sm text-muted-foreground">
            <p><strong>Last password change:</strong> {security.lastPasswordChange ? new Date(security.lastPasswordChange).toLocaleDateString() : 'Never'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
            {security.twoFactorEnabled && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Enabled
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!security.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Recommended Security Enhancement</span>
                </div>
                <p className="text-sm text-blue-700">
                  Two-factor authentication significantly improves your account security by requiring a second form of verification.
                </p>
              </div>
              
              <Button onClick={handle2FASetup} disabled={isLoading}>
                <Smartphone className="mr-2 h-4 w-4" />
                Enable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">2FA is Active</span>
                </div>
                <p className="text-sm text-green-700">
                  Your account is protected with two-factor authentication.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleGenerateBackupCodes}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate New Backup Codes
                </Button>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code to disable"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    maxLength={6}
                  />
                  <Button
                    variant="destructive"
                    onClick={handle2FADisable}
                    disabled={isLoading || confirmationCode.length !== 6}
                  >
                    Disable 2FA
                  </Button>
                </div>
              </div>

              {backupCodes.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-yellow-800">Backup Codes</span>
                    <Button variant="ghost" size="sm" onClick={copyBackupCodes}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-white border rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    Store these codes safely. Each can only be used once.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Set Up Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-white border rounded-lg">
              <img src={qrCode} alt="2FA QR Code" className="max-w-48" />
            </div>
            
            <div className="space-y-2">
              <Label>Backup Codes</Label>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-muted border rounded text-center">
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={() => setShow2FASetup(false)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                I've Saved My Codes
              </Button>
              <Button variant="outline" onClick={copyBackupCodes}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices that are currently signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {security.activeSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onRevoke={revokeSession}
                disabled={isLoading}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Security Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Summary
          </CardTitle>
          <CardDescription>
            Overview of your account security status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn(
                  "h-4 w-4",
                  security.twoFactorEnabled ? "text-green-500" : "text-gray-400"
                )} />
                <span className="text-sm font-medium">Two-Factor Auth</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Strong Password</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Last changed {security.lastPasswordChange ? new Date(security.lastPasswordChange).toLocaleDateString() : 'Never'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Active Sessions</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {security.activeSessions.length} device{security.activeSessions.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn(
                  "h-4 w-4",
                  security.backupCodesGenerated ? "text-green-500" : "text-gray-400"
                )} />
                <span className="text-sm font-medium">Backup Codes</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {security.backupCodesGenerated ? 'Generated' : 'Not generated'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">
                  Security settings error
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

SecuritySettings.displayName = 'SecuritySettings'