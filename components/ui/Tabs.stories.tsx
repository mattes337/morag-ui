import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { Button } from './Button';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A tabs component built on Radix UI primitives with multiple variants and sizes for organizing content into separate views.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'The default active tab',
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the tabs',
    },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue="tab1" className="w-96" {...args}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-4">
        <p className="text-sm">Content for the first tab. This is where you would put any content related to Tab 1.</p>
      </TabsContent>
      <TabsContent value="tab2" className="mt-4">
        <p className="text-sm">Content for the second tab. This shows different content when Tab 2 is selected.</p>
      </TabsContent>
      <TabsContent value="tab3" className="mt-4">
        <p className="text-sm">Content for the third tab. Each tab can contain completely different content and components.</p>
      </TabsContent>
    </Tabs>
  ),
  args: {
    defaultValue: 'tab1',
  },
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList variant="line">
        <TabsTrigger value="overview" variant="line">Overview</TabsTrigger>
        <TabsTrigger value="analytics" variant="line">Analytics</TabsTrigger>
        <TabsTrigger value="settings" variant="line">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Overview</h3>
          <p className="text-sm text-muted-foreground">General information and summary statistics.</p>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="mt-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Analytics</h3>
          <p className="text-sm text-muted-foreground">Detailed metrics and performance data.</p>
        </div>
      </TabsContent>
      <TabsContent value="settings" className="mt-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Settings</h3>
          <p className="text-sm text-muted-foreground">Configuration options and preferences.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs with line variant styling, showing underlined active tab.',
      },
    },
  },
};

export const PillVariant: Story = {
  render: () => (
    <Tabs defaultValue="personal" className="w-96">
      <TabsList variant="pill">
        <TabsTrigger value="personal" variant="pill">Personal</TabsTrigger>
        <TabsTrigger value="business" variant="pill">Business</TabsTrigger>
        <TabsTrigger value="enterprise" variant="pill">Enterprise</TabsTrigger>
      </TabsList>
      <TabsContent value="personal" className="mt-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Personal Plan</h3>
          <p className="text-sm text-muted-foreground">Perfect for individual users getting started.</p>
          <div className="text-2xl font-bold">$9/month</div>
        </div>
      </TabsContent>
      <TabsContent value="business" className="mt-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Business Plan</h3>
          <p className="text-sm text-muted-foreground">Ideal for small to medium businesses.</p>
          <div className="text-2xl font-bold">$29/month</div>
        </div>
      </TabsContent>
      <TabsContent value="enterprise" className="mt-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Enterprise Plan</h3>
          <p className="text-sm text-muted-foreground">Advanced features for large organizations.</p>
          <div className="text-2xl font-bold">$99/month</div>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs with pill variant styling, showing rounded active tab.',
      },
    },
  },
};

export const SmallSize: Story = {
  render: () => (
    <Tabs defaultValue="info" className="w-80">
      <TabsList size="sm">
        <TabsTrigger value="info" size="sm">Info</TabsTrigger>
        <TabsTrigger value="specs" size="sm">Specs</TabsTrigger>
        <TabsTrigger value="reviews" size="sm">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="mt-4">
        <p className="text-sm">Product information and description.</p>
      </TabsContent>
      <TabsContent value="specs" className="mt-4">
        <p className="text-sm">Technical specifications and details.</p>
      </TabsContent>
      <TabsContent value="reviews" className="mt-4">
        <p className="text-sm">Customer reviews and ratings.</p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact tabs with small size for tight layouts.',
      },
    },
  },
};

export const LargeSize: Story = {
  render: () => (
    <Tabs defaultValue="dashboard" className="w-[500px]">
      <TabsList size="lg">
        <TabsTrigger value="dashboard" size="lg">Dashboard</TabsTrigger>
        <TabsTrigger value="reports" size="lg">Reports</TabsTrigger>
        <TabsTrigger value="users" size="lg">Users</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="mt-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your admin dashboard.</p>
        </div>
      </TabsContent>
      <TabsContent value="reports" className="mt-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Reports</h2>
          <p className="text-muted-foreground">View detailed analytics and reports.</p>
        </div>
      </TabsContent>
      <TabsContent value="users" className="mt-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Large tabs for prominent navigation elements.',
      },
    },
  },
};

export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input className="w-full px-3 py-2 border rounded-md" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input className="w-full px-3 py-2 border rounded-md" defaultValue="john@example.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <input type="password" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input type="password" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input type="password" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="billing" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your subscription and billing details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div>
                <div className="font-medium">Pro Plan</div>
                <div className="text-sm text-muted-foreground">$29/month</div>
              </div>
              <Button variant="outline">Change Plan</Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="p-3 border rounded-md">
                <div className="font-medium">**** **** **** 4242</div>
                <div className="text-sm text-muted-foreground">Expires 12/24</div>
              </div>
            </div>
            <Button>Update Billing</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs containing card components for a settings interface.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <p className="text-sm">Default variant with background styling.</p>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <p className="text-sm">Second tab content.</p>
          </TabsContent>
          <TabsContent value="tab3" className="mt-4">
            <p className="text-sm">Third tab content.</p>
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Line Variant</h3>
        <Tabs defaultValue="tab1">
          <TabsList variant="line">
            <TabsTrigger value="tab1" variant="line">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" variant="line">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3" variant="line">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <p className="text-sm">Line variant with border bottom styling.</p>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <p className="text-sm">Second tab content.</p>
          </TabsContent>
          <TabsContent value="tab3" className="mt-4">
            <p className="text-sm">Third tab content.</p>
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Pill Variant</h3>
        <Tabs defaultValue="tab1">
          <TabsList variant="pill">
            <TabsTrigger value="tab1" variant="pill">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" variant="pill">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3" variant="pill">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <p className="text-sm">Pill variant with rounded styling.</p>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <p className="text-sm">Second tab content.</p>
          </TabsContent>
          <TabsContent value="tab3" className="mt-4">
            <p className="text-sm">Third tab content.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available tab variants side by side.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Size</h3>
        <Tabs defaultValue="tab1">
          <TabsList size="sm">
            <TabsTrigger value="tab1" size="sm">Small</TabsTrigger>
            <TabsTrigger value="tab2" size="sm">Compact</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <p className="text-sm">Content for small tabs.</p>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <p className="text-sm">Compact tab content.</p>
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Size</h3>
        <Tabs defaultValue="tab1">
          <TabsList size="default">
            <TabsTrigger value="tab1" size="default">Default</TabsTrigger>
            <TabsTrigger value="tab2" size="default">Standard</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <p className="text-sm">Content for default tabs.</p>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <p className="text-sm">Standard tab content.</p>
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Size</h3>
        <Tabs defaultValue="tab1">
          <TabsList size="lg">
            <TabsTrigger value="tab1" size="lg">Large</TabsTrigger>
            <TabsTrigger value="tab2" size="lg">Prominent</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <p className="text-sm">Content for large tabs.</p>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <p className="text-sm">Prominent tab content.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available tab sizes for comparison.',
      },
    },
  },
};

export const DashboardExample: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your project.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,543</div>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,426</div>
                  <p className="text-xs text-green-600">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">847</div>
                  <p className="text-xs text-red-600">-3% from last hour</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics</h2>
              <p className="text-muted-foreground">Detailed insights into your application performance.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">45,231</div>
                  <p className="text-sm text-muted-foreground">Total views this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3.2%</div>
                  <p className="text-sm text-muted-foreground">Average conversion rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-muted-foreground">Manage user accounts and permissions.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Users who joined in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Alice Johnson', 'Bob Smith', 'Carol Wilson'].map((name, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{name}</span>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-muted-foreground">Configure your application preferences.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive email updates</div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">API Access</div>
                    <div className="text-sm text-muted-foreground">Manage API keys</div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Complete dashboard interface using tabs for navigation between different views.',
      },
    },
  },
};