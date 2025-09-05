/**
 * Theme utility functions
 * Helper functions for working with themes, colors, and styling
 */

import { type ClassValue } from 'clsx';
import { cn } from '@/lib/utils';
import { designTokens, colors } from './tokens';
import { getContrastRatio } from './config';

// Theme-aware class name utilities
export function themeClass(lightClass: string, darkClass: string): string {
  return cn(lightClass, `dark:${darkClass}`);
}

export function themeClasses(classes: {
  light?: ClassValue;
  dark?: ClassValue;
  base?: ClassValue;
}): string {
  return cn(
    classes.base,
    classes.light,
    classes.dark && `dark:${classes.dark}`
  );
}

// Color manipulation utilities
export function adjustColorOpacity(hslColor: string, opacity: number): string {
  return `${hslColor} / ${Math.max(0, Math.min(1, opacity))}`;
}

export function createColorScale(baseColor: string, steps: number = 9): string[] {
  // This is a simplified implementation - in a real scenario you'd use a color library
  const scale: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const lightness = 95 - (i * 10); // Simple lightness progression
    const [hue, saturation] = baseColor.split(' ');
    scale.push(`${hue} ${saturation} ${lightness}%`);
  }
  
  return scale;
}

// Semantic color helpers
export function getSemanticColor(
  semantic: 'primary' | 'secondary' | 'success' | 'warning' | 'error',
  shade: keyof typeof colors.primary = 500
): string {
  switch (semantic) {
    case 'primary':
      return colors.primary[shade];
    case 'secondary':
      return colors.secondary[shade];
    case 'success':
      return colors.success[shade];
    case 'warning':
      return colors.warning[shade];
    case 'error':
      return colors.error[shade];
    default:
      return colors.primary[shade];
  }
}

// Accessibility helpers
export function ensureAccessibleContrast(
  foreground: string,
  background: string,
  fallbackForeground?: string
): string {
  const ratio = getContrastRatio(foreground, background);
  
  if (ratio >= 4.5) {
    return foreground;
  }
  
  return fallbackForeground || colors.secondary[900];
}

export function getAccessibleTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio('0 0% 100%', backgroundColor);
  const blackContrast = getContrastRatio(colors.secondary[900], backgroundColor);
  
  return whiteContrast > blackContrast ? '0 0% 100%' : colors.secondary[900];
}

// Component styling utilities
export function createComponentVariant(
  baseStyles: ClassValue,
  variants: Record<string, ClassValue>
) {
  return function(variant?: string) {
    return cn(baseStyles, variant && variants[variant]);
  };
}

export function createResponsiveVariant(styles: {
  base?: ClassValue;
  sm?: ClassValue;
  md?: ClassValue;
  lg?: ClassValue;
  xl?: ClassValue;
  '2xl'?: ClassValue;
}) {
  return cn(
    styles.base,
    styles.sm && `sm:${styles.sm}`,
    styles.md && `md:${styles.md}`,
    styles.lg && `lg:${styles.lg}`,
    styles.xl && `xl:${styles.xl}`,
    styles['2xl'] && `2xl:${styles['2xl']}`
  );
}

// Focus ring utilities
export function createFocusRing(color: string = 'var(--ring)'): string {
  return cn(
    'outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    `focus-visible:ring-[${color}]`
  );
}

// Animation utilities
export function createTransition(
  properties: string[] = ['background-color', 'color', 'border-color'],
  duration: keyof typeof designTokens.animation.duration = 'normal',
  easing: keyof typeof designTokens.animation.easing = 'out'
): string {
  const durationValue = designTokens.animation.duration[duration];
  const easingValue = designTokens.animation.easing[easing];
  
  return cn(
    `transition-[${properties.join(',')}]`,
    `duration-[${durationValue}]`,
    `ease-[${easingValue}]`
  );
}

// Layout utilities
export function createFlexCenter(): string {
  return cn('flex', 'items-center', 'justify-center');
}

export function createGridCenter(): string {
  return cn('grid', 'place-items-center');
}

export function createContainer(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg'): string {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };
  
  return cn('container', 'mx-auto', 'px-4', sizes[size]);
}

// Typography utilities
export function createTextStyle(
  size: keyof typeof designTokens.typography.fontSize,
  weight: keyof typeof designTokens.typography.fontWeight = 'normal',
  family: keyof typeof designTokens.typography.fontFamily = 'sans'
): string {
  const families = {
    sans: 'font-sans',
    mono: 'font-mono',
  };
  
  const weights = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  };
  
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };
  
  return cn(families[family], weights[weight], sizes[size]);
}

// Shadow utilities
export function createShadow(
  elevation: keyof typeof designTokens.boxShadow,
  color?: string
): string {
  const shadows = {
    sm: 'shadow-sm',
    DEFAULT: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
    none: 'shadow-none',
  };
  
  return cn(shadows[elevation], color && `shadow-[${color}]`);
}

// Border utilities
export function createBorder(
  width: 'thin' | 'default' | 'thick' = 'default',
  style: 'solid' | 'dashed' | 'dotted' = 'solid',
  color: string = 'var(--border)'
): string {
  const widths = {
    thin: 'border',
    default: 'border-2',
    thick: 'border-4',
  };
  
  const styles = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };
  
  return cn(widths[width], styles[style], `border-[${color}]`);
}

// Spacing utilities
export function createSpacing(
  type: 'padding' | 'margin',
  size: keyof typeof designTokens.spacing,
  sides?: 'all' | 'x' | 'y' | 't' | 'r' | 'b' | 'l'
): string {
  const prefix = type === 'padding' ? 'p' : 'm';
  const sideMap = {
    all: '',
    x: 'x',
    y: 'y',
    t: 't',
    r: 'r',
    b: 'b',
    l: 'l',
  };
  
  const side = sides ? sideMap[sides] : '';
  return `${prefix}${side}-${size}`;
}

// Media query utilities
export function createMediaQuery(breakpoint: keyof typeof designTokens.breakpoints): string {
  const breakpoints = {
    xs: 'xs:',
    sm: 'sm:',
    md: 'md:',
    lg: 'lg:',
    xl: 'xl:',
    '2xl': '2xl:',
  };
  
  return breakpoints[breakpoint] || '';
}

// Dark mode utilities
export function createDarkModeClass(className: ClassValue): string {
  return `dark:${className}`;
}

export function createModeAwareClasses(lightClass: ClassValue, darkClass: ClassValue): string {
  return cn(lightClass, createDarkModeClass(darkClass));
}

// Component state utilities
export function createStateVariants(states: {
  hover?: ClassValue;
  focus?: ClassValue;
  active?: ClassValue;
  disabled?: ClassValue;
}): string {
  return cn(
    states.hover && `hover:${states.hover}`,
    states.focus && `focus:${states.focus}`,
    states.active && `active:${states.active}`,
    states.disabled && `disabled:${states.disabled}`
  );
}

// Utility for creating component-specific theme classes
export function createComponentTheme<T extends Record<string, any>>(
  _componentName: string,
  variants: T
): T {
  // This would typically be used with a more sophisticated theme system
  // For now, it just returns the variants as-is
  return variants;
}

// Export a utility object for easier access
export const themeUtils = {
  themeClass,
  themeClasses,
  adjustColorOpacity,
  createColorScale,
  getSemanticColor,
  ensureAccessibleContrast,
  getAccessibleTextColor,
  createComponentVariant,
  createResponsiveVariant,
  createFocusRing,
  createTransition,
  createFlexCenter,
  createGridCenter,
  createContainer,
  createTextStyle,
  createShadow,
  createBorder,
  createSpacing,
  createMediaQuery,
  createDarkModeClass,
  createModeAwareClasses,
  createStateVariants,
  createComponentTheme,
} as const;