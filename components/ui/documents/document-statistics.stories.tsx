import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DocumentStatistics } from './document-statistics';

const meta: Meta<typeof DocumentStatistics> = {
  title: 'Components/DocumentStatistics',
  component: DocumentStatistics,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    documentId: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock the API call for Storybook
const mockFetch = (documentId: string) => {
  // Simulate different document types with different statistics
  const mockData = {
    'doc-small': {
      processing: {
        chunks: 15,
        quality: 92,
        processingTime: 45,
        version: 1,
        lastProcessed: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      content: {
        words: 1250,
        characters: 7500,
        pages: 3,
        language: 'English',
        readingTime: 5,
      },
      knowledgeGraph: {
        entities: 25,
        facts: 45,
        relations: 18,
        concepts: 12,
        topics: ['Technology', 'Software Development'],
      },
      performance: {
        searchQueries: 12,
        avgResponseTime: 150,
        accuracy: 94,
        lastAccessed: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      },
    },
    'doc-large': {
      processing: {
        chunks: 156,
        quality: 88,
        processingTime: 420,
        version: 3,
        lastProcessed: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      },
      content: {
        words: 15750,
        characters: 94500,
        pages: 45,
        language: 'English',
        readingTime: 63,
      },
      knowledgeGraph: {
        entities: 342,
        facts: 678,
        relations: 234,
        concepts: 89,
        topics: ['Research', 'Machine Learning', 'Data Science', 'AI Ethics', 'Neural Networks'],
      },
      performance: {
        searchQueries: 156,
        avgResponseTime: 280,
        accuracy: 91,
        lastAccessed: new Date(Date.now() - 900000).toISOString(), // 15 min ago
      },
    },
    'doc-technical': {
      processing: {
        chunks: 89,
        quality: 96,
        processingTime: 180,
        version: 2,
        lastProcessed: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
      },
      content: {
        words: 8900,
        characters: 53400,
        pages: 28,
        language: 'English',
        readingTime: 36,
      },
      knowledgeGraph: {
        entities: 178,
        facts: 345,
        relations: 156,
        concepts: 67,
        topics: ['API Documentation', 'Software Architecture', 'System Design', 'Best Practices'],
      },
      performance: {
        searchQueries: 89,
        avgResponseTime: 195,
        accuracy: 97,
        lastAccessed: new Date(Date.now() - 600000).toISOString(), // 10 min ago
      },
    },
  };

  return mockData[documentId as keyof typeof mockData] || mockData['doc-small'];
};

// Override fetch for Storybook
if (typeof window !== 'undefined') {
  (window as any).fetch = jest.fn((url: string) => {
    const documentId = url.split('/').pop();
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockFetch(documentId || 'doc-small')),
    });
  });
}

export const SmallDocument: Story = {
  args: {
    documentId: 'doc-small',
  },
};

export const LargeDocument: Story = {
  args: {
    documentId: 'doc-large',
  },
};

export const TechnicalDocument: Story = {
  args: {
    documentId: 'doc-technical',
  },
};

export const LoadingState: Story = {
  args: {
    documentId: 'doc-loading',
  },
  parameters: {
    mockData: [
      {
        url: '/api/documents/doc-loading/statistics',
        method: 'GET',
        status: 200,
        delay: 5000, // 5 second delay to show loading state
        response: mockFetch('doc-small'),
      },
    ],
  },
};

export const ErrorState: Story = {
  args: {
    documentId: 'doc-error',
  },
  parameters: {
    mockData: [
      {
        url: '/api/documents/doc-error/statistics',
        method: 'GET',
        status: 500,
        response: { error: 'Failed to fetch document statistics' },
      },
    ],
  },
};
