import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction } from './Toast';
import { Button } from './Button';
import React from 'react';

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Toast notification component built on Radix UI primitives with multiple variants for displaying temporary messages.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'success', 'warning'],
      description: 'The visual variant of the toast',
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="relative">
          <Story />
          <ToastViewport />
        </div>
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Toast {...args}>
      <div className="grid gap-1">
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>This is a default toast notification.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  args: {
    variant: 'default',
  },
};

export const Success: Story = {
  render: () => (
    <Toast variant="success">
      <div className="grid gap-1">
        <ToastTitle>Success!</ToastTitle>
        <ToastDescription>Your changes have been saved successfully.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success toast for positive feedback.',
      },
    },
  },
};

export const Warning: Story = {
  render: () => (
    <Toast variant="warning">
      <div className="grid gap-1">
        <ToastTitle>Warning</ToastTitle>
        <ToastDescription>Please check your internet connection.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warning toast for cautionary messages.',
      },
    },
  },
};

export const Destructive: Story = {
  render: () => (
    <Toast variant="destructive">
      <div className="grid gap-1">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>Something went wrong. Please try again.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Destructive toast for error messages.',
      },
    },
  },
};

export const WithAction: Story = {
  render: () => (
    <Toast>
      <div className="grid gap-1">
        <ToastTitle>Update Available</ToastTitle>
        <ToastDescription>A new version of the app is available.</ToastDescription>
      </div>
      <ToastAction altText="Update now" onClick={fn()}>
        Update
      </ToastAction>
    </Toast>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with an action button.',
      },
    },
  },
};

export const TitleOnly: Story = {
  render: () => (
    <Toast>
      <ToastTitle>Settings saved</ToastTitle>
      <ToastClose />
    </Toast>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simple toast with title only.',
      },
    },
  },
};

export const LongContent: Story = {
  render: () => (
    <Toast>
      <div className="grid gap-1">
        <ToastTitle>File Upload Complete</ToastTitle>
        <ToastDescription>
          Your file "document-with-a-very-long-filename-that-might-wrap.pdf" has been uploaded successfully to the server and is now available for processing.
        </ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with longer content that may wrap to multiple lines.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Toast variant="default">
        <div className="grid gap-1">
          <ToastTitle>Default Toast</ToastTitle>
          <ToastDescription>This is a default notification message.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      
      <Toast variant="success">
        <div className="grid gap-1">
          <ToastTitle>Success Toast</ToastTitle>
          <ToastDescription>Operation completed successfully.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      
      <Toast variant="warning">
        <div className="grid gap-1">
          <ToastTitle>Warning Toast</ToastTitle>
          <ToastDescription>Please review your settings.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      
      <Toast variant="destructive">
        <div className="grid gap-1">
          <ToastTitle>Error Toast</ToastTitle>
          <ToastDescription>An error occurred during processing.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available toast variants displayed together.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [toasts, setToasts] = React.useState<Array<{ id: string; variant: 'default' | 'success' | 'warning' | 'destructive'; title: string; description: string; action?: boolean }>>([]);

    const addToast = (variant: 'default' | 'success' | 'warning' | 'destructive', title: string, description: string, action: boolean = false) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, variant, title, description, action }]);
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Try Toast Notifications</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => addToast('default', 'Info', 'This is an informational message.')}
              variant="outline"
              size="sm"
            >
              Show Info
            </Button>
            <Button 
              onClick={() => addToast('success', 'Success!', 'Operation completed successfully.')}
              variant="outline"
              size="sm"
            >
              Show Success
            </Button>
            <Button 
              onClick={() => addToast('warning', 'Warning', 'Please check your input.')}
              variant="outline"
              size="sm"
            >
              Show Warning
            </Button>
            <Button 
              onClick={() => addToast('destructive', 'Error', 'Something went wrong.')}
              variant="outline"
              size="sm"
            >
              Show Error
            </Button>
            <Button 
              onClick={() => addToast('default', 'Update Available', 'Click to install the latest version.', true)}
              variant="outline"
              size="sm"
            >
              Show with Action
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {toasts.map((toast) => (
              <Toast key={toast.id} variant={toast.variant}>
                <div className="grid gap-1">
                  <ToastTitle>{toast.title}</ToastTitle>
                  <ToastDescription>{toast.description}</ToastDescription>
                </div>
                {toast.action && (
                  <ToastAction altText="Take action" onClick={() => console.log('Action clicked')}>
                    Install
                  </ToastAction>
                )}
                <ToastClose onClick={() => removeToast(toast.id)} />
              </Toast>
            ))}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Interactive demo allowing you to trigger different toast notifications.',
      },
    },
  },
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold">Common Toast Scenarios</h3>
      
      <div className="space-y-3">
        <Toast variant="success">
          <div className="grid gap-1">
            <ToastTitle>Profile Updated</ToastTitle>
            <ToastDescription>Your profile information has been saved.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        
        <Toast variant="default">
          <div className="grid gap-1">
            <ToastTitle>Message Sent</ToastTitle>
            <ToastDescription>Your message was delivered to John Doe.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        
        <Toast variant="warning">
          <div className="grid gap-1">
            <ToastTitle>Storage Nearly Full</ToastTitle>
            <ToastDescription>You've used 95% of your storage space.</ToastDescription>
          </div>
          <ToastAction altText="Upgrade storage">
            Upgrade
          </ToastAction>
        </Toast>
        
        <Toast variant="destructive">
          <div className="grid gap-1">
            <ToastTitle>Upload Failed</ToastTitle>
            <ToastDescription>The file could not be uploaded. Please try again.</ToastDescription>
          </div>
          <ToastAction altText="Retry upload">
            Retry
          </ToastAction>
        </Toast>
        
        <Toast variant="default">
          <div className="grid gap-1">
            <ToastTitle>New Comment</ToastTitle>
            <ToastDescription>Sarah commented on your post "Getting Started with React".</ToastDescription>
          </div>
          <ToastAction altText="View comment">
            View
          </ToastAction>
        </Toast>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world examples of toast notifications in different scenarios.',
      },
    },
  },
};

export const StackedToasts: Story = {
  render: () => (
    <div className="space-y-2">
      <Toast variant="success">
        <div className="grid gap-1">
          <ToastTitle>File 1 uploaded</ToastTitle>
          <ToastDescription>document.pdf was uploaded successfully.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      
      <Toast variant="success">
        <div className="grid gap-1">
          <ToastTitle>File 2 uploaded</ToastTitle>
          <ToastDescription>image.jpg was uploaded successfully.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      
      <Toast variant="warning">
        <div className="grid gap-1">
          <ToastTitle>File 3 partially uploaded</ToastTitle>
          <ToastDescription>video.mp4 upload is 67% complete.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      
      <Toast variant="destructive">
        <div className="grid gap-1">
          <ToastTitle>File 4 failed</ToastTitle>
          <ToastDescription>archive.zip could not be uploaded.</ToastDescription>
        </div>
        <ToastAction altText="Retry">
          Retry
        </ToastAction>
      </Toast>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Multiple stacked toasts showing batch operation results.',
      },
    },
  },
};