/**
 * RealmCard - Individual realm card for grid display
 * Shows realm information, usage statistics, and quick actions
 */
'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { MockRealm, getRealmUsageSummary } from '@/lib/mockData/realmMockData'
import { useRealm, useRealmPermissions } from '@/lib/hooks/useRealm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/Progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import {
  Building2,
  Users,
  Database,
  Activity,
  Settings,
  Copy,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Archive
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RealmCardProps {
  realm: MockRealm
  className?: string
  onSelect?: (realm: MockRealm) => void
  onEdit?: (realm: MockRealm) => void
  onDuplicate?: (realm: MockRealm) => void
  onDelete?: (realm: MockRealm) => void
  onSettings?: (realm: MockRealm) => void
  isSelected?: boolean
  showActions?: boolean
}

export const RealmCard: React.FC<RealmCardProps> = ({
  realm,
  className,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onSettings,
  isSelected = false,
  showActions = true,
}) => {
  const { currentRealm, switchRealm } = useRealm()
  const { permissions, hasPermission } = useRealmPermissions()
  const [isHovered, setIsHovered] = useState(false)
  
  const isCurrentRealm = currentRealm?.id === realm.id
  const usageSummary = getRealmUsageSummary(realm.id)

  const getStatusIcon = () => {
    switch (realm.status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-600" />
      case 'archived':
        return <Archive className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (realm.status) {
      case 'active':
        return 'border-l-green-500'
      case 'maintenance':
        return 'border-l-yellow-500'
      case 'inactive':
        return 'border-l-gray-500'
      case 'archived':
        return 'border-l-red-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const getTierBadgeVariant = () => {
    switch (realm.tier) {
      case 'enterprise':
      case 'custom':
        return 'default'
      case 'professional':
        return 'secondary'
      case 'basic':
      default:
        return 'outline'
    }
  }

  const getRealmIcon = (realmName: string) => {
    const name = realmName.toLowerCase()
    if (name.includes('marketing')) return '📈'
    if (name.includes('sales')) return '💰'
    if (name.includes('engineering')) return '⚙️'
    if (name.includes('executive')) return '👔'
    if (name.includes('support')) return '🎧'
    return '🏢'
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(realm)
    } else if (!isCurrentRealm) {
      switchRealm(realm.id)
    }
  }

  const activeMembers = realm.memberships.filter(m => m.status === 'active').length
  const recentActivity = realm.recentActivity[0]

  return (
    <TooltipProvider>
      <Card
        className={cn(
          'group relative cursor-pointer transition-all duration-200 border-l-4',
          getStatusColor(),
          isSelected && 'ring-2 ring-primary ring-offset-2',
          isCurrentRealm && 'bg-primary/5 border-primary/20',
          isHovered && 'shadow-lg scale-[1.02]',
          'hover:shadow-md',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        data-testid={`realm-card-${realm.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Realm Icon */}
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-lg flex-shrink-0">
                {getRealmIcon(realm.name)}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg truncate">
                    {realm.name}
                  </CardTitle>
                  {isCurrentRealm && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      Current
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getTierBadgeVariant()} className="text-xs">
                    {realm.tier}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getStatusIcon()}
                    <span className="text-xs text-muted-foreground capitalize">
                      {realm.status}
                    </span>
                  </div>
                </div>

                {/* User Permissions */}
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>
                    {hasPermission('admin') ? 'Admin' : 
                     hasPermission('editor') ? 'Editor' : 
                     hasPermission('viewer') ? 'Viewer' : 'Limited Access'}
                  </span>
                  {permissions.length > 1 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{permissions.length - 1}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <strong>Permissions:</strong>
                            <div>{permissions.join(', ')}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isCurrentRealm && (
                    <>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        switchRealm(realm.id)
                      }}>
                        <Zap className="w-4 h-4 mr-2" />
                        Switch to Realm
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onEdit(realm)
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Realm
                    </DropdownMenuItem>
                  )}
                  
                  {onSettings && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onSettings(realm)
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  )}
                  
                  {onDuplicate && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(realm)
                    }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  
                  {onDelete && realm.status !== 'active' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(realm)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Realm
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <CardDescription className="text-sm line-clamp-2">
            {realm.description || 'No description provided'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Usage Statistics */}
          {usageSummary && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Usage Overview
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Documents Usage */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Documents</span>
                    <span className="font-medium">
                      {usageSummary.documentsUsage.used}/{usageSummary.documentsUsage.limit}
                    </span>
                  </div>
                  <Progress 
                    value={usageSummary.documentsUsage.percentage} 
                    className="h-1.5"
                  />
                </div>

                {/* Storage Usage */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">
                      {usageSummary.storageUsage.used}/{usageSummary.storageUsage.limit}GB
                    </span>
                  </div>
                  <Progress 
                    value={usageSummary.storageUsage.percentage} 
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Realm Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{activeMembers}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{activeMembers} active member{activeMembers !== 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="flex items-center gap-2 text-muted-foreground">
                <Database className="w-4 h-4" />
                <span>{realm.usage.documentsUploaded}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{realm.usage.documentsUploaded} document{realm.usage.documentsUploaded !== 1 ? 's' : ''} uploaded</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>{realm.configuration.security.enableSso ? 'SSO' : 'Basic'}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Security: {realm.configuration.security.enableSso ? 'SSO enabled' : 'Basic authentication'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Recent Activity */}
          {recentActivity && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span className="truncate flex-1">
                  Last activity: {formatDistanceToNow(recentActivity.timestamp, { addSuffix: true })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate">
                {recentActivity.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {realm.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {realm.tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0"
                >
                  {tag}
                </Badge>
              ))}
              {realm.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  +{realm.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Selection Indicator */}
        {isCurrentRealm && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm" />
        )}
      </Card>
    </TooltipProvider>
  )
}

export default RealmCard