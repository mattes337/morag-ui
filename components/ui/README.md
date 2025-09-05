# Radix UI + Tailwind CSS Component Library

This is a comprehensive, production-ready UI component library built with Radix UI primitives and Tailwind CSS, specifically designed for the MoRAG enterprise platform.

## Features

✅ **Radix UI Integration** - Built on top of accessible, unstyled Radix UI primitives  
✅ **Tailwind CSS Styling** - Fully styled with Tailwind CSS and custom design tokens  
✅ **TypeScript Support** - Complete TypeScript definitions for all components  
✅ **Accessibility First** - WCAG compliant with proper ARIA attributes and keyboard navigation  
✅ **Component Variants** - Multiple variants using Class Variance Authority (CVA)  
✅ **Dark Mode Support** - Complete dark/light theme system  
✅ **Enterprise Ready** - Production-tested patterns and best practices  

## Installation & Setup

All dependencies are already installed and configured:

```json
{
  "@radix-ui/colors": "^3.0.0",
  "@radix-ui/react-accordion": "^1.2.12",
  "@radix-ui/react-alert-dialog": "^1.1.15",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-collapsible": "^1.1.12",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-radio-group": "^1.3.8",
  "@radix-ui/react-scroll-area": "^1.2.10",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-tabs": "^1.1.13",
  "@radix-ui/react-toast": "^1.2.15",
  "@radix-ui/react-tooltip": "^1.2.8",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "tailwindcss-animate": "^1.0.7"
}
```

## Available Components

### Form Components
- `Button` - Enhanced button with loading states, icons, and multiple variants
- `Input` - Text input with icons, error states, and helper text
- `Label` - Accessible labels with required field indicators
- `Checkbox` - Checkbox with labels and descriptions
- `Switch` - Toggle switch with multiple variants
- `Select` - Dropdown select with keyboard navigation

### Layout Components
- `Card` - Container with header, content, and footer sections
- `Separator` - Horizontal and vertical separators

### Navigation Components
- `Tabs` - Tabbed interface with multiple styling variants

### Overlay Components
- `Dialog` - Modal dialogs with customizable sizes
- `Toast` - Notification system (requires provider setup)

### Display Components
- `Avatar` - User avatars with fallbacks
- `Progress` - Progress bars with labels and variants

## Usage Examples

### Basic Import
```tsx
import { Button, Card, Input } from '@/components/ui';

// Or import specific components
import { Button } from '@/components/ui/Button';
```

### Bulk Import by Category
```tsx
import { FormComponents, LayoutComponents } from '@/components/ui';

const { Button, Input, Label } = FormComponents;
const { Card, CardHeader, CardContent } = LayoutComponents;
```

### Button Examples
```tsx
// Basic button
<Button>Click me</Button>

// Button with variants
<Button variant="destructive" size="lg">
  Delete
</Button>

// Button with loading state
<Button loading>
  Saving...
</Button>

// Button with icons
<Button leftIcon={<SaveIcon />} rightIcon={<ArrowIcon />}>
  Save Document
</Button>
```

### Form Examples
```tsx
// Input with validation
<Input 
  label="Email"
  type="email" 
  error="Please enter a valid email"
  placeholder="user@example.com"
/>

// Checkbox with description
<Checkbox 
  label="Accept terms"
  description="I agree to the terms and conditions"
  required
/>

// Switch with custom styling
<Switch 
  variant="success"
  label="Enable notifications"
  size="lg"
/>
```

### Card Layout
```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Processing Status</CardTitle>
    <CardDescription>Document ingestion progress</CardDescription>
  </CardHeader>
  <CardContent>
    <Progress value={75} showValue label="Documents processed" />
  </CardContent>
</Card>
```

### Dialog Example
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent size="lg">
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Design System

### CSS Variables
The component library uses CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 217 91% 60%;
  --secondary: 210 40% 98%;
  --muted: 210 40% 98%;
  --accent: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 217 91% 60%;
  --radius: 0.5rem;
}
```

### Color Palette
- **Primary**: MoRAG brand blue (#3b82f6)
- **Secondary**: Neutral grays
- **Success**: Green variants
- **Warning**: Yellow variants  
- **Destructive**: Red variants

### Typography
- **Font Family**: Inter (sans-serif), JetBrains Mono (monospace)
- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl
- **Font Weights**: normal, medium, semibold, bold

## Accessibility Features

- **Keyboard Navigation**: All interactive components support keyboard navigation
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators for keyboard users
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Color Contrast**: WCAG AA compliant color ratios

## Utility Functions

### `cn()` - Class Name Utility
```tsx
import { cn } from '@/lib/utils';

// Merges classes with conflict resolution
const className = cn(
  'bg-blue-500 text-white',
  isActive && 'bg-green-500',
  'px-4 py-2'
);
```

### Focus Utilities
```tsx
import { focusRing, buttonFocusRing } from '@/lib/utils';

// Apply focus ring styles
<div className={focusRing()}>Content</div>
<button className={buttonFocusRing()}>Button</button>
```

### Animation Utilities
```tsx
import { pressAnimation, transition } from '@/lib/utils';

// Add press animation
<button className={pressAnimation()}>Press me</button>
```

## Component Variants

Components use Class Variance Authority (CVA) for consistent variant patterns:

```tsx
// Button variants
variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning'
size: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'

// Input variants
variant: 'default' | 'error' | 'success'
size: 'default' | 'sm' | 'lg'

// Card variants
variant: 'default' | 'outlined' | 'elevated' | 'ghost'
padding: 'none' | 'sm' | 'default' | 'lg'
```

## Customization

### Extending Components
```tsx
// Create custom variants
const customButton = cva(buttonVariants(), {
  variants: {
    brand: {
      morag: 'bg-gradient-to-r from-blue-600 to-purple-600',
    }
  }
});
```

### Custom CSS Classes
```css
/* Add to globals.css */
.custom-component {
  @apply bg-primary text-primary-foreground rounded-md;
}
```

## Best Practices

1. **Use Semantic HTML**: Components render semantic HTML elements
2. **Provide Labels**: Always provide labels for form controls
3. **Handle Loading States**: Use loading props for async operations
4. **Error Handling**: Display helpful error messages
5. **Keyboard Support**: Test keyboard navigation
6. **Color Contrast**: Ensure sufficient color contrast
7. **Responsive Design**: Components are mobile-friendly by default

## Toast System Setup

For Toast notifications, wrap your app with the ToastProvider:

```tsx
// In your root layout or App component
import { ToastProvider, ToastViewport } from '@/components/ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
```

## Performance Considerations

- **Tree Shaking**: Components are individually exportable
- **Bundle Size**: Radix UI primitives are lightweight
- **Runtime Performance**: Minimal JavaScript footprint
- **CSS Optimization**: Tailwind CSS purges unused styles

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Accessibility**: Screen readers and assistive technologies
- **Mobile**: iOS Safari, Android Chrome

This component library provides a solid foundation for building the MoRAG platform's user interface with enterprise-grade quality and accessibility standards.