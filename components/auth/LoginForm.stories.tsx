import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../../contexts/auth/AuthContext';

// Mock AuthContext with different states for stories
const MockAuthProvider = ({ 
  children, 
}: { 
  children: React.ReactNode;
  mockState?: { isLoading?: boolean; error?: string | null; user?: any };
}) => {
  // For Storybook, we'll wrap with the real AuthProvider but you could mock it differently
  return <AuthProvider>{children}</AuthProvider>;
};

const meta = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Login form component with validation, authentication integration, and social auth support. Handles email/password authentication with proper error states and loading indicators.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <MockAuthProvider>
          <Story />
        </MockAuthProvider>
      </div>
    ),
  ],
  argTypes: {
    onSuccess: {
      action: 'success',
      description: 'Callback called when login succeeds',
    },
    onSocialAuth: {
      action: 'social-auth',
      description: 'Callback called when social authentication is attempted',
    },
    showSocialAuth: {
      control: 'boolean',
      description: 'Whether to show social authentication buttons',
    },
    showForgotPassword: {
      control: 'boolean',
      description: 'Whether to show the forgot password link',
    },
    submitButtonText: {
      control: 'text',
      description: 'Custom text for the submit button',
    },
    className: {
      control: 'text',
      description: 'Custom CSS classes',
    },
  },
  args: {
    onSuccess: fn(),
    onSocialAuth: fn(),
    showSocialAuth: true,
    showForgotPassword: true,
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default login form with all features enabled including social auth and forgot password link.',
      },
    },
  },
};

export const WithoutSocialAuth: Story = {
  args: {
    showSocialAuth: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Login form without social authentication options.',
      },
    },
  },
};

export const WithoutForgotPassword: Story = {
  args: {
    showForgotPassword: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Login form without forgot password link.',
      },
    },
  },
};

export const MinimalForm: Story = {
  args: {
    showSocialAuth: false,
    showForgotPassword: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal login form with just email/password fields and submit button.',
      },
    },
  },
};

export const CustomSubmitText: Story = {
  args: {
    submitButtonText: 'Access Dashboard',
  },
  parameters: {
    docs: {
      description: {
        story: 'Login form with custom submit button text.',
      },
    },
  },
};

// Note: These error states would typically be controlled by the AuthContext
// In a real implementation, you'd mock the context to show these states
export const ValidationErrors: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Try submitting the form without filling in the fields to see validation errors.
        </p>
        <LoginForm {...args} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login form showing validation errors when submitted with invalid data. Click submit without filling fields to see errors.',
      },
    },
  },
};

export const FilledForm: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Form pre-filled with sample data to show the filled state.
        </p>
        <LoginForm {...args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const emailInput = document.querySelector('input[type="email"]');
              const passwordInput = document.querySelector('input[type="password"]');
              const rememberMe = document.querySelector('input[type="checkbox"]');
              if (emailInput) emailInput.value = 'user@example.com';
              if (passwordInput) passwordInput.value = 'password123';
              if (rememberMe) rememberMe.checked = true;
            }, 100);
          `
        }} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login form with pre-filled data showing the completed state.',
      },
    },
  },
};

export const PasswordVisibility: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Click the eye icon to toggle password visibility.
        </p>
        <LoginForm {...args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const passwordInput = document.querySelector('input[type="password"]');
              if (passwordInput) passwordInput.value = 'examplePassword123!';
            }, 100);
          `
        }} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the password visibility toggle functionality.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Demo:</strong> Login form in loading state with disabled fields and loading spinner.
      </p>
      {/* Mock loading state - in real app this would come from AuthContext */}
      <div className="w-full space-y-6">
        <form className="space-y-4" style={{ pointerEvents: 'none' }}>
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
            Signing you in...
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value="user@example.com"
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value="********"
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" disabled className="cursor-not-allowed opacity-50" />
              <label className="ml-2 text-sm text-gray-900 cursor-not-allowed opacity-50">Remember me</label>
            </div>
            <a className="text-sm text-blue-600 opacity-50 cursor-not-allowed">Forgot password?</a>
          </div>
          <button
            disabled
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 opacity-50 cursor-not-allowed"
          >
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </button>
        </form>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Login form in loading state showing disabled fields and loading indicators.',
      },
    },
  },
};

export const ErrorStates: Story = {
  render: (args) => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">General Error</h3>
        <div className="w-full space-y-6">
          <form className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm" role="alert">
              Authentication failed. Please try again.
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value="user@example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value="wrongpassword"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Sign In</button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Field-Specific Errors</h3>
        <div className="w-full space-y-6">
          <form className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value="invalid-email"
                className="block w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500"
              />
              <p className="text-sm text-red-600">Please enter a valid email address.</p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value=""
                className="block w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500"
              />
              <p className="text-sm text-red-600">Password is required.</p>
            </div>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different error states showing general errors and field-specific validation errors.',
      },
    },
  },
};

export const SocialAuthVariations: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">With All Social Providers</h3>
          <LoginForm {...args} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Social Auth Loading</h3>
          <div className="w-full space-y-6">
            <form className="space-y-4">
              <div className="space-y-1">
                <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded-md bg-gray-50 opacity-50" disabled />
              </div>
              <div className="space-y-1">
                <input type="password" placeholder="Password" className="w-full px-3 py-2 border rounded-md bg-gray-50 opacity-50" disabled />
              </div>
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md opacity-50" disabled>
                Sign In
              </button>
            </form>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="flex flex-row space-x-2">
                <button className="flex-1 flex items-center justify-center gap-2 h-10 text-sm px-4 border border-red-300 bg-white rounded-md opacity-50" disabled>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 h-10 text-sm px-4 border border-gray-300 bg-white rounded-md" disabled>
                  GitHub
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 h-10 text-sm px-4 border border-blue-300 bg-white rounded-md" disabled>
                  Microsoft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Social authentication variations including loading states.',
      },
    },
  },
};

export const AccessibilityFeatures: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Accessibility Features:</strong> This form includes proper ARIA labels, keyboard navigation, 
          screen reader support, and focus management. Try navigating with Tab key or screen reader.
        </p>
        <LoginForm {...args} />
        <div className="text-xs text-gray-500 space-y-1 mt-4 p-3 bg-gray-50 rounded">
          <p><strong>ARIA Features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Form has proper role and aria-label</li>
            <li>Error messages have aria-live="polite"</li>
            <li>Invalid fields have aria-describedby pointing to error messages</li>
            <li>Password toggle has descriptive aria-label</li>
            <li>Loading states are announced to screen readers</li>
          </ul>
        </div>
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including ARIA labels, keyboard navigation, and screen reader support.',
      },
    },
  },
};

export const AllFormStates: Story = {
  render: (args) => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center mb-8">LoginForm States Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Empty State</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider>
              <LoginForm showSocialAuth={false} />
            </MockAuthProvider>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">With Social Auth</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider>
              <LoginForm />
            </MockAuthProvider>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Error State</h3>
          <div className="border rounded-lg p-4">
            <div className="w-full space-y-6">
              <form className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                  Invalid credentials. Please try again.
                </div>
                <input type="email" placeholder="Email" className="w-full px-3 py-2 border border-red-300 rounded-md" />
                <input type="password" placeholder="Password" className="w-full px-3 py-2 border border-red-300 rounded-md" />
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Sign In</button>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Minimal Form</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider>
              <LoginForm showSocialAuth={false} showForgotPassword={false} />
            </MockAuthProvider>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comprehensive overview of all LoginForm variations and states in a single view.',
      },
    },
  },
};