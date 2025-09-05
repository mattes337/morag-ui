import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ResetPasswordForm } from './ResetPasswordForm';
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
  title: 'Auth/ResetPasswordForm',
  component: ResetPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Reset password form component for setting a new password after clicking a reset link. Includes password strength validation, confirmation matching, and comprehensive error handling.',
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
    token: {
      control: 'text',
      description: 'Reset token from URL',
    },
    onSuccess: {
      action: 'password-reset-success',
      description: 'Callback called when password reset succeeds',
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
    token: 'mock-reset-token-123',
    onSuccess: fn(),
  },
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default reset password form with password strength indicator and confirmation field.',
      },
    },
  },
};

export const CustomSubmitText: Story = {
  args: {
    submitButtonText: 'Update Password',
  },
  parameters: {
    docs: {
      description: {
        story: 'Reset password form with custom submit button text.',
      },
    },
  },
};

export const InvalidToken: Story = {
  args: {
    token: '',
  },
  render: (_args) => (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium">Invalid Reset Link</h4>
            <p className="text-sm mt-1">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <a href="/forgot-password" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          Request New Reset Link
        </a>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Invalid token state showing error message and link to request new reset.',
      },
    },
  },
};

export const FilledForm: Story = {
  render: (_args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Form with sample passwords showing password strength indicator.
        </p>
        <ResetPasswordForm {..._args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const passwordInput = document.querySelector('input[id="password"]');
              const confirmPasswordInput = document.querySelector('input[id="confirm-password"]');
              
              if (passwordInput) {
                passwordInput.value = 'MyStr0ngP@ssw0rd!';
                const event = new Event('input', { bubbles: true });
                passwordInput.dispatchEvent(event);
              }
              if (confirmPasswordInput) {
                confirmPasswordInput.value = 'MyStr0ngP@ssw0rd!';
                const event2 = new Event('input', { bubbles: true });
                confirmPasswordInput.dispatchEvent(event2);
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
        story: 'Reset password form with pre-filled strong password showing strength indicator.',
      },
    },
  },
};

export const PasswordStrengthDemo: Story = {
  render: (_args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Type in the password field to see real-time strength analysis.
          Try: "weak", "Password1", "MyStr0ngP@ssw0rd!" to see different levels.
        </p>
        <ResetPasswordForm {..._args} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates real-time password strength analysis as you type.',
      },
    },
  },
};

export const PasswordVisibilityDemo: Story = {
  render: (_args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Click the eye icons to toggle password visibility for both fields.
        </p>
        <ResetPasswordForm {..._args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const passwordInput = document.querySelector('input[id="password"]');
              const confirmPasswordInput = document.querySelector('input[id="confirm-password"]');
              
              if (passwordInput) passwordInput.value = 'ExamplePassword123!';
              if (confirmPasswordInput) confirmPasswordInput.value = 'ExamplePassword123!';
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
        story: 'Demonstrates password visibility toggle functionality for both password fields.',
      },
    },
  },
};

export const ValidationDemo: Story = {
  render: (_args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Try submitting with mismatched passwords, weak passwords, or empty fields to see validation errors.
        </p>
        <ResetPasswordForm {..._args} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates form validation including password strength and confirmation matching.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: (_args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Demo:</strong> Form in loading state while processing the password reset.
      </p>
      <div className="w-full space-y-6">
        <form className="space-y-4" style={{ pointerEvents: 'none' }}>
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
            Resetting your password...
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">New password</label>
            <div className="relative">
              <input
                type="password"
                value="********"
                disabled
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
              />
              <button
                type="button"
                disabled
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
            <div className="relative">
              <input
                type="password"
                value="********"
                disabled
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
              />
              <button
                type="button"
                disabled
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <button
            disabled
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 opacity-50 cursor-not-allowed"
          >
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Resetting...
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Make sure to choose a strong password that you haven't used before.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Reset password form in loading state with disabled fields and loading indicators.',
      },
    },
  },
};

export const SuccessState: Story = {
  render: (_args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Demo:</strong> Success state after password has been successfully reset.
      </p>
      <div className="w-full space-y-6">
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium">Password Reset Successful</h4>
              <p className="text-sm mt-1">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            Sign In Now
          </button>
          <p className="text-sm text-gray-600">
            Keep your new password safe and don't share it with anyone.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success state showing confirmation message and sign-in option after successful password reset.',
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
              Failed to reset password. Please try again or request a new reset link.
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                value="MyStr0ngP@ssw0rd!"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
              <input
                type="password"
                value="MyStr0ngP@ssw0rd!"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Reset Password</button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Validation Errors</h3>
        <div className="w-full space-y-6">
          <form className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">New password</label>
              <div className="relative">
                <input
                  type="password"
                  value="weak"
                  className="block w-full px-3 py-2 pr-10 border border-red-300 rounded-md focus:ring-red-500"
                />
                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-red-600">Password must be at least 8 characters with uppercase, lowercase, and numbers.</p>
              
              {/* Password strength indicator for weak password */}
              <div className="w-full space-y-3 mt-2">
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-300 ease-in-out" style={{ width: '25%' }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-600">Weak</span>
                    <span className="text-xs text-gray-500">25%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
              <div className="relative">
                <input
                  type="password"
                  value="different"
                  className="block w-full px-3 py-2 pr-10 border border-red-300 rounded-md focus:ring-red-500"
                />
                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-red-600">Passwords do not match.</p>
            </div>
            
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Reset Password</button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Token Expired</h3>
        <div className="w-full space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium">Reset Link Expired</h4>
                <p className="text-sm mt-1">
                  This password reset link has expired. Reset links are valid for 24 hours for security reasons.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              Request New Reset Link
            </button>
            <p className="text-sm text-gray-600 mt-2">
              You'll need to request a new reset link to change your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different error states including general errors, validation errors, and expired token scenarios.',
      },
    },
  },
};

export const PasswordStrengthLevels: Story = {
  render: (_args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Password Strength Examples</h3>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2 text-red-600">Weak Password</h4>
          <div className="space-y-1">
            <input
              type="password"
              value="weak"
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
            <div className="space-y-2 mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-red-600">Weak</span>
                <span className="text-xs text-gray-500">25%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2 text-yellow-600">Fair Password</h4>
          <div className="space-y-1">
            <input
              type="password"
              value="Password1"
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
            <div className="space-y-2 mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-yellow-600">Fair</span>
                <span className="text-xs text-gray-500">60%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2 text-green-600">Strong Password</h4>
          <div className="space-y-1">
            <input
              type="password"
              value="MyStr0ngP@ssw0rd!"
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
            <div className="space-y-2 mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-green-600">Strong</span>
                <span className="text-xs text-gray-500">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different password strength levels with visual indicators for password reset.',
      },
    },
  },
};

export const SecurityBestPractices: Story = {
  render: (_args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <ResetPasswordForm {..._args} />
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Password Security Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use a unique password you haven't used before</li>
            <li>• Include uppercase letters, lowercase letters, numbers, and symbols</li>
            <li>• Make it at least 12 characters long</li>
            <li>• Avoid personal information like names or birthdays</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div>
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Reset password form with security best practices and tips for users.',
      },
    },
  },
};

export const AccessibilityFeatures: Story = {
  render: (_args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Accessibility Features:</strong> This form includes comprehensive accessibility support
          with ARIA attributes, keyboard navigation, and screen reader compatibility.
        </p>
        <ResetPasswordForm {..._args} />
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
          <p><strong>ARIA Features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Form has proper role and aria-label attributes</li>
            <li>Password fields have autocomplete="new-password" for security</li>
            <li>Password strength indicator has role="progressbar" with aria-valuenow</li>
            <li>Error messages have aria-live="polite" for screen reader announcements</li>
            <li>Invalid fields use aria-describedby to reference error messages</li>
            <li>Password toggle buttons have descriptive aria-labels</li>
            <li>Loading states are announced to assistive technology</li>
          </ul>
        </div>
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the comprehensive accessibility features of the reset password form.',
      },
    },
  },
};

export const AllFormStates: Story = {
  render: (_args) => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center mb-8">ResetPasswordForm States Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Empty State</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider>
              <ResetPasswordForm token="demo-token" />
            </MockAuthProvider>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">With Strong Password</h3>
          <div className="border rounded-lg p-4">
            <div className="w-full space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  value="MyStr0ngP@ssw0rd!"
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
                <div className="space-y-2 mt-2">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-600">Strong</span>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                <input
                  type="password"
                  value="MyStr0ngP@ssw0rd!"
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
                Reset Password
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Validation Error</h3>
          <div className="border rounded-lg p-4">
            <div className="w-full space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  value="weak"
                  className="w-full px-3 py-2 border border-red-300 rounded-md"
                />
                <p className="text-sm text-red-600">Password is too weak.</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                <input
                  type="password"
                  value="different"
                  className="w-full px-3 py-2 border border-red-300 rounded-md"
                />
                <p className="text-sm text-red-600">Passwords do not match.</p>
              </div>
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
                Reset Password
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Success State</h3>
          <div className="border rounded-lg p-4">
            <div className="w-full space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Password reset successful!</span>
                </div>
              </div>
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
                Sign In Now
              </button>
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
        story: 'Comprehensive overview of all ResetPasswordForm states in a single view.',
      },
    },
  },
};