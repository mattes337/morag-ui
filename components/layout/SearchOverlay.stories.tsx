import type { Meta, StoryObj } from '@storybook/react'
import { SearchOverlay } from '@/components/layout'

const meta: Meta<typeof SearchOverlay> = {
  title: 'Layout/SearchOverlay',
  component: SearchOverlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Command palette style search overlay with keyboard navigation'
      }
    }
  },
  args: {
    isOpen: true,
    onClose: () => {},
    onSearch: () => {},
  },
  argTypes: {
    onClose: { action: 'closed' },
    onSearch: { action: 'searched' },
  },
}

export default meta
type Story = StoryObj<typeof SearchOverlay>

export const Open: Story = {
  decorators: [(Story) => (
    <div className="h-screen bg-background relative">
      <div className="p-6">
        <h1>Background Content</h1>
        <p>This content should be blurred when overlay is open</p>
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
      <div className="p-6">
        <h1>Background Content</h1>
        <p>Search overlay is closed - background should be clear</p>
      </div>
      <Story />
    </div>
  )],
}

export const WithBackground: Story = {
  decorators: [(Story) => (
    <div className="h-screen bg-background relative">
      <div className="p-6">
        <h1>Background Content</h1>
      </div>
      <Story />
    </div>
  )],
}