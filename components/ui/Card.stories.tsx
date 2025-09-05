import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';
import { Button } from './Button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections. Built with CVA for consistent styling and multiple variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'elevated', 'ghost'],
      description: 'The visual style variant of the card',
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'default', 'lg'],
      description: 'The padding size of the card',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card. You can put any content here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
  args: {
    variant: 'default',
    padding: 'default',
  },
};

export const Outlined: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>This card has an outlined variant</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with subtle shadow and border styling.</p>
      </CardContent>
    </Card>
  ),
  args: {
    variant: 'outlined',
  },
};

export const Elevated: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>This card has elevated styling</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with more prominent shadow for elevation effect.</p>
      </CardContent>
    </Card>
  ),
  args: {
    variant: 'elevated',
  },
};

export const Ghost: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Ghost Card</CardTitle>
        <CardDescription>This card has no background or border</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Minimal styling with transparent background.</p>
      </CardContent>
    </Card>
  ),
  args: {
    variant: 'ghost',
  },
};

export const WithoutPadding: Story = {
  render: (args) => (
    <Card {...args}>
      <div className="p-6">
        <h3 className="text-lg font-semibold">Custom Padding</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This card has no default padding, allowing for custom layouts.
        </p>
      </div>
      <div className="bg-muted p-4">
        <p className="text-sm">Different section with custom background</p>
      </div>
    </Card>
  ),
  args: {
    padding: 'none',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with no padding, allowing for fully custom layouts and styling.',
      },
    },
  },
};

export const SmallPadding: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Compact Card</CardTitle>
        <CardDescription>Card with smaller padding</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card uses small padding for a more compact layout.</p>
      </CardContent>
    </Card>
  ),
  args: {
    padding: 'sm',
  },
};

export const LargePadding: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Spacious Card</CardTitle>
        <CardDescription>Card with larger padding</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card uses large padding for a more spacious layout.</p>
      </CardContent>
    </Card>
  ),
  args: {
    padding: 'lg',
  },
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-80">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">Product Image</span>
      </div>
      <CardHeader>
        <CardTitle>Premium Headphones</CardTitle>
        <CardDescription>High-quality wireless headphones with noise cancellation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">$299.99</span>
          <span className="text-sm text-muted-foreground line-through">$399.99</span>
        </div>
        <p className="text-sm text-green-600 mt-1">25% off</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button className="flex-1">Add to Cart</Button>
        <Button variant="outline" size="icon">♥</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world example of a product card with image, pricing, and actions.',
      },
    },
  },
};

export const StatsCard: Story = {
  render: () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <span className="text-2xl">💰</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$45,231.89</div>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard stats card showing key metrics with growth indicators.',
      },
    },
  },
};

export const NotificationCard: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <CardTitle className="text-base">New Message</CardTitle>
          <span className="text-xs text-muted-foreground">2 min ago</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">You have a new message from John Doe. Click to view the full conversation.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">Dismiss</Button>
        <Button size="sm">View Message</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Notification card with status indicator and action buttons.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>Standard card styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Basic card with default border and background.</p>
        </CardContent>
      </Card>
      
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined Card</CardTitle>
          <CardDescription>Card with subtle shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Enhanced border with light shadow effect.</p>
        </CardContent>
      </Card>
      
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>Card with prominent shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">More prominent shadow for depth and emphasis.</p>
        </CardContent>
      </Card>
      
      <Card variant="ghost">
        <CardHeader>
          <CardTitle>Ghost Card</CardTitle>
          <CardDescription>Minimal transparent card</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">No background or border, minimal styling.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'A showcase of all card variants side by side.',
      },
    },
  },
};

export const PaddingSizes: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <Card padding="none">
        <div className="p-3">
          <h4 className="font-semibold">No Padding</h4>
          <p className="text-sm text-muted-foreground">Custom padding applied manually</p>
        </div>
      </Card>
      
      <Card padding="sm">
        <h4 className="font-semibold">Small Padding</h4>
        <p className="text-sm text-muted-foreground">Compact spacing</p>
      </Card>
      
      <Card padding="default">
        <h4 className="font-semibold">Default Padding</h4>
        <p className="text-sm text-muted-foreground">Standard spacing</p>
      </Card>
      
      <Card padding="lg">
        <h4 className="font-semibold">Large Padding</h4>
        <p className="text-sm text-muted-foreground">Spacious layout</p>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of different padding sizes available for cards.',
      },
    },
  },
};