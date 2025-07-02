import {
    generateEmbedding,
    performVectorSearch,
    executePromptWithContext,
    highlightSearchTerms,
    extractKeyTerms,
    checkApiHealth,
} from '../../lib/vectorSearch';
import { mockSearchResult } from '../../lib/test-utils';

describe('vectorSearch', () => {
    describe('generateEmbedding', () => {
        it('should generate an embedding vector', async () => {
            const embedding = await generateEmbedding('test text');

            expect(embedding).toHaveLength(1536);
            expect(embedding.every((val) => typeof val === 'number')).toBe(true);
            expect(embedding.every((val) => val >= -0.5 && val <= 0.5)).toBe(true);
        });
    });

    describe('performVectorSearch', () => {
        it('should return search results', async () => {
            const results = await performVectorSearch({
                query: 'machine learning',
                numResults: 3,
            });

            expect(results).toHaveLength(3);
            expect(results[0]).toHaveProperty('id');
            expect(results[0]).toHaveProperty('content');
            expect(results[0]).toHaveProperty('document');
            expect(results[0]).toHaveProperty('realm');
            expect(results[0]).toHaveProperty('similarity');
            expect(results[0]).toHaveProperty('chunk');
        });

        it('should filter results by minimum similarity', async () => {
            const results = await performVectorSearch({
                query: 'machine learning',
                numResults: 10,
                minSimilarity: 0.9,
            });

            expect(results.every((result) => result.similarity >= 0.9)).toBe(true);
        });

        it('should limit results to requested number', async () => {
            const results = await performVectorSearch({
                query: 'machine learning',
                numResults: 2,
            });

            expect(results).toHaveLength(2);
        });

        it('should sort results by similarity score', async () => {
            const results = await performVectorSearch({
                query: 'machine learning',
                numResults: 5,
            });

            for (let i = 1; i < results.length; i++) {
                expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity);
            }
        });
    });

    describe('executePromptWithContext', () => {
        it('should generate a response with context', async () => {
            const context = [mockSearchResult];
            const response = await executePromptWithContext({
                prompt: 'What is machine learning?',
                context,
            });

            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(0);
            expect(response).toContain('machine learning');
            expect(response).toContain(context[0].document);
        });

        it('should handle empty context', async () => {
            const response = await executePromptWithContext({
                prompt: 'What is machine learning?',
                context: [],
            });

            expect(typeof response).toBe('string');
            expect(response).toContain('No highly relevant context was found');
        });
    });

    describe('highlightSearchTerms', () => {
        it('should highlight search terms in content', () => {
            const content = 'Machine learning is a subset of artificial intelligence';
            const searchTerms = ['machine', 'learning'];

            const highlighted = highlightSearchTerms(content, searchTerms);

            expect(highlighted).toContain('<mark class="bg-yellow-200">Machine</mark>');
            expect(highlighted).toContain('<mark class="bg-yellow-200">learning</mark>');
        });

        it('should handle case-insensitive highlighting', () => {
            const content = 'MACHINE learning is important';
            const searchTerms = ['machine'];

            const highlighted = highlightSearchTerms(content, searchTerms);

            expect(highlighted).toContain('<mark class="bg-yellow-200">MACHINE</mark>');
        });

        it('should handle empty search terms', () => {
            const content = 'Machine learning is important';
            const searchTerms: string[] = [];

            const highlighted = highlightSearchTerms(content, searchTerms);

            expect(highlighted).toBe(content);
        });
    });

    describe('extractKeyTerms', () => {
        it('should extract key terms from query', () => {
            const query = 'What is machine learning and artificial intelligence?';
            const keyTerms = extractKeyTerms(query);
            
            console.log('keyTerms:', keyTerms);

            expect(keyTerms).toContain('machine');
            expect(keyTerms).toContain('learning');
            expect(keyTerms).toContain('artificial');
            expect(keyTerms).toContain('intelligence');
            expect(keyTerms).not.toContain('what');
            expect(keyTerms).not.toContain('is');
            expect(keyTerms).not.toContain('and');
        });

        it('should filter out short words', () => {
            const query = 'AI is ML';
            const keyTerms = extractKeyTerms(query);

            expect(keyTerms).not.toContain('ai');
            expect(keyTerms).not.toContain('is');
            expect(keyTerms).not.toContain('ml');
        });

        it('should handle empty query', () => {
            const keyTerms = extractKeyTerms('');

            expect(keyTerms).toEqual([]);
        });
    });

    describe('checkApiHealth', () => {
        it('should return health status', async () => {
            const isHealthy = await checkApiHealth();

            expect(typeof isHealthy).toBe('boolean');
        });

        it('should handle API errors gracefully', async () => {
            // Mock console.error to avoid noise in test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // This test relies on the random nature of the mock implementation
            // In a real scenario, you'd mock the actual API call
            const isHealthy = await checkApiHealth();

            expect(typeof isHealthy).toBe('boolean');

            consoleSpy.mockRestore();
        });
    });
});
