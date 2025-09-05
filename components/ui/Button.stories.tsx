import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes. Fully accessible with keyboard navigation, screen reader support, and WCAG 2.1 AA compliance.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
          {
            id: 'aria-valid-attr',
            enabled: true,
          },
        ],
      },
      options: {
        checks: { 
          'color-contrast': { 
            options: { noScroll: true } 
          } 
        },
        restoreScroll: true,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    children: {
      control: 'text',
      description: 'The content of the button',
    },
  },
  args: { 
    onClick: () => {},
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    children: 'Default Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🔥',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Fire icon button">🔥</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">States</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'A showcase of all button variants, sizes, and states.',
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Keyboard Navigation Test</h3>
        <p className="text-sm text-muted-foreground">
          Use Tab to navigate between buttons. Use Enter or Space to activate them.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="button-1" onClick={() => {}}>Button 1</Button>
          <Button data-testid="button-2" onClick={() => {}}>Button 2</Button>
          <Button data-testid="button-3" onClick={() => {}}>Button 3</Button>
          <Button data-testid="button-4" disabled>Disabled Button</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates keyboard navigation and activation patterns for buttons. Use Tab to navigate, Enter or Space to activate.',
      },
    },
  },
};

export const ScreenReaderSupport: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Screen Reader Support</h3>
        <div className="flex flex-wrap gap-2">
          <Button aria-label="Save document">💾</Button>
          <Button aria-describedby="delete-help">
            Delete
          </Button>
          <Button loading aria-label="Saving changes">
            Save Changes
          </Button>
          <Button variant="link" aria-describedby="external-link-help">
            External Link
          </Button>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div id="delete-help">This action cannot be undone</div>
          <div id="external-link-help">Opens in a new tab</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates proper ARIA labeling and descriptions for buttons with icons, loading states, and contextual help.',
      },
    },
  },
};

export const FocusVisibility: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Visibility</h3>
        <p className="text-sm text-muted-foreground">
          Tab through these buttons to see focus indicators. Focus should be clearly visible on all variants.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Light Backgrounds</h4>
            <div className="flex flex-wrap gap-2 p-4 bg-background border rounded">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Dark Backgrounds</h4>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-900 rounded">
              <Button variant="default">Default</Button>
              <Button variant="outline" className="border-slate-600">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost" className="text-slate-100">Ghost</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tests focus visibility across different button variants and background colors to ensure WCAG compliance.',
      },
    },
  },
};

export const HighContrastMode: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">High Contrast Mode</h3>
        <p className="text-sm text-muted-foreground">
          These buttons should maintain usability in high contrast mode and for users with visual impairments.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Primary Action</Button>
          <Button variant="destructive">Delete Item</Button>
          <Button variant="outline">Secondary Action</Button>
          <Button disabled>Disabled Action</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ensures button variants work correctly in high contrast mode and maintain accessibility.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast-enhanced',
            enabled: true, // Test AAA level contrast for this story
          },
        ],
      },
    },
  },
};