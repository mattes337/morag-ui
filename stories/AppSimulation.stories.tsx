import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { RealmsView } from '../components/views/RealmsView';
import { DocumentsView } from '../components/views/DocumentsView';
import { DocumentDetailView } from '../components/views/DocumentDetailView';
import { Document, Realm } from '../types';
import { MockAppProvider } from './MockAppProvider';

const meta: Meta = {
  title: 'App/Full Application Simulation',
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

// Mock data
const mockRealms: Realm[] = [
  {
    id: 'realm-admin',
    name: 'Admin Realm',
    description: 'Default admin realm with full access',
    domain: 'morag.drydev.de',
    isDefault: true,
    userRole: 'ADMIN',
    userCount: 1,
    documentCount: 8,
    lastUpdated: '2024-01-15T10:30:00Z',
    createdAt: new Date('2023-06-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'realm-dev',
    name: 'Development',
    description: 'Development environment for testing',
    domain: 'dev.morag.drydev.de',
    isDefault: false,
    userRole: 'MEMBER',
    userCount: 3,
    documentCount: 15,
    lastUpdated: '2024-01-14T16:45:00Z',
    createdAt: new Date('2023-08-15T00:00:00Z'),
    updatedAt: new Date('2024-01-14T16:45:00Z'),
  },
];

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'System Architecture Guide',
    type: 'PDF',
    state: 'ingested',
    version: 2,
    chunks: 45,
    quality: 92,
    uploadDate: '2024-01-10',
    processingMode: 'MANUAL',
  },
  {
    id: 'doc-2',
    name: 'API Documentation',
    type: 'Markdown',
    state: 'pending',
    version: 1,
    chunks: 0,
    quality: 0,
    uploadDate: '2024-01-15',
    processingMode: 'MANUAL',
  },
  {
    id: 'doc-3',
    name: 'User Manual',
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
    state: 'ingesting',
    version: 1,
    chunks: 12,
    quality: 45,
    uploadDate: '2024-01-14',
    processingMode: 'MANUAL',
  },
  {
    id: 'doc-5',
    name: 'Meeting Notes Q1',
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
    name: 'Database Schema',
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
    name: 'Customer Feedback',
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
    state: 'ingested',
    version: 1,
    chunks: 67,
    quality: 89,
    uploadDate: '2024-01-13',
    processingMode: 'AUTOMATIC',
  },
];

export const FullApplicationFlow = {
  render: () => {
    const [currentView, setCurrentView] = useState<'realms' | 'documents' | 'document-detail'>('realms');
    const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [realms, setRealms] = useState<Realm[]>(mockRealms);
    const [documents, setDocuments] = useState<Document[]>(mockDocuments);

    // Simulate data loading
    useEffect(() => {
      console.log('🔄 [App Simulation] Loading application data...');
      console.log('🏰 [App Simulation] Loaded realms:', realms.length);
      console.log('📄 [App Simulation] Loaded documents:', documents.length);
    }, [realms.length, documents.length]);

    const handleSelectRealm = (realm: Realm) => {
      console.log('🏰 [App Simulation] Selected realm:', realm.name);
      setSelectedRealm(realm);
      setCurrentView('documents');
    };

    const handleBackToRealms = () => {
      console.log('🔙 [App Simulation] Back to realms');
      setCurrentView('realms');
      setSelectedRealm(null);
    };

    const handleViewDocumentDetail = (document: Document) => {
      console.log('📄 [App Simulation] Viewing document:', document.name);
      setSelectedDocument(document);
      setCurrentView('document-detail');
    };

    const handleBackFromDocument = () => {
      console.log('🔙 [App Simulation] Back to documents');
      setCurrentView('documents');
      setSelectedDocument(null);
    };

    const handleDocumentUpdate = () => {
      console.log('💾 [App Simulation] Document updated');
    };

    const handleCreateRealm = () => {
      console.log('➕ [App Simulation] Creating new realm');
      const newRealm: Realm = {
        id: `realm-${Date.now()}`,
        name: 'New Realm',
        description: 'Newly created realm',
        domain: 'new.morag.drydev.de',
        isDefault: false,
        userRole: 'ADMIN',
        userCount: 1,
        documentCount: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setRealms(prev => [...prev, newRealm]);
    };

    const handleAddDocument = () => {
      console.log('➕ [App Simulation] Adding new document');
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: 'New Document',
        type: 'PDF',
        state: 'pending',
        version: 1,
        chunks: 0,
        quality: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        processingMode: 'MANUAL',
      };
      setDocuments(prev => [...prev, newDocument]);
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Morag UI - Full App Simulation</h1>
              <div className="text-sm text-gray-500">
                {currentView === 'realms' && 'Realm Management'}
                {currentView === 'documents' && `Documents in ${selectedRealm?.name}`}
                {currentView === 'document-detail' && `Document: ${selectedDocument?.name}`}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Realms: {realms.length}</span>
              <span>•</span>
              <span>Documents: {documents.length}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentView === 'realms' && (
            <RealmsView
              realms={realms}
              onCreateRealm={handleCreateRealm}
              onSelectRealm={handleSelectRealm}
              onPromptRealm={(realm) => console.log('💬 Prompt realm:', realm.name)}
              onViewRealm={(realm) => console.log('👁️ View realm:', realm.name)}
              onEditRealm={(realm) => console.log('✏️ Edit realm:', realm.name)}
              onDeleteRealm={(realm) => console.log('🗑️ Delete realm:', realm.name)}
              onManageUsers={(realm) => console.log('👥 Manage users:', realm.name)}
            />
          )}

          {currentView === 'documents' && selectedRealm && (
            <DocumentsView
              documents={documents}
              selectedRealm={selectedRealm}
              onBackToRealms={handleBackToRealms}
              onAddDocument={handleAddDocument}
              onPromptDocument={(doc) => console.log('💬 Prompt document:', doc.name)}
              onViewDocumentDetail={handleViewDocumentDetail}
            />
          )}

          {currentView === 'document-detail' && selectedDocument && (
            <DocumentDetailView
              document={selectedDocument}
              onBack={handleBackFromDocument}
              onReingest={(doc) => console.log('🔄 Reingest:', doc.name)}
              onSupersede={(doc) => console.log('🔄 Supersede:', doc.name)}
              onDelete={(doc) => console.log('🗑️ Delete:', doc.name)}
              onDocumentUpdate={handleDocumentUpdate}
            />
          )}
        </div>

        {/* Debug Panel */}
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-2">App State</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Current View: <span className="font-mono">{currentView}</span></div>
            <div>Selected Realm: <span className="font-mono">{selectedRealm?.name || 'none'}</span></div>
            <div>Selected Document: <span className="font-mono">{selectedDocument?.name || 'none'}</span></div>
            <div>Total Realms: <span className="font-mono">{realms.length}</span></div>
            <div>Total Documents: <span className="font-mono">{documents.length}</span></div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete application simulation showing the full flow from realm selection to document management. This addresses the issue where no realms or documents are displayed by providing mock data and simulating the complete user journey.',
      },
    },
  },
};
