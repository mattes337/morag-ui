/**
 * Device-Aware Settings Hook
 * 
 * Provides unified settings management across mobile and desktop devices
 * with automatic synchronization and device-specific optimizations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useMobileDetection } from './useMobileDetection'

interface DeviceSettings {
  // Layout preferences
  sidebarState: 'expanded' | 'collapsed' | 'hidden'
  theme: 'light' | 'dark' | 'system'
  reducedMotion: boolean
  
  // Mobile-specific settings
  mobileTabBar: boolean
  swipeGestures: boolean
  hapticFeedback: boolean
  
  // Performance settings
  lazyLoading: boolean
  imageQuality: 'low' | 'medium' | 'high'
  pageSize: number
  
  // Accessibility settings
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  keyboardNavigation: boolean
}

interface DeviceSettingsState {
  mobile: Partial<DeviceSettings>
  tablet: Partial<DeviceSettings>
  desktop: Partial<DeviceSettings>
  global: Partial<DeviceSettings>
}

const DEFAULT_SETTINGS: DeviceSettings = {
  sidebarState: 'expanded',
  theme: 'system',
  reducedMotion: false,
  mobileTabBar: true,
  swipeGestures: true,
  hapticFeedback: true,
  lazyLoading: true,
  imageQuality: 'medium',
  pageSize: 20,
  highContrast: false,
  fontSize: 'medium',
  keyboardNavigation: false,
}

const STORAGE_KEY = 'morag-device-settings'

/**
 * Hook for device-aware settings management
 */
export function useDeviceSettings() {
  const device = useMobileDetection()
  const { isMobile, isTablet, isDesktop } = device
  
  // Determine current device type
  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  
  // Settings state
  const [settingsState, setSettingsState] = useState<DeviceSettingsState>(() => {
    if (typeof window === 'undefined') {
      return {
        mobile: {},
        tablet: {},
        desktop: {},
        global: DEFAULT_SETTINGS
      }
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          mobile: parsed.mobile || {},
          tablet: parsed.tablet || {},
          desktop: parsed.desktop || {},
          global: parsed.global || DEFAULT_SETTINGS
        }
      }
    } catch (error) {
      console.warn('Failed to load device settings:', error)
    }
    
    return {
      mobile: {},
      tablet: {},
      desktop: {},
      global: DEFAULT_SETTINGS
    }
  })
  
  // Compute effective settings for current device
  const effectiveSettings = useMemo((): DeviceSettings => {
    const deviceSpecific = settingsState[deviceType] || {}
    const global = settingsState.global || {}
    
    // Apply device-specific optimizations
    let optimized: Partial<DeviceSettings> = {}
    
    if (isMobile) {
      optimized = {
        sidebarState: 'hidden', // Force hidden on mobile
        lazyLoading: true,
        imageQuality: 'medium',
        pageSize: 10,
        mobileTabBar: true,
      }
    } else if (isTablet) {
      optimized = {
        sidebarState: 'collapsed',
        lazyLoading: true,
        imageQuality: 'medium',
        pageSize: 15,
        mobileTabBar: false,
      }
    } else {
      optimized = {
        sidebarState: 'expanded',
        lazyLoading: false,
        imageQuality: 'high',
        pageSize: 25,
        mobileTabBar: false,
      }
    }
    
    return {
      ...DEFAULT_SETTINGS,
      ...global,
      ...deviceSpecific,
      ...optimized
    }
  }, [settingsState, deviceType, isMobile, isTablet])
  
  // Persist settings to localStorage
  const persistSettings = useCallback((newState: DeviceSettingsState) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch (error) {
      console.warn('Failed to persist device settings:', error)
    }
  }, [])
  
  // Update setting for current device
  const updateSetting = useCallback(<K extends keyof DeviceSettings>(
    key: K,
    value: DeviceSettings[K],
    scope: 'device' | 'global' = 'device'
  ) => {
    setSettingsState(prevState => {
      const newState = { ...prevState }
      
      if (scope === 'global') {
        newState.global = { ...newState.global, [key]: value }
      } else {
        newState[deviceType] = { ...newState[deviceType], [key]: value }
      }
      
      persistSettings(newState)
      return newState
    })
  }, [deviceType, persistSettings])
  
  // Update multiple settings at once
  const updateSettings = useCallback((
    updates: Partial<DeviceSettings>,
    scope: 'device' | 'global' = 'device'
  ) => {
    setSettingsState(prevState => {
      const newState = { ...prevState }
      
      if (scope === 'global') {
        newState.global = { ...newState.global, ...updates }
      } else {
        newState[deviceType] = { ...newState[deviceType], ...updates }
      }
      
      persistSettings(newState)
      return newState
    })
  }, [deviceType, persistSettings])
  
  // Reset settings for current device
  const resetDeviceSettings = useCallback(() => {
    setSettingsState(prevState => {
      const newState = { ...prevState }
      newState[deviceType] = {}
      persistSettings(newState)
      return newState
    })
  }, [deviceType, persistSettings])
  
  // Reset all settings
  const resetAllSettings = useCallback(() => {
    const newState: DeviceSettingsState = {
      mobile: {},
      tablet: {},
      desktop: {},
      global: DEFAULT_SETTINGS
    }
    setSettingsState(newState)
    persistSettings(newState)
  }, [persistSettings])
  
  // Get setting value for specific device
  const getDeviceSetting = useCallback(<K extends keyof DeviceSettings>(
    key: K,
    targetDevice: 'mobile' | 'tablet' | 'desktop'
  ): DeviceSettings[K] => {
    const deviceSpecific = settingsState[targetDevice]?.[key]
    const global = settingsState.global?.[key]
    return deviceSpecific ?? global ?? DEFAULT_SETTINGS[key]
  }, [settingsState])
  
  // Sync settings across devices (for global settings)
  const syncGlobalSettings = useCallback(() => {
    // In a real app, this would sync with a server
    console.log('Syncing global settings across devices...')
  }, [])
  
  // Auto-optimize settings based on device capabilities
  useEffect(() => {
    if (device.isLowEndDevice && !settingsState[deviceType].reducedMotion) {
      updateSetting('reducedMotion', true, 'device')
      updateSetting('lazyLoading', true, 'device')
      updateSetting('imageQuality', 'low', 'device')
    }
  }, [device.isLowEndDevice, deviceType, settingsState, updateSetting])
  
  return {
    // Current effective settings
    settings: effectiveSettings,
    
    // Device information
    device,
    deviceType,
    
    // Setting management
    updateSetting,
    updateSettings,
    resetDeviceSettings,
    resetAllSettings,
    
    // Cross-device utilities
    getDeviceSetting,
    syncGlobalSettings,
    
    // Raw state for advanced use cases
    rawSettings: settingsState,
    
    // Helper functions
    isOptimizedForDevice: (setting: keyof DeviceSettings) => {
      return settingsState[deviceType]?.[setting] !== undefined
    },
    
    hasDeviceSpecificSettings: () => {
      return Object.keys(settingsState[deviceType] || {}).length > 0
    }
  }
}

/**
 * Hook for theme management across devices
 */
export function useDeviceTheme() {
  const { settings, updateSetting, device } = useDeviceSettings()
  
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    updateSetting('theme', theme, 'global')
  }, [updateSetting])
  
  const toggleTheme = useCallback(() => {
    const current = settings.theme
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'
    setTheme(next)
  }, [settings.theme, setTheme])
  
  return {
    theme: settings.theme,
    setTheme,
    toggleTheme,
    isDarkMode: settings.theme === 'dark' || 
                (settings.theme === 'system' && 
                 typeof window !== 'undefined' && 
                 window.matchMedia('(prefers-color-scheme: dark)').matches),
    device
  }
}

export default useDeviceSettings