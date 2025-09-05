import type { Preview } from '@storybook/react';
import React from 'react';
import '../app/globals.css';
import './storybook.css';
import { ThemeProvider } from '../lib/theme/theme-provider';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'transparent',
      values: [
        {
          name: 'transparent',
          value: 'transparent',
        },
        {
          name: 'light',
          value: 'hsl(0 0% 100%)',
        },
        {
          name: 'dark',
          value: 'hsl(229 84% 2%)',
        },
        {
          name: 'surface',
          value: 'hsl(var(--card))',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        mobileLandscape: {
          name: 'Mobile Landscape',
          styles: {
            width: '667px',
            height: '375px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        tabletLandscape: {
          name: 'Tablet Landscape',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
        large: {
          name: 'Large Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
        xl: {
          name: 'Extra Large',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    a11y: {
      context: '#storybook-root',
      config: {
        // Configure axe-core for WCAG 2.1 AA compliance
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
        rules: [
          // Color and contrast
          {
            id: 'color-contrast',
            enabled: true,
            tags: ['wcag2aa', 'wcag143'],
          },
          {
            id: 'color-contrast-enhanced',
            enabled: false, // AAA level - optional
            tags: ['wcag2aaa', 'wcag146'],
          },
          
          // Keyboard accessibility
          {
            id: 'keyboard',
            enabled: true,
            tags: ['wcag2a', 'wcag211'],
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
            tags: ['wcag2a', 'wcag241'],
          },
          {
            id: 'focusable-content',
            enabled: true,
            tags: ['wcag2a', 'wcag211'],
          },
          {
            id: 'tabindex',
            enabled: true,
            tags: ['wcag2a', 'wcag211'],
          },
          
          // ARIA and semantics
          {
            id: 'aria-valid-attr',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          {
            id: 'aria-valid-attr-value',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          {
            id: 'aria-required-attr',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          {
            id: 'aria-roles',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          {
            id: 'aria-hidden-focus',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          {
            id: 'aria-label',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          {
            id: 'aria-labelledby',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          {
            id: 'aria-describedby',
            enabled: true,
            tags: ['wcag2a', 'wcag412'],
          },
          
          // Form controls
          {
            id: 'label',
            enabled: true,
            tags: ['wcag2a', 'wcag332', 'wcag131'],
          },
          {
            id: 'form-field-multiple-labels',
            enabled: true,
            tags: ['wcag2a', 'wcag332'],
          },
          {
            id: 'duplicate-id',
            enabled: true,
            tags: ['wcag2a', 'wcag411'],
          },
          
          // Images and media
          {
            id: 'image-alt',
            enabled: true,
            tags: ['wcag2a', 'wcag111'],
          },
          {
            id: 'image-redundant-alt',
            enabled: true,
            tags: ['best-practice'],
          },
          
          // Navigation and structure
          {
            id: 'landmark-main-is-top-level',
            enabled: true,
            tags: ['best-practice'],
          },
          {
            id: 'landmark-no-duplicate-banner',
            enabled: true,
            tags: ['best-practice'],
          },
          {
            id: 'landmark-no-duplicate-contentinfo',
            enabled: true,
            tags: ['best-practice'],
          },
          {
            id: 'landmark-unique',
            enabled: true,
            tags: ['best-practice'],
          },
          {
            id: 'region',
            enabled: true,
            tags: ['best-practice'],
          },
          
          // Links
          {
            id: 'link-name',
            enabled: true,
            tags: ['wcag2a', 'wcag244'],
          },
          {
            id: 'link-in-text-block',
            enabled: true,
            tags: ['wcag2a', 'wcag141'],
          },
          
          // Headings
          {
            id: 'empty-heading',
            enabled: true,
            tags: ['best-practice'],
          },
          {
            id: 'heading-order',
            enabled: true,
            tags: ['best-practice'],
          },
          
          // Lists
          {
            id: 'list',
            enabled: true,
            tags: ['wcag2a', 'wcag131'],
          },
          {
            id: 'listitem',
            enabled: true,
            tags: ['wcag2a', 'wcag131'],
          },
          
          // Tables
          {
            id: 'table-header',
            enabled: true,
            tags: ['wcag2a', 'wcag131'],
          },
          {
            id: 'td-headers-attr',
            enabled: true,
            tags: ['wcag2a', 'wcag131'],
          },
          {
            id: 'th-has-data-cells',
            enabled: true,
            tags: ['wcag2a', 'wcag131'],
          },
          
          // Page structure
          {
            id: 'page-has-heading-one',
            enabled: true,
            tags: ['best-practice'],
          },
          {
            id: 'bypass',
            enabled: true,
            tags: ['wcag2a', 'wcag241'],
          },
          
          // Language
          {
            id: 'html-has-lang',
            enabled: true,
            tags: ['wcag2a', 'wcag311'],
          },
          {
            id: 'html-lang-valid',
            enabled: true,
            tags: ['wcag2a', 'wcag311'],
          },
          
          // Timing
          {
            id: 'no-autoplay-audio',
            enabled: true,
            tags: ['wcag2a', 'wcag142'],
          },
          
          // Motion and animation
          {
            id: 'motion-reduce',
            enabled: true,
            tags: ['wcag2aa', 'wcag234'],
          },
        ],
        // Additional rule configurations
        disableOtherRules: false,
        reporter: 'v2',
      },
      options: {
        checks: { 
          'color-contrast': { 
            options: { 
              noScroll: true,
              // Minimum contrast ratio for AA compliance
              contrastRatio: {
                normal: 4.5,
                large: 3.0
              }
            } 
          } 
        },
        restoreScroll: true,
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
        }
      },
      manual: false,
    },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
          { value: 'system', icon: 'browser', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
    colorMode: {
      description: 'Color mode for enhanced theme testing',
      defaultValue: 'normal',
      toolbar: {
        title: 'Color Mode',
        icon: 'eyeclose',
        items: [
          { value: 'normal', title: 'Normal' },
          { value: 'protanopia', title: 'Protanopia' },
          { value: 'deuteranopia', title: 'Deuteranopia' },
          { value: 'tritanopia', title: 'Tritanopia' },
          { value: 'achromatopsia', title: 'Achromatopsia' },
        ],
      },
    },
    direction: {
      description: 'Text direction for internationalization testing',
      defaultValue: 'ltr',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'Left to Right' },
          { value: 'rtl', title: 'Right to Left' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      const colorMode = context.globals.colorMode || 'normal';
      const direction = context.globals.direction || 'ltr';
      
      // Apply theme class
      React.useEffect(() => {
        const root = document.documentElement;
        
        // Remove previous theme classes
        root.classList.remove('light', 'dark');
        
        // Apply new theme
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.add(prefersDark ? 'dark' : 'light');
        } else {
          root.classList.add(theme);
        }
        
        // Apply color mode simulation
        const colorModeClasses = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
        colorModeClasses.forEach(cls => root.classList.remove(cls));
        if (colorMode !== 'normal') {
          root.classList.add(colorMode);
        }
        
        // Apply direction
        root.dir = direction;
      }, [theme, colorMode, direction]);
      
      return (
        <ThemeProvider
          config={{
            defaultTheme: theme === 'system' ? 'system' : theme,
            enableSystemTheme: true,
            disableTransitionOnChange: false,
            storageKey: 'storybook-theme',
            themes: ['light', 'dark'],
          }}
        >
          <div 
            className="min-h-screen bg-background text-foreground transition-colors duration-300"
            style={{
              padding: 'var(--sb-story-padding, 1rem)',
              minHeight: 'var(--sb-story-min-height, 100vh)',
            }}
            dir={direction}
          >
            <div className="storybook-story-wrapper">
              <Story />
            </div>
          </div>
        </ThemeProvider>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;