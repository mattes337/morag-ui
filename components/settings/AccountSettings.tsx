'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/Separator'
import { Progress } from '@/components/ui/Progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useUserSettings, PasswordChangeRequest } from '@/lib/hooks/useUserSettings'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Download, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  LogOut,
  History,
  Monitor,
  MapPin,
  Calendar,
  QrCode
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
  onValidate: (isValid: boolean) => void
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  onValidate 
}) => {
  const { validatePassword } = useUserSettings()
  const strength = validatePassword(password)
  
  React.useEffect(() => {
    onValidate(strength.isValid)
  }, [strength.isValid, onValidate])

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'weak': return 'bg-red-500'
      case 'fair': return 'bg-yellow-500'
      case 'good': return 'bg-blue-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Password Strength</span>
        <span className="font-medium capitalize">{strength.level}</span>
      </div>
      <Progress 
        value={strength.score} 
        className={cn("h-2", getStrengthColor(strength.level))}
      />
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((feedback, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-destructive">•</span>
              {feedback}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface TwoFactorSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TwoFactorSetupDialog: React.FC<TwoFactorSetupDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { enable2FA, isLoading } = useUserSettings()
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr')
  const [qrCode, setQrCode] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')

  const handleEnable2FA = async () => {
    try {
      const result = await enable2FA()
      setQrCode(result.qrCode)
      setBackupCodes(result.backupCodes)
      setStep('verify')
      setError('')
    } catch (error) {
      setError('Failed to set up 2FA')
    }
  }

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setStep('backup')
    } else {
      setError('Please enter a valid 6-digit code')
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {step === 'qr' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll generate a QR code for you to scan with your authenticator app.
            </p>
            <Button onClick={handleEnable2FA} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter verification code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className={cn(error && 'border-destructive')}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            
            <Button onClick={handleVerify} className="w-full">
              Verify & Continue
            </Button>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Save Your Backup Codes</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Store these codes safely. You can use them to access your account if you lose your device.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy Codes
              </Button>
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download & Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function AccountSettings() {
  const {
    security,
    profile,
    isLoading,
    changePassword,
    disable2FA,
    generateBackupCodes,
    revokeSession,
    deleteAccount,
    requestDataExport,
    error,
    clearError
  } = useUserSettings()

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordValid, setPasswordValid] = useState(false)

  // 2FA state
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [disable2FACode, setDisable2FACode] = useState('')

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handlePasswordChange = async () => {
    const success = await changePassword(passwordForm)
    if (success) {
      setShowPasswordForm(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  const handleDisable2FA = async () => {
    const success = await disable2FA(disable2FACode)
    if (success) {
      setDisable2FACode('')
    }
  }

  const handleGenerateBackupCodes = async () => {
    try {
      const codes = await generateBackupCodes()
      // In a real app, this would show a dialog with the codes
      alert(`New backup codes:\n${codes.join('\n')}`)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    await revokeSession(sessionId)
  }

  const handleDataExport = async () => {
    await requestDataExport({
      format: 'json',
      includeDocuments: true,
      includeAnalytics: true,
      includeActivityLogs: false
    })
  }

  const handleDeleteAccount = async () => {
    const success = await deleteAccount(deleteConfirmText)
    if (success) {
      // In a real app, this would redirect to a goodbye page
      alert('Account deletion initiated')
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password and manage account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Last changed: {new Date(security.lastPasswordChange).toLocaleDateString()}
              </p>
            </div>
            <Button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              variant={showPasswordForm ? "outline" : "default"}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </Button>
          </div>

          {showPasswordForm && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ 
                      ...prev, 
                      currentPassword: e.target.value 
                    }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPasswords(prev => ({ 
                      ...prev, 
                      current: !prev.current 
                    }))}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ 
                      ...prev, 
                      newPassword: e.target.value 
                    }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPasswords(prev => ({ 
                      ...prev, 
                      new: !prev.new 
                    }))}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordForm.newPassword && (
                  <PasswordStrengthIndicator
                    password={passwordForm.newPassword}
                    onValidate={setPasswordValid}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ 
                      ...prev, 
                      confirmPassword: e.target.value 
                    }))}
                    className={cn(
                      passwordForm.confirmPassword && 
                      passwordForm.newPassword !== passwordForm.confirmPassword &&
                      'border-destructive'
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPasswords(prev => ({ 
                      ...prev, 
                      confirm: !prev.confirm 
                    }))}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button 
                onClick={handlePasswordChange}
                disabled={
                  !passwordForm.currentPassword ||
                  !passwordValid ||
                  passwordForm.newPassword !== passwordForm.confirmPassword ||
                  isLoading
                }
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">
                  Use an app like Google Authenticator or Authy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {security.twoFactorEnabled ? (
                <>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Enabled
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisable2FACode('')}
                  >
                    Disable
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShow2FASetup(true)}>
                  Enable 2FA
                </Button>
              )}
            </div>
          </div>

          {security.twoFactorEnabled && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleGenerateBackupCodes}
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate New Backup Codes
                </Button>
                
                {disable2FACode !== '' && (
                  <div className="space-y-2">
                    <Label htmlFor="disable-2fa-code">Enter 6-digit code to disable</Label>
                    <div className="flex gap-2">
                      <Input
                        id="disable-2fa-code"
                        value={disable2FACode}
                        onChange={(e) => setDisable2FACode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                      />
                      <Button
                        onClick={handleDisable2FA}
                        disabled={disable2FACode.length !== 6 || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Disable'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active login sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {security.activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.browser}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download a copy of your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Account Data</p>
              <p className="text-sm text-muted-foreground">
                Download your profile, documents, and activity data
              </p>
            </div>
            <Button onClick={handleDataExport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Request Export
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    This action cannot be undone
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will permanently delete your account, all your data, documents, and remove you from all realms.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delete-confirm">
                  Type "DELETE MY ACCOUNT" to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete My Account'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <TwoFactorSetupDialog 
        open={show2FASetup}
        onOpenChange={setShow2FASetup}
      />
    </div>
  )
}