// Mock implementation of DocumentService
export const DocumentService = {
    createDocument: jest.fn(),
    getAllDocuments: jest.fn(),
    getDocumentById: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    getDocumentsByDatabaseId: jest.fn(),
    getDocumentsByUserId: jest.fn(),
    getDocumentsByState: jest.fn(),
    updateDocumentQuality: jest.fn(),
};