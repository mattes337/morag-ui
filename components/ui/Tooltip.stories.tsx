import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A tooltip component for providing contextual information on hover or focus.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'The tooltip content',
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Button with tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click this button to perform an action</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="outline">
          ?
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Help information</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Long tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-xs">
          <p>This is a longer tooltip with multiple lines of text that provides more detailed information about the element.</p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

export const DifferentSides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-12 items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const CustomStyling: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-red-600 text-white">
          <p>This action cannot be undone</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Save</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-green-600 text-white">
          <p>Save your changes</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithKeyboardFocus: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        Use Tab to navigate and see tooltips on focus
      </p>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">First</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>First button tooltip</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Second</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Second button tooltip</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Third</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Third button tooltip</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips are accessible and work with keyboard navigation.',
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Interactive Elements with Tooltips</h3>
      <div className="grid grid-cols-2 gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-3 border rounded hover:bg-gray-50 text-left">
              <div className="font-medium">Profile Settings</div>
              <div className="text-sm text-muted-foreground">Manage your account</div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to open profile settings</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-3 border rounded hover:bg-gray-50 text-left">
              <div className="font-medium">Notifications</div>
              <div className="text-sm text-muted-foreground">3 new messages</div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View your notifications</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-3 border rounded hover:bg-gray-50 text-left">
              <div className="font-medium">Help & Support</div>
              <div className="text-sm text-muted-foreground">Get assistance</div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Access help documentation and support</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-3 border rounded hover:bg-gray-50 text-left">
              <div className="font-medium">Logout</div>
              <div className="text-sm text-muted-foreground">Sign out safely</div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign out of your account</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world example showing tooltips on various interactive elements.',
      },
    },
  },
};