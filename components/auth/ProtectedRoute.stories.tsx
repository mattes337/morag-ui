import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
// import { AuthProvider } from '../../contexts/auth/AuthContext';
import type { User, UserRole } from '../../lib/auth/types';

// Mock user data for different scenarios
const mockUsers: Record<string, User> = {
  admin: {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  user: {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  viewer: {
    id: '3',
    email: 'viewer@example.com',
    name: 'Viewer User',
    role: 'viewer',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  unverified: {
    id: '4',
    email: 'unverified@example.com',
    name: 'Unverified User',
    role: 'user',
    emailVerified: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
};

// Mock AuthProvider for different authentication states
const MockAuthProvider = ({ 
  children, 
  mockState 
}: { 
  children: React.ReactNode;
  mockState: {
    isLoading?: boolean;
    isAuthenticated?: boolean;
    user?: User | null;
  };
}) => {
  // Create a mock context value
  const mockContextValue = {
    user: mockState.user ?? null,
    isLoading: mockState.isLoading || false,
    isAuthenticated: mockState.isAuthenticated || false,
    error: null,
    login: async () => ({ success: true }),
    register: async () => ({ success: true }),
    logout: async () => {},
    forgotPassword: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    clearError: () => {},
    hasRole: (role: UserRole) => mockState.user?.role === role,
    hasAnyRole: (roles: UserRole[]) => mockState.user ? roles.includes(mockState.user.role) : false,
  };

  // We'll use React.createContext to create a temporary context for the story
  const TempAuthContext = React.createContext(mockContextValue);

  return (
    <TempAuthContext.Provider value={mockContextValue}>
      {children}
    </TempAuthContext.Provider>
  );
};

// Sample protected content component
const SampleProtectedContent: React.FC = () => (
  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
    <h3 className="text-lg font-semibold text-green-800 mb-2">Protected Content</h3>
    <p className="text-green-700">
      This content is only visible to authenticated users with proper permissions.
      You have successfully accessed this protected area!
    </p>
    <div className="mt-4 space-y-2">
      <div className="flex items-center text-sm text-green-600">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Authentication verified
      </div>
      <div className="flex items-center text-sm text-green-600">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Role permissions granted
      </div>
      <div className="flex items-center text-sm text-green-600">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Access granted
      </div>
    </div>
  </div>
);

const meta = {
  title: 'Auth/ProtectedRoute',
  component: ProtectedRoute,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Route protection component with role-based access control and email verification. Handles authentication states, role checking, and conditional content rendering with customizable redirect behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Child components to render when access is granted',
    },
    requiredRole: {
      control: { type: 'select' },
      options: ['admin', 'user', 'viewer'],
      description: 'Required role for access (single role)',
    },
    requiredRoles: {
      control: 'check',
      options: ['admin', 'user', 'viewer'],
      description: 'Required roles for access (any of the specified roles)',
    },
    requireEmailVerification: {
      control: 'boolean',
      description: 'Whether email verification is required',
    },
    loginUrl: {
      control: 'text',
      description: 'URL to redirect to when user is not authenticated',
    },
    unauthorizedUrl: {
      control: 'text',
      description: 'URL to redirect to when user is not authorized',
    },
    verifyEmailUrl: {
      control: 'text',
      description: 'URL to redirect to when email verification is required',
    },
    redirectMethod: {
      control: { type: 'select' },
      options: ['push', 'replace'],
      description: 'Method to use for redirects',
    },
    enableRedirects: {
      control: 'boolean',
      description: 'Whether to enable automatic redirects',
    },
    className: {
      control: 'text',
      description: 'Custom CSS classes for the wrapper',
    },
  },
  args: {
    children: <SampleProtectedContent />,
    enableRedirects: false, // Disable redirects for Storybook demo
  },
} satisfies Meta<typeof ProtectedRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthenticatedUser: Story = {
  render: (args) => (
    <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.user ?? null }}>
      <ProtectedRoute {...args}>
        <SampleProtectedContent />
      </ProtectedRoute>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Authenticated user accessing protected content without role restrictions.',
      },
    },
  },
};

export const UnauthenticatedUser: Story = {
  render: (args) => (
    <MockAuthProvider mockState={{ isAuthenticated: false, user: null }}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          <strong>Demo:</strong> Unauthenticated user attempting to access protected content.
          Since redirects are disabled for Storybook, nothing is rendered.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ProtectedRoute {...args}>
            <SampleProtectedContent />
          </ProtectedRoute>
          <p className="text-gray-500 text-sm mt-2">
            Protected content would normally redirect to login page
          </p>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Unauthenticated user attempting to access protected content. In a real app, this would redirect to login.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: (args) => (
    <MockAuthProvider mockState={{ isLoading: true }}>
      <ProtectedRoute {...args}>
        <SampleProtectedContent />
      </ProtectedRoute>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state while authentication status is being determined.',
      },
    },
  },
};

export const AdminOnlyAccess: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Admin User (Authorized)</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.admin ?? null }}>
          <ProtectedRoute {...args} requiredRole="admin">
            <SampleProtectedContent />
          </ProtectedRoute>
        </MockAuthProvider>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Regular User (Unauthorized)</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.user ?? null }}>
          <div className="border-2 border-dashed border-red-300 rounded-lg p-6 text-center">
            <ProtectedRoute {...args} requiredRole="admin">
              <SampleProtectedContent />
            </ProtectedRoute>
            <p className="text-red-500 text-sm mt-2">
              Access denied - Admin role required
            </p>
          </div>
        </MockAuthProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Admin-only protected content showing authorized and unauthorized access attempts.',
      },
    },
  },
};

export const MultiRoleAccess: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Admin User (Authorized)</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.admin ?? null }}>
          <ProtectedRoute {...args} requiredRoles={['admin', 'user']}>
            <SampleProtectedContent />
          </ProtectedRoute>
        </MockAuthProvider>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Regular User (Authorized)</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.user ?? null }}>
          <ProtectedRoute {...args} requiredRoles={['admin', 'user']}>
            <SampleProtectedContent />
          </ProtectedRoute>
        </MockAuthProvider>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Viewer User (Unauthorized)</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.viewer ?? null }}>
          <div className="border-2 border-dashed border-red-300 rounded-lg p-6 text-center">
            <ProtectedRoute {...args} requiredRoles={['admin', 'user']}>
              <SampleProtectedContent />
            </ProtectedRoute>
            <p className="text-red-500 text-sm mt-2">
              Access denied - Admin or User role required
            </p>
          </div>
        </MockAuthProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multi-role access control allowing admin or user roles, but not viewer.',
      },
    },
  },
};

export const EmailVerificationRequired: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Verified User (Authorized)</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.user ?? null }}>
          <ProtectedRoute {...args} requireEmailVerification={true}>
            <SampleProtectedContent />
          </ProtectedRoute>
        </MockAuthProvider>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Unverified User (Blocked)</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.unverified ?? null }}>
          <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center">
            <ProtectedRoute {...args} requireEmailVerification={true}>
              <SampleProtectedContent />
            </ProtectedRoute>
            <p className="text-yellow-600 text-sm mt-2">
              Access blocked - Email verification required
            </p>
          </div>
        </MockAuthProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Email verification requirement showing verified vs unverified user access.',
      },
    },
  },
};

export const CustomLoadingComponent: Story = {
  render: (args) => (
    <MockAuthProvider mockState={{ isLoading: true }}>
      <ProtectedRoute 
        {...args}
        loadingComponent={
          <div className="flex items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Custom Loading</h3>
              <p className="text-blue-700">Verifying your permissions...</p>
            </div>
          </div>
        }
      >
        <SampleProtectedContent />
      </ProtectedRoute>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom loading component while authentication state is being determined.',
      },
    },
  },
};

export const RoleBasedContent: Story = {
  render: (args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Role-Based Content Examples</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg">
          <div className="bg-red-50 border-b p-3">
            <h4 className="font-medium text-red-800">Admin Only</h4>
          </div>
          <div className="p-3">
            <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.admin ?? null }}>
              <ProtectedRoute requiredRole="admin" enableRedirects={false}>
                <div className="text-sm text-green-600">
                  ✓ Admin Dashboard Access
                </div>
              </ProtectedRoute>
            </MockAuthProvider>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="bg-blue-50 border-b p-3">
            <h4 className="font-medium text-blue-800">User & Admin</h4>
          </div>
          <div className="p-3">
            <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.user ?? null }}>
              <ProtectedRoute requiredRoles={['user', 'admin']} enableRedirects={false}>
                <div className="text-sm text-green-600">
                  ✓ User Features Available
                </div>
              </ProtectedRoute>
            </MockAuthProvider>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="bg-gray-50 border-b p-3">
            <h4 className="font-medium text-gray-800">All Roles</h4>
          </div>
          <div className="p-3">
            <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.viewer ?? null }}>
              <ProtectedRoute enableRedirects={false}>
                <div className="text-sm text-green-600">
                  ✓ Public Content
                </div>
              </ProtectedRoute>
            </MockAuthProvider>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different role-based content restrictions in a typical application layout.',
      },
    },
  },
};

export const WithCustomFallback: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Unauthorized Message</h3>
        <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.viewer ?? null }}>
          <ProtectedRoute 
            {...args} 
            requiredRole="admin" 
            enableRedirects={false}
            className="border-2 border-red-200 rounded-lg p-6 bg-red-50"
          >
            <SampleProtectedContent />
          </ProtectedRoute>
          {/* Custom fallback content for demo */}
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h4 className="text-sm font-medium text-red-800">Access Denied</h4>
            </div>
            <p className="text-sm text-red-700 mt-1">
              You don't have permission to access this resource. Contact your administrator if you believe this is an error.
            </p>
          </div>
        </MockAuthProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom fallback content when access is denied, useful for better user experience.',
      },
    },
  },
};

export const AllAuthStates: Story = {
  render: (args) => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center mb-8">ProtectedRoute States Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Loading State</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider mockState={{ isLoading: true }}>
              <ProtectedRoute enableRedirects={false}>
                <SampleProtectedContent />
              </ProtectedRoute>
            </MockAuthProvider>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Authenticated Access</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.user ?? null }}>
              <ProtectedRoute enableRedirects={false}>
                <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
                  <div className="text-green-600 font-medium">✓ Access Granted</div>
                  <div className="text-sm text-green-700">User authenticated successfully</div>
                </div>
              </ProtectedRoute>
            </MockAuthProvider>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unauthenticated</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider mockState={{ isAuthenticated: false, user: null }}>
              <div className="text-center">
                <ProtectedRoute enableRedirects={false}>
                  <SampleProtectedContent />
                </ProtectedRoute>
                <div className="p-4 text-gray-500">
                  <div className="text-red-600 font-medium">✗ Access Denied</div>
                  <div className="text-sm">Authentication required</div>
                </div>
              </div>
            </MockAuthProvider>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Role Restriction</h3>
          <div className="border rounded-lg p-4">
            <MockAuthProvider mockState={{ isAuthenticated: true, user: mockUsers.viewer ?? null }}>
              <div className="text-center">
                <ProtectedRoute requiredRole="admin" enableRedirects={false}>
                  <SampleProtectedContent />
                </ProtectedRoute>
                <div className="p-4 text-gray-500">
                  <div className="text-yellow-600 font-medium">⚠ Insufficient Permissions</div>
                  <div className="text-sm">Admin role required</div>
                </div>
              </div>
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
        story: 'Comprehensive overview of all ProtectedRoute authentication and authorization states.',
      },
    },
  },
};