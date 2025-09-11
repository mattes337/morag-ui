import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';
import { Input } from './input';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A label component that associates form controls with descriptive text. Built on Radix UI primitives with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'muted', 'destructive', 'success'],
      description: 'The color variant of the label',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the label',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required (shows red asterisk)',
    },
    children: {
      control: 'text',
      description: 'The label text',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label text',
    variant: 'default',
    size: 'default',
  },
};

export const Required: Story = {
  args: {
    children: 'Required field',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Label with required indicator (red asterisk).',
      },
    },
  },
};

export const Muted: Story = {
  args: {
    children: 'Muted label',
    variant: 'muted',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Error label',
    variant: 'destructive',
  },
};

export const Success: Story = {
  args: {
    children: 'Success label',
    variant: 'success',
  },
};

export const Small: Story = {
  args: {
    children: 'Small label',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large label',
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Label Sizes</h3>
        <div className="space-y-2">
          <div>
            <Label size="sm">Small label</Label>
          </div>
          <div>
            <Label size="default">Default label</Label>
          </div>
          <div>
            <Label size="lg">Large label</Label>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available label sizes.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Label Variants</h3>
        <div className="space-y-2">
          <div>
            <Label variant="default">Default label</Label>
          </div>
          <div>
            <Label variant="muted">Muted label</Label>
          </div>
          <div>
            <Label variant="destructive">Destructive label</Label>
          </div>
          <div>
            <Label variant="success">Success label</Label>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available label color variants.',
      },
    },
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2 w-64">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Label properly associated with an input field using htmlFor.',
      },
    },
  },
};

export const RequiredWithInput: Story = {
  render: () => (
    <div className="space-y-2 w-64">
      <Label htmlFor="password" required>Password</Label>
      <Input id="password" type="password" placeholder="Enter password" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Required label with input field showing the red asterisk.',
      },
    },
  },
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms" className="cursor-pointer">
        I agree to the terms and conditions
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Label associated with a checkbox, with cursor pointer for better UX.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <h3 className="text-lg font-semibold">Registration Form</h3>
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" required>Full Name</Label>
          <Input id="name" placeholder="John Doe" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email-form" required>Email</Label>
          <Input id="email-form" type="email" placeholder="you@example.com" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" variant="muted">Phone (Optional)</Label>
          <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Input id="bio" placeholder="Tell us about yourself..." />
          <p className="text-xs text-muted-foreground">Maximum 200 characters</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="newsletter" />
          <Label htmlFor="newsletter" size="sm" className="cursor-pointer">
            Subscribe to newsletter
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="terms-form" />
          <Label htmlFor="terms-form" size="sm" required className="cursor-pointer">
            I agree to the Terms of Service
          </Label>
        </div>
      </form>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Complete form example showing various label configurations and associations.',
      },
    },
  },
};

export const ErrorStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <h3 className="text-lg font-semibold">Form with Errors</h3>
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="error-email" variant="destructive" required>Email</Label>
          <Input 
            id="error-email" 
            type="email" 
            variant="error"
            defaultValue="invalid-email"
            error="Please enter a valid email address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="error-password" variant="destructive" required>Password</Label>
          <Input 
            id="error-password" 
            type="password" 
            variant="error"
            error="Password must be at least 8 characters"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="success-username" variant="success">Username</Label>
          <Input 
            id="success-username" 
            variant="success"
            defaultValue="john_doe"
            helperText="Username is available"
          />
        </div>
      </form>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Form showing error and success states with appropriately colored labels.',
      },
    },
  },
};

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <h3 className="text-lg font-semibold">Accessibility Best Practices</h3>
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accessible-input">
            Search Query
            <span className="sr-only">(required field)</span>
          </Label>
          <Input 
            id="accessible-input"
            placeholder="Enter search terms..."
            aria-describedby="search-help"
            required
          />
          <p id="search-help" className="text-xs text-muted-foreground">
            Use keywords to find relevant content
          </p>
        </div>
        
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Notification preferences</legend>
          <div className="flex items-center space-x-2">
            <Checkbox id="email-notif" />
            <Label htmlFor="email-notif" size="sm">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sms-notif" />
            <Label htmlFor="sms-notif" size="sm">SMS notifications</Label>
          </div>
        </fieldset>
      </form>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Accessibility example with screen reader text, aria-describedby, and fieldset/legend.',
      },
    },
  },
};