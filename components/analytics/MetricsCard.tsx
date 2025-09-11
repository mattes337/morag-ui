'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileText,
  Clock,
  Search,
  Users,
  CheckCircle,
  HardDrive,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'flat'
  icon?: string
  description?: string
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'bytes'
  variant?: 'default' | 'compact'
  className?: string
  animate?: boolean
}

const iconMap = {
  'file-text': FileText,
  'clock': Clock,
  'search': Search,
  'users': Users,
  'check-circle': CheckCircle,
  'hard-drive': HardDrive,
  'layers': Layers,
  'activity': Activity,
  'alert-circle': AlertCircle,
}

/**
 * MetricsCard component - Key performance indicator display
 * 
 * Features:
 * - Displays key metrics with trend indicators
 * - Supports positive, negative, and neutral trends
 * - CountUp animation for number values
 * - Multiple format types (number, currency, percentage, etc.)
 * - Customizable icons from Lucide React
 * - Responsive design with compact variant
 * - Accessibility support with proper ARIA labels
 */
export function MetricsCard({
  title,
  value,
  change,
  trend,
  icon,
  description,
  format = 'number',
  variant = 'default',
  className,
  animate = true,
}: MetricsCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const [isAnimating, setIsAnimating] = useState(false)

  // CountUp animation effect
  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(value)
      return
    }

    setIsAnimating(true)
    const startValue = typeof displayValue === 'number' ? displayValue : 0
    const endValue = value
    const duration = 1000 // 1 second
    const startTime = Date.now()

    const animateValue = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (endValue - startValue) * easeOutQuart

      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        requestAnimationFrame(animateValue)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animateValue)
  }, [value, animate, displayValue])

  // Format the display value based on format type
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val)

      case 'percentage':
        return `${val.toFixed(1)}%`

      case 'duration':
        // Convert milliseconds to human readable format
        if (val < 60000) return `${Math.round(val / 1000)}s`
        if (val < 3600000) return `${(val / 60000).toFixed(1)}m`
        return `${(val / 3600000).toFixed(1)}h`

      case 'bytes':
        const units = ['B', 'KB', 'MB', 'GB', 'TB']
        let size = val
        let unitIndex = 0
        
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024
          unitIndex++
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`

      case 'number':
      default:
        return val.toLocaleString()
    }
  }

  // Get trend color and icon
  const getTrendInfo = () => {
    if (!change && !trend) return null

    const trendDirection = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'flat')
    
    switch (trendDirection) {
      case 'up':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          icon: TrendingUp,
          label: 'Trending up',
        }
      case 'down':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          icon: TrendingDown,
          label: 'Trending down',
        }
      case 'flat':
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          icon: Minus,
          label: 'No change',
        }
    }
  }

  const trendInfo = getTrendInfo()
  const IconComponent = icon && iconMap[icon as keyof typeof iconMap]
  const TrendIcon = trendInfo?.icon

  const isCompact = variant === 'compact'

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className={cn("p-6", isCompact && "p-4")}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              {IconComponent && (
                <div className={cn(
                  "flex items-center justify-center rounded-md",
                  isCompact ? "h-6 w-6" : "h-8 w-8",
                  "bg-muted"
                )}>
                  <IconComponent className={cn(
                    "text-muted-foreground",
                    isCompact ? "h-3 w-3" : "h-4 w-4"
                  )} />
                </div>
              )}
              <h3 className={cn(
                "font-medium text-muted-foreground truncate",
                isCompact ? "text-xs" : "text-sm"
              )}>
                {title}
              </h3>
            </div>

            {/* Value */}
            <div className="mb-2">
              <span 
                className={cn(
                  "font-bold tracking-tight",
                  isCompact ? "text-xl" : "text-2xl lg:text-3xl",
                  isAnimating && "transition-all duration-200"
                )}
                aria-label={`${title}: ${formatValue(displayValue)}`}
              >
                {formatValue(displayValue)}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p className={cn(
                "text-muted-foreground",
                isCompact ? "text-xs" : "text-xs"
              )}>
                {description}
              </p>
            )}
          </div>

          {/* Trend Indicator */}
          {trendInfo && (
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant="secondary"
                className={cn(
                  "flex items-center gap-1",
                  trendInfo.bgColor,
                  trendInfo.color,
                  isCompact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1"
                )}
              >
                <TrendIcon className={cn(
                  isCompact ? "h-3 w-3" : "h-3 w-3"
                )} />
                {change !== undefined && (
                  <span className="font-medium">
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                )}
              </Badge>
              
              {!isCompact && (
                <span className="text-xs text-muted-foreground">
                  vs last period
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading animation overlay */}
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        )}
      </CardContent>
    </Card>
  )
}

export type { MetricsCardProps }