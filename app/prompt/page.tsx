'use client';

import { useApp } from '../../contexts/AppContext';
import { PromptView } from '../../components/views/PromptView';
import { performVectorSearch, executePromptWithContext } from '../../lib/vectorSearch';

export default function PromptPage() {
    const {
        currentRealm,
        selectedDocument,
        setSelectedDocument,
        setCurrentRealm,
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
        if (!currentRealm) {
            alert('Please select a realm first');
            return;
        }

        setIsLoading(true);

        try {
            // Query the MoRAG backend
            const queryRequest = {
                query: promptText,
                realmId: currentRealm.id,
                systemPrompt: currentRealm.systemPrompt,
                maxResults: numDocuments,
                minSimilarity: 0.7,
                documentIds: selectedDocument ? [selectedDocument.id] : undefined,
            };

            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(queryRequest),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to query documents');
            }

            const result = await response.json();

            // Convert MoRAG response to the expected format
            const searchResults = result.sources.map((source: any) => ({
                id: source.chunk_id,
                content: source.content,
                document: source.document_name,
                realm: currentRealm.name,
                similarity: source.similarity,
                chunk: parseInt(source.chunk_id.split('-').pop() || '0'),
                metadata: source.metadata,
            }));

            setSearchResults(searchResults);
            setPromptResponse({
                answer: result.answer,
                sources: searchResults,
                processingTime: result.processingTime,
                tokensUsed: result.tokensUsed,
            });
        } catch (error) {
            console.error('Error processing prompt:', error);
            setPromptResponse(
                `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDocumentFilter = () => {
        setSelectedDocument(null);
    };

    const handleClearRealmFilter = () => {
        setCurrentRealm(null);
    };

    return (
        <PromptView
            selectedRealm={currentRealm}
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
            onClearRealmFilter={handleClearRealmFilter}
            data-oid="edb_lg-"
        />
    );
}
