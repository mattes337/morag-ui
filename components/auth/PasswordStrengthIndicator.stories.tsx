import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

const meta = {
  title: 'Auth/PasswordStrengthIndicator',
  component: PasswordStrengthIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Password strength indicator component with visual feedback and requirements checklist. Provides real-time password strength analysis with progress bar, strength text, and detailed requirements.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    password: {
      control: 'text',
      description: 'The password to analyze',
    },
    showEmpty: {
      control: 'boolean',
      description: 'Whether to show the component when password is empty',
    },
    showProgress: {
      control: 'boolean',
      description: 'Whether to show the progress bar',
    },
    showStrengthText: {
      control: 'boolean',
      description: 'Whether to show the strength text (Weak/Medium/Strong)',
    },
    showRequirements: {
      control: 'boolean',
      description: 'Whether to show the requirements list',
    },
    className: {
      control: 'text',
      description: 'Custom CSS classes',
    },
  },
  args: {
    password: '',
    showEmpty: true,
    showProgress: true,
    showStrengthText: true,
    showRequirements: true,
  },
} satisfies Meta<typeof PasswordStrengthIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    password: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default password strength indicator with empty password showing all requirements unmet.',
      },
    },
  },
};

export const VeryWeakPassword: Story = {
  args: {
    password: 'abc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Very weak password showing minimal strength and many unmet requirements.',
      },
    },
  },
};

export const WeakPassword: Story = {
  args: {
    password: 'password',
  },
  parameters: {
    docs: {
      description: {
        story: 'Weak password with low strength score - only meets basic length requirement.',
      },
    },
  },
};

export const FairPassword: Story = {
  args: {
    password: 'Password1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Fair password strength with mixed case and numbers but still needs improvement.',
      },
    },
  },
};

export const GoodPassword: Story = {
  args: {
    password: 'Password123!',
  },
  parameters: {
    docs: {
      description: {
        story: 'Good password with uppercase, lowercase, numbers, and special characters.',
      },
    },
  },
};

export const StrongPassword: Story = {
  args: {
    password: 'MyStr0ngP@ssw0rd!2024',
  },
  parameters: {
    docs: {
      description: {
        story: 'Strong password meeting all requirements with high complexity and length.',
      },
    },
  },
};

export const ProgressBarOnly: Story = {
  args: {
    password: 'Password123!',
    showStrengthText: false,
    showRequirements: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Password strength indicator showing only the progress bar without text or requirements.',
      },
    },
  },
};

export const StrengthTextOnly: Story = {
  args: {
    password: 'Password123!',
    showProgress: false,
    showRequirements: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Password strength indicator showing only the strength text without progress bar or requirements.',
      },
    },
  },
};

export const RequirementsOnly: Story = {
  args: {
    password: 'Password123!',
    showProgress: false,
    showStrengthText: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Password strength indicator showing only the requirements checklist.',
      },
    },
  },
};

export const HideWhenEmpty: Story = {
  args: {
    password: '',
    showEmpty: false,
  },
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        The indicator is hidden when password is empty and showEmpty is false.
        Type a password to see it appear:
      </p>
      <input
        type="password"
        placeholder="Type a password..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        onChange={(e) => {
          const indicator = document.querySelector('[data-testid="password-strength-indicator"]');
          if (indicator) {
            const parent = indicator.parentElement;
            if (parent) {
              parent.innerHTML = '';
              if (e.target.value) {
                // This is a demo - in real usage, you'd update the component prop
                parent.innerHTML = `
                  <div class="w-full space-y-3" data-testid="password-strength-indicator">
                    <div class="space-y-2">
                      <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-yellow-500 transition-all duration-300 ease-in-out" style="width: 60%"></div>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-yellow-600">Medium</span>
                        <span class="text-xs text-gray-500">60%</span>
                      </div>
                    </div>
                  </div>
                `;
              }
            }
          }
        }}
      />
      <div>
        <PasswordStrengthIndicator {...args} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Password strength indicator that is hidden when password is empty and showEmpty is false.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    password: 'MyStr0ngP@ssw0rd!',
    className: 'border border-blue-200 rounded-lg p-4 bg-blue-50',
  },
  parameters: {
    docs: {
      description: {
        story: 'Password strength indicator with custom styling applied via className prop.',
      },
    },
  },
};

const InteractiveDemoComponent: React.FC = () => {
  const [password, setPassword] = React.useState('');

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            Type a password to see real-time strength analysis:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter password..."
          />
        </div>
        <PasswordStrengthIndicator password={password} />
        
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
          <p><strong>Try these examples:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>"weak" - Very weak password</li>
            <li>"Password1" - Fair password</li>
            <li>"MyStr0ngP@ssw0rd!" - Strong password</li>
          </ul>
        </div>
      </div>
    );
};

export const InteractiveDemo: Story = {
  render: () => <InteractiveDemoComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo allowing you to type different passwords and see real-time strength analysis.',
      },
    },
  },
};


export const ProgressionExample: Story = {
  render: (args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Password Strength Progression</h3>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3 text-red-600">Step 1: Very Weak (0-25%)</h4>
          <PasswordStrengthIndicator password="abc" />
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3 text-red-600">Step 2: Weak (26-50%)</h4>
          <PasswordStrengthIndicator password="password" />
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3 text-yellow-600">Step 3: Fair (51-70%)</h4>
          <PasswordStrengthIndicator password="Password1" />
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3 text-yellow-600">Step 4: Good (71-85%)</h4>
          <PasswordStrengthIndicator password="Password123!" />
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3 text-green-600">Step 5: Strong (86-100%)</h4>
          <PasswordStrengthIndicator password="MyVeryStr0ng&SecureP@ssw0rd2024!" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Shows the progression of password strength from very weak to strong with different examples.',
      },
    },
  },
};

export const RequirementsBreakdown: Story = {
  render: (args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Password Requirements Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="font-medium">Length Requirements</h4>
          <div className="space-y-2">
            <PasswordStrengthIndicator password="short" showProgress={false} showStrengthText={false} />
            <p className="text-sm text-gray-600">5 characters - Too short</p>
          </div>
          <div className="space-y-2">
            <PasswordStrengthIndicator password="longenough" showProgress={false} showStrengthText={false} />
            <p className="text-sm text-gray-600">10 characters - Meets minimum</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Character Types</h4>
          <div className="space-y-2">
            <PasswordStrengthIndicator password="lowercase" showProgress={false} showStrengthText={false} />
            <p className="text-sm text-gray-600">Only lowercase</p>
          </div>
          <div className="space-y-2">
            <PasswordStrengthIndicator password="Mixed123" showProgress={false} showStrengthText={false} />
            <p className="text-sm text-gray-600">Mixed case + numbers</p>
          </div>
          <div className="space-y-2">
            <PasswordStrengthIndicator password="Mixed123!" showProgress={false} showStrengthText={false} />
            <p className="text-sm text-gray-600">All character types</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Detailed breakdown showing how different password characteristics affect the requirements checklist.',
      },
    },
  },
};

export const ComponentVariations: Story = {
  render: (args) => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Component Display Variations</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Full Display</h4>
          <div className="border rounded-lg p-4">
            <PasswordStrengthIndicator password="Password123!" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Progress Only</h4>
          <div className="border rounded-lg p-4">
            <PasswordStrengthIndicator 
              password="Password123!" 
              showStrengthText={false}
              showRequirements={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Text Only</h4>
          <div className="border rounded-lg p-4">
            <PasswordStrengthIndicator 
              password="Password123!" 
              showProgress={false}
              showRequirements={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Requirements Only</h4>
          <div className="border rounded-lg p-4">
            <PasswordStrengthIndicator 
              password="Password123!" 
              showProgress={false}
              showStrengthText={false}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Different display variations of the password strength indicator showing various combinations of features.',
      },
    },
  },
};

export const AccessibilityFeatures: Story = {
  args: {
    password: 'Password123!',
  },
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Accessibility Features:</strong> This component includes comprehensive accessibility support
        with ARIA attributes, semantic HTML, and screen reader announcements.
      </p>
      <PasswordStrengthIndicator {...args} />
      <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
        <p><strong>ARIA Features:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Container has role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax</li>
          <li>Strength text has aria-live="polite" for screen reader announcements</li>
          <li>Requirements list uses proper list semantics</li>
          <li>Each requirement has descriptive title attribute</li>
          <li>Check/X icons have data-testid for testing and are aria-hidden</li>
          <li>Color is not the only indicator - text and icons provide redundant information</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the comprehensive accessibility features of the password strength indicator.',
      },
    },
  },
};