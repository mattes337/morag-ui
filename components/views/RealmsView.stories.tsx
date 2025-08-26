import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RealmsView } from './RealmsView';
import { Realm } from '../../types';
import { MockAppProvider } from '../../stories/MockAppProvider';

const meta: Meta<typeof RealmsView> = {
  title: 'Views/RealmsView',
  component: RealmsView,
  parameters: {
    layout: 'fullscreen',
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

// Mock realm data
const mockRealms: Realm[] = [
  {
    id: 'realm-1',
    name: 'Production Environment',
    description: 'Main production realm for customer-facing applications',
    domain: 'prod.morag.ai',
    isDefault: false,
    userRole: 'ADMIN',
    userCount: 15,
    documentCount: 1250,
    lastUpdated: '2024-01-15T10:30:00Z',
    createdAt: new Date('2023-06-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'realm-2',
    name: 'Development Sandbox',
    description: 'Development and testing environment for new features',
    domain: 'dev.morag.ai',
    isDefault: false,
    userRole: 'MEMBER',
    userCount: 8,
    documentCount: 342,
    lastUpdated: '2024-01-14T16:45:00Z',
    createdAt: new Date('2023-08-15T00:00:00Z'),
    updatedAt: new Date('2024-01-14T16:45:00Z'),
  },
  {
    id: 'realm-3',
    name: 'Research Lab',
    description: 'Experimental realm for AI research and model testing',
    domain: 'research.morag.ai',
    isDefault: false,
    userRole: 'MEMBER',
    userCount: 5,
    documentCount: 89,
    lastUpdated: '2024-01-13T09:15:00Z',
    createdAt: new Date('2023-11-01T00:00:00Z'),
    updatedAt: new Date('2024-01-13T09:15:00Z'),
  },
  {
    id: 'realm-4',
    name: 'Customer Demo',
    description: 'Demonstration realm for customer presentations and trials',
    domain: 'demo.morag.ai',
    isDefault: false,
    userRole: 'VIEWER',
    userCount: 3,
    documentCount: 25,
    lastUpdated: '2024-01-12T14:20:00Z',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-12T14:20:00Z'),
  },
];

// Mock handlers
const mockHandlers = {
  onCreateRealm: () => {
    console.log('🏰 [Storybook] Creating new realm');
  },
  onSelectRealm: (realm: Realm) => {
    console.log('🏰 [Storybook] Selecting realm:', realm.name);
  },
  onPromptRealm: (realm: Realm) => {
    console.log('💬 [Storybook] Opening prompt for realm:', realm.name);
  },
  onViewRealm: (realm: Realm) => {
    console.log('👁️ [Storybook] Viewing realm details:', realm.name);
  },
  onEditRealm: (realm: Realm) => {
    console.log('✏️ [Storybook] Editing realm:', realm.name);
  },
  onDeleteRealm: (realm: Realm) => {
    console.log('🗑️ [Storybook] Deleting realm:', realm.name);
  },
  onManageUsers: (realm: Realm) => {
    console.log('👥 [Storybook] Managing users for realm:', realm.name);
  },
};

export const Default: Story = {
  args: {
    realms: mockRealms,
    ...mockHandlers,
  },
};

export const EmptyState: Story = {
  args: {
    realms: [],
    ...mockHandlers,
  },
};

export const SingleRealm: Story = {
  args: {
    realms: [mockRealms[0]],
    ...mockHandlers,
  },
};

export const ManyRealms: Story = {
  args: {
    realms: [
      ...mockRealms,
      {
        id: 'realm-5',
        name: 'Staging Environment',
        description: 'Pre-production staging realm for final testing',
        domain: 'staging.morag.ai',
        isDefault: false,
        userRole: 'ADMIN',
        userCount: 12,
        documentCount: 890,
        lastUpdated: '2024-01-15T08:00:00Z',
        createdAt: new Date('2023-09-01T00:00:00Z'),
        updatedAt: new Date('2024-01-15T08:00:00Z'),
      },
      {
        id: 'realm-6',
        name: 'Training Data',
        description: 'Dedicated realm for training data and model preparation',
        domain: 'training.morag.ai',
        isDefault: false,
        userRole: 'MEMBER',
        userCount: 6,
        documentCount: 2150,
        lastUpdated: '2024-01-14T22:30:00Z',
        createdAt: new Date('2023-07-15T00:00:00Z'),
        updatedAt: new Date('2024-01-14T22:30:00Z'),
      },
    ],
    ...mockHandlers,
  },
};

export const InteractiveDemo: Story = {
  args: {
    realms: mockRealms,
    ...mockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing all realm management features. Click on realms to select them, use the action buttons to test different operations.',
      },
    },
  },
};
