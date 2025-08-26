import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MockAppProvider, useApp } from './MockAppProvider';

// Simple test component that uses the mock app context
const TestComponent = () => {
  const { user, currentRealm, documents } = useApp();
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">MockAppProvider Test</h2>
      <div className="space-y-2">
        <div>
          <strong>User:</strong> {user?.email || 'No user'}
        </div>
        <div>
          <strong>Current Realm:</strong> {currentRealm?.name || 'No realm'}
        </div>
        <div>
          <strong>Documents:</strong> {documents.length} documents
        </div>
        <div className="text-green-600 font-semibold">
          ✅ MockAppProvider is working correctly!
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof TestComponent> = {
  title: 'Test/MockAppProvider',
  component: TestComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockAppProvider>
        <Story />
      </MockAppProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomValues: Story = {
  decorators: [
    (Story) => (
      <MockAppProvider
        initialValues={{
          currentRealm: {
            id: 'test-realm',
            name: 'Test Realm',
            description: 'A test realm',
            domain: 'test.example.com',
            isDefault: false,
            userRole: 'ADMIN',
            userCount: 5,
            documentCount: 10,
            lastUpdated: '2024-01-15T10:30:00Z',
            createdAt: new Date('2023-06-01T00:00:00Z'),
            updatedAt: new Date('2024-01-15T10:30:00Z'),
          },
          documents: [
            {
              id: 'doc-1',
              name: 'Test Document',
              type: 'PDF',
              state: 'ingested',
              version: 1,
              chunks: 25,
              quality: 95,
              uploadDate: '2024-01-10',
              processingMode: 'MANUAL',
            },
          ],
        }}
      >
        <Story />
      </MockAppProvider>
    ),
  ],
};
