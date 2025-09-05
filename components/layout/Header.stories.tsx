import type { Meta, StoryObj } from '@storybook/react'
import { Header } from '@/components/layout'
import { mockUser, mockNotifications } from '@/components/layout/mockData'

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Top navigation header with user menu, realm switcher, and notifications'
      }
    }
  },
  args: {
    user: mockUser,
    currentRealm: mockUser.realms[0] || null,
    notifications: mockNotifications,
    unreadCount: 2,
  },
}

export default meta
type Story = StoryObj<typeof Header>

export const Default: Story = {
  decorators: [(Story) => (
    <div className="bg-background">
      <Story />
    </div>
  )],
}

export const NoNotifications: Story = {
  args: {
    notifications: [],
    unreadCount: 0,
  },
  decorators: [(Story) => (
    <div className="bg-background">
      <Story />
    </div>
  )],
}

export const ManyNotifications: Story = {
  args: {
    unreadCount: 15,
  },
  decorators: [(Story) => (
    <div className="bg-background">
      <Story />
    </div>
  )],
}

export const NoRealm: Story = {
  args: {
    currentRealm: null,
  },
  decorators: [(Story) => (
    <div className="bg-background">
      <Story />
    </div>
  )],
}

export const DifferentRealm: Story = {
  args: {
    currentRealm: mockUser.realms[1] || null,
  },
  decorators: [(Story) => (
    <div className="bg-background">
      <Story />
    </div>
  )],
}