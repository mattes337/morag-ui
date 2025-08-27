import type { Meta, StoryObj } from '@storybook/react';
import { ExpertModeDocumentDialog } from '../components/dialogs/ExpertModeDocumentDialog';
import { withMockAppProvider } from './MockAppProvider';
import { Toaster } from 'sonner';

const meta: Meta<typeof ExpertModeDocumentDialog> = {
  title: 'Dialogs/ExpertModeDocumentDialog',
  component: ExpertModeDocumentDialog,
  decorators: [withMockAppProvider],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Expert mode document upload dialog with full stage configuration. Provides advanced users with complete control over all processing stages and their parameters.',
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
    onSwitchToEasy: {
      action: 'onSwitchToEasy',
      description: 'Callback when switching to easy mode',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExpertModeDocumentDialog>;

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
    onSwitchToEasy: () => console.log('Switched to easy mode'),
  },
  render: (args) => (
    <DialogWrapper>
      <ExpertModeDocumentDialog {...args} />
    </DialogWrapper>
  ),
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Dialog closed'),
    onSwitchToEasy: () => console.log('Switched to easy mode'),
  },
  render: (args) => (
    <DialogWrapper>
      <ExpertModeDocumentDialog {...args} />
      <div className="p-8 text-center text-gray-500">
        Dialog is closed. Set isOpen to true to see the dialog.
      </div>
    </DialogWrapper>
  ),
};

export const WithoutEasyModeSwitch: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    // No onSwitchToEasy prop - should hide the easy mode button
  },
  render: (args) => (
    <DialogWrapper>
      <ExpertModeDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog without the easy mode switch button. Useful when you want to force users to use expert mode only.',
      },
    },
  },
};

export const ConfigurationFocused: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    onSwitchToEasy: () => console.log('Switched to easy mode'),
  },
  render: (args) => (
    <DialogWrapper>
      <ExpertModeDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Expert mode dialog showcasing the advanced configuration capabilities. Users can configure each processing stage individually with full control over all parameters.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Auto-navigate to configuration tab for demo purposes
    const canvas = canvasElement;
    setTimeout(() => {
      const configTab = canvas.querySelector('[value="configure"]') as HTMLElement;
      if (configTab) {
        configTab.click();
      }
    }, 500);
  },
};

export const ReviewFocused: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
    onSwitchToEasy: () => console.log('Switched to easy mode'),
  },
  render: (args) => (
    <DialogWrapper>
      <ExpertModeDocumentDialog {...args} />
    </DialogWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Expert mode dialog showing the review step where users can see a summary of their configuration before creating the document.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Auto-navigate to review tab for demo purposes
    const canvas = canvasElement;
    setTimeout(() => {
      const reviewTab = canvas.querySelector('[value="review"]') as HTMLElement;
      if (reviewTab) {
        reviewTab.click();
      }
    }, 500);
  },
};
