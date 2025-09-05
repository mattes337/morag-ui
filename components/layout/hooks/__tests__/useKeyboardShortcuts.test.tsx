// useKeyboardShortcuts.test.tsx - Test keyboard shortcuts hook
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let mockCallbacks: {
    onToggleSidebar: jest.Mock
    onToggleSearch: jest.Mock
    onEscape: jest.Mock
  }

  beforeEach(() => {
    mockCallbacks = {
      onToggleSidebar: jest.fn(),
      onToggleSearch: jest.fn(),
      onEscape: jest.fn(),
    }
  })

  afterEach(() => {
    // Clean up event listeners
    jest.clearAllMocks()
  })

  it('should call onToggleSidebar when Cmd+\\ is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const event = new KeyboardEvent('keydown', {
      key: '\\',
      metaKey: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(mockCallbacks.onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('should call onToggleSidebar when Ctrl+\\ is pressed on Windows', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const event = new KeyboardEvent('keydown', {
      key: '\\',
      ctrlKey: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(mockCallbacks.onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('should call onToggleSearch when Cmd+K is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(mockCallbacks.onToggleSearch).toHaveBeenCalledTimes(1)
  })

  it('should call onToggleSearch when Ctrl+K is pressed on Windows', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(mockCallbacks.onToggleSearch).toHaveBeenCalledTimes(1)
  })

  it('should call onEscape when Escape is pressed', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(mockCallbacks.onEscape).toHaveBeenCalledTimes(1)
  })

  it('should not trigger shortcuts when typing in input fields', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    // Mock an input element
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })

    // Override event.target
    Object.defineProperty(event, 'target', {
      value: input,
      writable: false,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(mockCallbacks.onToggleSearch).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('should not trigger shortcuts when typing in textarea fields', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })

    Object.defineProperty(event, 'target', {
      value: textarea,
      writable: false,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(mockCallbacks.onToggleSearch).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })


  it('should prevent default behavior for handled shortcuts', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

    act(() => {
      window.dispatchEvent(event)
    })

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should not prevent default for unhandled keys', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks))

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      metaKey: true,
    })

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

    act(() => {
      window.dispatchEvent(event)
    })

    expect(preventDefaultSpy).not.toHaveBeenCalled()
    expect(mockCallbacks.onToggleSidebar).not.toHaveBeenCalled()
    expect(mockCallbacks.onToggleSearch).not.toHaveBeenCalled()
    expect(mockCallbacks.onEscape).not.toHaveBeenCalled()
  })

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderHook(() => useKeyboardShortcuts(mockCallbacks))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })
})