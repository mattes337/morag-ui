import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A spinner component to indicate loading states with animated rotation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'The size of the spinner',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center space-y-2">
        <Spinner size="sm" />
        <p className="text-xs text-muted-foreground">Small</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="md" />
        <p className="text-xs text-muted-foreground">Medium</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="lg" />
        <p className="text-xs text-muted-foreground">Large</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="xl" />
        <p className="text-xs text-muted-foreground">Extra Large</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available spinner sizes displayed side by side.',
      },
    },
  },
};

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Spinner size="sm" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner combined with text for better user experience.',
      },
    },
  },
};

export const InButton: Story = {
  render: () => (
    <button 
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50" 
      disabled
    >
      <Spinner size="sm" />
      Loading...
    </button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner used within a button to indicate loading state.',
      },
    },
  },
};

export const InCard: Story = {
  render: () => (
    <div className="w-64 p-6 border rounded-lg">
      <div className="flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <div className="text-center">
          <p className="text-sm font-medium">Loading data</p>
          <p className="text-xs text-muted-foreground">Please wait while we fetch your information</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner used as a loading state within a card layout.',
      },
    },
  },
};

export const CustomColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center space-y-2">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-xs text-muted-foreground">Blue</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="lg" className="text-green-500" />
        <p className="text-xs text-muted-foreground">Green</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="lg" className="text-red-500" />
        <p className="text-xs text-muted-foreground">Red</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="lg" className="text-purple-500" />
        <p className="text-xs text-muted-foreground">Purple</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinners with custom colors using Tailwind CSS utilities.',
      },
    },
  },
};