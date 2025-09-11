/**
 * Advanced document mock data with 1000+ realistic entries and complex metadata
 * Task C1: Advanced Mock Data Expansion
 */

export interface AdvancedDocumentMetadata {
  id: string;
  name: string;
  filename: string;
  type: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  updatedAt: Date;
  uploadedBy: string;
  lastModifiedBy: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived';
  processingStage: 'markdown-conversion' | 'markdown-optimizer' | 'chunker' | 'fact-generator' | 'ingestor' | undefined;
  progress: number | undefined;
  tags: string[];
  categories: string[];
  description: string | undefined;
  chunkCount: number | undefined;
  factCount: number | undefined;
  entityCount: number | undefined;
  realmId: string;
  url: string | undefined;
  thumbnailUrl: string | undefined;
  error: string | undefined;
  // Advanced metadata
  version: number;
  versionHistory: DocumentVersion[];
  collaborators: string[];
  permissions: DocumentPermission[];
  relationships: DocumentRelationship[];
  metadata: CustomMetadata;
  processingMetrics: ProcessingMetrics;
  contentAnalysis: ContentAnalysis;
  searchIndex: SearchIndexData;
  auditLog: AuditLogEntry[];
}

export interface DocumentVersion {
  version: number;
  createdAt: Date;
  createdBy: string;
  changes: string[];
  size: number;
  checksum: string;
  isActive: boolean;
}

export interface DocumentPermission {
  userId: string;
  permission: 'read' | 'write' | 'admin' | 'owner';
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

export interface DocumentRelationship {
  type: 'references' | 'parent' | 'child' | 'similar' | 'duplicate' | 'merged';
  targetDocumentId: string;
  confidence: number;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface CustomMetadata {
  industry: string;
  department: string;
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  complianceFlags: string[];
  businessValue: 'low' | 'medium' | 'high' | 'critical';
  retentionPeriod: number; // days
  customFields: Record<string, any>;
}

export interface ProcessingMetrics {
  processingTimeMs: number;
  cpuTimeMs: number;
  memoryUsageBytes: number;
  stageMetrics: StageMetric[];
  errorCount: number;
  warningCount: number;
  qualityScore: number; // 0-100
}

export interface StageMetric {
  stage: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  status: 'success' | 'failure' | 'warning';
  metrics: Record<string, number>;
}

export interface ContentAnalysis {
  language: string;
  languageConfidence: number;
  readabilityScore: number;
  sentimentScore: number; // -1 to 1
  keyPhrases: string[];
  topics: Topic[];
  complexity: 'simple' | 'moderate' | 'complex' | 'technical';
  wordCount: number;
  uniqueTerms: number;
}

export interface Topic {
  name: string;
  confidence: number;
  keywords: string[];
}

export interface SearchIndexData {
  indexedAt: Date;
  indexVersion: string;
  termFrequency: Record<string, number>;
  documentRank: number;
  searchableContent: string;
  extractedEntities: Entity[];
}

export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'money' | 'percent' | 'other';
  confidence: number;
  startOffset: number;
  endOffset: number;
}

export interface AuditLogEntry {
  timestamp: Date;
  userId: string;
  action: 'view' | 'edit' | 'download' | 'share' | 'delete' | 'restore' | 'process';
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

// Generate comprehensive document dataset
function generateAdvancedDocuments(): AdvancedDocumentMetadata[] {
  const documents: AdvancedDocumentMetadata[] = [];
  
  // File types with detailed metadata
  const fileTypes = [
    { ext: 'pdf', mime: 'application/pdf', name: 'PDF Document' },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Word Document' },
    { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: 'PowerPoint Presentation' },
    { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Excel Spreadsheet' },
    { ext: 'txt', mime: 'text/plain', name: 'Text File' },
    { ext: 'md', mime: 'text/markdown', name: 'Markdown File' },
    { ext: 'html', mime: 'text/html', name: 'HTML File' },
    { ext: 'csv', mime: 'text/csv', name: 'CSV File' },
    { ext: 'json', mime: 'application/json', name: 'JSON File' },
    { ext: 'xml', mime: 'application/xml', name: 'XML File' },
    { ext: 'rtf', mime: 'application/rtf', name: 'Rich Text File' },
    { ext: 'odt', mime: 'application/vnd.oasis.opendocument.text', name: 'OpenDocument Text' },
    { ext: 'ods', mime: 'application/vnd.oasis.opendocument.spreadsheet', name: 'OpenDocument Spreadsheet' },
    { ext: 'odp', mime: 'application/vnd.oasis.opendocument.presentation', name: 'OpenDocument Presentation' },
    { ext: 'epub', mime: 'application/epub+zip', name: 'EPUB eBook' },
    { ext: 'mobi', mime: 'application/x-mobipocket-ebook', name: 'Mobi eBook' },
    { ext: 'mp3', mime: 'audio/mpeg', name: 'MP3 Audio' },
    { ext: 'mp4', mime: 'video/mp4', name: 'MP4 Video' },
    { ext: 'png', mime: 'image/png', name: 'PNG Image' },
    { ext: 'jpg', mime: 'image/jpeg', name: 'JPEG Image' },
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education',
    'Legal', 'Real Estate', 'Marketing', 'Consulting', 'Media', 'Non-profit',
    'Government', 'Automotive', 'Aerospace', 'Energy', 'Telecommunications',
    'Pharmaceuticals', 'Construction', 'Agriculture'
  ];

  const departments = [
    'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Legal',
    'Operations', 'Customer Support', 'Product Management', 'Quality Assurance',
    'Research & Development', 'Information Technology', 'Security', 'Compliance',
    'Business Development', 'Strategy', 'Analytics', 'Communications'
  ];

  const documentCategories = [
    'Reports', 'Presentations', 'Policies', 'Procedures', 'Training Materials',
    'Specifications', 'Documentation', 'Contracts', 'Proposals', 'Research',
    'Reviews', 'Manuals', 'Guidelines', 'Templates', 'Forms', 'Surveys',
    'Case Studies', 'White Papers', 'Best Practices', 'Standards'
  ];

  const complianceFlags = [
    'GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'FERPA', 'SOC2', 'ISO27001',
    'CCPA', 'PIPEDA', 'GLBA', 'COPPA', 'COSO', 'NIST', 'FedRAMP'
  ];

  const languages = [
    { code: 'en', name: 'English', confidence: 0.95 },
    { code: 'es', name: 'Spanish', confidence: 0.92 },
    { code: 'fr', name: 'French', confidence: 0.88 },
    { code: 'de', name: 'German', confidence: 0.91 },
    { code: 'it', name: 'Italian', confidence: 0.87 },
    { code: 'pt', name: 'Portuguese', confidence: 0.89 },
    { code: 'zh', name: 'Chinese', confidence: 0.93 },
    { code: 'ja', name: 'Japanese', confidence: 0.90 },
    { code: 'ko', name: 'Korean', confidence: 0.86 }
  ];

  const realms = ['realm-1', 'realm-2', 'realm-3', 'realm-4', 'realm-5', 'realm-6', 'realm-7', 'realm-8'];
  const users = [
    'john.doe', 'jane.smith', 'mike.johnson', 'sarah.wilson', 'david.chen',
    'emily.davis', 'robert.taylor', 'lisa.anderson', 'maria.garcia', 'tom.brown',
    'alice.white', 'bob.jones', 'carol.miller', 'daniel.lee', 'emma.clark',
    'frank.harris', 'grace.lewis', 'henry.walker', 'iris.hall', 'jack.young'
  ];

  const processingStages: AdvancedDocumentMetadata['processingStage'][] = [
    'markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'
  ];

  const statuses: AdvancedDocumentMetadata['status'][] = [
    'pending', 'processing', 'completed', 'failed', 'archived'
  ];

  // Document name templates for different categories
  const documentTemplates = {
    Reports: [
      'Q{quarter} {year} Financial Report', 'Annual Performance Review {year}', 
      'Market Analysis - {industry}', 'Customer Satisfaction Survey Results',
      'Risk Assessment Report {month}', 'Compliance Audit Report {year}',
      'Sales Performance Analysis Q{quarter}', 'Employee Engagement Study',
      'Competitive Intelligence Report', 'Operational Efficiency Review'
    ],
    Presentations: [
      'Board Meeting Presentation {month}', 'Product Launch Strategy {year}',
      'Team All-Hands Meeting Slides', 'Client Proposal - {company}',
      'Training Workshop Materials', 'Strategic Planning Session',
      'Quarterly Business Review', 'Project Kickoff Presentation',
      'Sales Pitch Deck v{version}', 'Executive Summary Slides'
    ],
    Policies: [
      'Employee Handbook v{version}', 'Remote Work Policy {year}',
      'Data Privacy and Protection Policy', 'Information Security Guidelines',
      'Code of Conduct and Ethics', 'Travel and Expense Policy',
      'Performance Management Policy', 'Diversity and Inclusion Policy',
      'Environmental Sustainability Policy', 'Vendor Management Guidelines'
    ],
    Procedures: [
      'Incident Response Procedure', 'Document Review Workflow',
      'Customer Onboarding Process', 'Change Management Procedure',
      'Quality Control Checklist', 'Data Backup and Recovery Plan',
      'Software Deployment Process', 'Emergency Response Plan',
      'New Employee Onboarding', 'Performance Review Process'
    ],
    'Training Materials': [
      'New Employee Orientation Guide', 'Software Training Manual v{version}',
      'Safety Training Course Materials', 'Leadership Development Program',
      'Customer Service Excellence Training', 'Compliance Training Module',
      'Technical Skills Certification Course', 'Communication Skills Workshop',
      'Project Management Best Practices', 'Digital Literacy Training'
    ]
  };

  // Helper functions
  const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomChoices = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
  };
  const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
  const randomDate = (start: Date, end: Date): Date => 
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  // Generate 1200+ documents
  for (let i = 1; i <= 1200; i++) {
    const fileType = randomChoice(fileTypes);
    const category = randomChoice(documentCategories);
    const industry = randomChoice(industries);
    const department = randomChoice(departments);
    const language = randomChoice(languages);
    const realm = randomChoice(realms);
    const uploader = randomChoice(users);
    const modifier = randomChoice(users);
    
    // Generate document name
    const template = randomChoice(documentTemplates[category as keyof typeof documentTemplates] || ['Document {id}']);
    const name = template
      .replace('{quarter}', `${randomInt(1, 4)}`)
      .replace('{year}', `${randomInt(2022, 2024)}`)
      .replace('{month}', ['January', 'February', 'March', 'April', 'May', 'June'][randomInt(0, 5)])
      .replace('{industry}', industry)
      .replace('{company}', `${randomChoice(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'])} Corp`)
      .replace('{version}', `${randomInt(1, 5)}`)
      .replace('{id}', i.toString().padStart(4, '0'));

    const filename = `${name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.${fileType.ext}`;
    const uploadedAt = randomDate(new Date('2023-01-01'), new Date());
    const updatedAt = randomDate(uploadedAt, new Date());
    const status = randomChoice(statuses);
    
    // Generate version history
    const versionCount = randomInt(1, 8);
    const versionHistory: DocumentVersion[] = [];
    for (let v = 1; v <= versionCount; v++) {
      versionHistory.push({
        version: v,
        createdAt: randomDate(uploadedAt, updatedAt),
        createdBy: randomChoice(users),
        changes: randomChoices(['Content update', 'Formatting', 'Typo fixes', 'Structure change', 'Review comments'], randomInt(1, 3)),
        size: randomInt(1024, 50 * 1024 * 1024),
        checksum: `sha256:${Math.random().toString(36).substring(2, 15)}`,
        isActive: v === versionCount
      });
    }

    // Generate collaborators and permissions
    const collaboratorCount = randomInt(1, 5);
    const documentCollaborators = randomChoices(users.filter(u => u !== uploader), collaboratorCount);
    const permissions: DocumentPermission[] = [
      {
        userId: uploader,
        permission: 'owner',
        grantedAt: uploadedAt,
        grantedBy: uploader
      },
      ...documentCollaborators.map(user => ({
        userId: user,
        permission: randomChoice(['read', 'write', 'admin'] as const),
        grantedAt: randomDate(uploadedAt, new Date()),
        grantedBy: uploader,
        expiresAt: Math.random() > 0.7 ? randomDate(new Date(), new Date('2025-12-31')) : undefined
      }))
    ];

    // Generate relationships
    const relationshipCount = randomInt(0, 3);
    const relationships: DocumentRelationship[] = [];
    for (let r = 0; r < relationshipCount; r++) {
      relationships.push({
        type: randomChoice(['references', 'parent', 'child', 'similar', 'duplicate'] as const),
        targetDocumentId: `doc-${randomInt(1, 1200).toString().padStart(4, '0')}`,
        confidence: randomFloat(0.6, 1.0),
        createdAt: randomDate(uploadedAt, new Date()),
        metadata: {
          reason: randomChoice(['Content similarity', 'Same project', 'Sequential version', 'Cross-reference'])
        }
      });
    }

    // Generate processing metrics
    const stageCount = randomInt(3, 5);
    const stageMetrics: StageMetric[] = [];
    let totalProcessingTime = 0;
    for (let s = 0; s < stageCount; s++) {
      const stage = processingStages[s % processingStages.length];
      const startTime = new Date(uploadedAt.getTime() + totalProcessingTime);
      const duration = randomInt(1000, 30000);
      const endTime = new Date(startTime.getTime() + duration);
      totalProcessingTime += duration + randomInt(100, 5000); // Gap between stages
      
      stageMetrics.push({
        stage: stage!,
        startTime,
        endTime,
        durationMs: duration,
        status: Math.random() > 0.1 ? 'success' : randomChoice(['failure', 'warning'] as const),
        metrics: {
          throughput: randomFloat(1.0, 10.0),
          accuracy: randomFloat(0.8, 1.0),
          resourceUsage: randomFloat(0.1, 0.9)
        }
      });
    }

    // Generate content analysis
    const topics: Topic[] = [];
    const topicCount = randomInt(2, 6);
    const topicNames = [
      'Business Strategy', 'Financial Analysis', 'Market Research', 'Technology',
      'Operations', 'Human Resources', 'Legal Compliance', 'Customer Experience',
      'Product Development', 'Risk Management', 'Quality Assurance', 'Innovation'
    ];
    
    for (let t = 0; t < topicCount; t++) {
      topics.push({
        name: randomChoice(topicNames),
        confidence: randomFloat(0.6, 0.95),
        keywords: randomChoices(['strategy', 'analysis', 'performance', 'optimization', 'growth', 'efficiency'], randomInt(2, 4))
      });
    }

    // Generate entities
    const entityCount = randomInt(5, 20);
    const entities: Entity[] = [];
    const entityTypes: Entity['type'][] = ['person', 'organization', 'location', 'date', 'money', 'percent'];
    
    for (let e = 0; e < entityCount; e++) {
      const text = `Entity_${e + 1}`;
      entities.push({
        text,
        type: randomChoice(entityTypes),
        confidence: randomFloat(0.7, 0.98),
        startOffset: e * 50,
        endOffset: e * 50 + text.length
      });
    }

    // Generate audit log
    const auditCount = randomInt(3, 15);
    const auditLog: AuditLogEntry[] = [];
    const actions: AuditLogEntry['action'][] = ['view', 'edit', 'download', 'share', 'process'];
    
    for (let a = 0; a < auditCount; a++) {
      auditLog.push({
        timestamp: randomDate(uploadedAt, new Date()),
        userId: randomChoice([...documentCollaborators, uploader]),
        action: randomChoice(actions),
        details: `User performed ${randomChoice(actions)} action on document`,
        ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
        userAgent: 'Mozilla/5.0 (compatible; MoRAG/1.0)'
      });
    }

    const document: AdvancedDocumentMetadata = {
      id: `doc-${i.toString().padStart(4, '0')}`,
      name,
      filename,
      type: fileType.name,
      mimeType: fileType.mime,
      size: randomInt(1024, 50 * 1024 * 1024), // 1KB to 50MB
      uploadedAt,
      updatedAt,
      uploadedBy: uploader,
      lastModifiedBy: modifier,
      status,
      processingStage: status === 'processing' ? randomChoice(processingStages) : undefined,
      progress: status === 'processing' ? randomInt(10, 90) : undefined,
      tags: randomChoices(['important', 'draft', 'final', 'review', 'archive', 'confidential', 'public'], randomInt(1, 4)),
      categories: [category, ...randomChoices(documentCategories.filter(c => c !== category), randomInt(0, 2))],
      description: Math.random() > 0.3 ? `${category} document for ${department} department in ${industry} industry` : undefined,
      chunkCount: status === 'completed' ? randomInt(5, 100) : undefined,
      factCount: status === 'completed' ? randomInt(10, 500) : undefined,
      entityCount: status === 'completed' ? randomInt(5, 50) : undefined,
      realmId: realm,
      url: Math.random() > 0.8 ? `https://example.com/docs/${i}` : undefined,
      thumbnailUrl: ['pdf', 'docx', 'pptx', 'png', 'jpg'].includes(fileType.ext) ? `/api/thumbnails/${i}` : undefined,
      error: status === 'failed' ? randomChoice(['Processing timeout', 'Corrupted file', 'Unsupported format', 'Memory limit exceeded']) : undefined,
      
      // Advanced metadata
      version: versionHistory.length,
      versionHistory,
      collaborators: documentCollaborators,
      permissions,
      relationships,
      metadata: {
        industry,
        department,
        confidentialityLevel: randomChoice(['public', 'internal', 'confidential', 'restricted'] as const),
        complianceFlags: randomChoices(complianceFlags, randomInt(0, 3)),
        businessValue: randomChoice(['low', 'medium', 'high', 'critical'] as const),
        retentionPeriod: randomChoice([365, 1825, 2555, 3650]), // 1, 5, 7, 10 years
        customFields: {
          projectCode: `PRJ-${randomInt(1000, 9999)}`,
          costCenter: `CC-${randomInt(100, 999)}`,
          reviewDue: randomDate(new Date(), new Date('2024-12-31')).toISOString()
        }
      },
      processingMetrics: {
        processingTimeMs: totalProcessingTime,
        cpuTimeMs: randomInt(1000, totalProcessingTime),
        memoryUsageBytes: randomInt(10 * 1024 * 1024, 500 * 1024 * 1024),
        stageMetrics,
        errorCount: randomInt(0, 5),
        warningCount: randomInt(0, 10),
        qualityScore: randomInt(65, 98)
      },
      contentAnalysis: {
        language: language.code,
        languageConfidence: language.confidence,
        readabilityScore: randomFloat(30, 90),
        sentimentScore: randomFloat(-0.3, 0.8),
        keyPhrases: randomChoices(['business', 'analysis', 'strategy', 'performance', 'growth', 'optimization'], randomInt(3, 6)),
        topics,
        complexity: randomChoice(['simple', 'moderate', 'complex', 'technical'] as const),
        wordCount: randomInt(100, 50000),
        uniqueTerms: randomInt(50, 5000)
      },
      searchIndex: {
        indexedAt: randomDate(uploadedAt, new Date()),
        indexVersion: `v${randomInt(1, 5)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
        termFrequency: {
          business: randomFloat(0.01, 0.1),
          analysis: randomFloat(0.01, 0.08),
          strategy: randomFloat(0.005, 0.06),
          performance: randomFloat(0.01, 0.07)
        },
        documentRank: randomFloat(0.1, 1.0),
        searchableContent: `${name} ${category} ${department} ${industry}`,
        extractedEntities: entities
      },
      auditLog
    };

    documents.push(document);
  }

  return documents;
}

// Generate the advanced documents dataset
export const advancedDocuments: AdvancedDocumentMetadata[] = generateAdvancedDocuments();

// Helper functions for accessing advanced document data
export const getAdvancedDocumentById = (id: string): AdvancedDocumentMetadata | undefined => {
  return advancedDocuments.find(doc => doc.id === id);
};

export const getAdvancedDocumentsByStatus = (status: AdvancedDocumentMetadata['status']): AdvancedDocumentMetadata[] => {
  return advancedDocuments.filter(doc => doc.status === status);
};

export const getAdvancedDocumentsByRealm = (realmId: string): AdvancedDocumentMetadata[] => {
  return advancedDocuments.filter(doc => doc.realmId === realmId);
};

export const getAdvancedDocumentsByCategory = (category: string): AdvancedDocumentMetadata[] => {
  return advancedDocuments.filter(doc => doc.categories.includes(category));
};

export const getAdvancedDocumentsByDepartment = (department: string): AdvancedDocumentMetadata[] => {
  return advancedDocuments.filter(doc => doc.metadata.department === department);
};

export const getAdvancedDocumentsByIndustry = (industry: string): AdvancedDocumentMetadata[] => {
  return advancedDocuments.filter(doc => doc.metadata.industry === industry);
};

export const searchAdvancedDocuments = (query: string): AdvancedDocumentMetadata[] => {
  const lowerQuery = query.toLowerCase();
  return advancedDocuments.filter(doc =>
    doc.name.toLowerCase().includes(lowerQuery) ||
    doc.description?.toLowerCase().includes(lowerQuery) ||
    doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    doc.categories.some(cat => cat.toLowerCase().includes(lowerQuery)) ||
    doc.contentAnalysis.keyPhrases.some(phrase => phrase.toLowerCase().includes(lowerQuery))
  );
};

export const getAdvancedDocumentStats = () => {
  const total = advancedDocuments.length;
  const statusCounts = advancedDocuments.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalSize = advancedDocuments.reduce((sum, doc) => sum + doc.size, 0);
  const avgProcessingTime = advancedDocuments
    .filter(doc => doc.processingMetrics.processingTimeMs > 0)
    .reduce((sum, doc) => sum + doc.processingMetrics.processingTimeMs, 0) / total;
  
  return {
    total,
    statusCounts,
    totalSize,
    avgProcessingTime,
    totalChunks: advancedDocuments.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0),
    totalFacts: advancedDocuments.reduce((sum, doc) => sum + (doc.factCount || 0), 0),
    totalEntities: advancedDocuments.reduce((sum, doc) => sum + (doc.entityCount || 0), 0),
    avgQualityScore: advancedDocuments.reduce((sum, doc) => sum + doc.processingMetrics.qualityScore, 0) / total,
    lastUpdated: new Date().toISOString()
  };
};

// Export for use in other components
export default advancedDocuments;