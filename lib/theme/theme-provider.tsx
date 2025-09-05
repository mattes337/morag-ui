/**
 * Theme Provider for MoRAG UI
 * Integrates with next-themes for seamless theme switching and persistence
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';

import { defaultThemeConfig, type ThemeConfig } from './config';

// Extended theme provider props
export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  config?: Partial<ThemeConfig>;
}

// Theme context for accessing current theme and utilities
export interface ThemeContextValue {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  themes: string[];
  systemTheme: string | undefined;
  forcedTheme: string | undefined;
}

// Create theme context
// const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

// Theme provider component
export function ThemeProvider({
  children,
  config,
  ...props
}: ThemeProviderProps) {
  const mergedConfig = { ...defaultThemeConfig, ...config };
  
  return (
    <NextThemeProvider
      attribute={"class" as any}
      defaultTheme={mergedConfig.defaultTheme}
      enableSystem={mergedConfig.enableSystemTheme}
      disableTransitionOnChange={mergedConfig.disableTransitionOnChange}
      storageKey={mergedConfig.storageKey}
      themes={mergedConfig.themes}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}

// Re-export next-themes useTheme hook directly
export { useTheme };

// Higher-order component for theme-aware components
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme?: string }>
): React.ComponentType<P & { theme?: string }> {
  const ThemedComponent = React.forwardRef<
    any,
    P & { theme?: string }
  >((props, ref) => {
    const { resolvedTheme } = useTheme();
    
    return (
      <Component
        {...(props as any)}
        theme={props.theme || (resolvedTheme as string | undefined)}
        ref={ref}
      />
    );
  });
  
  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  
  return ThemedComponent as any;
}

// Hook for accessing theme-specific values
export function useThemeValues<T>(
  lightValue: T,
  darkValue: T,
  theme?: string
): T {
  const { resolvedTheme } = useTheme();
  const currentTheme = theme || resolvedTheme;
  
  return React.useMemo(() => {
    return currentTheme === 'dark' ? darkValue : lightValue;
  }, [currentTheme, lightValue, darkValue]);
}

// Hook for detecting system theme changes
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light');
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    // Set initial value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return systemTheme;
}

// Hook for theme transitions
export function useThemeTransition(enabled: boolean = true) {
  React.useEffect(() => {
    if (!enabled) return;
    
    const style = document.createElement('style');
    style.innerHTML = `
      *,
      *::before,
      *::after {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Remove after a short delay to allow transition to complete
    const timer = setTimeout(() => {
      document.head.removeChild(style);
    }, 300);
    
    return () => {
      clearTimeout(timer);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [enabled]);
}

// Custom hook for theme persistence
export function useThemePersistence(key: string = 'morag-ui-theme') {
  const { theme, setTheme } = useTheme();
  
  // Load theme from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored && stored !== theme) {
        setTheme(stored);
      }
    }
  }, [key, setTheme, theme]);
  
  // Save theme to localStorage when it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      localStorage.setItem(key, theme);
    }
  }, [key, theme]);
  
  return { theme, setTheme };
}

// Theme-aware media query hook
export function useThemeMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  const { resolvedTheme } = useTheme();
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query, resolvedTheme]);
  
  return matches;
}

// Component for applying theme classes conditionally
export interface ThemeClassProps {
  light?: string;
  dark?: string;
  children: (className: string) => React.ReactNode;
}

export function ThemeClass({ light = '', dark = '', children }: ThemeClassProps) {
  const className = useThemeValues(light, dark);
  return <>{children(className)}</>;
}

// Theme detection component for SSR compatibility
export function ThemeWatcher() {
  React.useEffect(() => {
    const theme = localStorage.getItem(defaultThemeConfig.storageKey);
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, []);
  
  return null;
}

// Export theme provider as default
export default ThemeProvider;