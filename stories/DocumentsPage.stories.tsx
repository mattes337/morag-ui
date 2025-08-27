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
  isDefault: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Machine Learning Research Paper',
    type: 'PDF',
    subType: 'academic',
    state: 'ingested',
    version: 1,
    chunks: 45,
    quality: 92,
    uploadDate: '2024-01-10',
    processingMode: 'AUTOMATIC',
    currentStage: 'INGESTOR',
    metadata: {},
  },
  {
    id: '2',
    name: 'Company Presentation Q4 2024',
    type: 'PPTX',
    subType: 'presentation',
    state: 'ingesting',
    version: 1,
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-14',
    processingMode: 'AUTOMATIC',
    currentStage: 'CHUNKER',
    metadata: {},
  },
  {
    id: '3',
    name: 'Podcast Interview with Tech Leader',
    type: 'MP3',
    subType: 'interview',
    state: 'pending',
    version: 1,
    currentStage: 'MARKDOWN_CONVERSION',
    processingMode: 'AUTOMATIC',
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-13',
    metadata: {},
  },
  {
    id: '4',
    name: 'YouTube Tutorial Series',
    type: 'YouTube',
    subType: 'educational',
    state: 'pending',
    version: 1,
    currentStage: undefined,
    processingMode: 'MANUAL',
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-15',
    metadata: { url: 'https://youtube.com/watch?v=example' },
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
        type: ['PDF', 'DOCX', 'MP3', 'MP4', 'TXT'][i % 5] as any,
        subType: 'general',
        state: ['ingested', 'ingesting', 'pending', 'deleted'][i % 4] as any,
        version: 1,
        currentStage: ['INGESTOR', 'CHUNKER', 'MARKDOWN_CONVERSION', undefined][i % 4] as any,
        processingMode: 'AUTOMATIC' as any,
        chunks: Math.floor(Math.random() * 100),
        quality: Math.floor(Math.random() * 100),
        uploadDate: new Date(2024, 0, i + 1).toISOString().split('T')[0],
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
