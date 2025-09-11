/**
 * Theme Toggle Components
 * Provides various UI components for switching between themes
 */

'use client';

import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/Switch';
import { useTheme } from '@/lib/theme/theme-provider';
import { cn } from '@/lib/utils';

// Theme toggle button - simple light/dark toggle
export interface ThemeToggleProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * Show text labels alongside icons
   */
  showLabels?: boolean;
  /**
   * Icon size
   */
  iconSize?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({
  showLabels = false,
  iconSize = 'md',
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <Button
      variant={variant}
      size={showLabels ? 'default' : size}
      onClick={toggleTheme}
      className={cn('relative', className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      {...props}
    >
      <Sun
        className={cn(
          iconSizes[iconSize],
          'transition-all',
          theme === 'dark' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
      />
      <Moon
        className={cn(
          iconSizes[iconSize],
          'absolute transition-all',
          theme === 'light' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
      />
      {showLabels && (
        <span className="ml-2">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </Button>
  );
}

// Advanced theme selector with system option
export interface ThemeSelectorProps {
  /**
   * Show system theme option
   */
  includeSystem?: boolean;
  /**
   * Custom trigger element
   */
  trigger?: React.ReactNode;
  /**
   * Additional class name for the select trigger
   */
  className?: string;
}

export function ThemeSelector({
  includeSystem = true,
  trigger,
  className,
}: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    ...(includeSystem ? [{ value: 'system', label: 'System', icon: Monitor }] : []),
  ];
  
  const currentTheme = themes.find(t => t.value === theme);
  
  return (
    <Select value={theme || ''} onValueChange={setTheme}>
      <SelectTrigger className={cn('w-32', className)}>
        {trigger || (
          <div className="flex items-center gap-2">
            {currentTheme && <currentTheme.icon className="h-4 w-4" />}
            <SelectValue placeholder="Theme" />
          </div>
        )}
      </SelectTrigger>
      <SelectContent>
        {themes.map((themeOption) => (
          <SelectItem key={themeOption.value} value={themeOption.value}>
            <div className="flex items-center gap-2">
              <themeOption.icon className="h-4 w-4" />
              <span>{themeOption.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Theme switch component (toggle style)
export interface ThemeSwitchProps {
  /**
   * Show labels
   */
  showLabels?: boolean;
  /**
   * Layout direction
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Additional class name
   */
  className?: string;
}

export function ThemeSwitch({
  showLabels = true,
  direction = 'horizontal',
  className,
}: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const handleSwitchChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };
  
  const containerClass = cn(
    'flex items-center gap-2',
    direction === 'vertical' && 'flex-col',
    className
  );
  
  return (
    <div className={containerClass}>
      {showLabels && (
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <span className="text-sm">Light</span>
        </div>
      )}
      
      <Switch
        checked={isDark}
        onCheckedChange={handleSwitchChange}
        aria-label="Toggle dark mode"
      />
      
      {showLabels && (
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          <span className="text-sm">Dark</span>
        </div>
      )}
    </div>
  );
}

// Segmented theme control
export interface ThemeSegmentedControlProps {
  /**
   * Include system theme option
   */
  includeSystem?: boolean;
  /**
   * Size of the control
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional class name
   */
  className?: string;
}

export function ThemeSegmentedControl({
  includeSystem = true,
  size = 'md',
  className,
}: ThemeSegmentedControlProps) {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    ...(includeSystem ? [{ value: 'system', label: 'System', icon: Monitor }] : []),
  ];
  
  const sizes = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  return (
    <div
      className={cn(
        'inline-flex rounded-lg bg-muted p-1',
        className
      )}
      role="tablist"
      aria-label="Theme selection"
    >
      {themes.map((themeOption) => (
        <button
          key={themeOption.value}
          type="button"
          role="tab"
          aria-selected={theme === themeOption.value}
          onClick={() => setTheme(themeOption.value)}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            sizes[size],
            theme === themeOption.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <themeOption.icon className={iconSizes[size]} />
          <span className="hidden sm:inline">{themeOption.label}</span>
        </button>
      ))}
    </div>
  );
}

// Theme indicator (read-only display)
export interface ThemeIndicatorProps {
  /**
   * Show theme name
   */
  showName?: boolean;
  /**
   * Size of the indicator
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional class name
   */
  className?: string;
}

export function ThemeIndicator({
  showName = true,
  size = 'md',
  className,
}: ThemeIndicatorProps) {
  const { theme, resolvedTheme } = useTheme();
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const getThemeIcon = () => {
    if (theme === 'system') {
      return Monitor;
    }
    return resolvedTheme === 'dark' ? Moon : Sun;
  };
  
  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };
  
  const Icon = getThemeIcon();
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={iconSizes[size]} />
      {showName && (
        <span className="text-sm text-muted-foreground">
          {getThemeLabel()}
        </span>
      )}
    </div>
  );
}

