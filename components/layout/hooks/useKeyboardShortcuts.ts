// useKeyboardShortcuts.ts - Keyboard shortcuts hook
import { useEffect } from 'react'

export interface KeyboardShortcutsCallbacks {
  onToggleSidebar: () => void
  onToggleSearch: () => void
  onEscape: () => void
}

// Check if target element is an input field where shortcuts should be disabled
const isInputElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof Element)) return false
  
  const tagName = target.tagName.toLowerCase()
  const contentEditable = target.getAttribute('contenteditable')
  
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    contentEditable === 'true' ||
    contentEditable === '' ||
    (target as HTMLElement).isContentEditable
  )
}

// Check if the key combination matches our shortcuts
const matchesShortcut = (
  event: KeyboardEvent,
  key: string,
  requireModifier = true
): boolean => {
  const isModifierPressed = event.metaKey || event.ctrlKey
  
  if (requireModifier && !isModifierPressed) return false
  if (!requireModifier && isModifierPressed) return false
  
  return event.key.toLowerCase() === key.toLowerCase()
}

export const useKeyboardShortcuts = (callbacks: KeyboardShortcutsCallbacks): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (isInputElement(event.target)) return
      
      let handled = false
      
      // Cmd/Ctrl + K: Toggle search
      if (matchesShortcut(event, 'k')) {
        callbacks.onToggleSearch()
        handled = true
      }
      // Cmd/Ctrl + \: Toggle sidebar
      else if (matchesShortcut(event, '\\')) {
        callbacks.onToggleSidebar()
        handled = true
      }
      // Escape: Close overlays/modals
      else if (matchesShortcut(event, 'Escape', false)) {
        callbacks.onEscape()
        handled = true
      }
      
      // Prevent default behavior for handled shortcuts
      if (handled) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [callbacks])
}