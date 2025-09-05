import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A textarea component for multi-line text input with various sizes and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: 'The visual style variant of the textarea',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the textarea',
    },
    resize: {
      control: 'boolean',
      description: 'Whether the textarea can be resized',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display',
    },
  },
  args: {
    placeholder: 'Enter your text here...',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithError: Story = {
  args: {
    error: 'This field is required',
    variant: 'error',
  },
};

export const WithSuccess: Story = {
  args: {
    variant: 'success',
    helperText: 'Message saved successfully',
  },
};

export const WithHelperText: Story = {
  args: {
    helperText: 'Enter a detailed description (max 500 characters)',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'This textarea is disabled',
  },
};

export const NoResize: Story = {
  args: {
    resize: false,
    placeholder: 'This textarea cannot be resized',
  },
};

export const WithRows: Story = {
  args: {
    rows: 6,
    placeholder: 'This textarea has 6 rows initially',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Small</h3>
        <Textarea size="sm" placeholder="Small textarea" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Default</h3>
        <Textarea placeholder="Default textarea" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Large</h3>
        <Textarea size="lg" placeholder="Large textarea" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available textarea sizes.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Default</h3>
        <Textarea placeholder="Default variant" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">With Helper Text</h3>
        <Textarea 
          placeholder="Enter your message"
          helperText="This will be visible to other users"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Success</h3>
        <Textarea 
          variant="success"
          value="Great job! This looks perfect."
          helperText="Message validated successfully"
          readOnly
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Error</h3>
        <Textarea 
          variant="error"
          placeholder="Enter your message"
          error="Message must be at least 10 characters long"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Disabled</h3>
        <Textarea 
          disabled
          value="This field is currently unavailable"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All textarea variants and states.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Subject
        </label>
        <Textarea 
          size="sm"
          placeholder="Brief subject line"
          rows={2}
          resize={false}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Message
        </label>
        <Textarea 
          placeholder="Enter your detailed message here..."
          helperText="Minimum 50 characters required"
          rows={6}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Additional Notes (Optional)
        </label>
        <Textarea 
          size="lg"
          placeholder="Any additional information..."
          helperText="This field is optional"
          rows={4}
        />
      </div>
    </form>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of textareas in a form layout with labels and different configurations.',
      },
    },
  },
};