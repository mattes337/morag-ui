/**
 * Realms Page - Main realm management interface
 * Grid view of all realms with search, filtering, and management actions
 */
'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useRealm } from '@/lib/hooks/useRealm'
import { mockRealms, MockRealm } from '@/lib/mockData/realmMockData'
import { RealmCard } from '@/components/realms/RealmCard'
import { RealmDialog } from '@/components/realms/RealmDialog'
import { RealmSettings } from '@/components/realms/RealmSettings'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Archive
} from 'lucide-react'

interface RealmFilters {
  search: string
  status: string[]
  tier: string[]
  sortBy: 'name' | 'created' | 'updated' | 'usage'
  sortOrder: 'asc' | 'desc'
}

type ViewMode = 'grid' | 'list'

const DEFAULT_FILTERS: RealmFilters = {
  search: '',
  status: [],
  tier: [],
  sortBy: 'name',
  sortOrder: 'asc',
}

export default function RealmsPage() {
  const { isLoading } = useRealm()
  const [filters, setFilters] = useState<RealmFilters>(DEFAULT_FILTERS)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedRealm, setSelectedRealm] = useState<MockRealm | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Filter and sort realms
  const filteredRealms = useMemo(() => {
    let filtered = [...mockRealms] // Use all realms for demonstration

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(realm =>
        realm.name.toLowerCase().includes(searchLower) ||
        realm.description.toLowerCase().includes(searchLower) ||
        realm.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(realm => filters.status.includes(realm.status))
    }

    // Tier filter
    if (filters.tier.length > 0) {
      filtered = filtered.filter(realm => filters.tier.includes(realm.tier))
    }

    // Tab filter
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'my-realms':
          filtered = filtered.filter(realm => 
            realm.memberships.some(m => m.userId === '1' && m.status === 'active')
          )
          break
        case 'active':
          filtered = filtered.filter(realm => realm.status === 'active')
          break
        case 'archived':
          filtered = filtered.filter(realm => realm.status === 'archived')
          break
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0
      
      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'created':
          compareValue = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'updated':
          compareValue = a.updatedAt.getTime() - b.updatedAt.getTime()
          break
        case 'usage':
          compareValue = a.usage.documentsUploaded - b.usage.documentsUploaded
          break
      }

      return filters.sortOrder === 'desc' ? -compareValue : compareValue
    })

    return filtered
  }, [filters, activeTab])

  // Statistics
  const stats = useMemo(() => {
    return {
      total: mockRealms.length,
      active: mockRealms.filter(r => r.status === 'active').length,
      myRealms: mockRealms.filter(r => 
        r.memberships.some(m => m.userId === '1' && m.status === 'active')
      ).length,
      archived: mockRealms.filter(r => r.status === 'archived').length,
    }
  }, [])

  const updateFilter = <K extends keyof RealmFilters>(
    key: K,
    value: RealmFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleFilterArray = (key: 'status' | 'tier', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }))
  }

  const handleCreateRealm = async (realmData: any) => {
    // Mock implementation
    console.log('Creating realm:', realmData)
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }

  const handleUpdateRealm = async (realmId: string, updates: any) => {
    console.log('Updating realm:', realmId, updates)
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }

  const handleDuplicateRealm = (realm: MockRealm) => {
    setSelectedRealm({
      ...realm,
      id: 'new',
      name: `${realm.name} (Copy)`,
    })
    setShowCreateDialog(true)
  }

  const handleDeleteRealm = async (realmId: string) => {
    console.log('Deleting realm:', realmId)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowDeleteDialog(false)
    setSelectedRealm(null)
    return true
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const activeFilterCount = 
    filters.search.length + filters.status.length + filters.tier.length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Realms</h1>
          <p className="text-muted-foreground mt-1">
            Manage your workspaces and team collaboration
          </p>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Realm
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-medium">Total Realms</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium">My Realms</span>
          </div>
          <p className="text-2xl font-bold">{stats.myRealms}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Archive className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Archived</span>
          </div>
          <p className="text-2xl font-bold">{stats.archived}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Realms ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="my-realms">
            My Realms ({stats.myRealms})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({stats.active})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({stats.archived})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search realms..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 px-1 min-w-5 h-5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                {['active', 'maintenance', 'inactive', 'archived'].map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => toggleFilterArray('status', status)}
                  >
                    <div className="flex items-center gap-2 capitalize">
                      {status === 'active' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {status === 'maintenance' && <Clock className="w-4 h-4 text-yellow-600" />}
                      {status === 'inactive' && <AlertTriangle className="w-4 h-4 text-gray-600" />}
                      {status === 'archived' && <Archive className="w-4 h-4 text-red-600" />}
                      {status}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Tier</DropdownMenuLabel>
                {['basic', 'professional', 'enterprise', 'custom'].map(tier => (
                  <DropdownMenuCheckboxItem
                    key={tier}
                    checked={filters.tier.includes(tier)}
                    onCheckedChange={() => toggleFilterArray('tier', tier)}
                  >
                    <span className="capitalize">{tier}</span>
                  </DropdownMenuCheckboxItem>
                ))}

                {activeFilterCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <button
                      onClick={clearFilters}
                      className="w-full px-2 py-1.5 text-sm text-center hover:bg-accent rounded"
                    >
                      Clear All Filters
                    </button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder]
                setFilters(prev => ({ ...prev, sortBy, sortOrder }))
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="created-desc">Newest First</SelectItem>
                <SelectItem value="created-asc">Oldest First</SelectItem>
                <SelectItem value="updated-desc">Recently Updated</SelectItem>
                <SelectItem value="usage-desc">Most Used</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results */}
          {filteredRealms.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No realms found</h3>
              <p className="text-muted-foreground mb-4">
                {activeFilterCount > 0 
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first realm to get started'
                }
              </p>
              {activeFilterCount > 0 ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Realm
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredRealms.length} of {mockRealms.length} realms
                </span>
              </div>

              {/* Realms Grid/List */}
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
                  : 'space-y-4'
              )}>
                {filteredRealms.map((realm) => (
                  <RealmCard
                    key={realm.id}
                    realm={realm}
                    onEdit={(realm) => {
                      setSelectedRealm(realm)
                      setShowEditDialog(true)
                    }}
                    onDuplicate={handleDuplicateRealm}
                    onDelete={(realm) => {
                      setSelectedRealm(realm)
                      setShowDeleteDialog(true)
                    }}
                    onSettings={(realm) => {
                      setSelectedRealm(realm)
                      setShowSettingsDialog(true)
                    }}
                    className={viewMode === 'list' ? 'max-w-none' : ''}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Realm Dialog */}
      <RealmDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        onSave={handleCreateRealm}
      />

      {/* Edit Realm Dialog */}
      {selectedRealm && (
        <RealmDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          realm={selectedRealm}
          mode="edit"
          onSave={(data) => handleUpdateRealm(selectedRealm.id, data)}
        />
      )}

      {/* Settings Dialog */}
      {selectedRealm && (
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <RealmSettings
              realm={selectedRealm}
              onUpdate={handleUpdateRealm}
              onDelete={handleDeleteRealm}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedRealm && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Realm</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedRealm.name}"? This action cannot be undone
                and will permanently delete all documents and data.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteRealm(selectedRealm.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Realm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}