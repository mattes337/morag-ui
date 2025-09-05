/**
 * Theme system exports
 * Central export point for all theme-related utilities and components
 */

// Core theme configuration
export {
  type Theme,
  type ThemeColors,
  type ThemeMode,
  type ThemeName,
  type ThemeConfig,
  lightTheme,
  darkTheme,
  themes,
  defaultThemeConfig,
  getTheme,
  getThemeColors,
  getThemeCSSVariables,
  hexToHsl,
  hslToHex,
  getContrastRatio,
  meetsContrastRatio,
} from './config';

// Design tokens
export {
  designTokens,
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animation,
  zIndex,
  breakpoints,
  components,
  accessibility,
  type DesignTokens,
  type ColorPalette,
  type TypographyTokens,
  type SpacingTokens,
} from './tokens';

// Theme provider and hooks
export {
  ThemeProvider,
  useTheme,
  useThemeValues,
  useSystemTheme,
  useThemeTransition,
  useThemePersistence,
  useThemeMediaQuery,
  withTheme,
  ThemeClass,
  ThemeWatcher,
  type ThemeProviderProps,
  type ThemeContextValue,
  type ThemeClassProps,
} from './theme-provider';

// Theme utilities
export * from './utils';