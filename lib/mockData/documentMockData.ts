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
  processingStage: 'markdown-conversion' | 'markdown-optimizer' | 'chunker' | 'fact-generator' | 'ingestor' | undefined;
  progress: number | undefined;
  tags: string[];
  description: string | undefined;
  chunkCount: number | undefined;
  factCount: number | undefined;
  realmId: string;
  url: string | undefined;
  thumbnailUrl: string | undefined;
  error: string | undefined;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  speed: number | undefined; // bytes per second
  eta: number | undefined; // seconds remaining
  error: string | undefined;
}

// Generate large dataset of realistic documents
function generateLargeDocumentDataset(): DocumentMetadata[] {
  const documents: DocumentMetadata[] = []
  const documentTypes = [
    { ext: 'pdf', mime: 'application/pdf', name: 'PDF Document' },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Word Document' },
    { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: 'PowerPoint Presentation' },
    { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Excel Spreadsheet' },
    { ext: 'txt', mime: 'text/plain', name: 'Text File' },
    { ext: 'md', mime: 'text/markdown', name: 'Markdown File' },
    { ext: 'html', mime: 'text/html', name: 'HTML File' },
    { ext: 'csv', mime: 'text/csv', name: 'CSV File' },
  ]

  const companyDepartments = ['Marketing', 'Sales', 'Engineering', 'HR', 'Finance', 'Legal', 'Operations', 'Support']
  const documentCategories = [
    'Reports', 'Presentations', 'Policies', 'Procedures', 'Training', 'Analysis', 
    'Specifications', 'Documentation', 'Contracts', 'Proposals', 'Research', 'Reviews'
  ]
  
  const processingStages: DocumentMetadata['processingStage'][] = [
    'markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'
  ]
  
  const statuses: DocumentMetadata['status'][] = ['pending', 'processing', 'completed', 'failed']
  const realms = ['1', '2', '3', '4', '5']
  const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Chen', 'Emily Davis', 'Robert Taylor', 'Lisa Anderson', 'Maria Garcia', 'Tom Wilson']

  // Generate base names for different document types
  const documentNames = {
    Reports: [
      'Quarterly Business Review', 'Financial Performance Report', 'Market Analysis Report', 
      'Employee Satisfaction Survey', 'Product Performance Metrics', 'Sales Forecast Report',
      'Customer Feedback Analysis', 'Risk Assessment Report', 'Compliance Audit Report',
      'Operational Efficiency Study', 'Competitive Analysis Report', 'Budget Analysis Report'
    ],
    Presentations: [
      'Product Launch Strategy', 'Team Meeting Presentation', 'Board Meeting Slides',
      'Training Workshop Materials', 'Client Proposal Presentation', 'Annual Review Slides',
      'Project Status Update', 'Strategy Planning Session', 'Sales Pitch Deck',
      'Onboarding Presentation', 'Performance Review Guidelines', 'Company Vision Presentation'
    ],
    Policies: [
      'Employee Handbook', 'Remote Work Policy', 'Data Privacy Policy',
      'Security Guidelines', 'Code of Conduct', 'Travel Policy',
      'Expense Policy', 'Leave Policy', 'Performance Management Policy',
      'IT Security Policy', 'Vendor Management Policy', 'Quality Assurance Policy'
    ],
    Procedures: [
      'Incident Response Procedure', 'Document Review Process', 'Customer Onboarding Flow',
      'Equipment Setup Guide', 'Data Backup Procedure', 'Software Installation Guide',
      'Performance Review Process', 'Hiring Process Documentation', 'Change Management Process',
      'Quality Control Checklist', 'Emergency Response Plan', 'System Maintenance Procedure'
    ],
    Training: [
      'New Employee Orientation', 'Software Training Manual', 'Safety Training Materials',
      'Leadership Development Program', 'Technical Skills Workshop', 'Customer Service Training',
      'Compliance Training Course', 'Sales Training Module', 'Product Knowledge Guide',
      'Communication Skills Training', 'Project Management Certification', 'Digital Literacy Course'
    ],
    Analysis: [
      'Customer Behavior Analysis', 'Website Traffic Study', 'Sales Performance Analysis',
      'User Experience Research', 'Market Trend Analysis', 'Cost-Benefit Analysis',
      'Workflow Efficiency Study', 'Technology Assessment', 'Competitive Benchmarking',
      'Customer Journey Mapping', 'Process Improvement Analysis', 'ROI Analysis Report'
    ]
  }

  // Generate 500+ realistic documents
  for (let i = 0; i < 500; i++) {
    const department = companyDepartments[Math.floor(Math.random() * companyDepartments.length)]!
    const category = documentCategories[Math.floor(Math.random() * documentCategories.length)]!
    const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)]!
    const status = statuses[Math.floor(Math.random() * statuses.length)]!
    const user = users[Math.floor(Math.random() * users.length)]!
    const realm = realms[Math.floor(Math.random() * realms.length)]!
    
    // Pick a base name from the appropriate category
    const categoryNames = documentNames[category as keyof typeof documentNames] || ['Document']
    const baseName = categoryNames[Math.floor(Math.random() * categoryNames.length)]!
    
    // Create variations of the name
    const year = 2020 + Math.floor(Math.random() * 5)
    const quarter = ['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(Math.random() * 4)]!
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Math.floor(Math.random() * 12)]!
    const version = `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`
    
    let name = baseName
    if (Math.random() > 0.7) name += ` ${year}`
    if (Math.random() > 0.8) name += ` ${quarter}`
    if (Math.random() > 0.9) name += ` ${month}`
    if (Math.random() > 0.85) name += ` ${version}`
    if (Math.random() > 0.9) name += ` - ${department}`
    
    const filename = `${name.replace(/[^a-zA-Z0-9\\s-]/g, '').replace(/\\s+/g, '_')}.${docType.ext}`
    
    // Generate realistic file sizes (in bytes)
    let baseSize = 50000 // 50KB base
    if (docType.ext === 'pdf') baseSize = 2000000 // 2MB for PDFs
    else if (docType.ext === 'docx') baseSize = 500000 // 500KB for Word docs
    else if (docType.ext === 'pptx') baseSize = 5000000 // 5MB for presentations
    else if (docType.ext === 'xlsx') baseSize = 1000000 // 1MB for spreadsheets
    
    const size = baseSize + Math.floor(Math.random() * baseSize * 2)
    
    // Generate upload date (last 2 years)
    const uploadDate = new Date(Date.now() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000))
    
    // Generate processing stage and progress based on status
    let processingStage: DocumentMetadata['processingStage']
    let progress: number | undefined
    let chunkCount: number | undefined
    let factCount: number | undefined
    let error: string | undefined
    
    if (status === 'completed') {
      processingStage = undefined
      progress = undefined
      chunkCount = Math.floor(Math.random() * 100) + 5
      factCount = Math.floor(Math.random() * 200) + 10
    } else if (status === 'processing') {
      processingStage = processingStages[Math.floor(Math.random() * processingStages.length)]
      progress = Math.floor(Math.random() * 80) + 10
    } else if (status === 'failed') {
      processingStage = processingStages[Math.floor(Math.random() * processingStages.length)]
      progress = Math.floor(Math.random() * 60) + 10
      const errors = [
        'File format not supported',
        'Processing timeout occurred',
        'Insufficient memory for processing',
        'Network connection lost during processing',
        'Invalid file structure detected',
        'Processing service unavailable',
        'File size exceeds limit',
        'Corrupted file content detected'
      ]
      error = errors[Math.floor(Math.random() * errors.length)]
    } else {
      // pending
      processingStage = undefined
      progress = undefined
    }
    
    // Generate realistic tags
    const availableTags = [
      department.toLowerCase(),
      category.toLowerCase(),
      year.toString(),
      quarter?.toLowerCase(),
      docType.name.toLowerCase().replace(/\\s+/g, '-'),
      'internal',
      'external',
      'confidential',
      'draft',
      'final',
      'review',
      'archived'
    ]
    
    const numTags = Math.floor(Math.random() * 4) + 1
    const tags: string[] = []
    for (let j = 0; j < numTags; j++) {
      const tag = availableTags[Math.floor(Math.random() * availableTags.length)]!
      if (!tags.includes(tag)) {
        tags.push(tag)
      }
    }
    
    const description = `${category} document for ${department} department - ${baseName}`
    
    documents.push({
      id: `doc-gen-${String(i + 100).padStart(4, '0')}`,
      name,
      filename,
      type: docType.mime,
      size,
      uploadedAt: uploadDate,
      uploadedBy: user,
      status,
      processingStage,
      progress,
      tags,
      description,
      chunkCount,
      factCount,
      realmId: realm,
      url: `/api/documents/doc-gen-${String(i + 100).padStart(4, '0')}/download`,
      thumbnailUrl: docType.ext === 'pdf' || docType.ext.includes('image') ? `/api/thumbnails/doc-gen-${String(i + 100).padStart(4, '0')}.png` : undefined,
      error
    })
  }
  
  return documents
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
    processingStage: undefined,
    progress: undefined,
    tags: ['requirements', 'product', 'v2.1'],
    description: 'Comprehensive product requirements for MoRAG version 2.1',
    chunkCount: 45,
    factCount: 123,
    realmId: 'realm-1',
    url: '/api/documents/doc-1/download',
    thumbnailUrl: '/api/thumbnails/doc-1.png',
    error: undefined
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
    chunkCount: undefined,
    factCount: undefined,
    realmId: 'realm-1',
    url: '/api/documents/doc-2/download',
    thumbnailUrl: undefined,
    error: undefined
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
    processingStage: undefined,
    progress: undefined,
    tags: ['meeting', 'planning', 'q1'],
    description: 'Notes from Q1 2024 planning meeting',
    chunkCount: 8,
    factCount: 23,
    realmId: 'realm-1',
    url: '/api/documents/doc-3/download',
    thumbnailUrl: undefined,
    error: undefined
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
    processingStage: 'markdown-conversion',
    progress: 25,
    tags: ['research', 'user', 'report'],
    description: 'Comprehensive user research findings for January 2024',
    chunkCount: undefined,
    factCount: undefined,
    realmId: 'realm-1',
    url: '/api/documents/doc-4/download',
    thumbnailUrl: '/api/thumbnails/doc-4.png',
    error: 'Processing failed due to corrupted file content'
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
    chunkCount: undefined,
    factCount: undefined,
    realmId: 'realm-1',
    url: '/api/documents/doc-5/download',
    thumbnailUrl: undefined,
    error: undefined
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
    processingStage: undefined,
    progress: undefined,
    tags: ['database', 'schema', 'design'],
    description: 'Database schema design and relationships',
    chunkCount: 28,
    factCount: 67,
    realmId: 'realm-1',
    url: '/api/documents/doc-6/download',
    thumbnailUrl: undefined,
    error: undefined
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
    processingStage: undefined,
    progress: undefined,
    tags: ['security', 'guidelines', '2024'],
    description: 'Security guidelines and best practices for 2024',
    chunkCount: undefined,
    factCount: undefined,
    realmId: 'realm-1',
    url: '/api/documents/doc-7/download',
    thumbnailUrl: '/api/thumbnails/doc-7.png',
    error: undefined
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
    processingStage: undefined,
    progress: undefined,
    tags: ['performance', 'benchmarks', 'testing'],
    description: 'Performance benchmark results and analysis',
    chunkCount: 12,
    factCount: 34,
    realmId: 'realm-1',
    url: '/api/documents/doc-8/download',
    thumbnailUrl: undefined,
    error: undefined
  },
  // Generated realistic document data (500+ entries)
  ...generateLargeDocumentDataset(),
];

// Mock upload progress data
export const mockUploadProgress: UploadProgress[] = [
  {
    fileId: 'upload-1',
    filename: 'large_dataset.pdf',
    progress: 75,
    status: 'uploading',
    speed: 1024 * 1024, // 1MB/s
    eta: 30, // 30 seconds
    error: undefined
  },
  {
    fileId: 'upload-2',
    filename: 'training_manual.docx',
    progress: 100,
    status: 'completed',
    speed: undefined,
    eta: undefined,
    error: undefined
  },
  {
    fileId: 'upload-3',
    filename: 'corrupted_file.pdf',
    progress: 45,
    status: 'failed',
    speed: undefined,
    eta: undefined,
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

// Document statistics for dashboard - computed dynamically to handle large dataset
export const getMockDocumentStats = () => ({
  total: mockDocuments.length,
  pending: mockDocuments.filter(doc => doc.status === 'pending').length,
  processing: mockDocuments.filter(doc => doc.status === 'processing').length,
  completed: mockDocuments.filter(doc => doc.status === 'completed').length,
  failed: mockDocuments.filter(doc => doc.status === 'failed').length,
  totalSize: mockDocuments.reduce((sum, doc) => sum + doc.size, 0),
  totalChunks: mockDocuments.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0),
  totalFacts: mockDocuments.reduce((sum, doc) => sum + (doc.factCount || 0), 0)
});

// For backward compatibility
export const mockDocumentStats = getMockDocumentStats();

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