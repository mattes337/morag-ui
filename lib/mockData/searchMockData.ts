// Mock data for search functionality testing and development

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  documentType: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'audio' | 'video' | 'webpage' | 'other';
  createdAt: string;
  updatedAt?: string;
  relevanceScore: number;
  highlights: string[];
  metadata: {
    author?: string;
    tags: string[];
    size?: number;
    realm?: string;
    path?: string;
  };
}

export interface SearchFilters {
  documentType: 'all' | 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'audio' | 'video' | 'webpage' | 'other';
  dateRange: 'all' | 'today' | 'last-week' | 'last-month' | 'last-3-months' | 'last-year' | 'custom';
  sortBy: 'relevance' | 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
  customDateFrom?: string;
  customDateTo?: string;
}

export const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Q4 Financial Report 2024',
    content: 'Comprehensive analysis of Q4 performance metrics including revenue growth, market expansion, and strategic initiatives implemented throughout the quarter.',
    excerpt: 'Q4 performance metrics including revenue growth...',
    documentType: 'pdf',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    relevanceScore: 0.95,
    highlights: ['revenue growth', 'performance metrics', 'Q4'],
    metadata: {
      author: 'Sarah Johnson',
      tags: ['finance', 'quarterly', 'revenue', 'analysis'],
      size: 2847392,
      realm: 'Corporate Finance',
      path: '/reports/2024/q4-financial-report.pdf'
    }
  },
  {
    id: '2',
    title: 'Machine Learning Best Practices Guide',
    content: 'Complete guide covering data preprocessing, model selection, training strategies, and deployment considerations for production ML systems.',
    excerpt: 'Complete guide covering data preprocessing, model selection...',
    documentType: 'docx',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    relevanceScore: 0.92,
    highlights: ['machine learning', 'best practices', 'model selection'],
    metadata: {
      author: 'Dr. Alex Chen',
      tags: ['machine-learning', 'ai', 'best-practices', 'guide', 'technical'],
      size: 1249856,
      realm: 'Data Science',
      path: '/guides/ml-best-practices.docx'
    }
  },
  {
    id: '3',
    title: 'Product Roadmap Presentation',
    content: 'Strategic product development roadmap for 2024-2025, outlining key features, milestones, and market positioning strategies.',
    excerpt: 'Strategic product development roadmap for 2024-2025...',
    documentType: 'pptx',
    createdAt: '2024-01-10T14:22:00Z',
    relevanceScore: 0.89,
    highlights: ['product roadmap', '2024', 'strategic'],
    metadata: {
      author: 'Mike Rodriguez',
      tags: ['product', 'strategy', 'roadmap', '2024', 'planning'],
      size: 5847293,
      realm: 'Product Management',
      path: '/presentations/product-roadmap-2024.pptx'
    }
  },
  {
    id: '4',
    title: 'Employee Survey Results Analysis',
    content: 'Detailed analysis of annual employee satisfaction survey results with insights on workplace culture, engagement levels, and improvement recommendations.',
    excerpt: 'Analysis of annual employee satisfaction survey...',
    documentType: 'xlsx',
    createdAt: '2024-01-08T11:30:00Z',
    relevanceScore: 0.87,
    highlights: ['employee survey', 'satisfaction', 'workplace culture'],
    metadata: {
      author: 'Jennifer Liu',
      tags: ['hr', 'survey', 'employee-satisfaction', 'culture', 'analysis'],
      size: 892743,
      realm: 'Human Resources',
      path: '/analytics/employee-survey-2024.xlsx'
    }
  },
  {
    id: '5',
    title: 'System Architecture Diagram',
    content: 'High-level system architecture diagram showing microservices interaction, data flow, and infrastructure components.',
    excerpt: 'System architecture diagram showing microservices...',
    documentType: 'image',
    createdAt: '2024-01-05T16:45:00Z',
    relevanceScore: 0.85,
    highlights: ['system architecture', 'microservices', 'infrastructure'],
    metadata: {
      author: 'Tom Wilson',
      tags: ['architecture', 'system-design', 'microservices', 'technical'],
      size: 3847592,
      realm: 'Engineering',
      path: '/diagrams/system-architecture.png'
    }
  },
  {
    id: '6',
    title: 'Customer Onboarding Webinar',
    content: 'Comprehensive webinar covering customer onboarding processes, best practices for user engagement, and success metrics.',
    excerpt: 'Webinar covering customer onboarding processes...',
    documentType: 'video',
    createdAt: '2024-01-03T13:20:00Z',
    relevanceScore: 0.83,
    highlights: ['customer onboarding', 'user engagement', 'webinar'],
    metadata: {
      author: 'Lisa Park',
      tags: ['customer-success', 'onboarding', 'webinar', 'training'],
      size: 187593472,
      realm: 'Customer Success',
      path: '/videos/onboarding-webinar-jan2024.mp4'
    }
  },
  {
    id: '7',
    title: 'Team Standup Recording - Sprint 23',
    content: 'Daily standup meeting recording discussing sprint progress, blockers, and upcoming deliverables for development team.',
    excerpt: 'Daily standup meeting recording discussing sprint progress...',
    documentType: 'audio',
    createdAt: '2024-01-02T09:00:00Z',
    relevanceScore: 0.78,
    highlights: ['standup', 'sprint progress', 'development team'],
    metadata: {
      author: 'Development Team',
      tags: ['standup', 'scrum', 'development', 'sprint-23'],
      size: 25847392,
      realm: 'Engineering',
      path: '/recordings/standup-sprint23.mp3'
    }
  },
  {
    id: '8',
    title: 'Market Research Report',
    content: 'Comprehensive market analysis covering competitor landscape, industry trends, and growth opportunities in the SaaS sector.',
    excerpt: 'Market analysis covering competitor landscape...',
    documentType: 'pdf',
    createdAt: '2023-12-28T15:45:00Z',
    relevanceScore: 0.82,
    highlights: ['market research', 'competitor analysis', 'SaaS sector'],
    metadata: {
      author: 'Research Team',
      tags: ['market-research', 'competitive-analysis', 'saas', 'industry-trends'],
      size: 4293847,
      realm: 'Business Intelligence',
      path: '/research/market-analysis-2024.pdf'
    }
  },
  {
    id: '9',
    title: 'Security Incident Response Plan',
    content: 'Detailed incident response procedures for security breaches, including escalation protocols, communication templates, and recovery steps.',
    excerpt: 'Incident response procedures for security breaches...',
    documentType: 'docx',
    createdAt: '2023-12-25T10:15:00Z',
    relevanceScore: 0.91,
    highlights: ['security incident', 'response plan', 'escalation protocols'],
    metadata: {
      author: 'Security Team',
      tags: ['security', 'incident-response', 'procedures', 'compliance'],
      size: 1847392,
      realm: 'Information Security',
      path: '/security/incident-response-plan.docx'
    }
  },
  {
    id: '10',
    title: 'Company Values Presentation',
    content: 'Interactive presentation outlining company core values, mission statement, and cultural principles for new employee orientation.',
    excerpt: 'Presentation outlining company core values and mission...',
    documentType: 'pptx',
    createdAt: '2023-12-20T14:30:00Z',
    relevanceScore: 0.76,
    highlights: ['company values', 'mission statement', 'cultural principles'],
    metadata: {
      author: 'HR Leadership',
      tags: ['company-culture', 'values', 'orientation', 'mission'],
      size: 7293847,
      realm: 'Human Resources',
      path: '/presentations/company-values.pptx'
    }
  },
  // Additional results for pagination testing
  {
    id: '11',
    title: 'API Documentation v2.1',
    content: 'Complete REST API documentation including endpoints, authentication, rate limiting, and integration examples.',
    excerpt: 'Complete REST API documentation including endpoints...',
    documentType: 'webpage',
    createdAt: '2023-12-18T12:00:00Z',
    relevanceScore: 0.88,
    highlights: ['API documentation', 'REST', 'authentication'],
    metadata: {
      author: 'Engineering Team',
      tags: ['api', 'documentation', 'rest', 'integration'],
      size: 0,
      realm: 'Engineering',
      path: '/docs/api-v2.1'
    }
  },
  {
    id: '12',
    title: 'Budget Allocation Spreadsheet',
    content: 'Detailed budget breakdown for fiscal year 2024 including departmental allocations, projected expenses, and variance analysis.',
    excerpt: 'Budget breakdown for fiscal year 2024...',
    documentType: 'xlsx',
    createdAt: '2023-12-15T16:20:00Z',
    relevanceScore: 0.84,
    highlights: ['budget allocation', 'fiscal year 2024', 'expenses'],
    metadata: {
      author: 'Finance Department',
      tags: ['budget', 'finance', 'allocation', '2024', 'expenses'],
      size: 2847392,
      realm: 'Corporate Finance',
      path: '/budgets/fy2024-allocation.xlsx'
    }
  },
  {
    id: '13',
    title: 'User Interface Mockups',
    content: 'High-fidelity UI mockups for the new customer dashboard featuring improved navigation, data visualization, and accessibility enhancements.',
    excerpt: 'UI mockups for new customer dashboard...',
    documentType: 'image',
    createdAt: '2023-12-12T11:45:00Z',
    relevanceScore: 0.80,
    highlights: ['UI mockups', 'customer dashboard', 'navigation'],
    metadata: {
      author: 'Design Team',
      tags: ['ui', 'mockups', 'design', 'dashboard', 'accessibility'],
      size: 15847392,
      realm: 'Product Design',
      path: '/designs/dashboard-mockups.png'
    }
  },
  {
    id: '14',
    title: 'Quarterly Business Review',
    content: 'Comprehensive QBR presentation covering performance metrics, customer feedback, strategic initiatives, and next quarter planning.',
    excerpt: 'QBR presentation covering performance metrics...',
    documentType: 'pptx',
    createdAt: '2023-12-10T09:30:00Z',
    relevanceScore: 0.93,
    highlights: ['quarterly review', 'performance metrics', 'strategic initiatives'],
    metadata: {
      author: 'Executive Team',
      tags: ['qbr', 'quarterly', 'performance', 'strategy', 'planning'],
      size: 12847392,
      realm: 'Executive',
      path: '/reviews/q4-2023-qbr.pptx'
    }
  },
  {
    id: '15',
    title: 'Customer Support Training Manual',
    content: 'Complete training guide for customer support representatives including procedures, escalation paths, and communication best practices.',
    excerpt: 'Training guide for customer support representatives...',
    documentType: 'pdf',
    createdAt: '2023-12-08T14:15:00Z',
    relevanceScore: 0.86,
    highlights: ['customer support', 'training manual', 'procedures'],
    metadata: {
      author: 'Support Team Lead',
      tags: ['customer-support', 'training', 'procedures', 'communication'],
      size: 5847392,
      realm: 'Customer Support',
      path: '/training/support-manual.pdf'
    }
  },
  // Continue with more realistic data...
  {
    id: '16',
    title: 'Data Privacy Compliance Audit',
    content: 'Annual data privacy audit report covering GDPR compliance, data handling procedures, and recommended improvements.',
    excerpt: 'Data privacy audit covering GDPR compliance...',
    documentType: 'docx',
    createdAt: '2023-12-05T13:00:00Z',
    relevanceScore: 0.90,
    highlights: ['data privacy', 'GDPR compliance', 'audit report'],
    metadata: {
      author: 'Legal Team',
      tags: ['privacy', 'gdpr', 'compliance', 'audit', 'legal'],
      size: 3294738,
      realm: 'Legal & Compliance',
      path: '/legal/privacy-audit-2023.docx'
    }
  },
  {
    id: '17',
    title: 'Technology Stack Overview',
    content: 'Comprehensive overview of current technology stack including frameworks, databases, cloud services, and migration roadmap.',
    excerpt: 'Overview of current technology stack...',
    documentType: 'pdf',
    createdAt: '2023-12-02T10:45:00Z',
    relevanceScore: 0.81,
    highlights: ['technology stack', 'frameworks', 'cloud services'],
    metadata: {
      author: 'CTO Office',
      tags: ['technology', 'stack', 'architecture', 'cloud', 'migration'],
      size: 4293847,
      realm: 'Engineering',
      path: '/architecture/tech-stack-overview.pdf'
    }
  },
  {
    id: '18',
    title: 'Employee Handbook 2024',
    content: 'Updated employee handbook covering policies, benefits, code of conduct, remote work guidelines, and company culture.',
    excerpt: 'Employee handbook covering policies and benefits...',
    documentType: 'pdf',
    createdAt: '2024-01-05T08:00:00Z',
    relevanceScore: 0.89,
    highlights: ['employee handbook', 'policies', 'benefits', 'remote work'],
    metadata: {
      author: 'HR Department',
      tags: ['hr', 'handbook', 'policies', 'benefits', 'culture'],
      size: 6847392,
      realm: 'Human Resources',
      path: '/hr/employee-handbook-2024.pdf'
    }
  },
  {
    id: '19',
    title: 'Security Incident Response Plan',
    content: 'Comprehensive security incident response procedures including detection, containment, eradication, and recovery protocols.',
    excerpt: 'Security incident response procedures...',
    documentType: 'docx',
    createdAt: '2023-11-28T15:30:00Z',
    relevanceScore: 0.94,
    highlights: ['security incident', 'response plan', 'protocols'],
    metadata: {
      author: 'Security Team',
      tags: ['security', 'incident', 'response', 'protocols', 'cybersecurity'],
      size: 3847392,
      realm: 'Security',
      path: '/security/incident-response-plan.docx'
    }
  },
  {
    id: '20',
    title: 'Product Roadmap Q1-Q2 2024',
    content: 'Product development roadmap outlining key features, milestones, and strategic initiatives for the first half of 2024.',
    excerpt: 'Product roadmap for Q1-Q2 2024...',
    documentType: 'pptx',
    createdAt: '2023-11-25T12:15:00Z',
    relevanceScore: 0.92,
    highlights: ['product roadmap', 'Q1-Q2 2024', 'strategic initiatives'],
    metadata: {
      author: 'Product Team',
      tags: ['product', 'roadmap', 'features', 'strategy', '2024'],
      size: 8847392,
      realm: 'Product Management',
      path: '/product/roadmap-q1q2-2024.pptx'
    }
  },
  {
    id: '21',
    title: 'Sales Performance Dashboard',
    content: 'Interactive dashboard showing sales metrics, conversion rates, pipeline analysis, and territory performance for Q4.',
    excerpt: 'Sales metrics and performance dashboard...',
    documentType: 'webpage',
    createdAt: '2023-11-22T09:45:00Z',
    relevanceScore: 0.87,
    highlights: ['sales performance', 'dashboard', 'conversion rates'],
    metadata: {
      author: 'Sales Operations',
      tags: ['sales', 'dashboard', 'metrics', 'performance', 'pipeline'],
      size: 0,
      realm: 'Sales',
      path: '/dashboards/sales-performance-q4'
    }
  },
  {
    id: '22',
    title: 'Machine Learning Model Documentation',
    content: 'Technical documentation for the recommendation engine ML model including architecture, training data, and performance metrics.',
    excerpt: 'ML model documentation for recommendation engine...',
    documentType: 'pdf',
    createdAt: '2023-11-20T14:00:00Z',
    relevanceScore: 0.91,
    highlights: ['machine learning', 'model documentation', 'recommendation engine'],
    metadata: {
      author: 'Data Science Team',
      tags: ['ml', 'model', 'documentation', 'recommendation', 'data-science'],
      size: 5293847,
      realm: 'Data Science',
      path: '/ml/recommendation-model-docs.pdf'
    }
  },
  {
    id: '23',
    title: 'Cloud Infrastructure Cost Analysis',
    content: 'Detailed analysis of cloud infrastructure costs including resource utilization, optimization opportunities, and budget forecasts.',
    excerpt: 'Cloud infrastructure cost analysis and optimization...',
    documentType: 'xlsx',
    createdAt: '2023-11-18T11:30:00Z',
    relevanceScore: 0.85,
    highlights: ['cloud infrastructure', 'cost analysis', 'optimization'],
    metadata: {
      author: 'DevOps Team',
      tags: ['cloud', 'infrastructure', 'cost', 'optimization', 'budget'],
      size: 4847392,
      realm: 'Operations',
      path: '/ops/cloud-cost-analysis-nov2023.xlsx'
    }
  },
  {
    id: '24',
    title: 'Customer Feedback Survey Results',
    content: 'Comprehensive analysis of customer satisfaction survey results including NPS scores, feedback themes, and improvement recommendations.',
    excerpt: 'Customer satisfaction survey analysis...',
    documentType: 'pptx',
    createdAt: '2023-11-15T16:20:00Z',
    relevanceScore: 0.88,
    highlights: ['customer feedback', 'survey results', 'NPS scores'],
    metadata: {
      author: 'Customer Success Team',
      tags: ['customer', 'feedback', 'survey', 'nps', 'satisfaction'],
      size: 7847392,
      realm: 'Customer Success',
      path: '/customer/feedback-survey-nov2023.pptx'
    }
  },
  {
    id: '25',
    title: 'API Rate Limiting Implementation Guide',
    content: 'Technical guide for implementing API rate limiting including algorithms, configuration, monitoring, and best practices.',
    excerpt: 'API rate limiting implementation guide...',
    documentType: 'docx',
    createdAt: '2023-11-12T13:45:00Z',
    relevanceScore: 0.83,
    highlights: ['API rate limiting', 'implementation guide', 'algorithms'],
    metadata: {
      author: 'Backend Engineering',
      tags: ['api', 'rate-limiting', 'implementation', 'algorithms', 'monitoring'],
      size: 2847392,
      realm: 'Engineering',
      path: '/engineering/api-rate-limiting-guide.docx'
    }
  },
  {
    id: '26',
    title: 'Brand Guidelines and Style Guide',
    content: 'Complete brand guidelines including logo usage, color palettes, typography, photography standards, and voice guidelines.',
    excerpt: 'Brand guidelines and style standards...',
    documentType: 'pdf',
    createdAt: '2023-11-10T10:00:00Z',
    relevanceScore: 0.86,
    highlights: ['brand guidelines', 'style guide', 'logo usage'],
    metadata: {
      author: 'Brand Team',
      tags: ['brand', 'guidelines', 'style', 'logo', 'typography'],
      size: 12847392,
      realm: 'Marketing',
      path: '/brand/brand-guidelines-v3.pdf'
    }
  },
  {
    id: '27',
    title: 'Database Migration Planning Document',
    content: 'Detailed plan for database migration including timeline, risk assessment, rollback procedures, and testing strategy.',
    excerpt: 'Database migration planning and strategy...',
    documentType: 'docx',
    createdAt: '2023-11-08T14:30:00Z',
    relevanceScore: 0.90,
    highlights: ['database migration', 'planning document', 'risk assessment'],
    metadata: {
      author: 'Database Team',
      tags: ['database', 'migration', 'planning', 'risk', 'testing'],
      size: 4293847,
      realm: 'Engineering',
      path: '/db/migration-plan-v2.docx'
    }
  },
  {
    id: '28',
    title: 'Remote Work Policy Update',
    content: 'Updated remote work policy addressing hybrid schedules, equipment allowances, performance expectations, and communication protocols.',
    excerpt: 'Remote work policy updates and guidelines...',
    documentType: 'pdf',
    createdAt: '2023-11-05T09:15:00Z',
    relevanceScore: 0.87,
    highlights: ['remote work policy', 'hybrid schedules', 'performance expectations'],
    metadata: {
      author: 'HR Policy Team',
      tags: ['remote-work', 'policy', 'hybrid', 'performance', 'communication'],
      size: 3847392,
      realm: 'Human Resources',
      path: '/hr/remote-work-policy-v2.pdf'
    }
  },
  {
    id: '29',
    title: 'Competitive Analysis Report',
    content: 'Comprehensive competitive landscape analysis covering market positioning, feature comparison, pricing strategies, and strategic recommendations.',
    excerpt: 'Competitive landscape and market analysis...',
    documentType: 'pptx',
    createdAt: '2023-11-02T15:45:00Z',
    relevanceScore: 0.84,
    highlights: ['competitive analysis', 'market positioning', 'feature comparison'],
    metadata: {
      author: 'Strategy Team',
      tags: ['competitive', 'analysis', 'market', 'positioning', 'strategy'],
      size: 9847392,
      realm: 'Strategy',
      path: '/strategy/competitive-analysis-nov2023.pptx'
    }
  },
  {
    id: '30',
    title: 'User Experience Research Report',
    content: 'UX research findings from user interviews, usability testing, and behavioral analysis with design recommendations.',
    excerpt: 'UX research findings and design recommendations...',
    documentType: 'pdf',
    createdAt: '2023-10-30T12:00:00Z',
    relevanceScore: 0.89,
    highlights: ['UX research', 'usability testing', 'design recommendations'],
    metadata: {
      author: 'UX Research Team',
      tags: ['ux', 'research', 'usability', 'testing', 'design'],
      size: 6847392,
      realm: 'Product Design',
      path: '/ux/research-report-oct2023.pdf'
    }
  },
  {
    id: '31',
    title: 'Supply Chain Risk Assessment',
    content: 'Risk assessment of supply chain dependencies including vendor analysis, contingency planning, and mitigation strategies.',
    excerpt: 'Supply chain risk analysis and mitigation...',
    documentType: 'xlsx',
    createdAt: '2023-10-28T11:30:00Z',
    relevanceScore: 0.82,
    highlights: ['supply chain', 'risk assessment', 'vendor analysis'],
    metadata: {
      author: 'Operations Team',
      tags: ['supply-chain', 'risk', 'assessment', 'vendor', 'mitigation'],
      size: 3847392,
      realm: 'Operations',
      path: '/ops/supply-chain-risk-oct2023.xlsx'
    }
  },
  {
    id: '32',
    title: 'Marketing Campaign Performance Report',
    content: 'Analysis of Q3 marketing campaigns including ROI, conversion rates, channel performance, and optimization recommendations.',
    excerpt: 'Q3 marketing campaign performance analysis...',
    documentType: 'pptx',
    createdAt: '2023-10-25T14:15:00Z',
    relevanceScore: 0.91,
    highlights: ['marketing campaign', 'performance report', 'ROI analysis'],
    metadata: {
      author: 'Marketing Analytics',
      tags: ['marketing', 'campaign', 'performance', 'roi', 'conversion'],
      size: 8293847,
      realm: 'Marketing',
      path: '/marketing/campaign-performance-q3.pptx'
    }
  },
  {
    id: '33',
    title: 'Software License Audit Report',
    content: 'Annual software license audit covering compliance status, usage metrics, cost optimization opportunities, and renewal recommendations.',
    excerpt: 'Software license audit and compliance report...',
    documentType: 'docx',
    createdAt: '2023-10-22T10:45:00Z',
    relevanceScore: 0.85,
    highlights: ['software license', 'audit report', 'compliance'],
    metadata: {
      author: 'IT Procurement',
      tags: ['software', 'license', 'audit', 'compliance', 'procurement'],
      size: 4847392,
      realm: 'IT',
      path: '/it/software-license-audit-2023.docx'
    }
  },
  {
    id: '34',
    title: 'Mobile App Performance Metrics',
    content: 'Mobile application performance analysis including load times, crash rates, user engagement, and optimization strategies.',
    excerpt: 'Mobile app performance and optimization metrics...',
    documentType: 'webpage',
    createdAt: '2023-10-20T16:00:00Z',
    relevanceScore: 0.88,
    highlights: ['mobile app', 'performance metrics', 'user engagement'],
    metadata: {
      author: 'Mobile Team',
      tags: ['mobile', 'app', 'performance', 'metrics', 'optimization'],
      size: 0,
      realm: 'Engineering',
      path: '/mobile/performance-dashboard'
    }
  },
  {
    id: '35',
    title: 'Sustainability Initiative Proposal',
    content: 'Comprehensive proposal for corporate sustainability initiatives including carbon footprint reduction, green policies, and ESG goals.',
    excerpt: 'Corporate sustainability initiative proposal...',
    documentType: 'pdf',
    createdAt: '2023-10-18T13:30:00Z',
    relevanceScore: 0.80,
    highlights: ['sustainability initiative', 'carbon footprint', 'ESG goals'],
    metadata: {
      author: 'Sustainability Committee',
      tags: ['sustainability', 'green', 'carbon', 'esg', 'environment'],
      size: 5847392,
      realm: 'Corporate',
      path: '/corporate/sustainability-proposal.pdf'
    }
  },
  {
    id: '36',
    title: 'Data Warehouse Architecture Design',
    content: 'Technical architecture design for the new data warehouse including schema design, ETL processes, and scalability considerations.',
    excerpt: 'Data warehouse architecture and design...',
    documentType: 'docx',
    createdAt: '2023-10-15T09:00:00Z',
    relevanceScore: 0.93,
    highlights: ['data warehouse', 'architecture design', 'ETL processes'],
    metadata: {
      author: 'Data Architecture Team',
      tags: ['data-warehouse', 'architecture', 'etl', 'schema', 'scalability'],
      size: 6293847,
      realm: 'Data Engineering',
      path: '/data/warehouse-architecture-v2.docx'
    }
  },
  {
    id: '37',
    title: 'Customer Onboarding Process Guide',
    content: 'Step-by-step guide for customer onboarding including welcome flows, account setup, training materials, and success metrics.',
    excerpt: 'Customer onboarding process and workflows...',
    documentType: 'pdf',
    createdAt: '2023-10-12T12:45:00Z',
    relevanceScore: 0.86,
    highlights: ['customer onboarding', 'process guide', 'welcome flows'],
    metadata: {
      author: 'Customer Success Team',
      tags: ['onboarding', 'customer', 'process', 'training', 'success'],
      size: 4847392,
      realm: 'Customer Success',
      path: '/customer/onboarding-guide-v3.pdf'
    }
  },
  {
    id: '38',
    title: 'Network Security Configuration Manual',
    content: 'Comprehensive network security configuration manual covering firewall rules, VPN setup, intrusion detection, and monitoring protocols.',
    excerpt: 'Network security configuration and protocols...',
    documentType: 'docx',
    createdAt: '2023-10-10T15:20:00Z',
    relevanceScore: 0.92,
    highlights: ['network security', 'configuration manual', 'firewall rules'],
    metadata: {
      author: 'Network Security Team',
      tags: ['network', 'security', 'firewall', 'vpn', 'intrusion-detection'],
      size: 5293847,
      realm: 'Security',
      path: '/security/network-config-manual.docx'
    }
  },
  {
    id: '39',
    title: 'Financial Forecasting Model',
    content: 'Advanced financial forecasting model using historical data, market trends, and scenario analysis for budget planning.',
    excerpt: 'Financial forecasting and budget planning model...',
    documentType: 'xlsx',
    createdAt: '2023-10-08T11:15:00Z',
    relevanceScore: 0.89,
    highlights: ['financial forecasting', 'budget planning', 'scenario analysis'],
    metadata: {
      author: 'Financial Planning Team',
      tags: ['financial', 'forecasting', 'budget', 'planning', 'model'],
      size: 8847392,
      realm: 'Finance',
      path: '/finance/forecasting-model-2024.xlsx'
    }
  },
  {
    id: '40',
    title: 'Quality Assurance Testing Procedures',
    content: 'Comprehensive QA testing procedures including test case creation, automation frameworks, regression testing, and bug reporting.',
    excerpt: 'QA testing procedures and frameworks...',
    documentType: 'pdf',
    createdAt: '2023-10-05T14:00:00Z',
    relevanceScore: 0.87,
    highlights: ['QA testing', 'test procedures', 'automation frameworks'],
    metadata: {
      author: 'QA Team Lead',
      tags: ['qa', 'testing', 'procedures', 'automation', 'regression'],
      size: 5847392,
      realm: 'Quality Assurance',
      path: '/qa/testing-procedures-v4.pdf'
    }
  },
  {
    id: '41',
    title: 'Executive Dashboard Wireframes',
    content: 'High-fidelity wireframes for executive dashboard featuring KPI widgets, data visualization, and customizable layouts.',
    excerpt: 'Executive dashboard wireframes and layouts...',
    documentType: 'image',
    createdAt: '2023-10-02T10:30:00Z',
    relevanceScore: 0.84,
    highlights: ['executive dashboard', 'wireframes', 'KPI widgets'],
    metadata: {
      author: 'UI/UX Design Team',
      tags: ['dashboard', 'wireframes', 'kpi', 'visualization', 'executive'],
      size: 18847392,
      realm: 'Product Design',
      path: '/design/exec-dashboard-wireframes.png'
    }
  },
  {
    id: '42',
    title: 'Inventory Management System Spec',
    content: 'Technical specification for inventory management system including real-time tracking, automated reordering, and analytics features.',
    excerpt: 'Inventory management system specification...',
    documentType: 'docx',
    createdAt: '2023-09-30T13:45:00Z',
    relevanceScore: 0.91,
    highlights: ['inventory management', 'system spec', 'real-time tracking'],
    metadata: {
      author: 'Systems Analyst',
      tags: ['inventory', 'management', 'system', 'tracking', 'analytics'],
      size: 7293847,
      realm: 'Operations',
      path: '/ops/inventory-system-spec.docx'
    }
  },
  {
    id: '43',
    title: 'Social Media Strategy Playbook',
    content: 'Comprehensive social media strategy including content calendars, engagement tactics, influencer partnerships, and ROI measurement.',
    excerpt: 'Social media strategy and engagement playbook...',
    documentType: 'pptx',
    createdAt: '2023-09-28T16:15:00Z',
    relevanceScore: 0.83,
    highlights: ['social media strategy', 'content calendars', 'engagement tactics'],
    metadata: {
      author: 'Social Media Team',
      tags: ['social-media', 'strategy', 'content', 'engagement', 'roi'],
      size: 9847392,
      realm: 'Marketing',
      path: '/marketing/social-media-playbook.pptx'
    }
  },
  {
    id: '44',
    title: 'Backup and Disaster Recovery Plan',
    content: 'Comprehensive disaster recovery plan covering backup procedures, recovery time objectives, business continuity, and testing protocols.',
    excerpt: 'Disaster recovery and business continuity plan...',
    documentType: 'pdf',
    createdAt: '2023-09-25T12:00:00Z',
    relevanceScore: 0.95,
    highlights: ['disaster recovery', 'backup procedures', 'business continuity'],
    metadata: {
      author: 'IT Operations',
      tags: ['disaster-recovery', 'backup', 'continuity', 'rto', 'testing'],
      size: 6847392,
      realm: 'IT Operations',
      path: '/it/disaster-recovery-plan.pdf'
    }
  },
  {
    id: '45',
    title: 'Performance Review Guidelines',
    content: 'Updated performance review guidelines including evaluation criteria, feedback frameworks, goal setting, and career development planning.',
    excerpt: 'Performance review process and guidelines...',
    documentType: 'docx',
    createdAt: '2023-09-22T09:30:00Z',
    relevanceScore: 0.88,
    highlights: ['performance review', 'evaluation criteria', 'career development'],
    metadata: {
      author: 'HR Development',
      tags: ['performance', 'review', 'evaluation', 'feedback', 'development'],
      size: 4293847,
      realm: 'Human Resources',
      path: '/hr/performance-review-guidelines.docx'
    }
  },
  {
    id: '46',
    title: 'API Integration Best Practices',
    content: 'Best practices guide for API integrations including authentication patterns, error handling, rate limiting, and security considerations.',
    excerpt: 'API integration best practices and patterns...',
    documentType: 'pdf',
    createdAt: '2023-09-20T14:45:00Z',
    relevanceScore: 0.90,
    highlights: ['API integration', 'best practices', 'authentication patterns'],
    metadata: {
      author: 'Integration Team',
      tags: ['api', 'integration', 'best-practices', 'authentication', 'security'],
      size: 4847392,
      realm: 'Engineering',
      path: '/engineering/api-integration-practices.pdf'
    }
  },
  {
    id: '47',
    title: 'Market Research Analysis Report',
    content: 'Comprehensive market research analysis covering industry trends, customer segments, competitive landscape, and growth opportunities.',
    excerpt: 'Market research and industry analysis...',
    documentType: 'pptx',
    createdAt: '2023-09-18T11:00:00Z',
    relevanceScore: 0.85,
    highlights: ['market research', 'industry trends', 'competitive landscape'],
    metadata: {
      author: 'Market Research Team',
      tags: ['market', 'research', 'analysis', 'trends', 'competition'],
      size: 11847392,
      realm: 'Strategy',
      path: '/strategy/market-research-sep2023.pptx'
    }
  },
  {
    id: '48',
    title: 'Code Review Checklist and Standards',
    content: 'Comprehensive code review standards including security checks, performance considerations, style guidelines, and testing requirements.',
    excerpt: 'Code review standards and security checklist...',
    documentType: 'docx',
    createdAt: '2023-09-15T15:30:00Z',
    relevanceScore: 0.87,
    highlights: ['code review', 'security checks', 'style guidelines'],
    metadata: {
      author: 'Engineering Leadership',
      tags: ['code-review', 'standards', 'security', 'performance', 'testing'],
      size: 3847392,
      realm: 'Engineering',
      path: '/engineering/code-review-standards.docx'
    }
  },
  {
    id: '49',
    title: 'Customer Journey Mapping Workshop',
    content: 'Customer journey mapping workshop results including touchpoint analysis, pain point identification, and experience optimization recommendations.',
    excerpt: 'Customer journey mapping and experience analysis...',
    documentType: 'pptx',
    createdAt: '2023-09-12T10:15:00Z',
    relevanceScore: 0.86,
    highlights: ['customer journey', 'touchpoint analysis', 'pain points'],
    metadata: {
      author: 'Customer Experience Team',
      tags: ['customer-journey', 'mapping', 'touchpoints', 'experience', 'optimization'],
      size: 8293847,
      realm: 'Customer Experience',
      path: '/cx/journey-mapping-workshop.pptx'
    }
  },
  {
    id: '50',
    title: 'DevOps Pipeline Configuration Guide',
    content: 'Complete guide for setting up CI/CD pipelines including build automation, testing integration, deployment strategies, and monitoring.',
    excerpt: 'DevOps pipeline setup and configuration guide...',
    documentType: 'pdf',
    createdAt: '2023-09-10T13:00:00Z',
    relevanceScore: 0.92,
    highlights: ['DevOps pipeline', 'CI/CD', 'build automation'],
    metadata: {
      author: 'DevOps Team Lead',
      tags: ['devops', 'pipeline', 'ci-cd', 'automation', 'deployment'],
      size: 6847392,
      realm: 'DevOps',
      path: '/devops/pipeline-config-guide.pdf'
    }
  },
  {
    id: '51',
    title: 'Accessibility Compliance Audit',
    content: 'Web accessibility audit report covering WCAG 2.1 compliance, assistive technology compatibility, and remediation recommendations.',
    excerpt: 'Web accessibility audit and WCAG compliance...',
    documentType: 'docx',
    createdAt: '2023-09-08T12:30:00Z',
    relevanceScore: 0.89,
    highlights: ['accessibility compliance', 'WCAG audit', 'assistive technology'],
    metadata: {
      author: 'Accessibility Team',
      tags: ['accessibility', 'wcag', 'compliance', 'audit', 'assistive-tech'],
      size: 4293847,
      realm: 'Product Design',
      path: '/accessibility/wcag-audit-report.docx'
    }
  },
  {
    id: '52',
    title: 'Vendor Management Policy',
    content: 'Comprehensive vendor management policy including selection criteria, contract negotiation, performance monitoring, and risk assessment.',
    excerpt: 'Vendor management policies and procedures...',
    documentType: 'pdf',
    createdAt: '2023-09-05T09:45:00Z',
    relevanceScore: 0.83,
    highlights: ['vendor management', 'selection criteria', 'contract negotiation'],
    metadata: {
      author: 'Procurement Team',
      tags: ['vendor', 'management', 'policy', 'procurement', 'contracts'],
      size: 5847392,
      realm: 'Procurement',
      path: '/procurement/vendor-management-policy.pdf'
    }
  },
  {
    id: '53',
    title: 'Machine Learning Pipeline Architecture',
    content: 'Technical architecture for ML model training and deployment pipeline including data preprocessing, model versioning, and monitoring.',
    excerpt: 'ML pipeline architecture and deployment...',
    documentType: 'docx',
    createdAt: '2023-09-02T14:20:00Z',
    relevanceScore: 0.94,
    highlights: ['ML pipeline', 'model training', 'deployment architecture'],
    metadata: {
      author: 'ML Engineering Team',
      tags: ['ml', 'pipeline', 'architecture', 'training', 'deployment'],
      size: 7847392,
      realm: 'ML Engineering',
      path: '/ml/pipeline-architecture.docx'
    }
  },
  {
    id: '54',
    title: 'Crisis Communication Plan',
    content: 'Crisis communication plan including stakeholder notification procedures, message templates, media relations, and escalation protocols.',
    excerpt: 'Crisis communication procedures and protocols...',
    documentType: 'pdf',
    createdAt: '2023-08-30T11:00:00Z',
    relevanceScore: 0.90,
    highlights: ['crisis communication', 'stakeholder notification', 'media relations'],
    metadata: {
      author: 'Communications Team',
      tags: ['crisis', 'communication', 'stakeholder', 'media', 'escalation'],
      size: 4847392,
      realm: 'Communications',
      path: '/communications/crisis-plan.pdf'
    }
  },
  {
    id: '55',
    title: 'Enterprise Architecture Roadmap',
    content: 'Strategic enterprise architecture roadmap covering technology modernization, system integration, and digital transformation initiatives.',
    excerpt: 'Enterprise architecture and modernization roadmap...',
    documentType: 'pptx',
    createdAt: '2023-08-28T16:45:00Z',
    relevanceScore: 0.91,
    highlights: ['enterprise architecture', 'technology modernization', 'digital transformation'],
    metadata: {
      author: 'Enterprise Architecture Team',
      tags: ['enterprise', 'architecture', 'modernization', 'integration', 'transformation'],
      size: 12847392,
      realm: 'Enterprise Architecture',
      path: '/ea/enterprise-roadmap-2024.pptx'
    }
  }
];

// Helper function to filter results based on search criteria
export const filterSearchResults = (
  results: SearchResult[],
  query: string,
  filters: SearchFilters
): SearchResult[] => {
  let filtered = results;

  // Filter by search query
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(result =>
      result.title.toLowerCase().includes(searchTerm) ||
      result.content.toLowerCase().includes(searchTerm) ||
      result.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (result.metadata.author && result.metadata.author.toLowerCase().includes(searchTerm))
    );
  }

  // Filter by document type
  if (filters.documentType !== 'all') {
    filtered = filtered.filter(result => result.documentType === filters.documentType);
  }

  // Filter by date range
  if (filters.dateRange !== 'all') {
    const now = new Date();
    const filterDate = new Date();

    switch (filters.dateRange) {
      case 'today':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'last-week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'last-month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'last-3-months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'last-year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        // Handle custom date range if provided
        if (filters.customDateFrom) {
          const fromDate = new Date(filters.customDateFrom);
          filtered = filtered.filter(result => new Date(result.createdAt) >= fromDate);
        }
        if (filters.customDateTo) {
          const toDate = new Date(filters.customDateTo);
          filtered = filtered.filter(result => new Date(result.createdAt) <= toDate);
        }
        return filtered; // Skip the general date filtering below
    }

    filtered = filtered.filter(result => new Date(result.createdAt) >= filterDate);
  }

  // Sort results
  switch (filters.sortBy) {
    case 'relevance':
      filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
      break;
    case 'date-desc':
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'date-asc':
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'title-asc':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      filtered.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }

  return filtered;
};

// Pagination helper
export const paginateResults = (
  results: SearchResult[],
  page: number,
  limit: number = 10
): {
  results: SearchResult[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
} => {
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    results: paginatedResults,
    totalResults,
    totalPages,
    currentPage: page,
  };
};

// Mock API simulation with realistic delay
export const simulateSearchApi = async (
  query: string,
  filters: SearchFilters,
  page: number = 1,
  limit: number = 10
): Promise<{
  results: SearchResult[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  const filteredResults = filterSearchResults(mockSearchResults, query, filters);
  return paginateResults(filteredResults, page, limit);
};

// Named exports for components that need specific functions
export const searchResults = mockSearchResults;
export const searchDocuments = simulateSearchApi;
export const searchFacets = {
  documentTypes: [
    { value: 'all', label: 'All Types', count: mockSearchResults.length },
    { value: 'pdf', label: 'PDF', count: mockSearchResults.filter(r => r.documentType === 'pdf').length },
    { value: 'docx', label: 'Word Documents', count: mockSearchResults.filter(r => r.documentType === 'docx').length },
    { value: 'pptx', label: 'Presentations', count: mockSearchResults.filter(r => r.documentType === 'pptx').length },
    { value: 'xlsx', label: 'Spreadsheets', count: mockSearchResults.filter(r => r.documentType === 'xlsx').length },
    { value: 'image', label: 'Images', count: mockSearchResults.filter(r => r.documentType === 'image').length },
    { value: 'video', label: 'Videos', count: mockSearchResults.filter(r => r.documentType === 'video').length },
    { value: 'audio', label: 'Audio', count: mockSearchResults.filter(r => r.documentType === 'audio').length },
    { value: 'webpage', label: 'Web Pages', count: mockSearchResults.filter(r => r.documentType === 'webpage').length }
  ],
  dateRanges: [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ],
  sortOptions: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' }
  ]
};

export default {
  mockSearchResults,
  filterSearchResults,
  paginateResults,
  simulateSearchApi
};