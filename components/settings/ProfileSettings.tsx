'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/Separator'
import { useUserSettings } from '@/lib/hooks/useUserSettings'
import { availableTimezones, availableLanguages } from '@/lib/mockData/userSettings'
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Globe,
  Clock,
  MapPin,
  Briefcase,
  Phone,
  Link,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarCropperProps {
  imageUrl: string
  onCropped: (croppedBlob: Blob) => void
  onCancel: () => void
}

const AvatarCropper: React.FC<AvatarCropperProps> = ({ imageUrl, onCropped, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 })
  
  const handleCrop = async () => {
    // In a real implementation, this would use a library like react-image-crop
    // For now, we'll simulate the cropping process
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      onCropped(blob)
    } catch (error) {
      console.error('Failed to crop image:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crop Avatar</CardTitle>
          <CardDescription>
            Adjust the crop area to select your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '1:1' }}>
            <img 
              src={imageUrl} 
              alt="Avatar crop preview" 
              className="w-full h-full object-cover"
            />
            {/* Simulated crop overlay */}
            <div className="absolute inset-4 border-2 border-primary rounded-full bg-primary/10" />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleCrop}>
              Apply Crop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfileSettings() {
  const {
    profile,
    isLoading,
    updateProfile,
    uploadAvatar,
    checkEmailAvailability,
    error,
    clearError
  } = useUserSettings()

  const [editingField, setEditingField] = useState<string | null>(null)
  const [localValues, setLocalValues] = useState(profile)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string>('')
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setValidationErrors({ avatar: 'Please select an image file' })
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setValidationErrors({ avatar: 'Image size must be less than 5MB' })
      return
    }

    // Create temporary URL for cropping
    const tempUrl = URL.createObjectURL(file)
    setTempImageUrl(tempUrl)
    setShowCropper(true)
  }

  // Handle cropped avatar
  const handleCroppedAvatar = async (croppedBlob: Blob) => {
    try {
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
      const avatarUrl = await uploadAvatar(file)
      setLocalValues(prev => ({ ...prev, avatar: avatarUrl }))
      setShowCropper(false)
      URL.revokeObjectURL(tempImageUrl)
      clearError()
      setValidationErrors(prev => ({ ...prev, avatar: '' }))
    } catch (error) {
      setValidationErrors({ avatar: 'Failed to upload avatar' })
    }
  }

  // Handle field editing
  const handleFieldEdit = (field: string) => {
    setEditingField(field)
    clearError()
    setValidationErrors({})
  }

  const handleFieldSave = async (field: string) => {
    const value = localValues[field as keyof typeof localValues]
    
    // Validation
    let isValid = true
    const errors: Record<string, string> = {}

    switch (field) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)) {
          errors.email = 'Please enter a valid email address'
          isValid = false
        } else if (value !== profile.email) {
          // Check email availability
          const available = await checkEmailAvailability(value as string)
          if (!available) {
            errors.email = 'This email is already in use'
            isValid = false
          }
        }
        break
      
      case 'firstName':
      case 'lastName':
        if (!value || (value as string).trim().length < 2) {
          errors[field] = 'Name must be at least 2 characters long'
          isValid = false
        }
        break
      
      case 'phoneNumber':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value as string)) {
          errors.phoneNumber = 'Please enter a valid phone number'
          isValid = false
        }
        break
    }

    setValidationErrors(errors)
    
    if (isValid) {
      const success = await updateProfile({ [field]: value })
      if (success) {
        setEditingField(null)
      }
    }
  }

  const handleFieldCancel = (field: string) => {
    setLocalValues(prev => ({ ...prev, [field]: profile[field as keyof typeof profile] }))
    setEditingField(null)
    setValidationErrors({})
  }

  const handleValueChange = (field: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <img 
                  src={localValues.avatar} 
                  alt={localValues.displayName}
                  className="h-full w-full object-cover"
                />
              </Avatar>
              
              {/* Upload button overlay */}
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium">{localValues.displayName}</h3>
              <p className="text-sm text-muted-foreground">
                {localValues.jobTitle} at {localValues.department}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={localValues.activityStatus === 'online' ? 'default' : 'secondary'}>
                  {localValues.activityStatus}
                </Badge>
                {localValues.isEmailVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {validationErrors.avatar && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.avatar}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              {editingField === 'firstName' ? (
                <div className="space-y-2">
                  <Input
                    id="firstName"
                    value={localValues.firstName}
                    onChange={(e) => handleValueChange('firstName', e.target.value)}
                    className={cn(validationErrors.firstName && 'border-destructive')}
                  />
                  {validationErrors.firstName && (
                    <p className="text-sm text-destructive">{validationErrors.firstName}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleFieldSave('firstName')}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => handleFieldCancel('firstName')}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{localValues.firstName}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleFieldEdit('firstName')}>
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              {editingField === 'lastName' ? (
                <div className="space-y-2">
                  <Input
                    id="lastName"
                    value={localValues.lastName}
                    onChange={(e) => handleValueChange('lastName', e.target.value)}
                    className={cn(validationErrors.lastName && 'border-destructive')}
                  />
                  {validationErrors.lastName && (
                    <p className="text-sm text-destructive">{validationErrors.lastName}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleFieldSave('lastName')}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => handleFieldCancel('lastName')}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{localValues.lastName}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleFieldEdit('lastName')}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email Address
              {localValues.isEmailVerified && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </Label>
            {editingField === 'email' ? (
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  value={localValues.email}
                  onChange={(e) => handleValueChange('email', e.target.value)}
                  className={cn(validationErrors.email && 'border-destructive')}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleFieldSave('email')}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => handleFieldCancel('email')}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm">{localValues.email}</span>
                <Button size="sm" variant="ghost" onClick={() => handleFieldEdit('email')}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {editingField === 'bio' ? (
              <div className="space-y-2">
                <Textarea
                  id="bio"
                  value={localValues.bio}
                  onChange={(e) => handleValueChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleFieldSave('bio')}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => handleFieldCancel('bio')}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {localValues.bio || 'No bio provided'}
                </p>
                <Button size="sm" variant="ghost" onClick={() => handleFieldEdit('bio')}>
                  Edit Bio
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your experience with language and timezone settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timezone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timezone
              </Label>
              <Select
                value={localValues.timezone}
                onValueChange={(value) => {
                  handleValueChange('timezone', value)
                  updateProfile({ timezone: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTimezones.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <Select
                value={localValues.language}
                onValueChange={(value) => {
                  handleValueChange('language', value)
                  updateProfile({ language: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location & Contact */}
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              {editingField === 'location' ? (
                <div className="space-y-2">
                  <Input
                    id="location"
                    value={localValues.location}
                    onChange={(e) => handleValueChange('location', e.target.value)}
                    placeholder="City, State/Country"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleFieldSave('location')}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => handleFieldCancel('location')}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{localValues.location || 'Not specified'}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleFieldEdit('location')}>
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              {editingField === 'phoneNumber' ? (
                <div className="space-y-2">
                  <Input
                    id="phoneNumber"
                    value={localValues.phoneNumber}
                    onChange={(e) => handleValueChange('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={cn(validationErrors.phoneNumber && 'border-destructive')}
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-sm text-destructive">{validationErrors.phoneNumber}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleFieldSave('phoneNumber')}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => handleFieldCancel('phoneNumber')}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{localValues.phoneNumber || 'Not provided'}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleFieldEdit('phoneNumber')}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>
            Connect your social profiles and website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(localValues.socialLinks).map(([platform, url]) => (
            <div key={platform} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium capitalize">
                {platform}
              </div>
              <div className="flex-1">
                {editingField === `social_${platform}` ? (
                  <div className="space-y-2">
                    <Input
                      value={url || ''}
                      onChange={(e) => handleValueChange('socialLinks', JSON.stringify({
                        ...localValues.socialLinks,
                        [platform]: e.target.value
                      }))}
                      placeholder={`https://${platform}.com/username`}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          updateProfile({ socialLinks: localValues.socialLinks })
                          setEditingField(null)
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleFieldCancel(`social_${platform}`)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {url || 'Not connected'}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleFieldEdit(`social_${platform}`)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Avatar Cropper Modal */}
      {showCropper && tempImageUrl && (
        <AvatarCropper
          imageUrl={tempImageUrl}
          onCropped={handleCroppedAvatar}
          onCancel={() => {
            setShowCropper(false)
            URL.revokeObjectURL(tempImageUrl)
          }}
        />
      )}
    </div>
  )
}