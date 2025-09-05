// useLayoutState.ts - Layout state management hook
import { useState, useEffect, useCallback } from 'react'
import { LayoutState, SidebarState, Theme } from '../types'

const STORAGE_KEY = 'morag-layout-state'

// Default layout state
const defaultState: LayoutState = {
  sidebarState: 'expanded',
  isMobileMenuOpen: false,
  theme: 'system',
  isSearchOpen: false,
}

// Check if we're in a mobile viewport
const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// Load state from localStorage
const loadStateFromStorage = (): Partial<LayoutState> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to load layout state from localStorage:', error)
  }
  
  return {}
}

// Save state to localStorage
const saveStateToStorage = (state: LayoutState): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save layout state to localStorage:', error)
  }
}

// Get initial state with responsive considerations
const getInitialState = (): LayoutState => {
  const storedState = loadStateFromStorage()
  const initialState = { ...defaultState, ...storedState }
  
  // Auto-collapse sidebar on mobile
  if (isMobileViewport() && initialState.sidebarState === 'expanded') {
    initialState.sidebarState = 'collapsed'
  }
  
  return initialState
}

export interface UseLayoutStateReturn {
  state: LayoutState
  toggleSidebar: () => void
  setSidebarState: (state: SidebarState) => void
  toggleMobileMenu: () => void
  toggleSearch: () => void
  setTheme: (theme: Theme) => void
}

export const useLayoutState = (): UseLayoutStateReturn => {
  const [state, setState] = useState<LayoutState>(getInitialState)

  // Persist state changes to localStorage
  useEffect(() => {
    saveStateToStorage(state)
  }, [state])

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setState(prevState => {
        // Auto-collapse sidebar on mobile
        if (isMobileViewport() && prevState.sidebarState === 'expanded') {
          return { ...prevState, sidebarState: 'collapsed' }
        }
        // Close mobile menu on desktop
        if (!isMobileViewport() && prevState.isMobileMenuOpen) {
          return { ...prevState, isMobileMenuOpen: false }
        }
        return prevState
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
    
    return undefined
  }, [])

  const toggleSidebar = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      sidebarState: prevState.sidebarState === 'expanded' ? 'collapsed' : 'expanded',
    }))
  }, [])

  const setSidebarState = useCallback((sidebarState: SidebarState) => {
    setState(prevState => ({
      ...prevState,
      sidebarState,
    }))
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isMobileMenuOpen: !prevState.isMobileMenuOpen,
    }))
  }, [])

  const toggleSearch = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isSearchOpen: !prevState.isSearchOpen,
    }))
  }, [])

  const setTheme = useCallback((theme: Theme) => {
    setState(prevState => ({
      ...prevState,
      theme,
    }))
  }, [])

  return {
    state,
    toggleSidebar,
    setSidebarState,
    toggleMobileMenu,
    toggleSearch,
    setTheme,
  }
}