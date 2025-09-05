import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable checkbox component built on Radix UI primitives with multiple sizes, variants, and support for labels and descriptions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the checkbox',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'success'],
      description: 'The color variant of the checkbox',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    checked: {
      control: { type: 'select' },
      options: [true, false, 'indeterminate'],
      description: 'The checked state of the checkbox',
    },
    label: {
      control: 'text',
      description: 'Label text for the checkbox',
    },
    description: {
      control: 'text',
      description: 'Description text shown below the label',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
  args: {
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'default',
    variant: 'default',
    label: 'Accept terms and conditions',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Marketing emails',
    description: 'Receive emails about new products, features, and more.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with both label and description text.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Required field',
    description: 'This field must be checked to continue.',
    error: 'This field is required',
    checked: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox showing error state with error message.',
      },
    },
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked checkbox',
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Partially selected',
    checked: 'indeterminate',
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox in indeterminate state, often used for "select all" functionality.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked',
    disabled: true,
    checked: true,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small checkbox',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large checkbox',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    label: 'Delete all data',
    description: 'This action cannot be undone.',
    checked: true,
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Task completed',
    checked: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    'aria-label': 'Checkbox without visible label',
  },
  parameters: {
    docs: {
      description: {
        story: 'Standalone checkbox without label (ensure aria-label is provided for accessibility).',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Checkbox Sizes</h3>
        <div className="space-y-3">
          <Checkbox size="sm" label="Small checkbox" description="Compact size for tight layouts" />
          <Checkbox size="default" label="Default checkbox" description="Standard size for most use cases" />
          <Checkbox size="lg" label="Large checkbox" description="Larger size for emphasis or accessibility" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available checkbox sizes with labels and descriptions.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Checkbox Variants</h3>
        <div className="space-y-3">
          <Checkbox variant="default" checked label="Default variant" description="Standard primary color" />
          <Checkbox variant="destructive" checked label="Destructive variant" description="For dangerous actions" />
          <Checkbox variant="success" checked label="Success variant" description="For positive confirmations" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available checkbox color variants.',
      },
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Checkbox States</h3>
        <div className="space-y-3">
          <Checkbox label="Unchecked" checked={false} />
          <Checkbox label="Checked" checked={true} />
          <Checkbox label="Indeterminate" checked="indeterminate" />
          <Checkbox label="Disabled unchecked" disabled={true} checked={false} />
          <Checkbox label="Disabled checked" disabled={true} checked={true} />
          <Checkbox label="Disabled indeterminate" disabled={true} checked="indeterminate" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All possible checkbox states including disabled variations.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <h3 className="text-lg font-semibold">Settings</h3>
      <form className="space-y-4">
        <Checkbox 
          label="Email notifications"
          description="Receive email updates about your account"
          checked={true}
        />
        <Checkbox 
          label="SMS notifications"
          description="Receive text messages for important updates"
          checked={false}
        />
        <Checkbox 
          label="Marketing communications"
          description="Receive promotional emails and offers"
          checked={false}
        />
        <Checkbox 
          label="Data processing agreement"
          description="I agree to the processing of my personal data"
          error="This agreement is required"
          variant="destructive"
          checked={false}
        />
      </form>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world form example showing various checkbox configurations.',
      },
    },
  },
};

export const TaskList: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold">Project Tasks</h3>
      <div className="space-y-2">
        <Checkbox checked={true} label="Design system setup" variant="success" />
        <Checkbox checked={true} label="Component library" variant="success" />
        <Checkbox checked="indeterminate" label="Documentation" description="50% complete" />
        <Checkbox checked={false} label="Testing suite" />
        <Checkbox checked={false} label="Deployment pipeline" />
      </div>
      <div className="pt-2 border-t">
        <Checkbox checked="indeterminate" label="Select all tasks" size="sm" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Task list example showing different states and a "select all" checkbox.',
      },
    },
  },
};