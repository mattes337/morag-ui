# MoRAG UI Theme System

A comprehensive, accessible, and performant theme system with dark mode support for React applications.

## Features

🌓 **Seamless Light/Dark Mode** - Automatic theme switching with system preference detection  
🎨 **Design Tokens** - Centralized design system with semantic color tokens  
♿ **Accessibility First** - WCAG AA compliant colors and enhanced focus indicators  
⚡ **Performance Optimized** - CSS custom properties with minimal JavaScript  
🔧 **Developer Experience** - TypeScript support and Storybook integration  
📱 **Responsive Ready** - Mobile-first approach with adaptive layouts  
🔄 **SSR Compatible** - Works with Next.js server-side rendering  

## Quick Start

### 1. Install Dependencies

```bash
npm install next-themes
```

### 2. Setup Theme Provider

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/lib/theme/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3. Add Theme Controls

```tsx
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

### 4. Use Theme-Aware Styling

```tsx
<div className="bg-background text-foreground border border-border">
  <h2 className="text-primary">Themed Content</h2>
  <p className="text-muted-foreground">This adapts to the current theme</p>
</div>
```

## Core Components

### ThemeProvider
Main provider component that manages theme state and persistence.

```tsx
<ThemeProvider
  config={{
    defaultTheme: 'system',
    enableSystemTheme: true,
    storageKey: 'app-theme',
  }}
>
  {children}
</ThemeProvider>
```

### Theme Controls
Various UI components for theme switching:

```tsx
import {
  ThemeToggle,
  ThemeSelector,
  ThemeSwitch,
  ThemeSegmentedControl,
  ThemeIndicator
} from '@/components/theme/theme-toggle';

// Simple toggle button
<ThemeToggle />

// Dropdown selector
<ThemeSelector includeSystem />

// Switch control
<ThemeSwitch showLabels />

// Segmented control
<ThemeSegmentedControl />

// Read-only indicator
<ThemeIndicator />
```

## Hooks and Utilities

### useTheme
Access and control theme state:

```tsx
import { useTheme } from '@/lib/theme/theme-provider';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

### Theme-Aware Values
Use different values based on the current theme:

```tsx
import { useThemeValues } from '@/lib/theme/theme-provider';

function MyComponent() {
  const shadowColor = useThemeValues(
    'rgba(0, 0, 0, 0.1)', // light theme
    'rgba(255, 255, 255, 0.1)' // dark theme
  );
  
  return (
    <div style={{ boxShadow: `0 2px 8px ${shadowColor}` }}>
      Content with adaptive shadow
    </div>
  );
}
```

### Utility Functions
Helper functions for theme-aware styling:

```tsx
import { themeClass, createFocusRing } from '@/lib/theme/utils';

// Theme-aware classes
const buttonClass = themeClass(
  'bg-white hover:bg-gray-50', // light theme
  'bg-gray-800 hover:bg-gray-700' // dark theme
);

// Accessible focus styles
const focusRing = createFocusRing();
```

## Design Tokens

### Semantic Colors
All colors use semantic naming and automatically adapt to themes:

```css
/* Primary brand colors */
--primary: 217 91% 60%;
--primary-foreground: 210 40% 98%;

/* Semantic states */
--success: 142 71% 45%;
--warning: 38 92% 50%;
--destructive: 0 84% 60%;

/* Surface colors */
--background: 0 0% 100%;
--card: 0 0% 100%;
--muted: 210 40% 96%;

/* Interactive elements */
--border: 214 32% 91%;
--input: 214 32% 91%;
--ring: 217 91% 60%;
```

### Typography Scale
Consistent typography with proper line heights:

```css
/* Font families */
font-sans: Inter, ui-sans-serif, system-ui, sans-serif
font-mono: JetBrains Mono, ui-monospace, monospace

/* Scale */
text-xs: 0.75rem (1rem line-height)
text-sm: 0.875rem (1.25rem line-height)
text-base: 1rem (1.5rem line-height)
text-lg: 1.125rem (1.75rem line-height)
/* ... and more */
```

### Spacing System
Consistent spacing scale based on 0.25rem (4px) increments:

```css
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
6: 1.5rem (24px)
8: 2rem (32px)
/* ... and more */
```

## Accessibility Features

### WCAG Compliance
All color combinations meet WCAG AA standards:

```tsx
import { meetsContrastRatio, getAccessibleTextColor } from '@/lib/theme/config';

// Check contrast ratio
const isAccessible = meetsContrastRatio(foreground, background, 'AA');

// Get accessible text color
const textColor = getAccessibleTextColor(backgroundColor);
```

### Enhanced Focus Indicators
Visible focus indicators for keyboard navigation:

```tsx
<button className="focus-visible:ring-2 focus-visible:ring-ring">
  Accessible Button
</button>
```

### High Contrast Support
Automatic adaptation to high contrast preferences:

```css
@media (prefers-contrast: high) {
  :root {
    --border: 0 0% 0%;
    --ring: 0 0% 0%;
  }
}
```

### Reduced Motion Support
Respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Storybook Integration

The theme system includes comprehensive Storybook support:

- **Global Theme Control** - Switch themes from the toolbar
- **Accessibility Testing** - Color blindness simulation and contrast checking
- **Responsive Testing** - Multiple viewport configurations
- **Documentation** - Auto-generated docs for all theme components

## Advanced Usage

### Custom Theme Configuration
Customize the theme system behavior:

```tsx
<ThemeProvider
  config={{
    defaultTheme: 'dark',
    enableSystemTheme: true,
    disableTransitionOnChange: false,
    storageKey: 'my-app-theme',
    themes: ['light', 'dark', 'custom'],
  }}
>
  {children}
</ThemeProvider>
```

### Theme Detection
Monitor system theme changes:

```tsx
import { useSystemTheme } from '@/lib/theme/theme-provider';

function SystemThemeDetector() {
  const systemTheme = useSystemTheme();
  
  useEffect(() => {
    console.log('System theme changed to:', systemTheme);
  }, [systemTheme]);
}
```

### Performance Optimization
The theme system is optimized for performance:

- **CSS Custom Properties** - Efficient theme switching without style recalculation
- **Minimal JavaScript** - Core functionality with small bundle size
- **Tree Shaking** - Only import what you use
- **SSR Friendly** - No hydration mismatches

## Best Practices

### Component Development
1. Always use semantic color tokens instead of hardcoded colors
2. Test components in both light and dark themes
3. Verify color contrast meets accessibility standards
4. Provide fallback values for CSS custom properties

### Theme Customization
1. Extend the existing system rather than overriding
2. Maintain consistent spacing and typography scales
3. Document any custom theme additions
4. Test thoroughly across all components

### Performance
1. Use CSS custom properties for theme-aware styling
2. Minimize JavaScript-based theme logic
3. Leverage browser caching for theme preferences
4. Consider prefers-color-scheme for initial theme detection

## Migration Guide

### From Basic Dark Mode
1. Replace theme classes with semantic tokens
2. Update components to use CSS custom properties
3. Add ThemeProvider to your app
4. Replace manual toggles with provided components

### From Other Theme Systems
1. Map existing tokens to MoRAG UI structure
2. Update component styles to use new color system
3. Test accessibility with new combinations
4. Update documentation

## Troubleshooting

### Common Issues

**Theme not persisting:**
```tsx
// Ensure unique storage key
<ThemeProvider config={{ storageKey: 'unique-app-theme' }}>
```

**Flash of incorrect theme:**
```tsx
// Add to HTML element
<html suppressHydrationWarning>
```

**CSS variables not working:**
```css
/* Always provide fallbacks */
background: hsl(var(--background, 0 0% 100%));
```

**TypeScript errors:**
```tsx
// Ensure proper imports
import { useTheme } from '@/lib/theme/theme-provider';
```

## File Structure

```
lib/theme/
├── config.ts          # Theme configuration and color definitions
├── tokens.ts          # Design tokens and constants
├── theme-provider.tsx # React context and hooks
├── utils.ts           # Utility functions
├── index.ts           # Public exports
└── README.md          # This file

components/theme/
├── theme-toggle.tsx          # Theme switching components
├── theme-toggle.stories.tsx  # Storybook stories
└── color-palette.stories.tsx # Color documentation
```

## API Reference

### ThemeProvider
```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  config?: ThemeConfig;
}

interface ThemeConfig {
  defaultTheme: 'light' | 'dark' | 'system';
  enableSystemTheme: boolean;
  disableTransitionOnChange: boolean;
  storageKey: string;
  themes: string[];
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

### Theme Components
All theme components accept standard React props plus:
- `className?: string` - Additional CSS classes
- Theme-specific props (see individual component docs)

## Contributing

When contributing to the theme system:

1. Follow existing patterns and conventions
2. Maintain accessibility standards
3. Test in both themes and multiple devices
4. Update documentation for new features
5. Add Storybook stories for new components

## Resources

- [Design System Documentation](../../docs/THEME_SYSTEM.md)
- [Storybook Stories](../../components/theme/)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Next.js Themes Documentation](https://github.com/pacocoursey/next-themes)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## License

This theme system is part of the MoRAG UI component library and follows the same license terms.