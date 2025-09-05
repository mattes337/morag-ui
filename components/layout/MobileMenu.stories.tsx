import type { Meta, StoryObj } from '@storybook/react'
import { MobileMenu } from '@/components/layout'
import { mockNavigation } from '@/components/layout/mockData'

const meta: Meta<typeof MobileMenu> = {
  title: 'Layout/MobileMenu',
  component: MobileMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Mobile navigation menu with backdrop and smooth animations'
      }
    },
    viewport: {
      defaultViewport: 'mobile1',
    }
  },
  args: {
    navigation: mockNavigation,
    currentPath: '/',
    isOpen: true,
    onClose: () => {},
  },
  argTypes: {
    onClose: { action: 'closed' },
  },
}

export default meta
type Story = StoryObj<typeof MobileMenu>

export const Open: Story = {
  decorators: [(Story) => (
    <div className="h-screen bg-background relative">
      <div className="p-4">
        <h1 className="text-xl font-bold">Mobile View</h1>
        <p>Background content should be visible with overlay</p>
      </div>
      <Story />
    </div>
  )],
}

export const Closed: Story = {
  args: {
    isOpen: false,
  },
  decorators: [(Story) => (
    <div className="h-screen bg-background relative">
      <div className="p-4">
        <h1 className="text-xl font-bold">Mobile View - Menu Closed</h1>
        <p>No overlay should be visible</p>
      </div>
      <Story />
    </div>
  )],
}

export const DocumentsActive: Story = {
  args: {
    currentPath: '/documents',
  },
  decorators: [(Story) => (
    <div className="h-screen bg-background relative">
      <div className="p-4">
        <h1 className="text-xl font-bold">Documents Section</h1>
      </div>
      <Story />
    </div>
  )],
}

export const NestedNavigation: Story = {
  args: {
    currentPath: '/settings/users',
  },
  decorators: [(Story) => (
    <div className="h-screen bg-background relative">
      <div className="p-4">
        <h1 className="text-xl font-bold">Settings - Users</h1>
      </div>
      <Story />
    </div>
  )],
}