import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentThumbnail } from './DocumentThumbnail';

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

describe('DocumentThumbnail', () => {
  it('renders document information', () => {
    render(<DocumentThumbnail document={mockDocument} />);
    
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.00 MB')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('renders in list variant', () => {
    render(<DocumentThumbnail document={mockDocument} variant="list" />);
    
    const container = screen.getByText('Test Document').closest('button');
    expect(container).toHaveClass('flex', 'items-center');
  });

  it('renders in grid variant', () => {
    render(<DocumentThumbnail document={mockDocument} variant="grid" />);
    
    const container = screen.getByText('Test Document').closest('button');
    expect(container).toHaveClass('group', 'relative');
  });

  it('handles click events when clickable', () => {
    const mockOnClick = jest.fn();
    
    render(
      <DocumentThumbnail 
        document={mockDocument}
        clickable={true}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockDocument);
  });

  it('supports keyboard navigation', () => {
    const mockOnClick = jest.fn();
    
    render(
      <DocumentThumbnail 
        document={mockDocument}
        clickable={true}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith(mockDocument);
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('shows processing status and progress', () => {
    const processingDocument = {
      ...mockDocument,
      status: 'processing' as const,
      progress: 75
    };
    
    render(<DocumentThumbnail document={processingDocument} />);
    
    expect(screen.getByText('processing')).toBeInTheDocument();
    // Progress bar should be visible
    expect(document.querySelector('[style*="75%"]')).toBeInTheDocument();
  });

  it('displays tags when provided', () => {
    render(<DocumentThumbnail document={mockDocument} />);
    
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('financial')).toBeInTheDocument();
  });

  it('shows quick actions on hover when enabled', () => {
    const mockOnPreview = jest.fn();
    const mockOnDownload = jest.fn();
    
    render(
      <DocumentThumbnail 
        document={mockDocument}
        showQuickActions={true}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />
    );
    
    // Quick action buttons should be present but may be hidden
    const previewButton = screen.getByLabelText('Preview test.pdf');
    const downloadButton = screen.getByLabelText('Download test.pdf');
    
    fireEvent.click(previewButton);
    expect(mockOnPreview).toHaveBeenCalledWith(mockDocument);
    
    fireEvent.click(downloadButton);
    expect(mockOnDownload).toHaveBeenCalledWith(mockDocument);
  });

  it('handles different file types with appropriate icons', () => {
    const imageDocument = {
      ...mockDocument,
      filename: 'image.jpg',
      type: 'image/jpeg'
    };
    
    render(<DocumentThumbnail document={imageDocument} />);
    
    // Should render with image icon/preview
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
  });

  it('shows selected state', () => {
    render(
      <DocumentThumbnail 
        document={mockDocument}
        selected={true}
      />
    );
    
    const container = screen.getByText('Test Document').closest('button');
    expect(container).toHaveClass('ring-2', 'ring-primary');
  });

  it('supports different sizes', () => {
    const { rerender } = render(
      <DocumentThumbnail 
        document={mockDocument}
        size="sm"
      />
    );
    
    // Small size classes should be applied
    let thumbnail = document.querySelector('[class*="w-32"]');
    expect(thumbnail).toBeInTheDocument();
    
    rerender(
      <DocumentThumbnail 
        document={mockDocument}
        size="lg"
      />
    );
    
    // Large size classes should be applied
    thumbnail = document.querySelector('[class*="w-40"]');
    expect(thumbnail).toBeInTheDocument();
  });

  it('renders without clickable behavior when disabled', () => {
    render(
      <DocumentThumbnail 
        document={mockDocument}
        clickable={false}
      />
    );
    
    // Should not be a button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    // Should be a div instead
    expect(screen.getByText('Test Document').closest('div')).toBeInTheDocument();
  });
});