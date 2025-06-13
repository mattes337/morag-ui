import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { AddDocumentDialog } from '../../../components/dialogs/AddDocumentDialog';
import { mockDocument } from '../../utils/test-utils';

const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
};

describe('AddDocumentDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not render when closed', () => {
        render(<AddDocumentDialog {...mockProps} isOpen={false} data-oid="27l83w8" />);

        expect(screen.queryByText('Add Document')).not.toBeInTheDocument();
    });

    it('should render add document dialog', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="6prnbgf" />);

        expect(screen.getByText('Add Document')).toBeInTheDocument();
        expect(screen.getByText('Select document type:')).toBeInTheDocument();
    });

    it('should render supersede mode dialog', () => {
        render(
            <AddDocumentDialog
                {...mockProps}
                mode="supersede"
                documentToSupersede={mockDocument}
                data-oid="80h1m:_"
            />,
        );

        expect(screen.getByText('Supersede Document')).toBeInTheDocument();
        expect(screen.getByText('Document Supersede Warning')).toBeInTheDocument();
        expect(
            screen.getByText(/This action will replace the existing document/),
        ).toBeInTheDocument();
    });

    it('should display document types', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="7atnj56" />);

        expect(screen.getByText('PDF Document')).toBeInTheDocument();
        expect(screen.getByText('Word Document')).toBeInTheDocument();
        expect(screen.getByText('YouTube Video')).toBeInTheDocument();
        expect(screen.getByText('Video File')).toBeInTheDocument();
        expect(screen.getByText('Audio File')).toBeInTheDocument();
        expect(screen.getByText('Website')).toBeInTheDocument();
    });

    it('should select document type and show form', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="kmjezx6" />);

        const pdfButton = screen.getByText('PDF Document');
        fireEvent.click(pdfButton);

        await waitFor(() => {
            expect(screen.getByText('File')).toBeInTheDocument();
            expect(screen.getByLabelText('Chunk Size')).toBeInTheDocument();
            expect(screen.getByLabelText('Chunking Method')).toBeInTheDocument();
            expect(screen.getByLabelText('GPU Processing')).toBeInTheDocument();
            expect(screen.getByLabelText('Contextual Embedding')).toBeInTheDocument();
        });
    });

    it('should show URL input for YouTube and Website types', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="fnc89io" />);

        const youtubeButton = screen.getByText('YouTube Video');
        fireEvent.click(youtubeButton);

        await waitFor(() => {
            expect(screen.getByText('URL')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter URL...')).toBeInTheDocument();
        });
    });

    it('should handle form inputs', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="cldvyx9" />);

        const pdfButton = screen.getByText('PDF Document');
        fireEvent.click(pdfButton);

        await waitFor(() => {
            const chunkSizeSelect = screen.getByLabelText('Chunk Size');
            const chunkingMethodSelect = screen.getByLabelText('Chunking Method');
            const gpuCheckbox = screen.getByLabelText('GPU Processing');
            const contextualCheckbox = screen.getByLabelText('Contextual Embedding');

            fireEvent.change(chunkSizeSelect, { target: { value: '2000' } });
            fireEvent.change(chunkingMethodSelect, { target: { value: 'Fixed Size' } });
            fireEvent.click(gpuCheckbox);
            fireEvent.click(contextualCheckbox);

            expect(chunkSizeSelect).toHaveValue('2000');
            expect(chunkingMethodSelect).toHaveValue('Fixed Size');
            expect(gpuCheckbox).toBeChecked();
            expect(contextualCheckbox).toBeChecked();
        });
    });

    it('should call onClose when cancel button is clicked', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="cbrr2sc" />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should show add document button after selecting type', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="jd2wr6b" />);

        const pdfButton = screen.getByText('PDF Document');
        fireEvent.click(pdfButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Add Document' })).toBeInTheDocument();
        });
    });

    it('should show supersede document button in supersede mode', () => {
        render(
            <AddDocumentDialog
                {...mockProps}
                mode="supersede"
                documentToSupersede={mockDocument}
                data-oid="u77zlbp"
            />,
        );

        expect(screen.getByRole('button', { name: 'Supersede Document' })).toBeInTheDocument();
    });

    it('should allow changing document type in add mode', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="323ztsx" />);

        const pdfButton = screen.getByText('PDF Document');
        fireEvent.click(pdfButton);

        await waitFor(() => {
            const changeButton = screen.getByText('Change');
            fireEvent.click(changeButton);
        });

        expect(screen.getByText('Select document type:')).toBeInTheDocument();
    });

    it('should auto-select document type in supersede mode', () => {
        const documentToSupersede = {
            ...mockDocument,
            type: 'PDF',
        };

        render(
            <AddDocumentDialog
                {...mockProps}
                mode="supersede"
                documentToSupersede={documentToSupersede}
                data-oid="wz1ij.-"
            />,
        );

        expect(screen.getByText('📄')).toBeInTheDocument();
        expect(screen.getByText('PDF Document')).toBeInTheDocument();
    });

    it('should reset form when dialog closes', async () => {
        const { rerender } = render(<AddDocumentDialog {...mockProps} data-oid="b86ayh6" />);

        const pdfButton = screen.getByText('PDF Document');
        fireEvent.click(pdfButton);

        await waitFor(() => {
            const gpuCheckbox = screen.getByLabelText('GPU Processing');
            fireEvent.click(gpuCheckbox);
            expect(gpuCheckbox).toBeChecked();
        });

        // Close and reopen dialog
        rerender(<AddDocumentDialog {...mockProps} isOpen={false} data-oid="-wxpu5z" />);
        rerender(<AddDocumentDialog {...mockProps} isOpen={true} data-oid="rh9jm7_" />);

        expect(screen.getByText('Select document type:')).toBeInTheDocument();
    });
});
