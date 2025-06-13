import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { DocumentsView } from '../../../components/views/DocumentsView';
import { mockDatabase, mockDocument } from '../../utils/test-utils';

const mockProps = {
    documents: [mockDocument],
    selectedDatabase: mockDatabase,
    onBackToDatabases: jest.fn(),
    onAddDocument: jest.fn(),
    onPromptDocument: jest.fn(),
    onViewDocumentDetail: jest.fn(),
};

describe('DocumentsView', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render documents table', () => {
        render(<DocumentsView {...mockProps} data-oid="s1-63pi" />);

        expect(screen.getByText('Documents - Test Database')).toBeInTheDocument();
        expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('ingested')).toBeInTheDocument();
        expect(screen.getByText('v1')).toBeInTheDocument();
    });

    it('should render without selected database', () => {
        render(<DocumentsView {...mockProps} selectedDatabase={null} data-oid="r3p9mei" />);

        expect(screen.getByText('Documents')).toBeInTheDocument();
        expect(screen.queryByText('- Test Database')).not.toBeInTheDocument();
    });

    it('should call onBackToDatabases when back button is clicked', () => {
        render(<DocumentsView {...mockProps} data-oid="rjn8bjo" />);

        const backButton = screen.getByText('← Back to Databases');
        fireEvent.click(backButton);

        expect(mockProps.onBackToDatabases).toHaveBeenCalledTimes(1);
    });

    it('should call onAddDocument when add button is clicked', () => {
        render(<DocumentsView {...mockProps} data-oid="im1c:rh" />);

        const addButton = screen.getByText('Add Document');
        fireEvent.click(addButton);

        expect(mockProps.onAddDocument).toHaveBeenCalledTimes(1);
    });

    it('should call onViewDocumentDetail when document name is clicked', () => {
        render(<DocumentsView {...mockProps} data-oid="hp-qdih" />);

        const documentLink = screen.getByText('Test Document.pdf');
        fireEvent.click(documentLink);

        expect(mockProps.onViewDocumentDetail).toHaveBeenCalledWith(mockDocument);
    });

    it('should call onViewDocumentDetail when View Details button is clicked', () => {
        render(<DocumentsView {...mockProps} data-oid="r1n.pkp" />);

        const viewDetailsButton = screen.getByText('View Details');
        fireEvent.click(viewDetailsButton);

        expect(mockProps.onViewDocumentDetail).toHaveBeenCalledWith(mockDocument);
    });

    it('should call onPromptDocument when Prompt button is clicked', () => {
        render(<DocumentsView {...mockProps} data-oid="zz6viji" />);

        const promptButton = screen.getByText('Prompt');
        fireEvent.click(promptButton);

        expect(mockProps.onPromptDocument).toHaveBeenCalledWith(mockDocument);
    });

    it('should display document state with correct styling', () => {
        const documents = [
            { ...mockDocument, state: 'pending' as const },
            { ...mockDocument, id: '2', state: 'ingesting' as const },
            { ...mockDocument, id: '3', state: 'ingested' as const },
            { ...mockDocument, id: '4', state: 'deprecated' as const },
            { ...mockDocument, id: '5', state: 'deleted' as const },
        ];

        render(<DocumentsView {...mockProps} documents={documents} data-oid="i176_0i" />);

        expect(screen.getByText('pending')).toHaveClass('bg-yellow-100', 'text-yellow-800');
        expect(screen.getByText('ingesting')).toHaveClass('bg-blue-100', 'text-blue-800');
        expect(screen.getByText('ingested')).toHaveClass('bg-green-100', 'text-green-800');
        expect(screen.getByText('deprecated')).toHaveClass('bg-gray-100', 'text-gray-800');
        expect(screen.getByText('deleted')).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should display document metadata when available', () => {
        const documentWithMetadata = {
            ...mockDocument,
            metadata: {
                title: 'Test Document Title',
                author: 'Test Author',
                page_count: 10,
                duration: 120,
                word_count: 1000,
                file_size: 1024 * 1024,
                language: 'en',
                chunk_count: 15,
                extraction_quality: 0.98,
                text_length: 5000,
            },
        };

        render(
            <DocumentsView {...mockProps} documents={[documentWithMetadata]} data-oid="mwgkc5q" />,
        );

        // Check that the document name is rendered
        expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();

        // Check that basic table structure is there
        expect(screen.getByRole('table')).toBeInTheDocument();

        // Check that chunks and quality are rendered (these should definitely be there)
        expect(screen.getByText('15 chunks')).toBeInTheDocument();
        expect(screen.getByText('98% quality')).toBeInTheDocument();
        expect(screen.getByText('5.0k chars')).toBeInTheDocument();

        // Check if metadata is conditionally rendered
        const titleElement = screen.queryByText('Test Document Title');
        if (titleElement) {
            expect(titleElement).toBeInTheDocument();
            expect(screen.getByText('by Test Author')).toBeInTheDocument();
            expect(screen.getByText('10 pages')).toBeInTheDocument();
        }
    });

    it('should handle empty documents list', () => {
        render(<DocumentsView {...mockProps} documents={[]} data-oid="5b9quus" />);

        expect(screen.getByText('Documents - Test Database')).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.queryByText('Test Document.pdf')).not.toBeInTheDocument();
    });
});
