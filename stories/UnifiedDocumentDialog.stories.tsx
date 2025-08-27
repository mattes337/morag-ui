import type { Meta, StoryObj } from '@storybook/react';
import { UnifiedDocumentDialog } from '../components/dialogs/UnifiedDocumentDialog';
import { withMockAppProvider } from './MockAppProvider';
import { Toaster } from 'sonner';

const meta: Meta<typeof UnifiedDocumentDialog> = {
  title: 'Dialogs/UnifiedDocumentDialog',
  component: UnifiedDocumentDialog,
  decorators: [withMockAppProvider],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Unified document dialog that can switch between easy and expert modes. This is the main entry point for document upload with mode switching capabilities.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    onClose: {
      action: 'onClose',
      description: 'Callback when dialog is closed',
    },
    initialMode: {
      control: 'select',
      options: ['easy', 'expert'],
      description: 'Initial mode when dialog opens',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UnifiedDocumentDialog>;

// Wrapper component to include Toaster for notifications
const DialogWrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <Toaster position="top-right" richColors />
  </>
);

export const EasyModeDefault: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    initialMode: 'easy',
  },
  render: (args) => (
    <DialogWrapper>
      <UnifiedDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Unified dialog starting in easy mode. Users can switch to expert mode using the button in the header.',
      },
    },
  },
};

export const ExpertModeDefault: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    initialMode: 'expert',
  },
  render: (args) => (
    <DialogWrapper>
      <UnifiedDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Unified dialog starting in expert mode. Users can switch to easy mode using the button in the header.',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Dialog closed'),
    initialMode: 'easy',
  },
  render: (args) => (
    <DialogWrapper>
      <UnifiedDocumentDialog {...args} />
      <div className="p-8 text-center text-gray-500">
        Dialog is closed. Set isOpen to true to see the dialog.
      </div>
    </DialogWrapper>
  ),
};

export const ModeSwitchingDemo: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    initialMode: 'easy',
  },
  render: (args) => (
    <DialogWrapper>
      <UnifiedDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing mode switching capabilities. Click the mode switch buttons to see how the dialog transitions between easy and expert modes while preserving state.',
      },
    },
  },
};
