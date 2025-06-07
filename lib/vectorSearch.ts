// Vector search and AI utilities
export interface SearchResult {
    id: number;
    content: string;
    document: string;
    database: string;
    similarity: number;
    chunk: number;
    metadata?: Record<string, any>;
}

export interface VectorSearchOptions {
    query: string;
    numResults: number;
    databaseId?: string;
    documentId?: string;
    minSimilarity?: number;
}

export interface PromptOptions {
    prompt: string;
    context: SearchResult[];
    maxTokens?: number;
    temperature?: number;
}

// Mock embedding function - in production, this would call an actual embedding API
export async function generateEmbedding(text: string): Promise<number[]> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Return mock embedding vector (in production, this would be from OpenAI, Cohere, etc.)
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
}

// Mock vector search function - in production, this would query a vector database
export async function performVectorSearch(options: VectorSearchOptions): Promise<SearchResult[]> {
    const { query, numResults, databaseId, documentId, minSimilarity = 0.7 } = options;

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock search results - in production, this would come from your vector database
    const mockResults: SearchResult[] = [
        {
            id: 1,
            content:
                'Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data without being explicitly programmed.',
            document: 'Machine Learning Fundamentals.pdf',
            database: 'Research Papers',
            similarity: 0.95,
            chunk: 12,
            metadata: { page: 5, section: 'Introduction' },
        },
        {
            id: 2,
            content:
                'Neural networks are computing systems inspired by biological neural networks that constitute animal brains. They are used to estimate functions that depend on a large number of inputs.',
            document: 'AI Ethics Lecture',
            database: 'Research Papers',
            similarity: 0.87,
            chunk: 8,
            metadata: { timestamp: '00:15:30', speaker: 'Dr. Smith' },
        },
        {
            id: 3,
            content:
                'Deep learning uses multiple layers to progressively extract higher-level features from raw input. It has revolutionized computer vision and natural language processing.',
            document: 'Machine Learning Fundamentals.pdf',
            database: 'Research Papers',
            similarity: 0.82,
            chunk: 23,
            metadata: { page: 12, section: 'Deep Learning' },
        },
        {
            id: 4,
            content:
                'Ethical considerations in AI development include fairness, transparency, accountability, and the potential impact on employment and privacy.',
            document: 'AI Ethics Lecture',
            database: 'Research Papers',
            similarity: 0.78,
            chunk: 15,
            metadata: { timestamp: '00:32:15', speaker: 'Dr. Smith' },
        },
        {
            id: 5,
            content:
                'Vector databases enable efficient similarity search for high-dimensional data representations, making them ideal for AI applications requiring semantic search.',
            document: 'Vector Database Guide.pdf',
            database: 'Company Knowledge Base',
            similarity: 0.75,
            chunk: 5,
            metadata: { page: 3, section: 'Architecture' },
        },
        {
            id: 6,
            content:
                'Retrieval-Augmented Generation (RAG) combines the power of large language models with external knowledge bases to provide more accurate and contextual responses.',
            document: 'RAG Implementation Guide.pdf',
            database: 'Company Knowledge Base',
            similarity: 0.73,
            chunk: 18,
            metadata: { page: 8, section: 'RAG Architecture' },
        },
    ];

    // Filter results based on criteria
    let filteredResults = mockResults.filter((result) => result.similarity >= minSimilarity);

    // Filter by document if specified
    if (documentId) {
        // In a real implementation, you'd map documentId to document name
        filteredResults = filteredResults.filter(
            (result) => result.document === `Document_${documentId}.pdf`,
        );
    }

    // Filter by database if specified
    if (databaseId) {
        // In a real implementation, you'd map databaseId to database name
        filteredResults = filteredResults.filter(
            (result) => result.database === `Database_${databaseId}`,
        );
    }

    // Sort by similarity score (highest first)
    filteredResults.sort((a, b) => b.similarity - a.similarity);

    return filteredResults.slice(0, numResults);
}

// Mock AI prompt execution - in production, this would call OpenAI, Anthropic, etc.
export async function executePromptWithContext(options: PromptOptions): Promise<string> {
    const { prompt, context, maxTokens = 1000, temperature = 0.7 } = options;

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Build context string from search results
    const contextString = context
        .map(
            (result, index) =>
                `[${index + 1}] From "${result.document}" (${result.database}):\n${result.content}`,
        )
        .join('\n\n');

    // Mock AI response - in production, this would be generated by an LLM
    const mockResponse = `Based on the provided context from ${context.length} relevant documents, I can help answer your question: "${prompt}"

**Key Insights from Retrieved Documents:**

${context
    .slice(0, 3)
    .map(
        (result, index) =>
            `${index + 1}. **${result.document}** (${(result.similarity * 100).toFixed(1)}% relevance): ${result.content.substring(0, 150)}...`,
    )
    .join('\n\n')}

**Analysis:**
Your question relates to concepts that are well-documented in the retrieved sources. The search found ${context.length} relevant passages with similarity scores ranging from ${(Math.min(...context.map((r) => r.similarity)) * 100).toFixed(1)}% to ${(Math.max(...context.map((r) => r.similarity)) * 100).toFixed(1)}%.

**Summary:**
${
    context.length > 0
        ? `The most relevant information comes from "${context[0].document}" which discusses ${context[0].content.split('.')[0].toLowerCase()}.`
        : 'No highly relevant context was found for your query.'
}

**Recommendations:**
- Consider exploring the documents with the highest similarity scores for more detailed information
- If you need more specific information, try refining your query with more specific terms
- The retrieved context provides a solid foundation for understanding the topic

Would you like me to elaborate on any specific aspect or search for additional information with different parameters?`;

    return mockResponse;
}

// Utility function to highlight search terms in content
export function highlightSearchTerms(content: string, searchTerms: string[]): string {
    let highlightedContent = content;

    searchTerms.forEach((term) => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedContent = highlightedContent.replace(
            regex,
            '<mark class="bg-yellow-200">$1</mark>',
        );
    });

    return highlightedContent;
}

// Utility function to extract key terms from a query
export function extractKeyTerms(query: string): string[] {
    // Simple implementation - in production, you might use NLP libraries
    return query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 2)
        .filter(
            (term) =>
                ![
                    'the',
                    'and',
                    'or',
                    'but',
                    'in',
                    'on',
                    'at',
                    'to',
                    'for',
                    'of',
                    'with',
                    'by',
                ].includes(term),
        );
}
