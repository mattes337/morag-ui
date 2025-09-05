import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A separator component for dividing content sections. Built on Radix UI primitives with horizontal and vertical orientations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg'],
      description: 'The opacity/prominence of the separator',
    },
    decorative: {
      control: 'boolean',
      description: 'Whether the separator is purely decorative (default: true)',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-64">
      <p className="text-sm">Content above</p>
      <Separator {...args} className="my-4" />
      <p className="text-sm">Content below</p>
    </div>
  ),
  args: {
    orientation: 'horizontal',
    size: 'default',
  },
};

export const Horizontal: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <h4 className="font-semibold">Section 1</h4>
        <p className="text-sm text-muted-foreground">This is the first section of content.</p>
      </div>
      <Separator />
      <div>
        <h4 className="font-semibold">Section 2</h4>
        <p className="text-sm text-muted-foreground">This is the second section of content.</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal separator dividing content sections.',
      },
    },
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center space-x-4">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">42</span>
        <span className="text-xs text-muted-foreground">Projects</span>
      </div>
      <Separator orientation="vertical" />
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">1.2k</span>
        <span className="text-xs text-muted-foreground">Users</span>
      </div>
      <Separator orientation="vertical" />
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">99%</span>
        <span className="text-xs text-muted-foreground">Uptime</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical separators between statistics or metrics.',
      },
    },
  },
};

export const Small: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Content above</p>
      <Separator size="sm" className="my-4" />
      <p className="text-sm">Content below with subtle separator</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Subtle separator with reduced opacity.',
      },
    },
  },
};

export const Large: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Content above</p>
      <Separator size="lg" className="my-4" />
      <p className="text-sm">Content below with prominent separator</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Prominent separator with increased opacity.',
      },
    },
  },
};

export const InNavigation: Story = {
  render: () => (
    <nav className="flex items-center space-x-4 p-4 border rounded-lg">
      <a href="#" className="text-sm font-medium">Home</a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="text-sm font-medium">About</a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="text-sm font-medium">Services</a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="text-sm font-medium">Contact</a>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical separators in navigation menu.',
      },
    },
  },
};

export const InCard: Story = {
  render: () => (
    <div className="max-w-sm border rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="font-semibold">Product Title</h3>
        <p className="text-sm text-muted-foreground">Brief product description</p>
      </div>
      <Separator />
      <div className="p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">$99.99</span>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal separator dividing card content and actions.',
      },
    },
  },
};

export const InSidebar: Story = {
  render: () => (
    <div className="w-48 bg-muted/30 border rounded-lg p-4">
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Navigation</h4>
        <div className="space-y-1">
          <a href="#" className="block text-sm py-1 hover:text-primary">Dashboard</a>
          <a href="#" className="block text-sm py-1 hover:text-primary">Projects</a>
          <a href="#" className="block text-sm py-1 hover:text-primary">Tasks</a>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Account</h4>
        <div className="space-y-1">
          <a href="#" className="block text-sm py-1 hover:text-primary">Profile</a>
          <a href="#" className="block text-sm py-1 hover:text-primary">Settings</a>
          <a href="#" className="block text-sm py-1 hover:text-primary">Billing</a>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-1">
        <a href="#" className="block text-sm py-1 hover:text-primary">Help</a>
        <a href="#" className="block text-sm py-1 hover:text-primary">Logout</a>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal separators organizing sidebar menu sections.',
      },
    },
  },
};

export const AllOrientations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Horizontal Separators</h3>
        <div className="space-y-4 w-64">
          <div>
            <p className="text-sm mb-2">Default</p>
            <Separator />
          </div>
          <div>
            <p className="text-sm mb-2">Small (subtle)</p>
            <Separator size="sm" />
          </div>
          <div>
            <p className="text-sm mb-2">Large (prominent)</p>
            <Separator size="lg" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical Separators</h3>
        <div className="flex items-center h-16 space-x-4">
          <span className="text-sm">Item 1</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Item 2</span>
          <Separator orientation="vertical" size="sm" />
          <span className="text-sm">Item 3</span>
          <Separator orientation="vertical" size="lg" />
          <span className="text-sm">Item 4</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All separator orientations and sizes.',
      },
    },
  },
};

export const DashboardExample: Story = {
  render: () => (
    <div className="max-w-2xl border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-muted/30">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your metrics</p>
      </div>
      
      <Separator />
      
      {/* Stats Section */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">12.5k</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <Separator orientation="vertical" className="justify-self-center" />
          <div className="text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </div>
          <Separator orientation="vertical" className="justify-self-center" />
          <div className="text-center">
            <div className="text-2xl font-bold">$42k</div>
            <div className="text-sm text-muted-foreground">Revenue</div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Recent Activity */}
      <div className="p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">New user registration</span>
            <span className="text-xs text-muted-foreground">2 min ago</span>
          </div>
          <Separator size="sm" />
          <div className="flex items-center justify-between">
            <span className="text-sm">Payment received</span>
            <span className="text-xs text-muted-foreground">15 min ago</span>
          </div>
          <Separator size="sm" />
          <div className="flex items-center justify-between">
            <span className="text-sm">System update completed</span>
            <span className="text-xs text-muted-foreground">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Dashboard layout using separators to organize different content sections.',
      },
    },
  },
};