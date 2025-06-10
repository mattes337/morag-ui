'use client';

import { useApp } from '../../contexts/AppContext';
import { PromptView } from '../../components/views/PromptView';
import { performVectorSearch, executePromptWithContext } from '../../lib/vectorSearch';

export default function PromptPage() {
    const {
        selectedDatabase,
        selectedDocument,
        setSelectedDocument,
        setSelectedDatabase,
        promptText,
        setPromptText,
        numDocuments,
        setNumDocuments,
        searchResults,
        setSearchResults,
        promptResponse,
        setPromptResponse,
        isLoading,
        setIsLoading,
    } = useApp();

    const handlePromptSubmit = async () => {
        if (!promptText.trim()) return;

        setIsLoading(true);

        try {
            // Perform vector search first
            const searchOptions = {
                query: promptText,
                numResults: numDocuments,
                documentId: selectedDocument?.id?.toString(),
                databaseId: selectedDatabase?.id?.toString(),
            };

            const results = await performVectorSearch(searchOptions);
            setSearchResults(results);

            // Execute prompt with context
            const promptOptions = {
                prompt: promptText,
                context: results,
            };

            const response = await executePromptWithContext(promptOptions);
            setPromptResponse(response);
        } catch (error) {
            console.error('Error processing prompt:', error);
            setPromptResponse(
                'Sorry, there was an error processing your request. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDocumentFilter = () => {
        setSelectedDocument(null);
    };

    const handleClearDatabaseFilter = () => {
        setSelectedDatabase(null);
    };

    return (
        <PromptView
            selectedDatabase={selectedDatabase}
            selectedDocument={selectedDocument}
            promptText={promptText}
            numDocuments={numDocuments}
            searchResults={searchResults}
            promptResponse={promptResponse}
            isLoading={isLoading}
            onPromptTextChange={setPromptText}
            onNumDocumentsChange={setNumDocuments}
            onSubmitPrompt={handlePromptSubmit}
            onClearDocumentFilter={handleClearDocumentFilter}
            onClearDatabaseFilter={handleClearDatabaseFilter}
            data-oid="t1lnpoy"
        />
    );
}
