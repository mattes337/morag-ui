/**
 * Mock data for document management
 */

export interface DocumentMetadata {
  id: string;
  name: string;
  filename: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingStage?: 'markdown-conversion' | 'markdown-optimizer' | 'chunker' | 'fact-generator' | 'ingestor';
  progress?: number;
  tags: string[];
  description?: string;
  chunkCount?: number;
  factCount?: number;
  realmId: string;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  speed?: number; // bytes per second
  eta?: number; // seconds remaining
  error?: string;
}

// Mock document data
export const mockDocuments: DocumentMetadata[] = [
  {
    id: 'doc-1',
    name: 'Product Requirements Document',
    filename: 'PRD_MoRAG_v2.1.pdf',
    type: 'application/pdf',
    size: 2.5 * 1024 * 1024, // 2.5MB
    uploadedAt: new Date('2024-01-15T10:30:00Z'),
    uploadedBy: 'John Doe',
    status: 'completed',
    tags: ['requirements', 'product', 'v2.1'],
    description: 'Comprehensive product requirements for MoRAG version 2.1',
    chunkCount: 45,
    factCount: 123,
    realmId: 'realm-1',
    thumbnailUrl: '/api/thumbnails/doc-1.png'
  },
  {
    id: 'doc-2',
    name: 'Technical Architecture Guide',
    filename: 'tech_arch_guide.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1.8 * 1024 * 1024, // 1.8MB
    uploadedAt: new Date('2024-01-14T15:45:00Z'),
    uploadedBy: 'Jane Smith',
    status: 'processing',
    processingStage: 'chunker',
    progress: 65,
    tags: ['architecture', 'technical', 'guide'],
    description: 'Detailed technical architecture documentation',
    realmId: 'realm-1'
  },
  {
    id: 'doc-3',
    name: 'Meeting Notes - Q1 Planning',
    filename: 'meeting_notes_q1_2024.txt',
    type: 'text/plain',
    size: 45 * 1024, // 45KB
    uploadedAt: new Date('2024-01-12T09:15:00Z'),
    uploadedBy: 'Mike Johnson',
    status: 'completed',
    tags: ['meeting', 'planning', 'q1'],
    description: 'Notes from Q1 2024 planning meeting',
    chunkCount: 8,
    factCount: 23,
    realmId: 'realm-1'
  },
  {
    id: 'doc-4',
    name: 'User Research Report',
    filename: 'user_research_report_jan_2024.pdf',
    type: 'application/pdf',
    size: 4.2 * 1024 * 1024, // 4.2MB
    uploadedAt: new Date('2024-01-10T14:20:00Z'),
    uploadedBy: 'Sarah Wilson',
    status: 'failed',
    tags: ['research', 'user', 'report'],
    description: 'Comprehensive user research findings for January 2024',
    error: 'Processing failed due to corrupted file content',
    realmId: 'realm-1'
  },
  {
    id: 'doc-5',
    name: 'API Documentation',
    filename: 'api_docs_v3.md',
    type: 'text/markdown',
    size: 890 * 1024, // 890KB
    uploadedAt: new Date('2024-01-08T11:30:00Z'),
    uploadedBy: 'David Chen',
    status: 'processing',
    processingStage: 'fact-generator',
    progress: 80,
    tags: ['api', 'documentation', 'v3'],
    description: 'Complete API documentation for version 3.0',
    realmId: 'realm-1'
  },
  {
    id: 'doc-6',
    name: 'Database Schema Design',
    filename: 'db_schema_design.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1.2 * 1024 * 1024, // 1.2MB
    uploadedAt: new Date('2024-01-05T16:45:00Z'),
    uploadedBy: 'Emily Davis',
    status: 'completed',
    tags: ['database', 'schema', 'design'],
    description: 'Database schema design and relationships',
    chunkCount: 28,
    factCount: 67,
    realmId: 'realm-1'
  },
  {
    id: 'doc-7',
    name: 'Security Guidelines',
    filename: 'security_guidelines_2024.pdf',
    type: 'application/pdf',
    size: 3.1 * 1024 * 1024, // 3.1MB
    uploadedAt: new Date('2024-01-03T08:20:00Z'),
    uploadedBy: 'Robert Taylor',
    status: 'pending',
    tags: ['security', 'guidelines', '2024'],
    description: 'Security guidelines and best practices for 2024',
    realmId: 'realm-1'
  },
  {
    id: 'doc-8',
    name: 'Performance Benchmarks',
    filename: 'perf_benchmarks.txt',
    type: 'text/plain',
    size: 125 * 1024, // 125KB
    uploadedAt: new Date('2024-01-02T13:10:00Z'),
    uploadedBy: 'Lisa Anderson',
    status: 'completed',
    tags: ['performance', 'benchmarks', 'testing'],
    description: 'Performance benchmark results and analysis',
    chunkCount: 12,
    factCount: 34,
    realmId: 'realm-1'
  }
];

// Mock upload progress data
export const mockUploadProgress: UploadProgress[] = [
  {
    fileId: 'upload-1',
    filename: 'large_dataset.pdf',
    progress: 75,
    status: 'uploading',
    speed: 1024 * 1024, // 1MB/s
    eta: 30 // 30 seconds
  },
  {
    fileId: 'upload-2',
    filename: 'training_manual.docx',
    progress: 100,
    status: 'completed'
  },
  {
    fileId: 'upload-3',
    filename: 'corrupted_file.pdf',
    progress: 45,
    status: 'failed',
    error: 'Upload failed: Network connection lost'
  }
];

// Processing stage information
export const processingStages = [
  {
    id: 'markdown-conversion',
    name: 'Markdown Conversion',
    description: 'Converting document to markdown format',
    icon: 'file-text'
  },
  {
    id: 'markdown-optimizer',
    name: 'Text Optimization',
    description: 'Optimizing text content with AI',
    icon: 'wand'
  },
  {
    id: 'chunker',
    name: 'Content Chunking',
    description: 'Breaking content into semantic chunks',
    icon: 'scissors'
  },
  {
    id: 'fact-generator',
    name: 'Fact Extraction',
    description: 'Extracting facts and entities',
    icon: 'brain'
  },
  {
    id: 'ingestor',
    name: 'Database Ingestion',
    description: 'Storing in vector and graph databases',
    icon: 'database'
  }
];

// Document statistics for dashboard
export const mockDocumentStats = {
  total: mockDocuments.length,
  pending: mockDocuments.filter(doc => doc.status === 'pending').length,
  processing: mockDocuments.filter(doc => doc.status === 'processing').length,
  completed: mockDocuments.filter(doc => doc.status === 'completed').length,
  failed: mockDocuments.filter(doc => doc.status === 'failed').length,
  totalSize: mockDocuments.reduce((sum, doc) => sum + doc.size, 0),
  totalChunks: mockDocuments.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0),
  totalFacts: mockDocuments.reduce((sum, doc) => sum + (doc.factCount || 0), 0)
};

// Helper functions for mock data manipulation
export function getDocumentById(id: string): DocumentMetadata | undefined {
  return mockDocuments.find(doc => doc.id === id);
}

export function getDocumentsByStatus(status: DocumentMetadata['status']): DocumentMetadata[] {
  return mockDocuments.filter(doc => doc.status === status);
}

export function getDocumentsByTag(tag: string): DocumentMetadata[] {
  return mockDocuments.filter(doc => doc.tags.includes(tag));
}

export function searchDocuments(query: string): DocumentMetadata[] {
  const lowerQuery = query.toLowerCase();
  return mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(lowerQuery) ||
    doc.filename.toLowerCase().includes(lowerQuery) ||
    doc.description?.toLowerCase().includes(lowerQuery) ||
    doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileTypeIcon(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'file-text';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return 'file-text';
    case 'text/plain':
    case 'text/markdown':
      return 'file-text';
    default:
      return 'file';
  }
}

export function getStatusColor(status: DocumentMetadata['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}