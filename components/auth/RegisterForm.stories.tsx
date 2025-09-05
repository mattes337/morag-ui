import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { RegisterForm } from './RegisterForm';
import { AuthProvider } from '../../contexts/auth/AuthContext';

// Mock AuthContext wrapper
const MockAuthProvider = ({ 
  children, 
}: { 
  children: React.ReactNode;
  mockState?: { isLoading?: boolean; error?: string | null; user?: any };
}) => {
  return <AuthProvider>{children}</AuthProvider>;
};

const meta = {
  title: 'Auth/RegisterForm',
  component: RegisterForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Registration form component with comprehensive validation, password strength indication, realm selection, and social auth support. Handles user account creation with proper error states and loading indicators.',
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
      action: 'registration-success',
      description: 'Callback called when registration succeeds',
    },
    onSocialAuth: {
      action: 'social-auth',
      description: 'Callback called when social authentication is attempted',
    },
    showSocialAuth: {
      control: 'boolean',
      description: 'Whether to show social authentication buttons',
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
  },
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default registration form with all features including password strength indicator, realm selection, and social auth.',
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
        story: 'Registration form without social authentication options.',
      },
    },
  },
};

export const CustomSubmitText: Story = {
  args: {
    submitButtonText: 'Join the Platform',
  },
  parameters: {
    docs: {
      description: {
        story: 'Registration form with custom submit button text.',
      },
    },
  },
};

export const ValidationDemo: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Try submitting the form with invalid data to see validation errors.
          Requirements: name (2+ chars), valid email, strong password, matching confirmation, accept terms.
        </p>
        <RegisterForm {...args} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Registration form demonstrating client-side validation. Submit with invalid data to see error messages.',
      },
    },
  },
};

export const PasswordStrengthDemo: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Type in the password field to see the strength indicator change.
          Try: "weak", "Password1", "MyStr0ngP@ssw0rd!" to see different strength levels.
        </p>
        <RegisterForm {...args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const nameInput = document.querySelector('input[id="name"]');
              const emailInput = document.querySelector('input[id="email"]');
              if (nameInput) nameInput.value = 'John Doe';
              if (emailInput) emailInput.value = 'john.doe@example.com';
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
        story: 'Demonstrates the password strength indicator with different password examples.',
      },
    },
  },
};

export const FilledForm: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Form pre-filled with valid data to show the completed state.
        </p>
        <RegisterForm {...args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const nameInput = document.querySelector('input[id="name"]');
              const emailInput = document.querySelector('input[id="email"]');
              const passwordInput = document.querySelector('input[id="password"]');
              const confirmPasswordInput = document.querySelector('input[id="confirm-password"]');
              const acceptTerms = document.querySelector('input[id="accept-terms"]');
              
              if (nameInput) nameInput.value = 'Sarah Johnson';
              if (emailInput) emailInput.value = 'sarah.johnson@example.com';
              if (passwordInput) passwordInput.value = 'MyStr0ngP@ssw0rd!';
              if (confirmPasswordInput) confirmPasswordInput.value = 'MyStr0ngP@ssw0rd!';
              if (acceptTerms) acceptTerms.checked = true;
              
              // Trigger change events to update React state
              [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
                if (input) {
                  const event = new Event('input', { bubbles: true });
                  input.dispatchEvent(event);
                }
              });
              if (acceptTerms) {
                const event = new Event('change', { bubbles: true });
                acceptTerms.dispatchEvent(event);
              }
            }, 200);
          `
        }} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Registration form with pre-filled valid data showing the completed state and strong password.',
      },
    },
  },
};

export const PasswordVisibilityDemo: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> Click the eye icons to toggle password visibility for both password fields.
        </p>
        <RegisterForm {...args} />
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const passwordInput = document.querySelector('input[id="password"]');
              const confirmPasswordInput = document.querySelector('input[id="confirm-password"]');
              
              if (passwordInput) passwordInput.value = 'ExamplePassword123!';
              if (confirmPasswordInput) confirmPasswordInput.value = 'ExamplePassword123!';
              
              [passwordInput, confirmPasswordInput].forEach(input => {
                if (input) {
                  const event = new Event('input', { bubbles: true });
                  input.dispatchEvent(event);
                }
              });
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

export const LoadingState: Story = {
  render: (_args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Demo:</strong> Registration form in loading state with all fields disabled and loading spinner.
      </p>
      <div className="w-full space-y-6">
        <form className="space-y-4" style={{ pointerEvents: 'none' }}>
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
            Creating your account...
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              value="John Doe"
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              value="john.doe@example.com"
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
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              type="password"
              value="********"
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Select realm</label>
            <select
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed opacity-50"
            >
              <option>Default Realm</option>
            </select>
          </div>
          
          <div className="flex items-start">
            <input type="checkbox" checked disabled className="cursor-not-allowed opacity-50 mt-1" />
            <label className="ml-2 text-sm text-gray-900 cursor-not-allowed opacity-50">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          
          <button
            disabled
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 opacity-50 cursor-not-allowed"
          >
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating account...
          </button>
        </form>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Registration form in loading state showing disabled fields and loading indicators.',
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
              Registration failed. Please try again.
            </div>
            <input type="text" placeholder="Full name" value="John Doe" className="w-full px-3 py-2 border rounded-md" />
            <input type="email" placeholder="Email" value="john@example.com" className="w-full px-3 py-2 border rounded-md" />
            <input type="password" placeholder="Password" className="w-full px-3 py-2 border rounded-md" />
            <input type="password" placeholder="Confirm password" className="w-full px-3 py-2 border rounded-md" />
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Create Account</button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Field-Specific Errors</h3>
        <div className="w-full space-y-6">
          <form className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input
                value="X"
                className="block w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500"
              />
              <p className="text-sm text-red-600">Name must be at least 2 characters long.</p>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                value="john@example.com"
                className="block w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500"
              />
              <p className="text-sm text-red-600">This email is already registered.</p>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value="weak"
                className="block w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500"
              />
              <p className="text-sm text-red-600">Password must be at least 8 characters with uppercase, lowercase, and numbers.</p>
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
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                value="different"
                className="block w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500"
              />
              <p className="text-sm text-red-600">Passwords do not match.</p>
            </div>
            
            <div className="flex items-start">
              <input type="checkbox" className="mt-1" />
              <div className="ml-2">
                <label className="text-sm text-gray-900">
                  I agree to the Terms of Service and Privacy Policy
                </label>
                <p className="text-sm text-red-600 mt-1">You must accept the terms to continue.</p>
              </div>
            </div>
            
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Create Account</button>
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

export const PasswordStrengthLevels: Story = {
  render: (_args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Password Strength Examples</h3>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2 text-red-600">Weak Password</h4>
          <input
            type="password"
            value="weak"
            readOnly
            className="w-full px-3 py-2 border rounded-md mb-2"
          />
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-red-600">Weak</span>
              <span className="text-xs text-gray-500">25%</span>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2 text-yellow-600">Medium Password</h4>
          <input
            type="password"
            value="Password1"
            readOnly
            className="w-full px-3 py-2 border rounded-md mb-2"
          />
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-yellow-600">Medium</span>
              <span className="text-xs text-gray-500">60%</span>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2 text-green-600">Strong Password</h4>
          <input
            type="password"
            value="MyStr0ngP@ssw0rd!"
            readOnly
            className="w-full px-3 py-2 border rounded-md mb-2"
          />
          <div className="space-y-2">
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
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different password strength levels with visual indicators.',
      },
    },
  },
};

export const RealmSelection: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Demo:</strong> The realm selector shows available realms for user selection.
          In a real application, this would be populated from an API.
        </p>
        <RegisterForm {...args} />
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates realm selection functionality in the registration form.',
      },
    },
  },
};

export const AccessibilityFeatures: Story = {
  render: (args) => (
    <MockAuthProvider>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Accessibility Features:</strong> This form includes comprehensive accessibility features
          including proper ARIA labels, keyboard navigation, screen reader support, and semantic HTML.
        </p>
        <RegisterForm {...args} />
        <div className="text-xs text-gray-500 space-y-1 mt-4 p-3 bg-gray-50 rounded">
          <p><strong>ARIA Features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Form has proper role and aria-label</li>
            <li>Password strength indicator has role="progressbar" and aria-valuenow</li>
            <li>Error messages have aria-live="polite"</li>
            <li>Invalid fields have aria-describedby pointing to error messages</li>
            <li>Password toggle buttons have descriptive aria-labels</li>
            <li>Terms checkbox is properly associated with its label</li>
          </ul>
        </div>
      </div>
    </MockAuthProvider>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates comprehensive accessibility features for the registration form.',
      },
    },
  },
};

export const AllFormStates: Story = {
  render: (_args) => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center mb-8">RegisterForm States Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Empty State</h3>
          <div className="border rounded-lg p-4 max-h-96 overflow-auto">
            <MockAuthProvider>
              <RegisterForm showSocialAuth={false} />
            </MockAuthProvider>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">With Social Auth</h3>
          <div className="border rounded-lg p-4 max-h-96 overflow-auto">
            <MockAuthProvider>
              <RegisterForm />
            </MockAuthProvider>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Error State</h3>
          <div className="border rounded-lg p-4 max-h-96 overflow-auto">
            <div className="w-full space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                Please fix the errors below.
              </div>
              <input type="text" placeholder="Full name" className="w-full px-3 py-2 border border-red-300 rounded-md" />
              <p className="text-sm text-red-600 -mt-2">Name is required</p>
              <input type="email" placeholder="Email" className="w-full px-3 py-2 border border-red-300 rounded-md" />
              <p className="text-sm text-red-600 -mt-2">Invalid email format</p>
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Create Account</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Password Strength</h3>
          <div className="border rounded-lg p-4 max-h-96 overflow-auto">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value="MyStr0ngP@ssw0rd!"
                  readOnly
                  className="w-full px-3 py-2 border rounded-md"
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
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comprehensive overview of all RegisterForm variations and states in a single view.',
      },
    },
  },
};