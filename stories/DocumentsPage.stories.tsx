import type { Meta, StoryObj } from '@storybook/react';
import { DocumentsView } from '../components/views/DocumentsView';
import { withMockAppProvider } from './MockAppProvider';
import { Document, Realm } from '../types';

const meta: Meta<typeof DocumentsView> = {
  title: 'Pages/DocumentsPage',
  component: DocumentsView,
  decorators: [withMockAppProvider],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Documents page showing a list of documents in the current realm with various states and actions.',
      },
    },
  },
  argTypes: {
    documents: {
      control: false,
      description: 'Array of documents to display',
    },
    selectedRealm: {
      control: false,
      description: 'Currently selected realm',
    },
    onBackToRealms: {
      action: 'onBackToRealms',
      description: 'Callback to navigate back to realms',
    },
    onAddDocument: {
      action: 'onAddDocument',
      description: 'Callback to add a new document',
    },
    onPromptDocument: {
      action: 'onPromptDocument',
      description: 'Callback to prompt with a document',
    },
    onViewDocumentDetail: {
      action: 'onViewDocumentDetail',
      description: 'Callback to view document details',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DocumentsView>;

// Mock data
const mockRealm: Realm = {
  id: '1',
  name: 'Research Realm',
  description: 'A realm for research documents and academic papers',
  domain: 'research.example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Machine Learning Research Paper',
    type: 'pdf',
    subType: 'academic',
    state: 'COMPLETED',
    currentStage: 'INGESTOR',
    processingMode: 'AUTOMATIC',
    realmId: '1',
    userId: 'user1',
    chunks: 45,
    quality: 0.92,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    url: null,
    metadata: {},
  },
  {
    id: '2',
    name: 'Company Presentation Q4 2024',
    type: 'document',
    subType: 'presentation',
    state: 'PROCESSING',
    currentStage: 'CHUNKER',
    processingMode: 'AUTOMATIC',
    realmId: '1',
    userId: 'user1',
    chunks: 0,
    quality: 0,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    url: null,
    metadata: {},
  },
  {
    id: '3',
    name: 'Podcast Interview with Tech Leader',
    type: 'audio',
    subType: 'interview',
    state: 'FAILED',
    currentStage: 'MARKDOWN_CONVERSION',
    processingMode: 'AUTOMATIC',
    realmId: '1',
    userId: 'user1',
    chunks: 0,
    quality: 0,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    url: null,
    metadata: {},
  },
  {
    id: '4',
    name: 'YouTube Tutorial Series',
    type: 'youtube',
    subType: 'educational',
    state: 'PENDING',
    currentStage: null,
    processingMode: 'MANUAL',
    realmId: '1',
    userId: 'user1',
    chunks: 0,
    quality: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    url: 'https://youtube.com/watch?v=example',
    metadata: {},
  },
];

export const Default: Story = {
  args: {
    documents: mockDocuments,
    selectedRealm: mockRealm,
    onBackToRealms: () => console.log('Back to realms'),
    onAddDocument: () => console.log('Add document'),
    onPromptDocument: (doc) => console.log('Prompt document:', doc.name),
    onViewDocumentDetail: (doc) => console.log('View document:', doc.name),
  },
};

export const EmptyState: Story = {
  args: {
    documents: [],
    selectedRealm: mockRealm,
    onBackToRealms: () => console.log('Back to realms'),
    onAddDocument: () => console.log('Add document'),
    onPromptDocument: (doc) => console.log('Prompt document:', doc.name),
    onViewDocumentDetail: (doc) => console.log('View document:', doc.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Documents page with no documents, showing the empty state with call-to-action.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    documents: [],
    selectedRealm: null,
    onBackToRealms: () => console.log('Back to realms'),
    onAddDocument: () => console.log('Add document'),
    onPromptDocument: (doc) => console.log('Prompt document:', doc.name),
    onViewDocumentDetail: (doc) => console.log('View document:', doc.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Documents page in loading state with no realm selected.',
      },
    },
  },
};

export const ManyDocuments: Story = {
  args: {
    documents: [
      ...mockDocuments,
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `doc-${i + 5}`,
        name: `Document ${i + 5}`,
        type: ['pdf', 'document', 'audio', 'video', 'youtube'][i % 5] as any,
        subType: 'general',
        state: ['COMPLETED', 'PROCESSING', 'FAILED', 'PENDING'][i % 4] as any,
        currentStage: ['INGESTOR', 'CHUNKER', 'MARKDOWN_CONVERSION', null][i % 4] as any,
        processingMode: 'AUTOMATIC' as any,
        realmId: '1',
        userId: 'user1',
        chunks: Math.floor(Math.random() * 100),
        quality: Math.random(),
        createdAt: new Date(2024, 0, i + 1),
        updatedAt: new Date(2024, 0, i + 1),
        url: null,
        metadata: {},
      })),
    ],
    selectedRealm: mockRealm,
    onBackToRealms: () => console.log('Back to realms'),
    onAddDocument: () => console.log('Add document'),
    onPromptDocument: (doc) => console.log('Prompt document:', doc.name),
    onViewDocumentDetail: (doc) => console.log('View document:', doc.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Documents page with many documents to test pagination and performance.',
      },
    },
  },
};

export const ProcessingHeavy: Story = {
  args: {
    documents: mockDocuments.map(doc => ({
      ...doc,
      state: 'PROCESSING' as any,
      currentStage: ['MARKDOWN_CONVERSION', 'CHUNKER', 'FACT_GENERATOR'][Math.floor(Math.random() * 3)] as any,
    })),
    selectedRealm: mockRealm,
    onBackToRealms: () => console.log('Back to realms'),
    onAddDocument: () => console.log('Add document'),
    onPromptDocument: (doc) => console.log('Prompt document:', doc.name),
    onViewDocumentDetail: (doc) => console.log('View document:', doc.name),
  },
  parameters: {
    docs: {
      description: {
        story: 'Documents page with all documents in processing state, showing various processing stages.',
      },
    },
  },
};
