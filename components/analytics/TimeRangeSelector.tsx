'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'

export interface TimeRange {
  startDate: Date
  endDate: Date
  period: '7d' | '30d' | '90d' | '1y' | 'custom'
}

export interface TimeRangeSelectorProps {
  value?: TimeRange
  onChange: (timeRange: TimeRange) => void
  options?: Array<{
    label: string
    value: '7d' | '30d' | '90d' | '1y' | 'custom'
    description?: string
  }>
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showCustomRange?: boolean
}

const defaultOptions = [
  { label: 'Last 7 days', value: '7d' as const, description: 'Past week' },
  { label: 'Last 30 days', value: '30d' as const, description: 'Past month' },
  { label: 'Last 90 days', value: '90d' as const, description: 'Past quarter' },
  { label: 'Last year', value: '1y' as const, description: 'Past 12 months' },
  { label: 'Custom range', value: 'custom' as const, description: 'Select specific dates' },
]

/**
 * TimeRangeSelector component - Date/period filtering component
 * 
 * Features:
 * - Predefined time periods (7d, 30d, 90d, 1y)
 * - Custom date range selection
 * - Returns standardized time range object
 * - Responsive design with multiple variants
 * - Keyboard navigation support
 * - Accessibility features with proper ARIA labels
 */
export function TimeRangeSelector({
  value,
  onChange,
  options = defaultOptions,
  className,
  variant = 'outline',
  size = 'default',
  showCustomRange = true,
}: TimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Calculate time range based on period
  const calculateTimeRange = (period: TimeRange['period']): TimeRange => {
    const now = new Date()
    const endDate = endOfDay(now)
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = startOfDay(subDays(now, 6))
        break
      case '30d':
        startDate = startOfDay(subDays(now, 29))
        break
      case '90d':
        startDate = startOfDay(subDays(now, 89))
        break
      case '1y':
        startDate = startOfDay(subYears(now, 1))
        break
      case 'custom':
        startDate = customStartDate ? startOfDay(new Date(customStartDate)) : startOfDay(subDays(now, 7))
        const customEnd = customEndDate ? endOfDay(new Date(customEndDate)) : endDate
        return { startDate, endDate: customEnd, period }
      default:
        startDate = startOfDay(subDays(now, 29))
    }

    return { startDate, endDate, period }
  }

  // Get current selection label
  const getCurrentLabel = () => {
    if (!value) return 'Select time range'
    
    const option = options.find(opt => opt.value === value.period)
    if (option && value.period !== 'custom') {
      return option.label
    }
    
    if (value.period === 'custom') {
      return `${format(value.startDate, 'MMM d')} - ${format(value.endDate, 'MMM d, yyyy')}`
    }
    
    return 'Select time range'
  }

  // Handle option selection
  const handleOptionSelect = (period: TimeRange['period']) => {
    const timeRange = calculateTimeRange(period)
    onChange(timeRange)
    
    if (period !== 'custom') {
      setIsOpen(false)
    }
  }

  // Handle custom date range
  const handleCustomRange = () => {
    if (customStartDate && customEndDate) {
      const timeRange = calculateTimeRange('custom')
      onChange(timeRange)
      setIsOpen(false)
    }
  }

  // Get button size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs'
      case 'lg':
        return 'h-11 px-8 text-base'
      default:
        return 'h-9 px-4 text-sm'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "justify-start text-left font-normal",
            getSizeClasses(),
            !value && "text-muted-foreground",
            className
          )}
          aria-label={`Time range selector. Current: ${getCurrentLabel()}`}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {getCurrentLabel()}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent
        className={cn(
          "w-80 p-0 bg-background border rounded-lg shadow-lg",
          "z-50"
        )}
        align="start"
        sideOffset={4}
      >
        <div className="p-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm mb-3">Select time range</h4>
            
            {/* Predefined Options */}
            <div className="space-y-1">
              {options.filter(opt => opt.value !== 'custom' || showCustomRange).map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    value?.period === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Custom Range Section */}
            {showCustomRange && value?.period === 'custom' && (
              <div className="border-t pt-3 mt-3">
                <h5 className="font-medium text-sm mb-2">Custom date range</h5>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="custom-start-date" className="text-xs text-muted-foreground">From</label>
                    <input
                      id="custom-start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      aria-label="Start date for custom range"
                      className={cn(
                        "w-full mt-1 px-3 py-1.5 text-sm border rounded-md",
                        "bg-background text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      )}
                      max={customEndDate || format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-end-date" className="text-xs text-muted-foreground">To</label>
                    <input
                      id="custom-end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      aria-label="End date for custom range"
                      className={cn(
                        "w-full mt-1 px-3 py-1.5 text-sm border rounded-md",
                        "bg-background text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      )}
                      min={customStartDate}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handleCustomRange}
                      disabled={!customStartDate || !customEndDate}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCustomStartDate('')
                        setCustomEndDate('')
                        handleOptionSelect('30d')
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export type { TimeRange, TimeRangeSelectorProps }