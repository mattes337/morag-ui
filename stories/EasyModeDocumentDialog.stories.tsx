import type { Meta, StoryObj } from '@storybook/react';
import { EasyModeDocumentDialog } from '../components/dialogs/EasyModeDocumentDialog';
import { withMockAppProvider } from './MockAppProvider';
import { Toaster } from 'sonner';

const meta: Meta<typeof EasyModeDocumentDialog> = {
  title: 'Dialogs/EasyModeDocumentDialog',
  component: EasyModeDocumentDialog,
  decorators: [withMockAppProvider],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Easy mode document upload dialog with template selection. Provides a simplified interface for users to upload documents and choose from predefined processing templates.',
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
    onSwitchToExpert: {
      action: 'onSwitchToExpert',
      description: 'Callback when switching to expert mode',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EasyModeDocumentDialog>;

// Wrapper component to include Toaster for notifications
const DialogWrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <Toaster position="top-right" richColors />
  </>
);

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    onSwitchToExpert: () => console.log('Switched to expert mode'),
  },
  render: (args) => (
    <DialogWrapper>
      <EasyModeDocumentDialog {...args} />
    </DialogWrapper>
  ),
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Dialog closed'),
    onSwitchToExpert: () => console.log('Switched to expert mode'),
  },
  render: (args) => (
    <DialogWrapper>
      <EasyModeDocumentDialog {...args} />
      <div className="p-8 text-center text-gray-500">
        Dialog is closed. Set isOpen to true to see the dialog.
      </div>
    </DialogWrapper>
  ),
};

export const WithoutExpertModeSwitch: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    // No onSwitchToExpert prop - should hide the expert mode button
  },
  render: (args) => (
    <DialogWrapper>
      <EasyModeDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog without the expert mode switch button. Useful when you want to force users to use easy mode only.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    onSwitchToExpert: () => console.log('Switched to expert mode'),
  },
  render: (args) => (
    <DialogWrapper>
      <EasyModeDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo where you can test the full workflow: upload a file, enter a document name, select a template, and create the document. Note: Actual file processing is mocked in Storybook.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // You can add interactions here using @storybook/testing-library
    // For example, automatically opening certain tabs or filling forms
  },
};
