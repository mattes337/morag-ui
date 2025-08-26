import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DocumentsView } from './DocumentsView';
import { Document, Realm } from '../../types';
import { MockAppProvider } from '../../stories/MockAppProvider';

const meta: Meta<typeof DocumentsView> = {
  title: 'Views/DocumentsView',
  component: DocumentsView,
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
const mockRealm: Realm = {
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
};

// Mock document data
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Product Requirements Document',
    type: 'PDF',
    state: 'ingested',
    version: 2,
    chunks: 45,
    quality: 92,
    uploadDate: '2024-01-10',
    processingMode: 'AUTOMATIC',
  },
  {
    id: 'doc-2',
    name: 'API Documentation',
    type: 'Markdown',
    state: 'ingesting',
    version: 1,
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-15',
    processingMode: 'MANUAL',
  },
  {
    id: 'doc-3',
    name: 'User Manual v3.2',
    type: 'DOCX',
    state: 'ingested',
    version: 3,
    chunks: 78,
    quality: 88,
    uploadDate: '2024-01-08',
    processingMode: 'AUTOMATIC',
  },
  {
    id: 'doc-4',
    name: 'Technical Specifications',
    type: 'PDF',
    state: 'pending',
    version: 1,
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-14',
    processingMode: 'MANUAL',
  },
  {
    id: 'doc-5',
    name: 'Meeting Notes - Q1 Planning',
    type: 'TXT',
    state: 'ingested',
    version: 1,
    chunks: 12,
    quality: 76,
    uploadDate: '2024-01-05',
    processingMode: 'AUTOMATIC',
  },
  {
    id: 'doc-6',
    name: 'Database Schema Documentation',
    type: 'Markdown',
    state: 'pending',
    version: 2,
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-12',
    processingMode: 'AUTOMATIC',
  },
  {
    id: 'doc-7',
    name: 'Customer Feedback Analysis',
    type: 'XLSX',
    state: 'ingested',
    version: 1,
    chunks: 23,
    quality: 94,
    uploadDate: '2024-01-09',
    processingMode: 'MANUAL',
  },
  {
    id: 'doc-8',
    name: 'Security Audit Report',
    type: 'PDF',
    state: 'ingesting',
    version: 1,
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-13',
    processingMode: 'AUTOMATIC',
  },
];

// Mock handlers
const mockHandlers = {
  onBackToRealms: () => {
    console.log('🔙 [Storybook] Navigating back to realms');
  },
  onAddDocument: () => {
    console.log('➕ [Storybook] Adding new document');
  },
  onPromptDocument: (document: Document) => {
    console.log('💬 [Storybook] Opening prompt for document:', document.name);
  },
  onViewDocumentDetail: (document: Document) => {
    console.log('👁️ [Storybook] Viewing document details:', document.name);
  },
};

export const Default: Story = {
  args: {
    documents: mockDocuments,
    selectedRealm: mockRealm,
    ...mockHandlers,
  },
};

export const EmptyState: Story = {
  args: {
    documents: [],
    selectedRealm: mockRealm,
    ...mockHandlers,
  },
};

export const SingleDocument: Story = {
  args: {
    documents: [mockDocuments[0]],
    selectedRealm: mockRealm,
    ...mockHandlers,
  },
};

export const ProcessingStates: Story = {
  args: {
    documents: [
      mockDocuments[1], // ingesting
      mockDocuments[3], // pending
      mockDocuments[5], // failed
      mockDocuments[7], // ingesting
    ],
    selectedRealm: mockRealm,
    ...mockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows documents in various processing states: ingesting, pending, deleted.',
      },
    },
  },
};

export const MixedProcessingModes: Story = {
  args: {
    documents: mockDocuments.slice(0, 6),
    selectedRealm: mockRealm,
    ...mockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows documents with both MANUAL and AUTOMATIC processing modes.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    documents: mockDocuments,
    selectedRealm: mockRealm,
    ...mockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing all document management features. Click on documents to view details, use action buttons to test different operations.',
      },
    },
  },
};
