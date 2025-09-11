import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BatchActionBar } from './BatchActionBar';
import { TooltipProvider } from '@/components/ui';
import type { DocumentMetadata } from '@/lib/mockData/documentMockData';

// Wrapper component to provide tooltip context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TooltipProvider>
    {children}
  </TooltipProvider>
);

const mockDocuments: DocumentMetadata[] = [
  {
    id: 'doc1',
    name: 'Test Document 1',
    filename: 'test1.pdf',
    type: 'application/pdf',
    size: 1024 * 1024,
    uploadedAt: new Date(),
    uploadedBy: 'John Doe',
    status: 'completed',
    processingStage: undefined,
    progress: undefined,
    tags: ['test'],
    description: 'Test document',
    chunkCount: 10,
    factCount: 20,
    realmId: 'realm1',
    url: '/test1.pdf',
    thumbnailUrl: undefined,
    error: undefined
  },
  {
    id: 'doc2',
    name: 'Test Document 2',
    filename: 'test2.pdf',
    type: 'application/pdf',
    size: 2 * 1024 * 1024,
    uploadedAt: new Date(),
    uploadedBy: 'Jane Smith',
    status: 'processing',
    processingStage: 'chunker',
    progress: 50,
    tags: ['test'],
    description: 'Test document 2',
    chunkCount: undefined,
    factCount: undefined,
    realmId: 'realm1',
    url: '/test2.pdf',
    thumbnailUrl: undefined,
    error: undefined
  }
];

const defaultProps = {
  selectedCount: 2,
  totalCount: 10,
  allSelected: false,
  isPartialSelection: true,
  selectedDocuments: mockDocuments,
  onSelectAll: jest.fn(),
  onClearSelection: jest.fn(),
  onDownload: jest.fn(),
  onDelete: jest.fn(),
  onAddTags: jest.fn(),
  onMoveToRealm: jest.fn(),
};

describe('BatchActionBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with selection information', () => {
    render(<BatchActionBar {...defaultProps} />, { wrapper: TestWrapper });
    
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('of 10 selected')).toBeInTheDocument();
  });

  test('does not render when no selection and not always visible', () => {
    const { container } = render(
      <BatchActionBar 
        {...defaultProps} 
        selectedCount={0} 
        isPartialSelection={false}
        alwaysVisible={false}
      />,
      { wrapper: TestWrapper }
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders when always visible even with no selection', () => {
    render(
      <BatchActionBar 
        {...defaultProps} 
        selectedCount={0} 
        isPartialSelection={false}
        alwaysVisible={true}
      />,
      { wrapper: TestWrapper }
    );
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('of 10 selected')).toBeInTheDocument();
  });

  test('calls onSelectAll when select all button is clicked', () => {
    render(<BatchActionBar {...defaultProps} />, { wrapper: TestWrapper });
    
    const selectAllButton = screen.getByRole('button', { name: /select all/i });
    fireEvent.click(selectAllButton);
    
    expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(1);
  });

  test('calls onClearSelection when deselect all button is clicked', () => {
    render(<BatchActionBar {...defaultProps} allSelected={true} />, { wrapper: TestWrapper });
    
    const deselectAllButton = screen.getByRole('button', { name: /deselect all/i });
    fireEvent.click(deselectAllButton);
    
    expect(defaultProps.onClearSelection).toHaveBeenCalledTimes(1);
  });

  test('calls onDownload when download button is clicked', () => {
    render(<BatchActionBar {...defaultProps} />, { wrapper: TestWrapper });
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);
    
    expect(defaultProps.onDownload).toHaveBeenCalledWith(['doc1', 'doc2']);
  });

  test('calls onAddTags when tag button is clicked', () => {
    render(<BatchActionBar {...defaultProps} />, { wrapper: TestWrapper });
    
    const tagButton = screen.getByRole('button', { name: /tag/i });
    fireEvent.click(tagButton);
    
    expect(defaultProps.onAddTags).toHaveBeenCalledWith(['doc1', 'doc2']);
  });

  test('calls onMoveToRealm when move button is clicked', () => {
    render(<BatchActionBar {...defaultProps} />, { wrapper: TestWrapper });
    
    const moveButton = screen.getByRole('button', { name: /move/i });
    fireEvent.click(moveButton);
    
    expect(defaultProps.onMoveToRealm).toHaveBeenCalledWith(['doc1', 'doc2'], 'current-realm');
  });

  test('shows progress when processing', () => {
    render(
      <BatchActionBar 
        {...defaultProps} 
        isProcessing={true}
        operationProgress={75}
        currentOperation="Downloading files..."
      />,
      { wrapper: TestWrapper }
    );
    
    expect(screen.getByText('Downloading files...')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('disables buttons when processing', () => {
    render(<BatchActionBar {...defaultProps} isProcessing={true} />, { wrapper: TestWrapper });
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    const tagButton = screen.getByRole('button', { name: /tag/i });
    
    expect(downloadButton).toBeDisabled();
    expect(tagButton).toBeDisabled();
  });

  test('shows selection summary with file sizes and statuses', () => {
    render(<BatchActionBar {...defaultProps} />, { wrapper: TestWrapper });
    
    expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    expect(screen.getByText(/1 completed, 1 processing, 0 failed/)).toBeInTheDocument();
    expect(screen.getByText(/Total size:/)).toBeInTheDocument();
  });

  test('disables download for documents that cannot be downloaded', () => {
    const documentsWithPending = [
      ...mockDocuments,
      {
        id: 'doc3',
        name: 'Pending Document',
        filename: 'pending.pdf',
        type: 'application/pdf',
        size: 1024,
        uploadedAt: new Date(),
        uploadedBy: 'User',
        status: 'pending' as const,
        processingStage: undefined,
        progress: undefined,
        tags: [],
        description: '',
        chunkCount: undefined,
        factCount: undefined,
        realmId: 'realm1',
        url: '/pending.pdf',
        thumbnailUrl: undefined,
        error: undefined
      }
    ];

    render(
      <BatchActionBar 
        {...defaultProps} 
        selectedDocuments={documentsWithPending}
        selectedCount={3}
      />,
      { wrapper: TestWrapper }
    );
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    expect(downloadButton).toBeDisabled();
  });

  test('opens more actions menu when more button is clicked', () => {
    const mockArchive = jest.fn();
    const mockShare = jest.fn();
    
    render(
      <BatchActionBar 
        {...defaultProps} 
        onArchive={mockArchive}
        onShare={mockShare}
      />,
      { wrapper: TestWrapper }
    );
    
    const moreButton = screen.getByRole('button', { name: /more actions/i });
    fireEvent.click(moreButton);
    
    expect(screen.getByText('Archive')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Copy IDs')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('calls archive function from more actions menu', () => {
    const mockArchive = jest.fn();
    
    render(<BatchActionBar {...defaultProps} onArchive={mockArchive} />, { wrapper: TestWrapper });
    
    const moreButton = screen.getByRole('button', { name: /more actions/i });
    fireEvent.click(moreButton);
    
    const archiveButton = screen.getByText('Archive');
    fireEvent.click(archiveButton);
    
    expect(mockArchive).toHaveBeenCalledWith(['doc1', 'doc2']);
  });

  test('calls clear selection when close button is clicked', () => {
    render(<BatchActionBar {...defaultProps} />, { wrapper: TestWrapper });
    
    const closeButton = screen.getByRole('button', { name: /clear selection/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClearSelection).toHaveBeenCalledTimes(1);
  });
});