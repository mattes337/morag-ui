// useLayoutState.test.tsx - Test layout state management hook
import { renderHook, act } from '@testing-library/react'
import { useLayoutState } from '../useLayoutState'
import { SidebarState, Theme } from '../../types'

describe('useLayoutState', () => {
  // Create a real localStorage implementation for tests
  let localStorageData: { [key: string]: string } = {}

  beforeEach(() => {
    // Reset localStorage data
    localStorageData = {}
    
    // Mock localStorage with actual storage behavior
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageData[key] || null,
        setItem: (key: string, value: string) => {
          localStorageData[key] = value
        },
        removeItem: (key: string) => {
          delete localStorageData[key]
        },
        clear: () => {
          localStorageData = {}
        },
      },
      writable: true,
    })
    
    // Mock matchMedia for theme detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  afterEach(() => {
    localStorageData = {}
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLayoutState())

    expect(result.current.state).toEqual({
      sidebarState: 'expanded',
      isMobileMenuOpen: false,
      theme: 'system',
      isSearchOpen: false,
    })
  })

  it('should load state from localStorage if available', () => {
    const savedState = {
      sidebarState: 'collapsed' as SidebarState,
      isMobileMenuOpen: false,
      theme: 'dark' as Theme,
      isSearchOpen: false,
    }
    localStorage.setItem('morag-layout-state', JSON.stringify(savedState))

    const { result } = renderHook(() => useLayoutState())

    expect(result.current.state.sidebarState).toBe('collapsed')
    expect(result.current.state.theme).toBe('dark')
  })

  describe('toggleSidebar', () => {
    it('should toggle sidebar between expanded and collapsed', () => {
      const { result } = renderHook(() => useLayoutState())

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.state.sidebarState).toBe('collapsed')

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.state.sidebarState).toBe('expanded')
    })

    it('should expand collapsed sidebar when toggling', () => {
      localStorage.setItem('morag-layout-state', JSON.stringify({
        sidebarState: 'collapsed',
        isMobileMenuOpen: false,
        theme: 'system',
        isSearchOpen: false,
      }))

      const { result } = renderHook(() => useLayoutState())

      expect(result.current.state.sidebarState).toBe('collapsed')

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.state.sidebarState).toBe('expanded')
    })

    it('should collapse expanded sidebar when toggling', () => {
      const { result } = renderHook(() => useLayoutState())

      expect(result.current.state.sidebarState).toBe('expanded')

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.state.sidebarState).toBe('collapsed')
    })

    it('should expand hidden sidebar when toggling', () => {
      localStorage.setItem('morag-layout-state', JSON.stringify({
        sidebarState: 'hidden',
        isMobileMenuOpen: false,
        theme: 'system',
        isSearchOpen: false,
      }))

      const { result } = renderHook(() => useLayoutState())

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.state.sidebarState).toBe('expanded')
    })
  })

  describe('setSidebarState', () => {
    it('should set sidebar state directly', () => {
      const { result } = renderHook(() => useLayoutState())

      act(() => {
        result.current.setSidebarState('hidden')
      })

      expect(result.current.state.sidebarState).toBe('hidden')

      act(() => {
        result.current.setSidebarState('collapsed')
      })

      expect(result.current.state.sidebarState).toBe('collapsed')
    })
  })

  describe('toggleMobileMenu', () => {
    it('should toggle mobile menu open/closed', () => {
      const { result } = renderHook(() => useLayoutState())

      expect(result.current.state.isMobileMenuOpen).toBe(false)

      act(() => {
        result.current.toggleMobileMenu()
      })

      expect(result.current.state.isMobileMenuOpen).toBe(true)

      act(() => {
        result.current.toggleMobileMenu()
      })

      expect(result.current.state.isMobileMenuOpen).toBe(false)
    })
  })

  describe('toggleSearch', () => {
    it('should toggle search overlay open/closed', () => {
      const { result } = renderHook(() => useLayoutState())

      expect(result.current.state.isSearchOpen).toBe(false)

      act(() => {
        result.current.toggleSearch()
      })

      expect(result.current.state.isSearchOpen).toBe(true)

      act(() => {
        result.current.toggleSearch()
      })

      expect(result.current.state.isSearchOpen).toBe(false)
    })
  })

  describe('setTheme', () => {
    it('should set theme and update state', () => {
      const { result } = renderHook(() => useLayoutState())

      act(() => {
        result.current.setTheme('dark')
      })

      expect(result.current.state.theme).toBe('dark')

      act(() => {
        result.current.setTheme('light')
      })

      expect(result.current.state.theme).toBe('light')

      act(() => {
        result.current.setTheme('system')
      })

      expect(result.current.state.theme).toBe('system')
    })
  })

  describe('localStorage persistence', () => {
    it('should persist state changes to localStorage', () => {
      const { result } = renderHook(() => useLayoutState())

      act(() => {
        result.current.setSidebarState('collapsed')
        result.current.setTheme('dark')
      })

      const savedState = JSON.parse(localStorage.getItem('morag-layout-state') || '{}')
      expect(savedState.sidebarState).toBe('collapsed')
      expect(savedState.theme).toBe('dark')
    })

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('morag-layout-state', 'invalid-json')

      const { result } = renderHook(() => useLayoutState())

      expect(result.current.state).toEqual({
        sidebarState: 'expanded',
        isMobileMenuOpen: false,
        theme: 'system',
        isSearchOpen: false,
      })
    })

    it('should handle partial localStorage data', () => {
      localStorage.setItem('morag-layout-state', JSON.stringify({
        sidebarState: 'collapsed',
        // Missing other properties
      }))

      const { result } = renderHook(() => useLayoutState())

      expect(result.current.state.sidebarState).toBe('collapsed')
      expect(result.current.state.isMobileMenuOpen).toBe(false)
      expect(result.current.state.theme).toBe('system')
      expect(result.current.state.isSearchOpen).toBe(false)
    })
  })
})