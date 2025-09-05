/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        // Brand colors for MoRAG with extended palette
        primary: {
          50: 'hsl(214 100% 97%)',
          100: 'hsl(214 95% 93%)',
          200: 'hsl(213 97% 87%)',
          300: 'hsl(212 96% 78%)',
          400: 'hsl(213 94% 68%)',
          500: 'hsl(217 91% 60%)', // Main brand color
          600: 'hsl(221 83% 53%)',
          700: 'hsl(224 76% 48%)',
          800: 'hsl(226 71% 40%)',
          900: 'hsl(224 64% 33%)',
          950: 'hsl(226 55% 21%)',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          50: 'hsl(210 40% 98%)',
          100: 'hsl(210 40% 96%)',
          200: 'hsl(214 32% 91%)',
          300: 'hsl(213 27% 84%)',
          400: 'hsl(215 20% 65%)',
          500: 'hsl(220 14% 46%)',
          600: 'hsl(215 28% 17%)',
          700: 'hsl(222 47% 11%)',
          800: 'hsl(222 84% 5%)',
          900: 'hsl(224 71% 4%)',
          950: 'hsl(229 84% 2%)',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Semantic colors
        success: {
          50: 'hsl(138 76% 97%)',
          100: 'hsl(140 84% 92%)',
          200: 'hsl(141 78% 85%)',
          300: 'hsl(142 77% 73%)',
          400: 'hsl(142 69% 58%)',
          500: 'hsl(142 71% 45%)',
          600: 'hsl(142 76% 36%)',
          700: 'hsl(142 72% 29%)',
          800: 'hsl(142 64% 24%)',
          900: 'hsl(143 61% 20%)',
          950: 'hsl(144 60% 12%)',
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          50: 'hsl(48 100% 96%)',
          100: 'hsl(48 96% 89%)',
          200: 'hsl(48 97% 77%)',
          300: 'hsl(46 87% 65%)',
          400: 'hsl(43 74% 66%)',
          500: 'hsl(38 92% 50%)',
          600: 'hsl(32 95% 44%)',
          700: 'hsl(26 90% 37%)',
          800: 'hsl(23 83% 31%)',
          900: 'hsl(22 78% 26%)',
          950: 'hsl(21 92% 14%)',
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        error: {
          50: 'hsl(0 86% 97%)',
          100: 'hsl(0 93% 94%)',
          200: 'hsl(0 96% 89%)',
          300: 'hsl(0 94% 82%)',
          400: 'hsl(0 91% 71%)',
          500: 'hsl(0 84% 60%)',
          600: 'hsl(0 72% 51%)',
          700: 'hsl(0 74% 42%)',
          800: 'hsl(0 70% 35%)',
          900: 'hsl(0 63% 31%)',
          950: 'hsl(0 75% 15%)',
          DEFAULT: 'hsl(var(--destructive))', // Map to destructive for compatibility
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // Radix UI semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
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
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'ease-in-sine': 'cubic-bezier(0.12, 0, 0.39, 0)',
        'ease-out-sine': 'cubic-bezier(0.61, 1, 0.88, 1)',
        'ease-in-out-sine': 'cubic-bezier(0.37, 0, 0.63, 1)',
        'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-out': 'fade-out 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-in',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 8px 0 rgb(0 0 0 / 0.06)',
        'glow': '0 0 20px rgb(59 130 246 / 0.5)',
        'glow-lg': '0 0 40px rgb(59 130 246 / 0.5)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for theme utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `hsl(${theme('colors.secondary.400')}) hsl(${theme('colors.secondary.100')})`,
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: `hsl(${theme('colors.secondary.100')})`,
          'border-radius': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: `hsl(${theme('colors.secondary.400')})`,
          'border-radius': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: `hsl(${theme('colors.secondary.500')})`,
        },
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.glass': {
          'backdrop-filter': 'blur(8px)',
          'background-color': 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.dark .glass': {
          'background-color': 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(71, 85, 105, 0.2)',
        },
        '.focus-ring': {
          'outline': 'none',
          'box-shadow': '0 0 0 2px hsl(var(--ring))',
        },
        '.gradient-text': {
          background: `linear-gradient(to right, hsl(${theme('colors.primary.500')}), hsl(${theme('colors.primary.600')}))`,
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          color: 'transparent',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
