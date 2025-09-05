import type { Meta, StoryObj } from '@storybook/react'
import { DashboardLayout } from '@/components/layout'
import { mockUser, mockNavigation } from '@/components/layout/mockData'

const meta: Meta<typeof DashboardLayout> = {
  title: 'Layout/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main dashboard layout component with sidebar, header, and content area'
      }
    }
  },
  args: {
    user: mockUser,
    navigation: mockNavigation,
    currentRealm: mockUser.realms[0] || null,
    onRealmChange: () => {},
  },
  argTypes: {
    onRealmChange: { action: 'realm changed' },
  }
}

export default meta
type Story = StoryObj<typeof DashboardLayout>

export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Content</h1>
        <p>This is the main dashboard content area.</p>
      </div>
    ),
  },
}

export const WithCards: Story = {
  args: {
    children: (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Documents</h3>
            <p className="text-2xl font-bold">147</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Processing</h3>
            <p className="text-2xl font-bold">3</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-2xl font-bold">98%</p>
          </div>
        </div>
      </div>
    ),
  },
}

export const LongContent: Story = {
  args: {
    children: (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Long Content Example</h1>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="mb-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Content Block {i + 1}</h3>
            <p>This is example content to demonstrate scrolling behavior in the dashboard layout.</p>
          </div>
        ))}
      </div>
    ),
  },
}