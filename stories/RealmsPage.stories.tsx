import type { Meta, StoryObj } from '@storybook/react';
import { RealmsView } from '../components/views/RealmsView';
import { withMockAppProvider } from './MockAppProvider';
import { Realm } from '../types';

const meta: Meta<typeof RealmsView> = {
  title: 'Pages/RealmsPage',
  component: RealmsView,
  decorators: [withMockAppProvider],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main dashboard page showing available realms with various states and actions.',
      },
    },
  },
  argTypes: {
    realms: {
      control: false,
      description: 'Array of realms to display',
    },
    onCreateRealm: {
      action: 'onCreateRealm',
      description: 'Callback to create a new realm',
    },
    onSelectRealm: {
      action: 'onSelectRealm',
      description: 'Callback to select a realm',
    },
    onPromptRealm: {
      action: 'onPromptRealm',
      description: 'Callback to prompt with a realm',
    },
    onViewRealm: {
      action: 'onViewRealm',
      description: 'Callback to view realm details',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RealmsView>;

// Mock data
const mockRealms: Realm[] = [
  {
    id: '1',
    name: 'Research & Development',
    description: 'Technical documentation, research papers, and development resources',
    domain: 'research.company.com',
    isDefault: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Marketing Content',
    description: 'Marketing materials, campaigns, and brand guidelines',
    domain: 'marketing.company.com',
    isDefault: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    name: 'Legal & Compliance',
    description: 'Legal documents, contracts, and compliance materials',
    domain: 'legal.company.com',
    isDefault: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '4',
    name: 'Customer Support',
    description: 'Support documentation, FAQs, and training materials',
    domain: 'support.company.com',
    isDefault: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-13'),
  },
];

export const Default: Story = {
  args: {
    realms: mockRealms,
    onCreateRealm: () => console.log('Create realm'),
    onSelectRealm: (realm) => console.log('Select realm:', realm.name),
    onPromptRealm: (realm) => console.log('Prompt realm:', realm.name),
    onViewRealm: (realm) => console.log('View realm:', realm.name),
  },
};

export const EmptyState: Story = {
  args: {
    realms: [],
    onCreateRealm: () => console.log('Create realm'),
    onSelectRealm: (realm) => console.log('Select realm:', realm.name),
    onPromptRealm: (realm) => console.log('Prompt realm:', realm.name),
    onViewRealm: (realm) => console.log('View realm:', realm.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Realms page with no realms, showing the empty state with call-to-action to create the first realm.',
      },
    },
  },
};

export const SingleRealm: Story = {
  args: {
    realms: [mockRealms[0]],
    onCreateRealm: () => console.log('Create realm'),
    onSelectRealm: (realm) => console.log('Select realm:', realm.name),
    onPromptRealm: (realm) => console.log('Prompt realm:', realm.name),
    onViewRealm: (realm) => console.log('View realm:', realm.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Realms page with a single realm, showing how the layout adapts.',
      },
    },
  },
};

export const ManyRealms: Story = {
  args: {
    realms: [
      ...mockRealms,
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `realm-${i + 5}`,
        name: `Realm ${i + 5}`,
        description: `Description for realm ${i + 5} with various content types and use cases.`,
        domain: `realm${i + 5}.company.com`,
        isDefault: false,
        createdAt: new Date(2024, 0, i + 1),
        updatedAt: new Date(2024, 0, i + 5),
      })),
    ],
    onCreateRealm: () => console.log('Create realm'),
    onSelectRealm: (realm) => console.log('Select realm:', realm.name),
    onPromptRealm: (realm) => console.log('Prompt realm:', realm.name),
    onViewRealm: (realm) => console.log('View realm:', realm.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Realms page with many realms to test grid layout and responsiveness.',
      },
    },
  },
};

export const LongNames: Story = {
  args: {
    realms: [
      {
        id: '1',
        name: 'Very Long Realm Name That Might Wrap to Multiple Lines',
        description: 'This is a very long description that tests how the component handles extensive text content and ensures proper wrapping and layout.',
        domain: 'very-long-subdomain-name.company.com',
        isDefault: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Short',
        description: 'Brief.',
        domain: 'short.co',
        isDefault: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        id: '3',
        name: 'Medium Length Realm Name',
        description: 'A moderately sized description that provides enough context without being overwhelming.',
        domain: 'medium.company.com',
        isDefault: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-14'),
      },
    ],
    onCreateRealm: () => console.log('Create realm'),
    onSelectRealm: (realm) => console.log('Select realm:', realm.name),
    onPromptRealm: (realm) => console.log('Prompt realm:', realm.name),
    onViewRealm: (realm) => console.log('View realm:', realm.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Realms page with varying name and description lengths to test text handling and layout.',
      },
    },
  },
};

export const RecentlyUpdated: Story = {
  args: {
    realms: mockRealms.map((realm, index) => ({
      ...realm,
      updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Recent updates
    })),
    onCreateRealm: () => console.log('Create realm'),
    onSelectRealm: (realm) => console.log('Select realm:', realm.name),
    onPromptRealm: (realm) => console.log('Prompt realm:', realm.name),
    onViewRealm: (realm) => console.log('View realm:', realm.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Realms page with recently updated realms, showing how timestamps are displayed.',
      },
    },
  },
};
