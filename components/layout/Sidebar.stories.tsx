import type { Meta, StoryObj } from '@storybook/react'
import { Sidebar } from '@/components/layout'
import { mockNavigation } from '@/components/layout/mockData'

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Collapsible sidebar navigation with active states and nested items'
      }
    }
  },
  args: {
    navigation: mockNavigation,
    currentPath: '/',
  },
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Expanded: Story = {
  args: {},
  decorators: [(Story) => (
    <div className="h-screen bg-background">
      <Story />
    </div>
  )],
}

export const DocumentsActive: Story = {
  args: {
    currentPath: '/documents',
  },
  decorators: [(Story) => (
    <div className="h-screen bg-background">
      <Story />
    </div>
  )],
}

export const SearchActive: Story = {
  args: {
    currentPath: '/search',
  },
  decorators: [(Story) => (
    <div className="h-screen bg-background">
      <Story />
    </div>
  )],
}

export const NestedActive: Story = {
  args: {
    currentPath: '/documents/recent',
  },
  decorators: [(Story) => (
    <div className="h-screen bg-background">
      <Story />
    </div>
  )],
}

export const SettingsActive: Story = {
  args: {
    currentPath: '/settings/users',
  },
  decorators: [(Story) => (
    <div className="h-screen bg-background">
      <Story />
    </div>
  )],
}