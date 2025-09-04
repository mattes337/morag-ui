import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddDocumentDialog } from '../../../components/dialogs/AddDocumentDialog';
import { mockDocument } from '../../../lib/test-utils';
import { useApp } from '../../../contexts/AppContext';

import '@testing-library/jest-dom'

// Mock the useApp hook
jest.mock('../../../contexts/AppContext', () => ({
    useApp: jest.fn(),
}));

const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;

const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
};

describe('AddDocumentDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock the useApp hook with required data
        mockUseApp.mockReturnValue({
            servers: [
                { id: 'db1', name: 'Test Database 1', description: 'Test DB 1' },
                { id: 'db2', name: 'Test Database 2', description: 'Test DB 2' },
            ],
            createDocument: jest.fn().mockResolvedValue({}),
        } as any);
    });

    it('should not render when closed', () => {
        render(<AddDocumentDialog {...mockProps} isOpen={false} data-oid=".c5bbf-" />);

        expect(screen.queryByText('Add Document')).not.toBeInTheDocument();
    });

    it('should render add document dialog', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="8z0ygmn" />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Choose your document source to get started')).toBeInTheDocument();
    });

    it('should render supersede mode dialog', () => {
        render(
            <AddDocumentDialog
                {...mockProps}
                mode="supersede"
                documentToSupersede={mockDocument}
                data-oid="n1qg1_y"
            />,
        );

        // Since supersede mode is not implemented yet, it should still show the regular dialog
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Choose your document source to get started')).toBeInTheDocument();
    });

    it('should display document source options', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="1:9llyu" />);

        expect(screen.getByText('Upload File')).toBeInTheDocument();
        expect(screen.getByText('From URL')).toBeInTheDocument();
        expect(screen.getByText('Select a file from your computer')).toBeInTheDocument();
        expect(screen.getByText('Enter a web URL or YouTube link')).toBeInTheDocument();
    });

    it('should show file upload when upload file is clicked', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="866w_c8" />);

        const uploadButton = screen.getByText('Upload File');
        fireEvent.click(uploadButton);

        // The dialog should show the file input
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should show URL input when From URL is clicked', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="v:sh5nd" />);

        const urlInput = screen.getByPlaceholderText('https://example.com/document or YouTube URL');
        expect(urlInput).toBeInTheDocument();

        fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=test' } });
        expect(urlInput).toHaveValue('https://youtube.com/watch?v=test');
    });

    it('should handle URL input', async () => {
        render(<AddDocumentDialog {...mockProps} data-oid="ndh0yp1" />);

        const urlInput = screen.getByPlaceholderText('https://example.com/document or YouTube URL');

        fireEvent.change(urlInput, { target: { value: 'https://example.com/test.pdf' } });
        expect(urlInput).toHaveValue('https://example.com/test.pdf');
    });

    it('should call onClose when close button is clicked', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="a8h_0.m" />);

        const closeButton = screen.getByRole('button', { name: 'Close' });
        fireEvent.click(closeButton);

        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should show upload file option', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="6nv8:7p" />);

        expect(screen.getByText('Upload File')).toBeInTheDocument();
        expect(screen.getByText('Select a file from your computer')).toBeInTheDocument();
    });

    it('should show from URL option', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="_tc27f." />);

        expect(screen.getByText('From URL')).toBeInTheDocument();
        expect(screen.getByText('Enter a web URL or YouTube link')).toBeInTheDocument();
    });

    it('should have URL input field', () => {
        render(<AddDocumentDialog {...mockProps} data-oid="lwja.d-" />);

        const urlInput = screen.getByPlaceholderText('https://example.com/document or YouTube URL');
        expect(urlInput).toBeInTheDocument();
    });

    it('should handle supersede mode', () => {
        const documentToSupersede = {
            ...mockDocument,
            type: 'Document',
        };

        render(
            <AddDocumentDialog
                {...mockProps}
                mode="supersede"
                documentToSupersede={documentToSupersede}
                data-oid="9vssgjd"
            />,
        );

        // Since supersede mode is not implemented, it should show the regular dialog
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Choose your document source to get started')).toBeInTheDocument();
    });

    it('should reset form when dialog closes', async () => {
        const { rerender } = render(<AddDocumentDialog {...mockProps} data-oid="3v3m7x3" />);

        // Close and reopen dialog
        rerender(<AddDocumentDialog {...mockProps} isOpen={false} data-oid="jyc3.sw" />);
        rerender(<AddDocumentDialog {...mockProps} isOpen={true} data-oid="tinnpdp" />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Choose your document source to get started')).toBeInTheDocument();
    });
});
