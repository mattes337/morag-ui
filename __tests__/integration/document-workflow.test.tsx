import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../lib/test-utils';
import { AppProvider } from '../../contexts/AppContext';
import { DocumentsView } from '../../components/views/DocumentsView';
import { AddDocumentDialog } from '../../components/dialogs/AddDocumentDialog';
import { DeleteConfirmDialog } from '../../components/dialogs/DeleteConfirmDialog';
import { createMockFetch, mockRealm, mockDocument } from '../../lib/test-utils';

import '@testing-library/jest-dom'

// Mock the vector search module
jest.mock('../../lib/vectorSearch', () => ({
    checkApiHealth: jest.fn().mockResolvedValue(true),
}));

describe('Document Workflow Integration', () => {
    beforeEach(() => {
        global.fetch = createMockFetch({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should complete full document workflow', async () => {
        // Mock API responses
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockRealm]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockDocument]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'admin',
                    }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

        const TestComponent = () => {
            const [showAddDialog, setShowAddDialog] = React.useState(false);
            const [selectedDocument, setSelectedDocument] = React.useState<any>(null);

            return (
                <AppProvider>
                    <div>
                        <DocumentsView
                            documents={[mockDocument]}
                            selectedRealm={mockRealm}
                            onBackToRealms={() => {}}
                            onAddDocument={() => setShowAddDialog(true)}
                            onPromptDocument={(doc) => setSelectedDocument(doc)}
                            onViewDocumentDetail={(doc) => setSelectedDocument(doc)}
                        />

                        <AddDocumentDialog
                            isOpen={showAddDialog}
                            onClose={() => setShowAddDialog(false)}
                        />

                        {selectedDocument && (
                            <div data-testid="selected-document">
                                Selected: {selectedDocument.name}
                            </div>
                        )}
                    </div>
                </AppProvider>
            );
        };

        render(<TestComponent />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('Documents - Test Realm')).toBeInTheDocument();
        });

        // Test document display
        expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('ingested')).toBeInTheDocument();

        // Test add document workflow
        const addButton = screen.getByText('Add Document');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Select document type:')).toBeInTheDocument();
        });

        // Select PDF document type
        const pdfButton = screen.getByText('PDF Document');
        fireEvent.click(pdfButton);

        await waitFor(() => {
            expect(screen.getByText('File *')).toBeInTheDocument();
            const addButtons = screen.getAllByRole('button', { name: 'Add Document' });
            expect(addButtons.length).toBeGreaterThan(0);
        });

        // Close dialog
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Select document type:')).not.toBeInTheDocument();
        });

        // Test document interaction
        const documentLink = screen.getByText('Test Document.pdf');
        fireEvent.click(documentLink);

        await waitFor(() => {
            expect(screen.getByTestId('selected-document')).toHaveTextContent(
                'Selected: Test Document.pdf',
            );
        });

        // Test prompt functionality
        const promptButton = screen.getByText('Prompt');
        fireEvent.click(promptButton);

        await waitFor(() => {
            expect(screen.getByTestId('selected-document')).toHaveTextContent(
                'Selected: Test Document.pdf',
            );
        });
    });

    it('should handle document supersede workflow', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockRealm]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockDocument]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'admin',
                    }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

        const TestComponent = () => {
            const [showSupersede, setShowSupersede] = React.useState(false);

            return (
                <AppProvider>
                    <div>
                        <button onClick={() => setShowSupersede(true)}>Supersede Document</button>
                        <AddDocumentDialog
                            isOpen={showSupersede}
                            onClose={() => setShowSupersede(false)}
                            mode="supersede"
                            documentToSupersede={mockDocument}
                        />
                    </div>
                </AppProvider>
            );
        };

        render(<TestComponent />);

        // Open supersede dialog
        const supersedeButton = screen.getByText('Supersede Document');
        fireEvent.click(supersedeButton);

        await waitFor(() => {
            expect(screen.getByText('Document Supersede Warning')).toBeInTheDocument();
            const supersedeButtons = screen.getAllByRole('button', { name: 'Supersede Document' });
            expect(supersedeButtons.length).toBeGreaterThan(0);
        });

        // Should auto-select document type
        expect(screen.getByText('📄')).toBeInTheDocument();
        expect(screen.getByText('PDF Document')).toBeInTheDocument();
    });
});
