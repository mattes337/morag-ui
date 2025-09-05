import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible avatar component with image support and fallback text, built on Radix UI primitives with multiple sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg', 'xl', '2xl', '3xl'],
      description: 'The size of the avatar',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: 'default',
  },
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://broken-image-url.png" alt="Broken image" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows fallback text when the image fails to load.',
      },
    },
  },
};

export const FallbackOnly: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with only fallback text, no image source provided.',
      },
    },
  },
};

export const Small: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: 'xl',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avatar Sizes</h3>
        <div className="flex items-center gap-4">
          <div className="text-center space-y-2">
            <Avatar size="sm">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback size="sm">SM</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">Small</p>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar size="default">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback size="default">DF</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">Default</p>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar size="lg">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback size="lg">LG</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">Large</p>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar size="xl">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback size="xl">XL</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">Extra Large</p>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar size="2xl">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback size="2xl">2X</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">2X Large</p>
          </div>
          
          <div className="text-center space-y-2">
            <Avatar size="3xl">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback size="3xl">3X</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">3X Large</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fallback Examples</h3>
        <div className="flex items-center gap-4">
          <Avatar size="default">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          
          <Avatar size="default">
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          
          <Avatar size="default">
            <AvatarFallback>MZ</AvatarFallback>
          </Avatar>
          
          <Avatar size="default">
            <AvatarFallback>UI</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'A comprehensive showcase of all avatar sizes and fallback examples.',
      },
    },
  },
};

export const UserList: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Members</h3>
      <div className="space-y-3">
        {[
          { name: 'John Doe', src: 'https://github.com/shadcn.png', fallback: 'JD' },
          { name: 'Sarah Wilson', src: '', fallback: 'SW' },
          { name: 'Mike Johnson', src: 'https://github.com/vercel.png', fallback: 'MJ' },
          { name: 'Emma Brown', src: '', fallback: 'EB' },
        ].map((user, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.src} alt={user.name} />
              <AvatarFallback>{user.fallback}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world usage example showing avatars in a user list.',
      },
    },
  },
};

export const AvatarGroup: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Avatar Group</h3>
      <div className="flex -space-x-2">
        <Avatar className="border-2 border-background">
          <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
          <AvatarFallback>U1</AvatarFallback>
        </Avatar>
        <Avatar className="border-2 border-background">
          <AvatarImage src="https://github.com/vercel.png" alt="User 2" />
          <AvatarFallback>U2</AvatarFallback>
        </Avatar>
        <Avatar className="border-2 border-background">
          <AvatarFallback>U3</AvatarFallback>
        </Avatar>
        <Avatar className="border-2 border-background">
          <AvatarFallback>U4</AvatarFallback>
        </Avatar>
        <Avatar className="border-2 border-background bg-muted">
          <AvatarFallback className="text-xs">+2</AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Overlapping avatars showing multiple users with an overflow indicator.',
      },
    },
  },
};