/**
 * Theme configuration system for MoRAG UI
 * Defines theme structure, semantic color mappings, and theme variants
 */

import { /* designTokens, */ colors } from './tokens';

// Theme modes
export type ThemeMode = 'light' | 'dark' | 'system';

// Semantic color mapping for different themes
export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  
  // Card colors
  card: string;
  cardForeground: string;
  
  // Popover colors
  popover: string;
  popoverForeground: string;
  
  // Primary colors
  primary: string;
  primaryForeground: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  
  // Muted colors
  muted: string;
  mutedForeground: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  
  // Destructive colors
  destructive: string;
  destructiveForeground: string;
  
  // Success colors
  success: string;
  successForeground: string;
  
  // Warning colors
  warning: string;
  warningForeground: string;
  
  // Border and input colors
  border: string;
  input: string;
  ring: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

// Complete theme definition
export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  cssVariables: Record<string, string>;
}

// Light theme configuration
export const lightTheme: Theme = {
  name: 'MoRAG Light',
  mode: 'light',
  colors: {
    // Base colors
    background: '0 0% 100%',
    foreground: colors.secondary[900],
    
    // Card colors
    card: '0 0% 100%',
    cardForeground: colors.secondary[900],
    
    // Popover colors
    popover: '0 0% 100%',
    popoverForeground: colors.secondary[900],
    
    // Primary colors - MoRAG brand blue
    primary: colors.primary[500],
    primaryForeground: '210 40% 98%',
    
    // Secondary colors - Neutral grays
    secondary: colors.secondary[100],
    secondaryForeground: colors.secondary[900],
    
    // Muted colors
    muted: colors.secondary[100],
    mutedForeground: colors.secondary[500],
    
    // Accent colors
    accent: colors.secondary[100],
    accentForeground: colors.secondary[900],
    
    // Semantic colors
    destructive: colors.error[500],
    destructiveForeground: '210 40% 98%',
    
    success: colors.success[500],
    successForeground: '210 40% 98%',
    
    warning: colors.warning[500],
    warningForeground: '210 40% 98%',
    
    // Border and input colors
    border: colors.secondary[200],
    input: colors.secondary[200],
    ring: colors.primary[500],
    
    // Chart colors
    chart1: colors.chart[1],
    chart2: colors.chart[2],
    chart3: colors.chart[3],
    chart4: colors.chart[4],
    chart5: colors.chart[5],
  },
  cssVariables: {
    '--background': '0 0% 100%',
    '--foreground': colors.secondary[900],
    '--card': '0 0% 100%',
    '--card-foreground': colors.secondary[900],
    '--popover': '0 0% 100%',
    '--popover-foreground': colors.secondary[900],
    '--primary': colors.primary[500],
    '--primary-foreground': '210 40% 98%',
    '--secondary': colors.secondary[100],
    '--secondary-foreground': colors.secondary[900],
    '--muted': colors.secondary[100],
    '--muted-foreground': colors.secondary[500],
    '--accent': colors.secondary[100],
    '--accent-foreground': colors.secondary[900],
    '--destructive': colors.error[500],
    '--destructive-foreground': '210 40% 98%',
    '--success': colors.success[500],
    '--success-foreground': '210 40% 98%',
    '--warning': colors.warning[500],
    '--warning-foreground': '210 40% 98%',
    '--border': colors.secondary[200],
    '--input': colors.secondary[200],
    '--ring': colors.primary[500],
    '--radius': '0.5rem',
    '--chart-1': colors.chart[1],
    '--chart-2': colors.chart[2],
    '--chart-3': colors.chart[3],
    '--chart-4': colors.chart[4],
    '--chart-5': colors.chart[5],
  },
};

// Dark theme configuration
export const darkTheme: Theme = {
  name: 'MoRAG Dark',
  mode: 'dark',
  colors: {
    // Base colors
    background: colors.secondary[950],
    foreground: colors.secondary[50],
    
    // Card colors
    card: colors.secondary[950],
    cardForeground: colors.secondary[50],
    
    // Popover colors
    popover: colors.secondary[950],
    popoverForeground: colors.secondary[50],
    
    // Primary colors
    primary: colors.primary[500],
    primaryForeground: colors.secondary[950],
    
    // Secondary colors
    secondary: colors.secondary[800],
    secondaryForeground: colors.secondary[50],
    
    // Muted colors
    muted: colors.secondary[800],
    mutedForeground: colors.secondary[400],
    
    // Accent colors
    accent: colors.secondary[800],
    accentForeground: colors.secondary[50],
    
    // Semantic colors
    destructive: colors.error[600],
    destructiveForeground: colors.secondary[50],
    
    success: colors.success[600],
    successForeground: colors.secondary[50],
    
    warning: colors.warning[500],
    warningForeground: colors.secondary[950],
    
    // Border and input colors
    border: colors.secondary[800],
    input: colors.secondary[800],
    ring: colors.primary[500],
    
    // Chart colors (adjusted for dark mode)
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
  },
  cssVariables: {
    '--background': colors.secondary[950],
    '--foreground': colors.secondary[50],
    '--card': colors.secondary[950],
    '--card-foreground': colors.secondary[50],
    '--popover': colors.secondary[950],
    '--popover-foreground': colors.secondary[50],
    '--primary': colors.primary[500],
    '--primary-foreground': colors.secondary[950],
    '--secondary': colors.secondary[800],
    '--secondary-foreground': colors.secondary[50],
    '--muted': colors.secondary[800],
    '--muted-foreground': colors.secondary[400],
    '--accent': colors.secondary[800],
    '--accent-foreground': colors.secondary[50],
    '--destructive': colors.error[600],
    '--destructive-foreground': colors.secondary[50],
    '--success': colors.success[600],
    '--success-foreground': colors.secondary[50],
    '--warning': colors.warning[500],
    '--warning-foreground': colors.secondary[950],
    '--border': colors.secondary[800],
    '--input': colors.secondary[800],
    '--ring': colors.primary[500],
    '--radius': '0.5rem',
    '--chart-1': '220 70% 50%',
    '--chart-2': '160 60% 45%',
    '--chart-3': '30 80% 55%',
    '--chart-4': '280 65% 60%',
    '--chart-5': '340 75% 55%',
  },
};

// Available themes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;

// Theme configuration
export interface ThemeConfig {
  defaultTheme: ThemeMode;
  enableSystemTheme: boolean;
  disableTransitionOnChange: boolean;
  storageKey: string;
  themes: string[];
}

export const defaultThemeConfig: ThemeConfig = {
  defaultTheme: 'system',
  enableSystemTheme: true,
  disableTransitionOnChange: false,
  storageKey: 'morag-ui-theme',
  themes: ['light', 'dark'],
};

// Helper functions for theme management
export function getTheme(themeName: ThemeName): Theme {
  return themes[themeName];
}

export function getThemeColors(themeName: ThemeName): ThemeColors {
  return themes[themeName].colors;
}

export function getThemeCSSVariables(themeName: ThemeName): Record<string, string> {
  return themes[themeName].cssVariables;
}

// Color utility functions
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Find max and min values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  // Calculate lightness
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (diff !== 0) {
    // Calculate saturation
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    // Calculate hue
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

export function hslToHex(hsl: string): string {
  // Parse HSL string "h s% l%" format
  const matches = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!matches) return '#000000';
  
  const h = parseInt(matches[1]!) / 360;
  const s = parseInt(matches[2]!) / 100;
  const l = parseInt(matches[3]!) / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Contrast calculation for accessibility
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string) => {
    // Convert HSL to RGB first
    const hex = hslToHex(color);
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    
    const toLinear = (c: number) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if color combination meets WCAG standards
export function meetsContrastRatio(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}