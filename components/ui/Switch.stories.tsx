import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle switch component built on Radix UI primitives with multiple sizes, variants, and support for labels and descriptions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the switch',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'destructive'],
      description: 'The color variant of the switch',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    checked: {
      control: 'boolean',
      description: 'The checked state of the switch',
    },
    label: {
      control: 'text',
      description: 'Label text for the switch',
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
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'default',
    variant: 'default',
    label: 'Enable notifications',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Email notifications',
    description: 'Receive email updates about your account activity',
    checked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Switch with both label and description text.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Required setting',
    description: 'This setting must be enabled to continue',
    error: 'This option is required',
    checked: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Switch showing error state with error message.',
      },
    },
  },
};

export const Checked: Story = {
  args: {
    label: 'Enabled feature',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled switch',
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled but checked',
    disabled: true,
    checked: true,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small switch',
    checked: true,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large switch',
    checked: true,
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Feature enabled',
    checked: true,
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Experimental feature',
    description: 'This feature is in beta and may not work as expected',
    checked: true,
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    label: 'Delete on exit',
    description: 'Permanently delete all data when closing the application',
    checked: false,
  },
};

export const WithoutLabel: Story = {
  args: {
    'aria-label': 'Toggle setting',
    checked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Standalone switch without visible label (ensure aria-label is provided for accessibility).',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Switch Sizes</h3>
        <div className="space-y-4">
          <Switch size="sm" label="Small switch" description="Compact size for tight layouts" />
          <Switch size="default" label="Default switch" description="Standard size for most use cases" checked />
          <Switch size="lg" label="Large switch" description="Larger size for emphasis or accessibility" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available switch sizes with labels and descriptions.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Switch Variants</h3>
        <div className="space-y-4">
          <Switch variant="default" checked label="Default variant" description="Standard primary color" />
          <Switch variant="success" checked label="Success variant" description="For positive confirmations" />
          <Switch variant="warning" checked label="Warning variant" description="For cautionary actions" />
          <Switch variant="destructive" checked label="Destructive variant" description="For dangerous actions" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available switch color variants.',
      },
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Switch States</h3>
        <div className="space-y-4">
          <Switch label="Unchecked" checked={false} />
          <Switch label="Checked" checked={true} />
          <Switch label="Disabled unchecked" disabled={true} checked={false} />
          <Switch label="Disabled checked" disabled={true} checked={true} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All possible switch states including disabled variations.',
      },
    },
  },
};

export const SettingsExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <h3 className="text-lg font-semibold">App Settings</h3>
      <div className="space-y-4">
        <Switch 
          label="Push notifications"
          description="Receive push notifications on this device"
          checked={true}
        />
        <Switch 
          label="Email notifications"
          description="Receive email updates about your activity"
          checked={false}
        />
        <Switch 
          label="Auto-save"
          description="Automatically save your work every 30 seconds"
          checked={true}
        />
        <Switch 
          label="Dark mode"
          description="Use dark theme throughout the application"
          checked={false}
        />
        <Switch 
          variant="warning"
          label="Beta features"
          description="Enable experimental features (may be unstable)"
          checked={false}
        />
        <Switch 
          variant="destructive"
          label="Data collection"
          description="Allow collection of usage analytics"
          checked={false}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Settings panel showing various switch configurations.',
      },
    },
  },
};

export const PrivacySettings: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="text-lg font-semibold">Privacy Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Control how your information is used and shared
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Profile Visibility</h4>
          <div className="space-y-3">
            <Switch 
              label="Public profile"
              description="Make your profile visible to other users"
              checked={true}
            />
            <Switch 
              label="Show online status"
              description="Let others see when you're online"
              checked={false}
            />
            <Switch 
              label="Show activity status"
              description="Display your recent activity to followers"
              checked={true}
            />
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Data & Analytics</h4>
          <div className="space-y-3">
            <Switch 
              variant="warning"
              label="Usage analytics"
              description="Help improve our service by sharing anonymous usage data"
              checked={true}
            />
            <Switch 
              variant="destructive"
              label="Personalized ads"
              description="Use your data to show more relevant advertisements"
              checked={false}
            />
            <Switch 
              variant="destructive"
              label="Third-party sharing"
              description="Share your data with trusted partners"
              checked={false}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Privacy settings with grouped options and appropriate color coding.',
      },
    },
  },
};

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <h3 className="text-lg font-semibold">Accessibility Settings</h3>
      <div className="space-y-4">
        <Switch 
          size="lg"
          label="High contrast mode"
          description="Increase contrast for better visibility"
          checked={false}
        />
        <Switch 
          size="lg"
          label="Large text"
          description="Increase text size throughout the app"
          checked={true}
        />
        <Switch 
          size="lg"
          label="Reduced motion"
          description="Minimize animations and transitions"
          checked={false}
        />
        <Switch 
          size="lg"
          variant="success"
          label="Screen reader support"
          description="Optimize interface for screen readers"
          checked={true}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Accessibility settings using larger switches for better usability.',
      },
    },
  },
};

export const FeatureToggles: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="text-lg font-semibold">Feature Flags</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enable or disable experimental features
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <Switch 
            variant="success"
            label="New Dashboard UI"
            description="Modern dashboard with improved navigation"
            checked={true}
          />
        </div>
        
        <div className="border rounded-lg p-4">
          <Switch 
            variant="warning"
            label="AI Recommendations"
            description="Beta feature: Get AI-powered content suggestions"
            checked={false}
          />
        </div>
        
        <div className="border rounded-lg p-4">
          <Switch 
            variant="warning"
            label="Advanced Search"
            description="Enhanced search with filters and sorting"
            checked={true}
          />
        </div>
        
        <div className="border rounded-lg p-4 opacity-75">
          <Switch 
            disabled
            label="Real-time Collaboration"
            description="Coming soon: Work together in real-time"
            checked={false}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Feature toggles for a development or admin interface.',
      },
    },
  },
};