import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentViewer } from './DocumentViewer';

// Mock document data
const mockDocument = {
  id: '1',
  name: 'Test Document',
  filename: 'test.pdf',
  type: 'application/pdf',
  size: 1024000,
  status: 'completed' as const,
  uploadedAt: new Date('2024-01-10'),
  uploadedBy: 'test@example.com',
  tags: ['important', 'financial']
};

const mockDocuments = [
  mockDocument,
  {
    id: '2',
    name: 'Test Image',
    filename: 'test.jpg',
    type: 'image/jpeg',
    size: 512000,
    status: 'completed' as const,
    uploadedAt: new Date('2024-01-10'),
    uploadedBy: 'test@example.com',
  }
];

// Mock Portal for modals
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

describe('DocumentViewer', () => {
  it('renders inline mode by default', () => {
    render(<DocumentViewer document={mockDocument} />);
    
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('renders button mode when specified', () => {
    render(
      <DocumentViewer 
        document={mockDocument} 
        mode="button" 
        buttonText="Custom Preview" 
      />
    );
    
    const button = screen.getByRole('button', { name: 'Custom Preview' });
    expect(button).toBeInTheDocument();
  });

  it('opens modal when button is clicked', () => {
    render(
      <DocumentViewer 
        document={mockDocument} 
        mode="button"
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Modal should be open with document content
    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('handles navigation between documents', () => {
    const mockOnDocumentChange = jest.fn();
    
    render(
      <DocumentViewer 
        document={mockDocument}
        documents={mockDocuments}
        enableNavigation={true}
        onDocumentChange={mockOnDocumentChange}
      />
    );
    
    // Should show navigation indicator
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('calls onDownload when download is triggered', () => {
    const mockOnDownload = jest.fn();
    
    render(
      <DocumentViewer 
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );
    
    const downloadButton = screen.getByLabelText('Download document');
    fireEvent.click(downloadButton);
    
    expect(mockOnDownload).toHaveBeenCalledWith(mockDocument);
  });

  it('displays loading state', () => {
    render(
      <DocumentViewer 
        document={mockDocument}
        loading={true}
      />
    );
    
    // Should show loading skeleton or indicator
    expect(document.querySelector('.animate-pulse') || screen.queryByText('Loading')).toBeInTheDocument();
  });

  it('displays error state', () => {
    render(
      <DocumentViewer 
        document={mockDocument}
        error="Failed to load document"
      />
    );
    
    expect(screen.getByText('Preview Not Available')).toBeInTheDocument();
    expect(screen.getByText('Failed to load document')).toBeInTheDocument();
  });

  it('supports different sizes in inline mode', () => {
    const { rerender } = render(
      <DocumentViewer 
        document={mockDocument}
        size="sm"
      />
    );
    
    let container = document.querySelector('[style*="256px"]');
    expect(container).toBeInTheDocument();
    
    rerender(
      <DocumentViewer 
        document={mockDocument}
        size="lg"
      />
    );
    
    container = document.querySelector('[style*="512px"]');
    expect(container).toBeInTheDocument();
  });
});

describe('DocumentViewer Hook', () => {
  it('manages viewer state correctly', () => {
    const TestComponent = () => {
      const { currentDocument, modalOpen, openViewer, closeViewer } = 
        require('./DocumentViewer').useDocumentViewer(mockDocument);
      
      return (
        <div>
          <button onClick={() => openViewer(mockDocuments[1])}>
            Open Document
          </button>
          <button onClick={closeViewer}>
            Close
          </button>
          <div data-testid="modal-state">
            {modalOpen ? 'open' : 'closed'}
          </div>
          <div data-testid="current-doc">
            {currentDocument?.name}
          </div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Initial state
    expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');
    expect(screen.getByTestId('current-doc')).toHaveTextContent('Test Document');
    
    // Open viewer
    fireEvent.click(screen.getByText('Open Document'));
    expect(screen.getByTestId('modal-state')).toHaveTextContent('open');
    expect(screen.getByTestId('current-doc')).toHaveTextContent('Test Image');
    
    // Close viewer
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');
  });
});