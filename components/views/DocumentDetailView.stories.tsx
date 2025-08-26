import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { DocumentDetailView } from './DocumentDetailView';
import { Document } from '../../types';
import { MockAppProvider } from '../../stories/MockAppProvider';

// Wrapper component that provides the mock context
const DocumentDetailViewWrapper = (props: any) => {
  return (
    <MockAppProvider>
      <DocumentDetailView {...props} />
    </MockAppProvider>
  );
};

const meta: Meta<typeof DocumentDetailViewWrapper> = {
  title: 'Views/DocumentDetailView',
  component: DocumentDetailViewWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock document data
const createMockDocument = (overrides: Partial<Document> = {}): Document => ({
  id: 'doc-1',
  name: 'Product Requirements Document',
  type: 'PDF',
  state: 'ingested',
  version: 2,
  chunks: 45,
  quality: 92,
  uploadDate: '2024-01-10',
  processingMode: 'MANUAL',
  ...overrides,
});

// Mock handlers
const mockHandlers = {
  onBack: () => {
    console.log('🔙 [Storybook] Navigating back');
  },
  onReingest: (document: Document) => {
    console.log('🔄 [Storybook] Reingesting document:', document.name);
  },
  onSupersede: (document: Document) => {
    console.log('🔄 [Storybook] Superseding document:', document.name);
  },
  onDelete: (document: Document) => {
    console.log('🗑️ [Storybook] Deleting document:', document.name);
  },
  onDocumentUpdate: () => {
    console.log('💾 [Storybook] Document updated');
  },
};

export const Default: Story = {
  args: {
    document: createMockDocument(),
    ...mockHandlers,
  },
};

export const ProcessingDocument: Story = {
  args: {
    document: createMockDocument({
      state: 'ingesting',
      chunks: 0,
      quality: 0,
    }),
    ...mockHandlers,
  },
};

export const PendingDocument: Story = {
  args: {
    document: createMockDocument({
      state: 'pending',
      chunks: 0,
      quality: 0,
    }),
    ...mockHandlers,
  },
};

export const AutomaticMode: Story = {
  args: {
    document: createMockDocument({
      processingMode: 'AUTOMATIC',
    }),
    ...mockHandlers,
  },
};

// Interactive story with simulated stage processing
export const InteractiveProcessingSimulation = {
  render: () => {
    const [document, setDocument] = useState<Document>(createMockDocument({
      state: 'pending',
      chunks: 0,
      quality: 0,
      processingMode: 'MANUAL',
    }));

    const handleReingest = async (doc: Document) => {
      console.log('🔄 [Storybook] Starting reingest simulation for:', doc.name);
      
      // Simulate processing states
      setDocument(prev => ({ ...prev, state: 'ingesting' }));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate completion
      setDocument(prev => ({ 
        ...prev, 
        state: 'ingested',
        chunks: 45,
        quality: 92,
      }));
      
      console.log('✅ [Storybook] Reingest simulation completed');
    };

    const handleDocumentUpdate = () => {
      console.log('💾 [Storybook] Document updated');
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Interactive Document Detail Simulation
            </h2>
            <p className="text-gray-600 mb-4">
              This story simulates the complete document processing workflow. Use the reingest 
              button to see a 2-second processing simulation with state changes.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to test:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Click &quot;Reingest Document&quot; to simulate processing</li>
                <li>• Watch the state change from pending → ingesting → ingested</li>
                <li>• Observe chunks and quality values update upon completion</li>
                <li>• Try different processing modes and document states</li>
                <li>• Use the stage control panel to execute individual stages</li>
              </ul>
            </div>
          </div>

          <MockAppProvider>
            <DocumentDetailView
              document={document}
              onBack={mockHandlers.onBack}
              onReingest={handleReingest}
              onSupersede={mockHandlers.onSupersede}
              onDelete={mockHandlers.onDelete}
              onDocumentUpdate={handleDocumentUpdate}
            />
          </MockAppProvider>

          {/* Debug Information */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Debug Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Document State: <span className="font-mono">{document.state}</span></div>
              <div>Processing Mode: <span className="font-mono">{document.processingMode}</span></div>
              <div>Chunks: <span className="font-mono">{document.chunks}</span></div>
              <div>Quality: <span className="font-mono">{document.quality}%</span></div>
              <div>Upload Date: <span className="font-mono">{document.uploadDate}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const LargeDocument: Story = {
  args: {
    document: createMockDocument({
      name: 'Comprehensive System Architecture Documentation v4.2',
      chunks: 156,
      quality: 96,
      type: 'PDF',
    }),
    ...mockHandlers,
  },
};

export const SmallDocument: Story = {
  args: {
    document: createMockDocument({
      name: 'Quick Note',
      chunks: 3,
      quality: 68,
      type: 'TXT',
    }),
    ...mockHandlers,
  },
};
