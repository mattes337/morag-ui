import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component with multiple sizes, variants, and support for left/right elements, error states, and helper text.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the input',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: 'The variant styling of the input',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    leftElement: {
      control: false,
      description: 'Element to display on the left side of the input',
    },
    rightElement: {
      control: false,
      description: 'Element to display on the right side of the input',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the input',
    },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    size: 'default',
    variant: 'default',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Type your message here',
  },
};

export const WithHelperText: Story = {
  args: {
    placeholder: 'Username',
    helperText: 'Choose a unique username (3-20 characters)',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with helpful guidance text below the field.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Email address',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input showing error state with error message.',
      },
    },
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    placeholder: 'Email address',
    defaultValue: 'user@example.com',
    helperText: 'Email verified successfully',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input in success state with positive feedback.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Cannot edit this field',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftElement: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with a search icon on the left side.',
      },
    },
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Enter amount',
    rightElement: <span className="text-muted-foreground font-medium">USD</span>,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with currency indicator on the right side.',
      },
    },
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: 'Enter URL',
    leftElement: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 0V3" />
      </svg>
    ),
    rightElement: (
      <button className="text-muted-foreground hover:text-foreground">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with both left icon and right clear button.',
      },
    },
  },
};

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Password',
    rightElement: (
      <button className="text-muted-foreground hover:text-foreground">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Password input with visibility toggle button.',
      },
    },
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    leftElement: <span className="text-muted-foreground">$</span>,
    rightElement: <span className="text-muted-foreground">.00</span>,
  },
  parameters: {
    docs: {
      description: {
        story: 'Number input formatted for currency with dollar sign and decimal places.',
      },
    },
  },
};

export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'you@example.com',
    leftElement: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Email input with envelope icon.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Input Sizes</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Small</label>
            <Input size="sm" placeholder="Small input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Default</label>
            <Input size="default" placeholder="Default input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Large</label>
            <Input size="lg" placeholder="Large input" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available input sizes with labels.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Input Variants</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Default</label>
            <Input variant="default" placeholder="Default styling" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Success</label>
            <Input variant="success" placeholder="Success state" defaultValue="Valid input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Error</label>
            <Input variant="error" placeholder="Error state" defaultValue="Invalid input" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available input variants showing different states.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">Contact Form</h3>
      <form className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Full Name</label>
          <Input 
            placeholder="John Doe" 
            helperText="Enter your full name as it appears on your ID"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <Input 
            type="email"
            placeholder="you@example.com"
            leftElement={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
            error="Please enter a valid email address"
            defaultValue="invalid-email"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Phone</label>
          <Input 
            type="tel"
            placeholder="(555) 123-4567"
            leftElement={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Website</label>
          <Input 
            type="url"
            placeholder="https://example.com"
            leftElement={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 0V3" />
              </svg>
            }
            helperText="Optional - your personal or company website"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Message</label>
          <Input 
            placeholder="Tell us about your project..."
            helperText="Provide any additional details"
          />
        </div>
      </form>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world contact form showing various input types and configurations.',
      },
    },
  },
};