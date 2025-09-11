"use client"

import * as React from "react"

// Simple calendar stub component
export interface CalendarProps {
  selected?: Date | { from?: Date; to?: Date }
  onSelect?: (date: Date | undefined | { from?: Date; to?: Date }) => void
  className?: string
  mode?: 'single' | 'range'
  initialFocus?: boolean
}

export function Calendar({ selected, onSelect, className, mode = 'single' }: CalendarProps) {
  if (mode === 'range') {
    const rangeValue = selected as { from?: Date; to?: Date } | undefined
    
    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const from = e.target.value ? new Date(e.target.value) : undefined
      onSelect?.({ from, to: rangeValue?.to })
    }
    
    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const to = e.target.value ? new Date(e.target.value) : undefined
      onSelect?.({ from: rangeValue?.from, to })
    }

    return (
      <div className={`space-y-2 p-3 ${className || ''}`}>
        <div>
          <label className="block text-sm font-medium mb-1">From:</label>
          <input
            type="date"
            value={rangeValue?.from?.toISOString().split('T')[0] || ''}
            onChange={handleFromChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To:</label>
          <input
            type="date"
            value={rangeValue?.to?.toISOString().split('T')[0] || ''}
            onChange={handleToChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>
    )
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    onSelect?.(date)
  }

  const formatDate = (date?: Date) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  return (
    <input
      type="date"
      value={formatDate(selected as Date)}
      onChange={handleDateChange}
      className={`border rounded px-3 py-2 ${className || ''}`}
    />
  )
}

export default Calendar
