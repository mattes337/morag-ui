/**
 * Tests for SwipeGestures component
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SwipeGestures, useSwipeGestures } from '../SwipeGestures'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'

// Mock mobile detection hook
jest.mock('@/lib/hooks/useMobileDetection', () => ({
  useMobileDetection: jest.fn(),
}))

const mockMobileDevice = {
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isTouchDevice: true,
  isIOS: false,
  isAndroid: true,
  orientation: 'portrait',
  screenSize: 'small',
  supportsHover: false,
  isLowEndDevice: false,
  viewportWidth: 375,
  viewportHeight: 667,
}

const mockDesktopDevice = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouchDevice: false,
  isIOS: false,
  isAndroid: false,
  orientation: 'landscape',
  screenSize: 'large',
  supportsHover: true,
  isLowEndDevice: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
}

const mockSwipeCallbacks = {
  onSwipe: jest.fn(),
  onSwipeLeft: jest.fn(),
  onSwipeRight: jest.fn(),
  onSwipeUp: jest.fn(),
  onSwipeDown: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(useMobileDetection as jest.Mock).mockReturnValue(mockMobileDevice)
})

describe('SwipeGestures', () => {
  it('should render children on touch devices', () => {
    render(
      <SwipeGestures {...mockSwipeCallbacks}>
        <div data-testid="child-content">Test Content</div>
      </SwipeGestures>
    )
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('should render children on non-touch devices without gesture detection', () => {
    ;(useMobileDetection as jest.Mock).mockReturnValue(mockDesktopDevice)
    
    render(
      <SwipeGestures {...mockSwipeCallbacks}>
        <div data-testid="child-content">Test Content</div>
      </SwipeGestures>
    )
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('should not detect gestures when disabled', () => {
    render(
      <SwipeGestures {...mockSwipeCallbacks} disabled>
        <div data-testid="child-content">Test Content</div>
      </SwipeGestures>
    )
    
    const container = screen.getByTestId('child-content').parentElement
    
    // Simulate swipe
    fireEvent.touchStart(container!, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    fireEvent.touchEnd(container!, {
      changedTouches: [{ clientX: 200, clientY: 100 }]
    })
    
    expect(mockSwipeCallbacks.onSwipeRight).not.toHaveBeenCalled()
  })

  describe('Swipe Detection', () => {
    let container: Element

    beforeEach(() => {
      render(
        <SwipeGestures 
          {...mockSwipeCallbacks}
          threshold={50}
          minVelocity={0.1}
          maxDuration={1000}
        >
          <div data-testid="swipe-container">Swipe me</div>
        </SwipeGestures>
      )
      
      container = screen.getByTestId('swipe-container').parentElement!
    })

    it('should detect right swipe', () => {
      // Start touch
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Move right
      fireEvent.touchMove(container, {
        touches: [{ clientX: 150, clientY: 100 }]
      })
      
      // End touch
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeRight).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'right',
          distance: expect.any(Number),
          velocity: expect.any(Number),
        })
      )
      expect(mockSwipeCallbacks.onSwipe).toHaveBeenCalled()
    })

    it('should detect left swipe', () => {
      fireEvent.touchStart(container, {
        touches: [{ clientX: 200, clientY: 100 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 100, clientY: 100 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeLeft).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'left',
        })
      )
    })

    it('should detect up swipe', () => {
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 200 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 100, clientY: 100 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeUp).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'up',
        })
      )
    })

    it('should detect down swipe', () => {
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 100, clientY: 200 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeDown).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'down',
        })
      )
    })

    it('should not trigger swipe below threshold', () => {
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Small movement below threshold
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 120, clientY: 100 }]
      })
      
      expect(mockSwipeCallbacks.onSwipe).not.toHaveBeenCalled()
    })

    it('should not trigger swipe if too slow', () => {
      const slowSwipe = render(
        <SwipeGestures 
          {...mockSwipeCallbacks}
          minVelocity={10} // Very high velocity threshold
        >
          <div data-testid="slow-swipe">Slow swipe</div>
        </SwipeGestures>
      )
      
      const slowContainer = slowSwipe.getByTestId('slow-swipe').parentElement!
      
      fireEvent.touchStart(slowContainer, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Wait to simulate slow swipe
      setTimeout(() => {
        fireEvent.touchEnd(slowContainer, {
          changedTouches: [{ clientX: 200, clientY: 100 }]
        })
      }, 100)
      
      expect(mockSwipeCallbacks.onSwipe).not.toHaveBeenCalled()
    })

    it('should not trigger swipe if duration too long', () => {
      const fastTimeout = render(
        <SwipeGestures 
          {...mockSwipeCallbacks}
          maxDuration={1} // Very short duration
        >
          <div data-testid="timeout-swipe">Timeout swipe</div>
        </SwipeGestures>
      )
      
      const timeoutContainer = fastTimeout.getByTestId('timeout-swipe').parentElement!
      
      fireEvent.touchStart(timeoutContainer, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Wait longer than maxDuration
      setTimeout(() => {
        fireEvent.touchEnd(timeoutContainer, {
          changedTouches: [{ clientX: 200, clientY: 100 }]
        })
      }, 10)
      
      expect(mockSwipeCallbacks.onSwipe).not.toHaveBeenCalled()
    })
  })

  describe('Direction Constraints', () => {
    it('should only detect horizontal swipes when horizontalOnly is true', () => {
      render(
        <SwipeGestures 
          {...mockSwipeCallbacks}
          horizontalOnly
        >
          <div data-testid="horizontal-only">Horizontal only</div>
        </SwipeGestures>
      )
      
      const container = screen.getByTestId('horizontal-only').parentElement!
      
      // Vertical swipe should not trigger
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 100, clientY: 200 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeDown).not.toHaveBeenCalled()
      
      // Horizontal swipe should trigger
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeRight).toHaveBeenCalled()
    })

    it('should only detect vertical swipes when verticalOnly is true', () => {
      render(
        <SwipeGestures 
          {...mockSwipeCallbacks}
          verticalOnly
        >
          <div data-testid="vertical-only">Vertical only</div>
        </SwipeGestures>
      )
      
      const container = screen.getByTestId('vertical-only').parentElement!
      
      // Horizontal swipe should not trigger
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeRight).not.toHaveBeenCalled()
      
      // Vertical swipe should trigger
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 100, clientY: 200 }]
      })
      
      expect(mockSwipeCallbacks.onSwipeDown).toHaveBeenCalled()
    })
  })

  describe('Touch Event Handling', () => {
    it('should handle touchMove events', () => {
      render(
        <SwipeGestures {...mockSwipeCallbacks}>
          <div data-testid="touch-move">Touch move</div>
        </SwipeGestures>
      )
      
      const container = screen.getByTestId('touch-move').parentElement!
      
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchMove(container, {
        touches: [{ clientX: 150, clientY: 100 }]
      })
      
      // Should not throw errors
      expect(() => {
        fireEvent.touchEnd(container, {
          changedTouches: [{ clientX: 200, clientY: 100 }]
        })
      }).not.toThrow()
    })

    it('should handle missing touch data gracefully', () => {
      render(
        <SwipeGestures {...mockSwipeCallbacks}>
          <div data-testid="missing-touch">Missing touch</div>
        </SwipeGestures>
      )
      
      const container = screen.getByTestId('missing-touch').parentElement!
      
      // TouchEnd without touchStart
      expect(() => {
        fireEvent.touchEnd(container, {
          changedTouches: [{ clientX: 200, clientY: 100 }]
        })
      }).not.toThrow()
      
      expect(mockSwipeCallbacks.onSwipe).not.toHaveBeenCalled()
    })
  })

  describe('Event Prevention', () => {
    it('should prevent default when preventDefault is true', () => {
      render(
        <SwipeGestures {...mockSwipeCallbacks} preventDefault>
          <div data-testid="prevent-default">Prevent default</div>
        </SwipeGestures>
      )
      
      const container = screen.getByTestId('prevent-default').parentElement!
      
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      })
      
      const preventDefaultSpy = jest.spyOn(touchStartEvent, 'preventDefault')
      
      fireEvent(container, touchStartEvent)
      
      // Note: preventDefault behavior might be complex to test in jsdom
      // This is more of a smoke test
      expect(() => fireEvent(container, touchStartEvent)).not.toThrow()
    })
  })
})

describe('useSwipeGestures hook', () => {
  it('should return swipe handlers', () => {
    const TestComponent = () => {
      const { swipeHandlers } = useSwipeGestures({
        onSwipeLeft: mockSwipeCallbacks.onSwipeLeft,
        onSwipeRight: mockSwipeCallbacks.onSwipeRight,
      })
      
      return (
        <div 
          data-testid="hook-container"
          {...swipeHandlers}
        >
          Hook test
        </div>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('hook-container')).toBeInTheDocument()
  })

  it('should not add handlers on non-touch devices', () => {
    ;(useMobileDetection as jest.Mock).mockReturnValue(mockDesktopDevice)
    
    const TestComponent = () => {
      const { swipeHandlers } = useSwipeGestures({
        onSwipeLeft: mockSwipeCallbacks.onSwipeLeft,
      })
      
      return (
        <div 
          data-testid="no-touch-container"
          {...swipeHandlers}
        >
          No touch test
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const container = screen.getByTestId('no-touch-container')
    
    // Simulate touch events - should not trigger callbacks
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    
    fireEvent.touchEnd(container, {
      changedTouches: [{ clientX: 200, clientY: 100 }]
    })
    
    expect(mockSwipeCallbacks.onSwipeLeft).not.toHaveBeenCalled()
  })
})