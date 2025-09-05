import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from './AuthLayout';

const meta = {
  title: 'Auth/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Centered authentication layout component providing consistent structure for authentication pages including login, register, forgot password, etc.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main title for the authentication page',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle/description',
    },
    backHref: {
      control: 'text',
      description: 'URL for the back button navigation',
    },
    backText: {
      control: 'text',
      description: 'Text for the back button',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the layout is in a loading state',
    },
    className: {
      control: 'text',
      description: 'Custom className for the main container',
    },
    cardClassName: {
      control: 'text',
      description: 'Custom className for the card container',
    },
    children: {
      control: false,
      description: 'Children components (typically forms)',
    },
  },
  args: {
    title: 'Sign In',
    children: (
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Sign In
        </button>
      </div>
    ),
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Sign In',
    subtitle: 'Welcome back! Please sign in to your account.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default authentication layout with title and subtitle.',
      },
    },
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Create Account',
    subtitle: 'Join thousands of users and start your journey today.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with a descriptive subtitle to provide additional context.',
      },
    },
  },
};

export const WithBackButton: Story = {
  args: {
    title: 'Forgot Password',
    subtitle: 'Enter your email address and we\'ll send you a reset link.',
    backHref: '/login',
    backText: '← Back to Sign In',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with back button for navigation to previous page.',
      },
    },
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Welcome to the MoRAG Platform Authentication System',
    subtitle: 'This is a very long subtitle that demonstrates how the layout handles longer text content and maintains proper spacing and readability across different screen sizes.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout handling longer titles and subtitles with proper text wrapping.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    title: 'Processing',
    subtitle: 'Please wait while we process your request...',
    loading: true,
    backHref: '/login',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout in loading state with disabled back button and loading indication.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    title: 'Custom Theme',
    subtitle: 'Example with custom styling applied.',
    className: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    cardClassName: 'border-2 border-blue-200 shadow-xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with custom background and card styling using className props.',
      },
    },
  },
};

export const MinimalContent: Story = {
  args: {
    title: 'Verify Email',
    children: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-600">Check your email for verification instructions.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with minimal content like confirmation messages or status displays.',
      },
    },
  },
};

export const ComplexForm: Story = {
  args: {
    title: 'Complete Registration',
    subtitle: 'Fill in all required information to create your account.',
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option>Select Organization</option>
          <option>Company A</option>
          <option>Company B</option>
        </select>
        <div className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <label className="text-sm text-gray-600">
            I agree to the Terms of Service and Privacy Policy
          </label>
        </div>
        <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Account
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout handling complex forms with multiple fields and various input types.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    title: 'Mobile Login',
    subtitle: 'Optimized for mobile devices',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Layout optimized for mobile viewing with responsive design.',
      },
    },
  },
};

export const AllVariations: Story = {
  render: (_args) => (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-center mb-8">AuthLayout Variations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Layout */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Basic</h3>
          <div style={{ transform: 'scale(0.6)', transformOrigin: 'top left', height: '300px' }}>
            <AuthLayout
              title="Sign In"
              subtitle="Welcome back"
              className="min-h-[500px]"
            >
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-blue-600 rounded"></div>
              </div>
            </AuthLayout>
          </div>
        </div>

        {/* With Back Button */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">With Back Button</h3>
          <div style={{ transform: 'scale(0.6)', transformOrigin: 'top left', height: '300px' }}>
            <AuthLayout
              title="Forgot Password"
              backHref="/login"
              className="min-h-[500px]"
            >
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-blue-600 rounded"></div>
              </div>
            </AuthLayout>
          </div>
        </div>

        {/* Loading State */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Loading</h3>
          <div style={{ transform: 'scale(0.6)', transformOrigin: 'top left', height: '300px' }}>
            <AuthLayout
              title="Processing..."
              loading={true}
              backHref="/login"
              className="min-h-[500px]"
            >
              <div className="space-y-3">
                <div className="h-10 bg-gray-100 rounded opacity-50"></div>
                <div className="h-10 bg-gray-100 rounded opacity-50"></div>
              </div>
            </AuthLayout>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Overview of all AuthLayout variations in a comparison view.',
      },
    },
  },
};