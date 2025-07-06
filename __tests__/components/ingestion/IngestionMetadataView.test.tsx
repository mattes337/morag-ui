import { render, screen, fireEvent } from '@testing-library/react';
import { IngestionMetadataView } from '../../../components/ingestion/IngestionMetadataView';
import { IngestionMetadata } from '../../../types';

const mockMetadata: IngestionMetadata = {
    ingestion_id: 'test-id-123',
    timestamp: '2025-07-06T17:50:38.645173+00:00',
    summary: 'This is a test document summary that describes the main content and key points.',
    source_info: {
        source_path: '/test/document.pdf',
        content_type: 'pdf',
        document_id: 'doc_test_123'
    },
    processing_result: {
        success: true,
        processing_time: 450.0955994129181,
        content_length: 12345,
        metadata: {
            page_count: 10,
            title: 'Test Document'
        }
    },
    databases_configured: [
        {
            type: 'qdrant',
            hostname: 'localhost',
            port: 6333,
            database_name: 'test_db'
        },
        {
            type: 'neo4j',
            hostname: 'localhost',
            port: 7687,
            database_name: 'neo4j'
        }
    ],
    embeddings_data: {
        chunk_count: 2,
        chunk_size: 1000,
        chunk_overlap: 200,
        embedding_dimension: 768,
        chunks: [
            {
                chunk_id: 'chunk_0',
                chunk_index: 0,
                chunk_text: 'This is the first chunk of text content.',
                chunk_size: 39,
                embedding: new Array(768).fill(0.1),
                metadata: {
                    chunk_id: 'chunk_0',
                    document_id: 'doc_test_123',
                    chunk_index: 0,
                    chunk_size: 39,
                    created_at: '2025-07-06T17:50:51.352393+00:00'
                }
            },
            {
                chunk_id: 'chunk_1',
                chunk_index: 1,
                chunk_text: 'This is the second chunk of text content.',
                chunk_size: 41,
                embedding: new Array(768).fill(0.2),
                metadata: {
                    chunk_id: 'chunk_1',
                    document_id: 'doc_test_123',
                    chunk_index: 1,
                    chunk_size: 41,
                    created_at: '2025-07-06T17:50:51.352407+00:00'
                }
            }
        ]
    },
    knowledge_graph: {
        entities: [
            {
                id: 'entity_1',
                type: 'person',
                name: 'John Doe',
                properties: {
                    age: 30,
                    occupation: 'Engineer'
                }
            },
            {
                id: 'entity_2',
                type: 'organization',
                name: 'ACME Corp',
                properties: {
                    industry: 'Technology'
                }
            }
        ],
        relations: [
            {
                id: 'relation_1',
                source_entity_id: 'entity_1',
                target_entity_id: 'entity_2',
                relation_type: 'works_for',
                properties: {
                    start_date: '2020-01-01'
                }
            }
        ]
    }
};

describe('IngestionMetadataView', () => {
    it('renders overview tab by default', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);
        
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Processing Stats')).toBeInTheDocument();
        expect(screen.getByText('✅ Success')).toBeInTheDocument();
        expect(screen.getByText('7m 30s')).toBeInTheDocument(); // Processing time
    });

    it('switches between tabs correctly', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);
        
        // Click on chunks tab
        fireEvent.click(screen.getByText('Chunks'));
        expect(screen.getByText('Chunks (2)')).toBeInTheDocument();
        
        // Click on entities tab
        fireEvent.click(screen.getByText('Entities'));
        expect(screen.getByText('All Entities (2)')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        
        // Click on relations tab
        fireEvent.click(screen.getByText('Relations'));
        expect(screen.getByText('All Relations (1)')).toBeInTheDocument();
    });

    it('displays chunk details when chunk is selected', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);
        
        // Switch to chunks tab
        fireEvent.click(screen.getByText('Chunks'));
        
        // Click on first chunk
        fireEvent.click(screen.getByText('Chunk 0'));
        
        // Check if chunk details are displayed
        expect(screen.getByText('Chunk 0 Details')).toBeInTheDocument();
        expect(screen.getByText('This is the first chunk of text content.')).toBeInTheDocument();
    });

    it('displays entity types summary', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);

        // Switch to entities tab
        fireEvent.click(screen.getByText('Entities'));

        // Check entity type counts - use more specific queries
        expect(screen.getByText('All Entities (2)')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('ACME Corp')).toBeInTheDocument();
    });

    it('displays relation types summary', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);

        // Switch to relations tab
        fireEvent.click(screen.getByText('Relations'));

        // Check relation type counts - use more specific query
        expect(screen.getByText('All Relations (1)')).toBeInTheDocument();
        expect(screen.getByText('entity_1')).toBeInTheDocument();
        expect(screen.getByText('entity_2')).toBeInTheDocument();
    });

    it('displays document summary when available', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);

        // Check if summary is displayed in overview tab
        expect(screen.getByText('Document Summary')).toBeInTheDocument();
        expect(screen.getByText('This is a test document summary that describes the main content and key points.')).toBeInTheDocument();
    });

    it('handles metadata without summary', () => {
        const metadataWithoutSummary = {
            ...mockMetadata,
            summary: undefined
        };

        render(<IngestionMetadataView metadata={metadataWithoutSummary} />);

        // Summary section should not be displayed
        expect(screen.queryByText('Document Summary')).not.toBeInTheDocument();
    });

    it('handles metadata without knowledge graph', () => {
        const metadataWithoutKG = {
            ...mockMetadata,
            knowledge_graph: undefined
        };

        render(<IngestionMetadataView metadata={metadataWithoutKG} />);

        // Switch to entities tab
        fireEvent.click(screen.getByText('Entities'));
        expect(screen.getByText('No entities found in the knowledge graph')).toBeInTheDocument();

        // Switch to relations tab
        fireEvent.click(screen.getByText('Relations'));
        expect(screen.getByText('No relations found in the knowledge graph')).toBeInTheDocument();
    });

    it('formats file sizes correctly', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);
        
        // Check if file size is formatted (12345 bytes should be ~12.1 KB)
        expect(screen.getByText('12.1 KB')).toBeInTheDocument();
    });

    it('displays database configuration', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);
        
        expect(screen.getByText('QDRANT')).toBeInTheDocument();
        expect(screen.getByText('NEO4J')).toBeInTheDocument();
        expect(screen.getByText('localhost:6333')).toBeInTheDocument();
        expect(screen.getByText('localhost:7687')).toBeInTheDocument();
    });

    it('shows tab counts correctly', () => {
        render(<IngestionMetadataView metadata={mockMetadata} />);

        // Check tab counts in badges - use more specific queries
        expect(screen.getByRole('button', { name: /chunks/i })).toHaveTextContent('2');
        expect(screen.getByRole('button', { name: /entities/i })).toHaveTextContent('2');
        expect(screen.getByRole('button', { name: /relations/i })).toHaveTextContent('1');
    });
});
