/**
 * Design tokens for MoRAG UI theme system
 * This file defines the foundational design system tokens including colors,
 * typography, spacing, and component-specific variables
 */

// Color palette - HSL values for better color manipulation
export const colors = {
  // Primary brand colors - MoRAG blue
  primary: {
    50: '214 100% 97%',
    100: '214 95% 93%',
    200: '213 97% 87%',
    300: '212 96% 78%',
    400: '213 94% 68%',
    500: '217 91% 60%', // Main brand color
    600: '221 83% 53%',
    700: '224 76% 48%',
    800: '226 71% 40%',
    900: '224 64% 33%',
    950: '226 55% 21%',
  },
  
  // Secondary/neutral colors
  secondary: {
    50: '210 40% 98%',
    100: '210 40% 96%',
    200: '214 32% 91%',
    300: '213 27% 84%',
    400: '215 20% 65%',
    500: '220 14% 46%',
    600: '215 28% 17%',
    700: '222 47% 11%',
    800: '222 84% 5%',
    900: '224 71% 4%',
    950: '229 84% 2%',
  },
  
  // Semantic colors
  success: {
    50: '138 76% 97%',
    100: '140 84% 92%',
    200: '141 78% 85%',
    300: '142 77% 73%',
    400: '142 69% 58%',
    500: '142 71% 45%',
    600: '142 76% 36%',
    700: '142 72% 29%',
    800: '142 64% 24%',
    900: '143 61% 20%',
    950: '144 60% 12%',
  },
  
  warning: {
    50: '48 100% 96%',
    100: '48 96% 89%',
    200: '48 97% 77%',
    300: '46 87% 65%',
    400: '43 74% 66%',
    500: '38 92% 50%',
    600: '32 95% 44%',
    700: '26 90% 37%',
    800: '23 83% 31%',
    900: '22 78% 26%',
    950: '21 92% 14%',
  },
  
  error: {
    50: '0 86% 97%',
    100: '0 93% 94%',
    200: '0 96% 89%',
    300: '0 94% 82%',
    400: '0 91% 71%',
    500: '0 84% 60%', // Main error color
    600: '0 72% 51%',
    700: '0 74% 42%',
    800: '0 70% 35%',
    900: '0 63% 31%',
    950: '0 75% 15%',
  },
  
  // Chart colors for data visualization
  chart: {
    1: '12 76% 61%',
    2: '173 58% 39%',
    3: '197 37% 24%',
    4: '43 74% 66%',
    5: '27 87% 67%',
  },
};

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

// Spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border radius scale
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadow scale
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Animation durations and easings
export const animation = {
  duration: {
    fastest: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in-sine': 'cubic-bezier(0.12, 0, 0.39, 0)',
    'ease-out-sine': 'cubic-bezier(0.61, 1, 0.88, 1)',
    'ease-in-out-sine': 'cubic-bezier(0.37, 0, 0.63, 1)',
    'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
    'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
};

// Z-index scale for layering
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
  max: '2147483647',
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Component-specific design tokens
export const components = {
  button: {
    height: {
      sm: '2rem', // 32px
      default: '2.5rem', // 40px
      lg: '2.75rem', // 44px
      xl: '3rem', // 48px
    },
    padding: {
      sm: '0.5rem 0.75rem', // 8px 12px
      default: '0.5rem 1rem', // 8px 16px
      lg: '0.625rem 1.5rem', // 10px 24px
      xl: '0.75rem 2rem', // 12px 32px
    },
    fontSize: {
      sm: '0.75rem',
      default: '0.875rem',
      lg: '1rem',
      xl: '1.125rem',
    },
  },
  
  input: {
    height: {
      sm: '2rem',
      default: '2.5rem',
      lg: '2.75rem',
    },
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
  },
  
  card: {
    padding: {
      sm: '1rem',
      default: '1.5rem',
      lg: '2rem',
    },
    borderRadius: '0.5rem',
  },
  
  modal: {
    maxWidth: {
      sm: '24rem',
      default: '32rem',
      lg: '48rem',
      xl: '64rem',
    },
  },
};

// Accessibility-focused design tokens
export const accessibility = {
  focusRing: {
    width: '2px',
    style: 'solid',
    offset: '2px',
  },
  
  minimumTouchTarget: '44px',
  
  contrast: {
    aa: 4.5,
    aaa: 7,
  },
  
  fontSize: {
    minimum: '0.875rem', // 14px minimum for readability
  },
};

// Export all tokens as a cohesive theme object
export const designTokens = {
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
} as const;

export type DesignTokens = typeof designTokens;
export type ColorPalette = typeof colors;
export type TypographyTokens = typeof typography;
export type SpacingTokens = typeof spacing;