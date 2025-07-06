'use client';

import { useState } from 'react';
import { IngestionMetadata } from '../../types';

interface IngestionMetadataViewProps {
    metadata: IngestionMetadata;
}

export function IngestionMetadataView({ metadata }: IngestionMetadataViewProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'chunks' | 'entities' | 'relations'>('overview');

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'chunks', label: 'Chunks', icon: '🧩', count: metadata.embeddings_data.chunk_count },
        { id: 'entities', label: 'Entities', icon: '🏷️', count: metadata.knowledge_graph?.entities?.length || 0 },
        { id: 'relations', label: 'Relations', icon: '🔗', count: metadata.knowledge_graph?.relations?.length || 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <OverviewTab metadata={metadata} formatDuration={formatDuration} formatFileSize={formatFileSize} />
                )}
                {activeTab === 'chunks' && (
                    <ChunksTab chunks={metadata.embeddings_data.chunks} />
                )}
                {activeTab === 'entities' && (
                    <EntitiesTab entities={metadata.knowledge_graph?.entities || []} />
                )}
                {activeTab === 'relations' && (
                    <RelationsTab relations={metadata.knowledge_graph?.relations || []} />
                )}
            </div>
        </div>
    );
}

function OverviewTab({ 
    metadata, 
    formatDuration, 
    formatFileSize 
}: { 
    metadata: IngestionMetadata;
    formatDuration: (seconds: number) => string;
    formatFileSize: (bytes: number) => string;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Processing Stats */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Stats</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${metadata.processing_result.success ? 'text-green-600' : 'text-red-600'}`}>
                            {metadata.processing_result.success ? '✅ Success' : '❌ Failed'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-medium">{formatDuration(metadata.processing_result.processing_time)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Content Length:</span>
                        <span className="font-medium">{formatFileSize(metadata.processing_result.content_length)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="font-medium text-sm">{new Date(metadata.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Embeddings Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Embeddings</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Chunks:</span>
                        <span className="font-medium">{metadata.embeddings_data.chunk_count}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Chunk Size:</span>
                        <span className="font-medium">{metadata.embeddings_data.chunk_size}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Overlap:</span>
                        <span className="font-medium">{metadata.embeddings_data.chunk_overlap}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">{metadata.embeddings_data.embedding_dimension}</span>
                    </div>
                </div>
            </div>

            {/* Knowledge Graph */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Graph</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Entities:</span>
                        <span className="font-medium">{metadata.knowledge_graph?.entities?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Relations:</span>
                        <span className="font-medium">{metadata.knowledge_graph?.relations?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Document Summary */}
            {metadata.summary && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Summary</h3>
                    <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed">{metadata.summary}</p>
                    </div>
                </div>
            )}

            {/* Source Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-600">Source Path:</span>
                        <p className="font-medium text-sm break-all">{metadata.source_info.source_path}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Content Type:</span>
                        <p className="font-medium">{metadata.source_info.content_type}</p>
                    </div>
                    <div className="md:col-span-2">
                        <span className="text-gray-600">Document ID:</span>
                        <p className="font-medium text-sm break-all">{metadata.source_info.document_id}</p>
                    </div>
                </div>
            </div>

            {/* Databases */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configured Databases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metadata.databases_configured.map((db, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="font-medium text-gray-900">{db.type.toUpperCase()}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                <div>{db.hostname}{db.port && `:${db.port}`}</div>
                                <div>Database: {db.database_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ChunksTab({ chunks }: { chunks: IngestionMetadata['embeddings_data']['chunks'] }) {
    const [selectedChunk, setSelectedChunk] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chunks List */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Chunks ({chunks.length})</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {chunks.map((chunk, index) => (
                            <div
                                key={chunk.chunk_id}
                                onClick={() => setSelectedChunk(index)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                    selectedChunk === index ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-sm">Chunk {chunk.chunk_index}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {chunk.chunk_size} characters
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {chunk.embedding.length} dims
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {chunk.chunk_text.substring(0, 100)}...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chunk Detail */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {selectedChunk !== null ? `Chunk ${chunks[selectedChunk].chunk_index} Details` : 'Select a chunk'}
                        </h3>
                    </div>
                    <div className="p-4">
                        {selectedChunk !== null ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Chunk ID:</label>
                                    <p className="text-sm text-gray-600 break-all">{chunks[selectedChunk].chunk_id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Size:</label>
                                    <p className="text-sm text-gray-600">{chunks[selectedChunk].chunk_size} characters</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Content:</label>
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap">
                                        {chunks[selectedChunk].chunk_text}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Select a chunk from the list to view details</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EntitiesTab({ entities }: { entities: IngestionMetadata['knowledge_graph']['entities'] | undefined }) {
    if (!entities || entities.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4">🏷️</div>
                <p className="text-gray-500">No entities found in the knowledge graph</p>
            </div>
        );
    }

    const entityTypes = [...new Set(entities.map(e => e.type))];

    return (
        <div className="space-y-6">
            {/* Entity Type Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {entityTypes.map(type => (
                    <div key={type} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {entities.filter(e => e.type === type).length}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{type}</div>
                    </div>
                ))}
            </div>

            {/* Entities List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">All Entities ({entities.length})</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {entities.map((entity, index) => (
                        <div key={entity.id || index} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-gray-900">{entity.name}</div>
                                    <div className="text-sm text-gray-500 capitalize">{entity.type}</div>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {entity.type}
                                </span>
                            </div>
                            {entity.properties && Object.keys(entity.properties).length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <details>
                                        <summary className="cursor-pointer hover:text-gray-800">Properties</summary>
                                        <div className="mt-2 pl-4">
                                            {Object.entries(entity.properties).map(([key, value]) => (
                                                <div key={key} className="flex justify-between py-1">
                                                    <span className="font-medium">{key}:</span>
                                                    <span>{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RelationsTab({ relations }: { relations: IngestionMetadata['knowledge_graph']['relations'] | undefined }) {
    if (!relations || relations.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4">🔗</div>
                <p className="text-gray-500">No relations found in the knowledge graph</p>
            </div>
        );
    }

    const relationTypes = [...new Set(relations.map(r => r.relation_type))];

    return (
        <div className="space-y-6">
            {/* Relation Type Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relationTypes.map(type => (
                    <div key={type} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {relations.filter(r => r.relation_type === type).length}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{type}</div>
                    </div>
                ))}
            </div>

            {/* Relations List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">All Relations ({relations.length})</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {relations.map((relation, index) => (
                        <div key={relation.id || index} className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                        {relation.source_entity_id}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                        {relation.relation_type}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                </div>
                                <div className="flex-1 text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {relation.target_entity_id}
                                    </div>
                                </div>
                            </div>
                            {relation.properties && Object.keys(relation.properties).length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <details>
                                        <summary className="cursor-pointer hover:text-gray-800">Properties</summary>
                                        <div className="mt-2 pl-4">
                                            {Object.entries(relation.properties).map(([key, value]) => (
                                                <div key={key} className="flex justify-between py-1">
                                                    <span className="font-medium">{key}:</span>
                                                    <span>{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
