import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthProvider } from '../../contexts/auth/AuthContext';

// Mock AuthContext wrapper
const MockAuthProvider = ({ 
  children, 
}: { 
  children: React.ReactNode;
  mockState?: { isLoading?: boolean; error?: string | null };
}) => {
  return <AuthProvider>{children}</AuthProvider>;
};

const meta = {
  title: 'Auth/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Forgot password form component for requesting password reset. Handles email validation, submission states, and provides user feedback for the password recovery process.',
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
      action: 'password-reset-requested',
      description: 'Callback called when password reset request succeeds',
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
  },
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default forgot password form with email input and submit button.',
      },
    },
  },
};

export const CustomSubmitText: Story = {
  args: {
    submitButtonText: 'Request Reset Link',
  },
  parameters: {
    docs: {
      description: {
        story: 'Forgot password form with custom submit button text.',
      },
    },
  },
};

export const FilledForm: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Form pre-filled with sample email address.
        </p>
        <ForgotPasswordForm {...args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const emailInput = document.querySelector('input[type="email"]');
              if (emailInput) {
                emailInput.value = 'user@example.com';
                const event = new Event('input', { bubbles: true });
                emailInput.dispatchEvent(event);
              }
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
        story: 'Forgot password form with pre-filled email showing the completed state.',
      },
    },
  },
};

export const ValidationDemo: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Try submitting the form without entering an email or with invalid email format to see validation errors.
        </p>
        <ForgotPasswordForm {...args} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates client-side validation. Submit without email or with invalid format to see errors.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: (_args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Demo:</strong> Form in loading state while processing the password reset request.
      </p>
      <div className="w-full space-y-6">
        <form className="space-y-4" style={{ pointerEvents: 'none' }}>
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
            Sending reset link...
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
          
          <button
            disabled
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 opacity-50 cursor-not-allowed"
          >
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            We'll send a password reset link to your email if an account exists.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Forgot password form in loading state with disabled fields and loading indicators.',
      },
    },
  },
};

export const SuccessState: Story = {
  render: (_args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Demo:</strong> Success state after password reset request has been sent.
      </p>
      <div className="w-full space-y-6">
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <h4 className="text-sm font-medium">Reset link sent</h4>
          </div>
          <p className="text-sm mt-2">
            We've sent a password reset link to <strong>user@example.com</strong>. 
            Check your inbox and follow the instructions to reset your password.
          </p>
        </div>
        
        <form className="space-y-4" style={{ pointerEvents: 'none' }}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value="user@example.com"
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
            />
          </div>
          
          <button
            disabled
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 opacity-75 cursor-not-allowed"
          >
            ✓ Reset Link Sent
          </button>
        </form>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-500 underline">
            Resend reset link
          </button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success state showing confirmation message after password reset request is sent.',
      },
    },
  },
};

export const ErrorStates: Story = {
  render: (_args) => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">General Error</h3>
        <div className="w-full space-y-6">
          <form className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm" role="alert">
              Unable to process password reset request. Please try again later.
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value="user@example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Send Reset Link</button>
          </form>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              We'll send a password reset link to your email if an account exists.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Field-Specific Error</h3>
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
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Send Reset Link</button>
          </form>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              We'll send a password reset link to your email if an account exists.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Empty Field Error</h3>
        <div className="w-full space-y-6">
          <form className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value=""
                className="block w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500"
              />
              <p className="text-sm text-red-600">Email address is required.</p>
            </div>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Send Reset Link</button>
          </form>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              We'll send a password reset link to your email if an account exists.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different error states including general errors, invalid email format, and empty field validation.',
      },
    },
  },
};

export const WithSecurityNote: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <ForgotPasswordForm {...args} />
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Security Information</h4>
              <p className="text-sm text-yellow-700 mt-1">
                For security reasons, we'll send a reset link regardless of whether the email exists in our system. 
                The reset link will expire in 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Forgot password form with additional security information for users.',
      },
    },
  },
};

export const MinimalDesign: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
          <p className="text-gray-600 mb-6">
            No worries! Enter your email address and we'll send you a reset link.
          </p>
        </div>
        <ForgotPasswordForm {...args} />
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Minimal design approach with contextual messaging and navigation links.',
      },
    },
  },
};

export const MobileOptimized: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="max-w-sm mx-auto">
        <ForgotPasswordForm {...args} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile-optimized layout for forgot password form.',
      },
    },
  },
};

export const AccessibilityFeatures: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Accessibility Features:</strong> This form includes comprehensive accessibility support
          with ARIA attributes, proper labeling, and keyboard navigation.
        </p>
        <ForgotPasswordForm {...args} />
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
          <p><strong>ARIA Features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Form has proper role and aria-label attributes</li>
            <li>Email input is properly labeled and has autocomplete="email"</li>
            <li>Error messages have aria-live="polite" for screen reader announcements</li>
            <li>Invalid fields use aria-describedby to reference error messages</li>
            <li>Loading states are announced to assistive technology</li>
            <li>Form provides clear feedback for all user interactions</li>
          </ul>
        </div>
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the comprehensive accessibility features of the forgot password form.',
      },
    },
  },
};

export const AllFormStates: Story = {
  render: (_args) => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center mb-8">ForgotPasswordForm States Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Empty State</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider>
              <ForgotPasswordForm />
            </MockAuthProvider>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Filled State</h3>
          <div className="border rounded-lg p-4">
            <div className="w-full space-y-6">
              <form className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    value="user@example.com"
                    readOnly
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
                  Send Reset Link
                </button>
              </form>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  We'll send a password reset link to your email if an account exists.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Error State</h3>
          <div className="border rounded-lg p-4">
            <div className="w-full space-y-6">
              <form className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                  Please enter a valid email address.
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    value="invalid-email"
                    className="block w-full px-3 py-2 border border-red-300 rounded-md"
                  />
                  <p className="text-sm text-red-600">Invalid email format.</p>
                </div>
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
                  Send Reset Link
                </button>
              </form>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  We'll send a password reset link to your email if an account exists.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Success State</h3>
          <div className="border rounded-lg p-4">
            <div className="w-full space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Reset link sent successfully!</span>
                </div>
              </div>
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
        story: 'Comprehensive overview of all ForgotPasswordForm states in a single view.',
      },
    },
  },
};