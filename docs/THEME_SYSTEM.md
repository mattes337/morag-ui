# MoRAG UI Theme System

A comprehensive theme system with dark mode support, design tokens, and accessibility features for the MoRAG UI component library.

## Overview

The MoRAG UI theme system provides:

- **Light/Dark Mode Support**: Seamless switching between themes
- **System Theme Detection**: Automatic theme based on user preferences
- **Design Tokens**: Centralized design system tokens
- **Accessibility**: WCAG compliant color contrasts and focus indicators
- **SSR Compatible**: Works with Next.js server-side rendering
- **Storybook Integration**: Enhanced development experience

## Quick Start

### 1. Theme Provider Setup

Wrap your app with the `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/lib/theme/theme-provider';

export default function App({ children }) {
  return (
    <ThemeProvider
      config={{
        defaultTheme: 'system',
        enableSystemTheme: true,
        themes: ['light', 'dark'],
      }}
    >
      {children}
    </ThemeProvider>
  );
}
```

### 2. Using Theme Controls

Add theme switching components to your UI:

```tsx
import { ThemeToggle, ThemeSelector } from '@/components/theme/theme-toggle';

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1>My App</h1>
      <div className="flex gap-2">
        <ThemeSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}
```

### 3. Using Theme Hooks

Access theme information in components:

```tsx
import { useTheme } from '@/lib/theme/theme-provider';

export function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <div className="p-4 bg-background text-foreground">
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## Design Tokens

### Color System

The theme system uses semantic color tokens that automatically adapt to light and dark themes:

#### Primary Colors
- `--primary`: Main brand color (MoRAG blue)
- `--primary-foreground`: Text color on primary backgrounds
- `--primary-hover`: Hover state for primary elements
- `--primary-active`: Active state for primary elements

#### Semantic Colors
- `--success`: Success states and positive actions
- `--warning`: Warning states and caution indicators
- `--destructive`: Error states and destructive actions
- `--info`: Informational content and neutral actions

#### Surface Colors
- `--background`: Main background color
- `--foreground`: Main text color
- `--card`: Card and surface backgrounds
- `--muted`: Subtle backgrounds and disabled states
- `--accent`: Highlight and accent colors

#### Interactive Colors
- `--border`: Default border color
- `--input`: Input field borders and backgrounds
- `--ring`: Focus ring color
- `--selection-background`: Text selection background

### Typography Scale

```tsx
// Font families
--font-inter: 'Inter', ui-sans-serif, system-ui, sans-serif
--font-jetbrains-mono: 'JetBrains Mono', ui-monospace, monospace

// Font sizes (with line heights)
text-xs: 0.75rem (1rem line-height)
text-sm: 0.875rem (1.25rem line-height)
text-base: 1rem (1.5rem line-height)
text-lg: 1.125rem (1.75rem line-height)
text-xl: 1.25rem (1.75rem line-height)
text-2xl: 1.5rem (2rem line-height)
text-3xl: 1.875rem (2.25rem line-height)
text-4xl: 2.25rem (2.5rem line-height)
text-5xl: 3rem (1 line-height)
text-6xl: 3.75rem (1 line-height)
```

### Spacing System

The theme system includes a consistent spacing scale:

```tsx
// Spacing tokens
px: 1px
0.5: 0.125rem (2px)
1: 0.25rem (4px)
1.5: 0.375rem (6px)
2: 0.5rem (8px)
2.5: 0.625rem (10px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

## Theme Components

### ThemeToggle

Simple toggle button for switching between light and dark themes:

```tsx
<ThemeToggle />
<ThemeToggle showLabels />
<ThemeToggle iconSize="lg" />
```

### ThemeSelector

Dropdown selector with multiple theme options:

```tsx
<ThemeSelector />
<ThemeSelector includeSystem={false} />
```

### ThemeSwitch

Toggle switch style theme control:

```tsx
<ThemeSwitch />
<ThemeSwitch direction="vertical" />
<ThemeSwitch showLabels={false} />
```

### ThemeSegmentedControl

Segmented control for theme selection:

```tsx
<ThemeSegmentedControl />
<ThemeSegmentedControl size="lg" />
<ThemeSegmentedControl includeSystem={false} />
```

### ThemeIndicator

Read-only theme indicator:

```tsx
<ThemeIndicator />
<ThemeIndicator showName={false} />
<ThemeIndicator size="sm" />
```

## Advanced Usage

### Custom Theme Values

Use theme-aware values in components:

```tsx
import { useThemeValues } from '@/lib/theme/theme-provider';

export function MyComponent() {
  const shadowColor = useThemeValues(
    'rgba(0, 0, 0, 0.1)', // light theme
    'rgba(255, 255, 255, 0.1)' // dark theme
  );
  
  return (
    <div style={{ boxShadow: `0 2px 8px ${shadowColor}` }}>
      Content with theme-aware shadow
    </div>
  );
}
```

### Theme-Aware Classes

Use utility functions for theme-aware styling:

```tsx
import { themeClass, createModeAwareClasses } from '@/lib/theme/utils';

const className = themeClass(
  'bg-white text-black', // light theme
  'bg-black text-white'  // dark theme
);

const responsiveClass = createModeAwareClasses(
  'hover:bg-gray-100',
  'hover:bg-gray-800'
);
```

### System Theme Detection

Detect and respond to system theme changes:

```tsx
import { useSystemTheme } from '@/lib/theme/theme-provider';

export function SystemThemeDetector() {
  const systemTheme = useSystemTheme();
  
  return (
    <p>System prefers: {systemTheme} theme</p>
  );
}
```

## CSS Custom Properties

The theme system exposes CSS custom properties for direct use:

```css
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}

.my-component:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.my-component:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

## Accessibility Features

### Color Contrast

All theme colors meet WCAG AA standards for color contrast:

```tsx
import { meetsContrastRatio, getAccessibleTextColor } from '@/lib/theme/config';

// Check if colors meet accessibility standards
const isAccessible = meetsContrastRatio(foreground, background, 'AA');

// Get accessible text color for any background
const textColor = getAccessibleTextColor(backgroundColor);
```

### Focus Indicators

Enhanced focus indicators for keyboard navigation:

```tsx
// Use built-in focus ring utilities
<button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Accessible Button
</button>

// Or use utility functions
import { createFocusRing } from '@/lib/theme/utils';

const focusStyles = createFocusRing();
```

### High Contrast Support

The theme system adapts to high contrast preferences:

```css
@media (prefers-contrast: high) {
  :root {
    --border: 0 0% 0%;
    --ring: 0 0% 0%;
  }
  
  .dark {
    --border: 0 0% 100%;
    --ring: 0 0% 100%;
  }
}
```

### Reduced Motion Support

Respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Storybook Integration

The theme system includes comprehensive Storybook integration:

### Theme Switching
- Global theme toolbar control
- Light/Dark/System theme options
- Real-time preview updates

### Accessibility Testing
- Color blindness simulation
- High contrast mode testing
- Focus indicator visibility
- RTL layout testing

### Responsive Testing
- Multiple viewport configurations
- Mobile-first breakpoints
- Container queries support

## Performance Considerations

### CSS Variables
- Uses CSS custom properties for efficient theme switching
- Minimal JavaScript required for theme changes
- No style recalculation on theme switch

### Bundle Size
- Tree-shakable theme utilities
- Conditional loading of theme components
- Optimized font loading with `font-display: swap`

### Server-Side Rendering
- Hydration-safe theme detection
- No flash of incorrect theme (FOIT)
- Progressive enhancement support

## Best Practices

### Component Development
1. **Use Semantic Tokens**: Always use semantic color tokens (`--primary`, `--success`) instead of specific colors
2. **Test in Both Themes**: Ensure components work in both light and dark themes
3. **Consider Contrast**: Verify color combinations meet accessibility standards
4. **Provide Fallbacks**: Include fallback values for CSS custom properties

### Theme Customization
1. **Extend Don't Override**: Extend the existing theme system rather than overriding
2. **Maintain Consistency**: Keep consistent spacing and typography scales
3. **Test Thoroughly**: Test custom themes across all components
4. **Document Changes**: Document any theme customizations

### Accessibility
1. **Check Contrast Ratios**: Use provided utilities to verify color accessibility
2. **Test with Screen Readers**: Ensure theme changes don't break screen reader navigation
3. **Support High Contrast**: Test with high contrast mode enabled
4. **Keyboard Navigation**: Verify focus indicators are visible in all themes

## Troubleshooting

### Common Issues

#### Theme Not Persisting
```tsx
// Ensure ThemeProvider is properly configured
<ThemeProvider
  config={{
    storageKey: 'my-app-theme', // Unique storage key
    enableSystemTheme: true,
  }}
>
```

#### Flash of Incorrect Theme
```tsx
// Add suppressHydrationWarning to html element
<html suppressHydrationWarning>
```

#### CSS Variables Not Working
```css
/* Ensure fallback values are provided */
.my-component {
  background: hsl(var(--background, 0 0% 100%));
}
```

#### Storybook Theme Issues
```tsx
// Ensure preview.tsx includes ThemeProvider
import { ThemeProvider } from '../lib/theme/theme-provider';

const decorators = [
  (Story) => (
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  ),
];
```

## Migration Guide

### From Basic Dark Mode

If migrating from a basic dark mode implementation:

1. **Replace theme classes** with semantic tokens
2. **Update component styles** to use CSS custom properties
3. **Add ThemeProvider** to your app root
4. **Replace theme toggle** with provided components

### From Other Theme Systems

1. **Map existing tokens** to MoRAG UI token structure
2. **Update component variants** to use new color system
3. **Test accessibility** with new color combinations
4. **Update documentation** to reflect new theme system

## API Reference

### ThemeProvider Props
```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  config?: {
    defaultTheme?: 'light' | 'dark' | 'system';
    enableSystemTheme?: boolean;
    disableTransitionOnChange?: boolean;
    storageKey?: string;
    themes?: string[];
  };
}
```

### useTheme Hook
```typescript
interface ThemeContextValue {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  themes: string[];
  systemTheme: string | undefined;
}
```

### Theme Utilities
```typescript
// Color utilities
hexToHsl(hex: string): string
hslToHex(hsl: string): string
getContrastRatio(color1: string, color2: string): number
meetsContrastRatio(fg: string, bg: string, level?: 'AA' | 'AAA'): boolean

// Styling utilities
themeClass(lightClass: string, darkClass: string): string
createFocusRing(color?: string): string
createTransition(properties?: string[], duration?: string): string
```

## Contributing

When contributing to the theme system:

1. **Follow Design Tokens**: Use existing tokens or propose new ones
2. **Maintain Accessibility**: Ensure all changes meet accessibility standards
3. **Test Thoroughly**: Test in both themes and multiple devices
4. **Document Changes**: Update documentation for any new features
5. **Add Stories**: Include Storybook stories for new components

For more information, see the [Contributing Guide](../CONTRIBUTING.md).