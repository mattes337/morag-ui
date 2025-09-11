/**
 * Global Realm State Management Hook with React Context
 * Manages global realm selection, persistent storage, and realm-specific filtering
 */

import { 
  createContext, 
  useContext, 
  useCallback, 
  useEffect, 
  useState, 
  ReactNode 
} from 'react'
import { mockRealms, MockRealm, getRealmById } from '@/lib/mockData/realmMockData'

interface RealmContextType {
  // Current selected realm
  currentRealm: MockRealm | null
  
  // All available realms for the user
  availableRealms: MockRealm[]
  
  // Recently used realms (for quick switching)
  recentRealms: MockRealm[]
  
  // Loading states
  isLoading: boolean
  isSwitching: boolean
  
  // Actions
  switchRealm: (realmId: string) => Promise<boolean>
  refreshRealms: () => Promise<void>
  addToRecent: (realmId: string) => void
  
  // Permissions for current realm
  currentRealmPermissions: string[]
  
  // Realm-specific filtering
  isRealmFiltered: boolean
  enableRealmFiltering: (enabled: boolean) => void
}

const RealmContext = createContext<RealmContextType | null>(null)

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_REALM: 'morag_current_realm_id',
  RECENT_REALMS: 'morag_recent_realms',
  REALM_FILTERING: 'morag_realm_filtering_enabled'
} as const

export interface RealmProviderProps {
  children: ReactNode
  initialRealmId?: string
}

/**
 * RealmProvider - Manages global realm state with persistence
 */
export const RealmProvider: React.FC<RealmProviderProps> = ({ 
  children, 
  initialRealmId 
}) => {
  const [currentRealm, setCurrentRealm] = useState<MockRealm | null>(null)
  const [availableRealms, setAvailableRealms] = useState<MockRealm[]>([])
  const [recentRealms, setRecentRealms] = useState<MockRealm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isRealmFiltered, setIsRealmFiltered] = useState(true)

  // Load persisted realm state from localStorage
  const loadPersistedState = useCallback(() => {
    if (typeof window === 'undefined') return null

    try {
      const savedRealmId = localStorage.getItem(STORAGE_KEYS.CURRENT_REALM)
      const savedRecentRealms = localStorage.getItem(STORAGE_KEYS.RECENT_REALMS)
      const savedFiltering = localStorage.getItem(STORAGE_KEYS.REALM_FILTERING)
      
      return {
        currentRealmId: savedRealmId,
        recentRealmIds: savedRecentRealms ? JSON.parse(savedRecentRealms) : [],
        isFiltered: savedFiltering ? JSON.parse(savedFiltering) : true
      }
    } catch (error) {
      console.warn('Failed to load persisted realm state:', error)
      return null
    }
  }, [])

  // Persist realm state to localStorage
  const persistState = useCallback((
    realmId: string | null, 
    recentIds: string[], 
    filtering: boolean
  ) => {
    if (typeof window === 'undefined') return

    try {
      if (realmId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_REALM, realmId)
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_REALM)
      }
      
      localStorage.setItem(STORAGE_KEYS.RECENT_REALMS, JSON.stringify(recentIds))
      localStorage.setItem(STORAGE_KEYS.REALM_FILTERING, JSON.stringify(filtering))
    } catch (error) {
      console.warn('Failed to persist realm state:', error)
    }
  }, [])

  // Get user permissions for a realm
  const getUserPermissions = useCallback((realm: MockRealm): string[] => {
    // For now, simulate getting current user ID (would come from auth context)
    const currentUserId = '1' // Mock current user ID
    
    const membership = realm.memberships.find(m => 
      m.userId === currentUserId && m.status === 'active'
    )
    
    return membership ? membership.permissions : []
  }, [])

  // Initialize realm state on mount
  useEffect(() => {
    const initializeRealms = async () => {
      setIsLoading(true)
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get available realms (filter by user access)
        const userRealms = mockRealms.filter(realm => 
          realm.memberships.some(m => m.userId === '1' && m.status === 'active')
        )
        
        setAvailableRealms(userRealms)
        
        // Load persisted state
        const persistedState = loadPersistedState()
        
        // Determine initial realm
        let initialRealm: MockRealm | null = null
        
        if (initialRealmId) {
          initialRealm = getRealmById(initialRealmId) || null
        } else if (persistedState?.currentRealmId) {
          initialRealm = getRealmById(persistedState.currentRealmId) || null
        }
        
        // Fallback to first available realm
        if (!initialRealm && userRealms.length > 0) {
          initialRealm = userRealms[0]!
        }
        
        setCurrentRealm(initialRealm)
        
        // Set up recent realms
        if (persistedState?.recentRealmIds) {
          const recentRealmObjects = persistedState.recentRealmIds
            .map((id: string) => getRealmById(id))
            .filter((realm: MockRealm | undefined): realm is MockRealm => realm !== undefined)
            .slice(0, 5) // Keep only 5 most recent
          
          setRecentRealms(recentRealmObjects)
        } else if (initialRealm) {
          setRecentRealms([initialRealm])
        }
        
        // Set filtering state
        if (persistedState?.isFiltered !== undefined) {
          setIsRealmFiltered(persistedState.isFiltered)
        }
        
      } catch (error) {
        console.error('Failed to initialize realm state:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeRealms()
  }, [initialRealmId, loadPersistedState])

  // Switch to a different realm
  const switchRealm = useCallback(async (realmId: string): Promise<boolean> => {
    setIsSwitching(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const targetRealm = getRealmById(realmId)
      if (!targetRealm) {
        throw new Error(`Realm with ID ${realmId} not found`)
      }
      
      // Check if user has access to this realm
      const hasAccess = targetRealm.memberships.some(m => 
        m.userId === '1' && m.status === 'active'
      )
      
      if (!hasAccess) {
        throw new Error('Access denied to realm')
      }
      
      setCurrentRealm(targetRealm)
      
      // Add to recent realms
      addToRecent(realmId)
      
      // Persist the change
      const recentIds = [realmId, ...recentRealms.map(r => r.id).filter(id => id !== realmId)].slice(0, 5)
      persistState(realmId, recentIds, isRealmFiltered)
      
      return true
    } catch (error) {
      console.error('Failed to switch realm:', error)
      return false
    } finally {
      setIsSwitching(false)
    }
  }, [recentRealms, isRealmFiltered, persistState])

  // Refresh available realms
  const refreshRealms = useCallback(async () => {
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const userRealms = mockRealms.filter(realm => 
        realm.memberships.some(m => m.userId === '1' && m.status === 'active')
      )
      
      setAvailableRealms(userRealms)
      
      // Refresh current realm if it still exists
      if (currentRealm) {
        const updatedCurrentRealm = getRealmById(currentRealm.id)
        if (updatedCurrentRealm) {
          setCurrentRealm(updatedCurrentRealm)
        }
      }
    } catch (error) {
      console.error('Failed to refresh realms:', error)
    }
  }, [currentRealm])

  // Add realm to recent list
  const addToRecent = useCallback((realmId: string) => {
    setRecentRealms(prev => {
      const realm = getRealmById(realmId)
      if (!realm) return prev
      
      const filtered = prev.filter(r => r.id !== realmId)
      const newRecent = [realm, ...filtered].slice(0, 5)
      
      // Persist the change
      const recentIds = newRecent.map(r => r.id)
      persistState(currentRealm?.id || null, recentIds, isRealmFiltered)
      
      return newRecent
    })
  }, [currentRealm?.id, isRealmFiltered, persistState])

  // Enable/disable realm filtering
  const enableRealmFiltering = useCallback((enabled: boolean) => {
    setIsRealmFiltered(enabled)
    persistState(currentRealm?.id || null, recentRealms.map(r => r.id), enabled)
  }, [currentRealm?.id, recentRealms, persistState])

  // Get current realm permissions
  const currentRealmPermissions = currentRealm ? getUserPermissions(currentRealm) : []

  const contextValue: RealmContextType = {
    currentRealm,
    availableRealms,
    recentRealms,
    isLoading,
    isSwitching,
    switchRealm,
    refreshRealms,
    addToRecent,
    currentRealmPermissions,
    isRealmFiltered,
    enableRealmFiltering,
  }

  return (
    <RealmContext.Provider value={contextValue}>
      {children}
    </RealmContext.Provider>
  )
}

/**
 * useRealm - Hook to access realm context
 */
export const useRealm = (): RealmContextType => {
  const context = useContext(RealmContext)
  if (!context) {
    throw new Error('useRealm must be used within a RealmProvider')
  }
  return context
}

/**
 * useRealmPermissions - Hook to check realm permissions
 */
export const useRealmPermissions = () => {
  const { currentRealmPermissions } = useRealm()
  
  const hasPermission = useCallback((permission: string): boolean => {
    return currentRealmPermissions.includes(permission)
  }, [currentRealmPermissions])
  
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => currentRealmPermissions.includes(permission))
  }, [currentRealmPermissions])
  
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => currentRealmPermissions.includes(permission))
  }, [currentRealmPermissions])

  return {
    permissions: currentRealmPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}

/**
 * useRealmFiltering - Hook for realm-specific data filtering
 */
export const useRealmFiltering = () => {
  const { currentRealm, isRealmFiltered, enableRealmFiltering } = useRealm()
  
  const getRealmFilteredData = useCallback(<T extends { realmId?: string }>(
    data: T[]
  ): T[] => {
    if (!isRealmFiltered || !currentRealm) {
      return data
    }
    
    return data.filter(item => item.realmId === currentRealm.id)
  }, [currentRealm, isRealmFiltered])

  return {
    isRealmFiltered,
    currentRealmId: currentRealm?.id || null,
    enableRealmFiltering,
    getRealmFilteredData,
  }
}

export default useRealm