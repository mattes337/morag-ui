import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { SocialAuthButtons } from './SocialAuthButtons';
// import type { SocialProvider } from './SocialAuthButtons';

const meta = {
  title: 'Auth/SocialAuthButtons',
  component: SocialAuthButtons,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Social authentication buttons component for supported providers (Google, GitHub, Microsoft). Provides configurable layout, loading states, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    providers: {
      control: 'check',
      options: ['google', 'github', 'microsoft'],
      description: 'List of providers to show. If not specified, shows all supported providers',
    },
    onProviderClick: {
      action: 'provider-clicked',
      description: 'Callback when a provider button is clicked',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the buttons are in a loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the buttons are disabled',
    },
    layout: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Layout direction for the buttons',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the buttons',
    },
    buttonText: {
      control: 'text',
      description: 'Text to show before provider name',
    },
    showText: {
      control: 'boolean',
      description: 'Whether to show text or just icons',
    },
    className: {
      control: 'text',
      description: 'Custom CSS classes',
    },
  },
  args: {
    providers: ['google', 'github', 'microsoft'],
    onProviderClick: fn(),
    loading: false,
    disabled: false,
    layout: 'horizontal',
    size: 'medium',
    buttonText: 'Sign in with',
    showText: true,
  },
} satisfies Meta<typeof SocialAuthButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default social authentication buttons showing all supported providers in horizontal layout.',
      },
    },
  },
};

export const VerticalLayout: Story = {
  args: {
    layout: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: 'Social authentication buttons arranged in vertical layout, useful for narrow containers.',
      },
    },
  },
};

export const IconsOnly: Story = {
  args: {
    showText: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Social authentication buttons showing only icons without text, perfect for compact layouts.',
      },
    },
  },
};

export const IconsOnlyVertical: Story = {
  args: {
    showText: false,
    layout: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons in vertical layout for maximum space efficiency.',
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small-sized social authentication buttons for compact interfaces.',
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    size: 'large',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large-sized social authentication buttons for prominent placement.',
      },
    },
  },
};

export const SingleProvider: Story = {
  args: {
    providers: ['google'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Single provider configuration showing only Google authentication.',
      },
    },
  },
};

export const TwoProviders: Story = {
  args: {
    providers: ['google', 'github'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Two provider configuration showing Google and GitHub authentication options.',
      },
    },
  },
};

export const CustomText: Story = {
  args: {
    buttonText: 'Continue with',
  },
  parameters: {
    docs: {
      description: {
        story: 'Social authentication buttons with custom button text.',
      },
    },
  },
};

export const SignUpContext: Story = {
  args: {
    buttonText: 'Sign up with',
  },
  parameters: {
    docs: {
      description: {
        story: 'Social authentication buttons configured for sign-up context.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Social authentication buttons in loading state showing spinner and disabled interaction.',
      },
    },
  },
};

export const DisabledState: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Social authentication buttons in disabled state preventing user interaction.',
      },
    },
  },
};

export const LoadingIndividualProvider: Story = {
  render: (_args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Demo:</strong> Individual provider loading states. In real usage, only the clicked provider would show loading.
      </p>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Google Loading</h4>
          <div className="flex flex-row space-x-2">
            <button className="flex-1 flex items-center justify-center gap-2 h-10 text-sm px-4 border border-red-300 bg-white rounded-md">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 h-10 text-sm px-4 border border-gray-300 bg-white rounded-md opacity-50" disabled>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Sign in with GitHub</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 h-10 text-sm px-4 border border-blue-300 bg-white rounded-md opacity-50" disabled>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#00A4EF" d="M13 1h10v10H13z" />
                <path fill="#7FBA00" d="M1 13h10v10H1z" />
                <path fill="#FFB900" d="M13 13h10v10H13z" />
              </svg>
              <span className="font-medium">Sign in with Microsoft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates individual provider loading states as they would appear during authentication.',
      },
    },
  },
};

export const CustomProviderOrder: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">GitHub First</h4>
        <SocialAuthButtons 
          providers={['github', 'google', 'microsoft']} 
          onProviderClick={args.onProviderClick || fn()}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Microsoft Only</h4>
        <SocialAuthButtons 
          providers={['microsoft']} 
          onProviderClick={args.onProviderClick || fn()}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Google + Microsoft</h4>
        <SocialAuthButtons 
          providers={['google', 'microsoft']} 
          onProviderClick={args.onProviderClick || fn()}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different provider combinations and ordering options for various use cases.',
      },
    },
  },
};

export const ResponsiveDemo: Story = {
  render: (args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Responsive Behavior</h3>
      
      <div className="space-y-4">
        <div className="w-80">
          <h4 className="text-sm font-medium mb-2">Wide Container (Horizontal)</h4>
          <div className="border rounded p-4">
            <SocialAuthButtons {...args} layout="horizontal" />
          </div>
        </div>
        
        <div className="w-48">
          <h4 className="text-sm font-medium mb-2">Narrow Container (Vertical Better)</h4>
          <div className="border rounded p-4">
            <SocialAuthButtons {...args} layout="vertical" />
          </div>
        </div>
        
        <div className="w-32">
          <h4 className="text-sm font-medium mb-2">Very Narrow (Icons Only)</h4>
          <div className="border rounded p-4">
            <SocialAuthButtons {...args} layout="vertical" showText={false} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how different layout options work in various container widths.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Button Sizes</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Small Size</h4>
          <SocialAuthButtons {...args} size="small" providers={['google', 'github']} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Medium Size (Default)</h4>
          <SocialAuthButtons {...args} size="medium" providers={['google', 'github']} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Large Size</h4>
          <SocialAuthButtons {...args} size="large" providers={['google', 'github']} />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Icon-Only Sizes</h4>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Small</p>
            <SocialAuthButtons {...args} size="small" showText={false} providers={['google']} />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Medium</p>
            <SocialAuthButtons {...args} size="medium" showText={false} providers={['google']} />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Large</p>
            <SocialAuthButtons {...args} size="large" showText={false} providers={['google']} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes for both text and icon-only variants.',
      },
    },
  },
};

export const InteractionStates: Story = {
  render: (args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Interaction States</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Normal State</h4>
          <SocialAuthButtons {...args} providers={['google']} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Loading State</h4>
          <SocialAuthButtons {...args} providers={['google']} loading={true} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Disabled State</h4>
          <SocialAuthButtons {...args} providers={['google']} disabled={true} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Hover State (Hover over buttons)</h4>
          <div className="p-2 border rounded">
            <p className="text-xs text-gray-500 mb-2">Hover over the buttons to see the hover effects</p>
            <SocialAuthButtons {...args} providers={['google', 'github']} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different interaction states including normal, loading, disabled, and hover effects.',
      },
    },
  },
};

export const AccessibilityFeatures: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Accessibility Features:</strong> These buttons include comprehensive accessibility support
        with proper ARIA labels, keyboard navigation, and semantic HTML.
      </p>
      <SocialAuthButtons {...args} />
      <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
        <p><strong>Accessibility Features:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Buttons have descriptive aria-label attributes</li>
          <li>Proper keyboard navigation with Tab and Enter/Space</li>
          <li>Focus indicators for keyboard users</li>
          <li>Loading state is announced to screen readers</li>
          <li>Icons are aria-hidden with text providing context</li>
          <li>Disabled state properly communicated</li>
          <li>High contrast colors for better visibility</li>
        </ul>
        <p className="mt-2"><strong>Try:</strong> Navigate with Tab key and activate with Enter or Space</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the comprehensive accessibility features of the social authentication buttons.',
      },
    },
  },
};

export const AllVariations: Story = {
  render: (_args) => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center mb-8">SocialAuthButtons Variations</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Layouts</h3>
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Horizontal</h4>
              <SocialAuthButtons layout="horizontal" providers={['google', 'github']} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Vertical</h4>
              <SocialAuthButtons layout="vertical" providers={['google', 'github']} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sizes</h3>
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Small</h4>
              <SocialAuthButtons size="small" providers={['google']} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Medium</h4>
              <SocialAuthButtons size="medium" providers={['google']} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Large</h4>
              <SocialAuthButtons size="large" providers={['google']} />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">States</h3>
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Normal</h4>
              <SocialAuthButtons providers={['google']} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Loading</h4>
              <SocialAuthButtons providers={['google']} loading={true} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Disabled</h4>
              <SocialAuthButtons providers={['google']} disabled={true} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Display Options</h3>
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">With Text</h4>
              <SocialAuthButtons providers={['google']} showText={true} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Icons Only</h4>
              <SocialAuthButtons providers={['google', 'github', 'microsoft']} showText={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comprehensive overview of all SocialAuthButtons variations and configurations in a single view.',
      },
    },
  },
};