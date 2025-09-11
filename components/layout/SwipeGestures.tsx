/**
 * SwipeGestures Component
 * 
 * Provides touch-based swipe gesture recognition for mobile navigation.
 * Supports horizontal and vertical swipes with customizable thresholds and callbacks.
 */

'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'

interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  duration: number
  velocity: number
  startX: number
  startY: number
  endX: number
  endY: number
}

interface SwipeGesturesProps {
  /** Child components to wrap with swipe detection */
  children: React.ReactNode
  /** Callback when swipe gesture is detected */
  onSwipe?: (event: SwipeEvent) => void
  /** Callback for left swipe */
  onSwipeLeft?: (event: SwipeEvent) => void
  /** Callback for right swipe */
  onSwipeRight?: (event: SwipeEvent) => void
  /** Callback for up swipe */
  onSwipeUp?: (event: SwipeEvent) => void
  /** Callback for down swipe */
  onSwipeDown?: (event: SwipeEvent) => void
  /** Minimum distance in pixels to register as swipe */
  threshold?: number
  /** Maximum time in ms for swipe to be valid */
  maxDuration?: number
  /** Minimum velocity in px/ms to register as swipe */
  minVelocity?: number
  /** Prevent default touch behavior */
  preventDefault?: boolean
  /** Only detect horizontal swipes */
  horizontalOnly?: boolean
  /** Only detect vertical swipes */
  verticalOnly?: boolean
  /** Additional CSS classes */
  className?: string
  /** Disable swipe detection */
  disabled?: boolean
}

interface TouchData {
  startX: number
  startY: number
  startTime: number
  currentX: number
  currentY: number
  isTracking: boolean
}

/**
 * SwipeGestures component for touch-based navigation
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SwipeGestures onSwipeLeft={() => router.back()}>
 *   <div>Swipe left to go back</div>
 * </SwipeGestures>
 * 
 * // Navigation between pages
 * <SwipeGestures
 *   onSwipeLeft={() => navigateToNext()}
 *   onSwipeRight={() => navigateToPrevious()}
 *   threshold={100}
 *   horizontalOnly
 * >
 *   <PageContent />
 * </SwipeGestures>
 * 
 * // Pull-to-refresh pattern
 * <SwipeGestures
 *   onSwipeDown={(event) => {
 *     if (event.distance > 150) {
 *       triggerRefresh();
 *     }
 *   }}
 *   verticalOnly
 * >
 *   <ContentList />
 * </SwipeGestures>
 * ```
 */
export const SwipeGestures: React.FC<SwipeGesturesProps> = ({
  children,
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  maxDuration = 1000,
  minVelocity = 0.1,
  preventDefault = true,
  horizontalOnly = false,
  verticalOnly = false,
  className = '',
  disabled = false,
}) => {
  const device = useMobileDetection()
  const touchDataRef = useRef<TouchData>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isTracking: false,
  })

  // Don't render swipe detection on non-touch devices
  if (!device.isTouchDevice || disabled) {
    return <div className={className}>{children}</div>
  }

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return

    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isTracking: true,
    }

    if (preventDefault) {
      // Only prevent default for certain gestures to maintain scrolling
      const isHorizontalStart = Math.abs(touch.clientX - touchDataRef.current.startX) > 
                               Math.abs(touch.clientY - touchDataRef.current.startY)
      
      if ((horizontalOnly && isHorizontalStart) || (!horizontalOnly && !verticalOnly)) {
        // Allow vertical scrolling for horizontal-only swipes
        // Prevent default only when we're sure it's a horizontal gesture
      }
    }
  }, [preventDefault, horizontalOnly])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchDataRef.current.isTracking) return

    const touch = event.touches[0]
    if (!touch) return

    touchDataRef.current.currentX = touch.clientX
    touchDataRef.current.currentY = touch.clientY

    // Calculate deltas to determine gesture direction
    const deltaX = Math.abs(touch.clientX - touchDataRef.current.startX)
    const deltaY = Math.abs(touch.clientY - touchDataRef.current.startY)

    // Prevent default scrolling for horizontal swipes if horizontalOnly is true
    if (horizontalOnly && deltaX > deltaY && deltaX > 10) {
      event.preventDefault()
    }

    // Prevent default scrolling for vertical swipes if verticalOnly is true  
    if (verticalOnly && deltaY > deltaX && deltaY > 10) {
      event.preventDefault()
    }
  }, [horizontalOnly, verticalOnly])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!touchDataRef.current.isTracking) return

    const touchData = touchDataRef.current
    touchData.isTracking = false

    const endTime = Date.now()
    const duration = endTime - touchData.startTime
    const deltaX = touchData.currentX - touchData.startX
    const deltaY = touchData.currentY - touchData.startY
    const distanceX = Math.abs(deltaX)
    const distanceY = Math.abs(deltaY)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / duration

    // Check if gesture meets minimum requirements
    if (duration > maxDuration || velocity < minVelocity) {
      return
    }

    // Determine primary direction
    let direction: 'left' | 'right' | 'up' | 'down' | null = null

    if (horizontalOnly || (!horizontalOnly && !verticalOnly && distanceX > distanceY)) {
      if (distanceX >= threshold) {
        direction = deltaX > 0 ? 'right' : 'left'
      }
    } else if (verticalOnly || (!horizontalOnly && !verticalOnly && distanceY > distanceX)) {
      if (distanceY >= threshold) {
        direction = deltaY > 0 ? 'down' : 'up'
      }
    }

    if (!direction) return

    const swipeEvent: SwipeEvent = {
      direction,
      distance,
      duration,
      velocity,
      startX: touchData.startX,
      startY: touchData.startY,
      endX: touchData.currentX,
      endY: touchData.currentY,
    }

    // Call appropriate callbacks
    onSwipe?.(swipeEvent)

    switch (direction) {
      case 'left':
        onSwipeLeft?.(swipeEvent)
        break
      case 'right':
        onSwipeRight?.(swipeEvent)
        break
      case 'up':
        onSwipeUp?.(swipeEvent)
        break
      case 'down':
        onSwipeDown?.(swipeEvent)
        break
    }
  }, [
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold,
    maxDuration,
    minVelocity,
    horizontalOnly,
    verticalOnly,
  ])

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }} // Allow vertical scrolling by default
    >
      {children}
    </div>
  )
}

/**
 * Hook for using swipe gestures in functional components
 */
export function useSwipeGestures({
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  maxDuration = 1000,
  minVelocity = 0.1,
}: Omit<SwipeGesturesProps, 'children' | 'className'>) {
  const device = useMobileDetection()
  const touchDataRef = useRef<TouchData>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isTracking: false,
  })

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!device.isTouchDevice) return

    const touch = event.touches[0]
    if (!touch) return

    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isTracking: true,
    }
  }, [device.isTouchDevice])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!device.isTouchDevice || !touchDataRef.current.isTracking) return

    const touchData = touchDataRef.current
    touchData.isTracking = false

    const touch = event.changedTouches[0]
    if (!touch) return

    const endTime = Date.now()
    const duration = endTime - touchData.startTime
    const deltaX = touch.clientX - touchData.startX
    const deltaY = touch.clientY - touchData.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / duration

    if (duration > maxDuration || velocity < minVelocity || distance < threshold) {
      return
    }

    const distanceX = Math.abs(deltaX)
    const distanceY = Math.abs(deltaY)
    let direction: 'left' | 'right' | 'up' | 'down'

    if (distanceX > distanceY) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    const swipeEvent: SwipeEvent = {
      direction,
      distance,
      duration,
      velocity,
      startX: touchData.startX,
      startY: touchData.startY,
      endX: touch.clientX,
      endY: touch.clientY,
    }

    onSwipe?.(swipeEvent)

    switch (direction) {
      case 'left':
        onSwipeLeft?.(swipeEvent)
        break
      case 'right':
        onSwipeRight?.(swipeEvent)
        break
      case 'up':
        onSwipeUp?.(swipeEvent)
        break
      case 'down':
        onSwipeDown?.(swipeEvent)
        break
    }
  }, [device.isTouchDevice, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, maxDuration, minVelocity])

  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  }
}

export default SwipeGestures