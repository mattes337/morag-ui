/**
 * Color contrast validation utilities for WCAG compliance
 */

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorHSL {
  h: number;
  s: number;
  l: number;
}

/**
 * WCAG contrast ratio requirements
 */
export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,      // Normal text AA
  AA_LARGE: 3.0,       // Large text AA (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7.0,     // Normal text AAA
  AAA_LARGE: 4.5,      // Large text AAA
  UI_COMPONENTS: 3.0,  // UI components (non-text)
} as const;

/**
 * Color contrast utilities class
 */
export class ColorContrastUtils {
  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): ColorRGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result && result[1] && result[2] && result[3] ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert CSS rgb string to RGB object
   */
  static cssRgbToRgb(rgb: string): ColorRGB | null {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (!match || !match[1] || !match[2] || !match[3]) return null;

    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10)
    };
  }

  /**
   * Convert CSS hsl string to HSL object
   */
  static cssHslToHsl(hsl: string): ColorHSL | null {
    const match = hsl.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/);
    if (!match || !match[1] || !match[2] || !match[3]) return null;

    return {
      h: parseInt(match[1], 10),
      s: parseInt(match[2], 10),
      l: parseInt(match[3], 10)
    };
  }

  /**
   * Convert HSL to RGB
   */
  static hslToRgb(hsl: ColorHSL): ColorRGB {
    const { h, s, l } = hsl;
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (sNorm === 0) {
      r = g = b = lNorm; // achromatic
    } else {
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
      const p = 2 * lNorm - q;
      r = hue2rgb(p, q, hNorm + 1/3);
      g = hue2rgb(p, q, hNorm);
      b = hue2rgb(p, q, hNorm - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Parse any CSS color to RGB
   */
  static parseColor(color: string): ColorRGB | null {
    if (color.startsWith('#')) {
      return this.hexToRgb(color);
    } else if (color.startsWith('rgb')) {
      return this.cssRgbToRgb(color);
    } else if (color.startsWith('hsl')) {
      const hsl = this.cssHslToHsl(color);
      return hsl ? this.hslToRgb(hsl) : null;
    }
    return null;
  }

  /**
   * Calculate relative luminance of a color
   * Based on WCAG 2.1 specification
   */
  static getRelativeLuminance(rgb: ColorRGB): number {
    const { r, g, b } = rgb;

    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Calculate contrast ratio between two colors
   * Based on WCAG 2.1 specification
   */
  static getContrastRatio(color1: ColorRGB, color2: ColorRGB): number {
    const luminance1 = this.getRelativeLuminance(color1);
    const luminance2 = this.getRelativeLuminance(color2);

    // Ensure lighter color is in numerator
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG standard
   */
  static meetsContrastRequirement(
    ratio: number,
    level: 'AA' | 'AAA' = 'AA',
    textSize: 'normal' | 'large' = 'normal'
  ): boolean {
    const requirement = level === 'AA' 
      ? (textSize === 'normal' ? WCAG_CONTRAST_RATIOS.AA_NORMAL : WCAG_CONTRAST_RATIOS.AA_LARGE)
      : (textSize === 'normal' ? WCAG_CONTRAST_RATIOS.AAA_NORMAL : WCAG_CONTRAST_RATIOS.AAA_LARGE);
    
    return ratio >= requirement;
  }

  /**
   * Get contrast ratio from CSS color strings
   */
  static getContrastRatioFromCss(foreground: string, background: string): number | null {
    const fgColor = this.parseColor(foreground);
    const bgColor = this.parseColor(background);

    if (!fgColor || !bgColor) {
      return null;
    }

    return this.getContrastRatio(fgColor, bgColor);
  }

  /**
   * Test element's color contrast
   */
  static testElementContrast(
    element: Element,
    level: 'AA' | 'AAA' = 'AA',
    textSize: 'normal' | 'large' = 'normal'
  ): {
    ratio: number | null;
    passes: boolean;
    foreground: string;
    background: string;
  } {
    const computedStyle = window.getComputedStyle(element);
    const foreground = computedStyle.color;
    const background = computedStyle.backgroundColor;

    const ratio = this.getContrastRatioFromCss(foreground, background);
    const passes = ratio ? this.meetsContrastRequirement(ratio, level, textSize) : false;

    return {
      ratio,
      passes,
      foreground,
      background
    };
  }

  /**
   * Find suitable foreground color for given background
   */
  static findAccessibleForeground(
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    textSize: 'normal' | 'large' = 'normal',
    preferredColors: string[] = ['#000000', '#ffffff']
  ): string | null {
    const bgColor = this.parseColor(background);
    if (!bgColor) return null;

    const targetRatio = level === 'AA' 
      ? (textSize === 'normal' ? WCAG_CONTRAST_RATIOS.AA_NORMAL : WCAG_CONTRAST_RATIOS.AA_LARGE)
      : (textSize === 'normal' ? WCAG_CONTRAST_RATIOS.AAA_NORMAL : WCAG_CONTRAST_RATIOS.AAA_LARGE);

    // Test preferred colors first
    for (const colorString of preferredColors) {
      const color = this.parseColor(colorString);
      if (color) {
        const ratio = this.getContrastRatio(color, bgColor);
        if (ratio >= targetRatio) {
          return colorString;
        }
      }
    }

    return null;
  }

  /**
   * Generate accessible color palette
   */
  static generateAccessiblePalette(
    baseColor: string,
    level: 'AA' | 'AAA' = 'AA'
  ): {
    light: string[];
    dark: string[];
  } {
    const base = this.parseColor(baseColor);
    if (!base) {
      return { light: [], dark: [] };
    }

    const targetRatio = level === 'AA' ? WCAG_CONTRAST_RATIOS.AA_NORMAL : WCAG_CONTRAST_RATIOS.AAA_NORMAL;
    const light: string[] = [];
    const dark: string[] = [];

    // Generate lighter variations
    for (let i = 10; i <= 95; i += 10) {
      const lightColor = { r: base.r + i, g: base.g + i, b: base.b + i };
      // Clamp values
      lightColor.r = Math.min(255, lightColor.r);
      lightColor.g = Math.min(255, lightColor.g);
      lightColor.b = Math.min(255, lightColor.b);

      const ratio = this.getContrastRatio(lightColor, { r: 0, g: 0, b: 0 });
      if (ratio >= targetRatio) {
        light.push(`rgb(${lightColor.r}, ${lightColor.g}, ${lightColor.b})`);
      }
    }

    // Generate darker variations
    for (let i = 10; i <= 95; i += 10) {
      const darkColor = { r: base.r - i, g: base.g - i, b: base.b - i };
      // Clamp values
      darkColor.r = Math.max(0, darkColor.r);
      darkColor.g = Math.max(0, darkColor.g);
      darkColor.b = Math.max(0, darkColor.b);

      const ratio = this.getContrastRatio(darkColor, { r: 255, g: 255, b: 255 });
      if (ratio >= targetRatio) {
        dark.push(`rgb(${darkColor.r}, ${darkColor.g}, ${darkColor.b})`);
      }
    }

    return { light, dark };
  }

  /**
   * Analyze color accessibility for an entire page
   */
  static analyzePageContrast(): Array<{
    element: Element;
    ratio: number | null;
    passes: boolean;
    issues: string[];
  }> {
    const results: Array<{
      element: Element;
      ratio: number | null;
      passes: boolean;
      issues: string[];
    }> = [];

    // Find all text elements
    const textElements = document.querySelectorAll('*');
    
    textElements.forEach(element => {
      const hasText = element.textContent && element.textContent.trim().length > 0;
      
      if (hasText) {
        const { ratio, passes, foreground, background } = this.testElementContrast(element);
        const issues: string[] = [];

        if (!passes) {
          issues.push(`Insufficient contrast ratio: ${ratio?.toFixed(2) || 'unknown'}`);
        }

        if (foreground === background) {
          issues.push('Foreground and background colors are identical');
        }

        if (issues.length > 0 || !passes) {
          results.push({
            element,
            ratio,
            passes,
            issues
          });
        }
      }
    });

    return results;
  }

  /**
   * Generate accessibility report for color usage
   */
  static generateContrastReport(elements?: Element[]): {
    totalElements: number;
    passingElements: number;
    failingElements: number;
    averageRatio: number;
    issues: Array<{
      element: Element;
      ratio: number | null;
      requirement: number;
      difference: number;
    }>;
  } {
    const elementsToTest = elements || Array.from(document.querySelectorAll('*'));
    const filteredElements = elementsToTest.filter(el => el.textContent && el.textContent.trim().length > 0);
    const results = filteredElements
      .map(el => ({ element: el, result: this.testElementContrast(el) }))
      .filter(({ result }) => result.ratio !== null);

    const totalElements = results.length;
    const passingElements = results.filter(({ result }) => result.passes).length;
    const failingElements = totalElements - passingElements;
    const averageRatio = results.reduce((sum, { result }) => sum + (result.ratio || 0), 0) / totalElements;

    const issues = results
      .filter(({ result }) => !result.passes && result.ratio !== null)
      .map(({ element, result }) => ({
        element,
        ratio: result.ratio,
        requirement: WCAG_CONTRAST_RATIOS.AA_NORMAL,
        difference: WCAG_CONTRAST_RATIOS.AA_NORMAL - (result.ratio || 0)
      }));

    return {
      totalElements,
      passingElements,
      failingElements,
      averageRatio,
      issues
    };
  }
}

/**
 * Jest matcher for color contrast testing
 */
export function toHaveAccessibleColors(
  element: Element,
  level: 'AA' | 'AAA' = 'AA',
  textSize: 'normal' | 'large' = 'normal'
) {
  const result = ColorContrastUtils.testElementContrast(element, level, textSize);
  
  if (result.passes) {
    return {
      message: () => `Expected element not to have accessible color contrast`,
      pass: true,
    };
  } else {
    return {
      message: () => 
        `Expected element to have accessible color contrast.\n` +
        `  Foreground: ${result.foreground}\n` +
        `  Background: ${result.background}\n` +
        `  Ratio: ${result.ratio?.toFixed(2) || 'unknown'}\n` +
        `  Required: ${level === 'AA' 
          ? (textSize === 'normal' ? WCAG_CONTRAST_RATIOS.AA_NORMAL : WCAG_CONTRAST_RATIOS.AA_LARGE)
          : (textSize === 'normal' ? WCAG_CONTRAST_RATIOS.AAA_NORMAL : WCAG_CONTRAST_RATIOS.AAA_LARGE)
        }`,
      pass: false,
    };
  }
}

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAccessibleColors(level?: 'AA' | 'AAA', textSize?: 'normal' | 'large'): R;
    }
  }
}