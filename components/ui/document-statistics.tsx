'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Link, 
  Clock,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react';

interface DocumentStatistics {
  processing: {
    chunks: number;
    quality: number;
    processingTime: number;
    version: number;
    lastProcessed: string;
  };
  content: {
    words: number;
    characters: number;
    pages: number;
    language: string;
    readingTime: number;
  };
  knowledgeGraph: {
    entities: number;
    facts: number;
    relations: number;
    concepts: number;
    topics: string[];
  };
  performance: {
    searchQueries: number;
    avgResponseTime: number;
    accuracy: number;
    lastAccessed: string;
  };
}

interface DocumentStatisticsProps {
  documentId: string;
  className?: string;
}

export function DocumentStatistics({ documentId, className }: DocumentStatisticsProps) {
  const [statistics, setStatistics] = useState<DocumentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [documentId]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${documentId}/statistics`);

      if (!response.ok) {
        throw new Error('Failed to fetch document statistics');
      }

      const stats = await response.json();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load document statistics:', error);
      // Fallback to mock data if API fails
      const mockStats: DocumentStatistics = {
        processing: {
          chunks: 0,
          quality: 0,
          processingTime: 0,
          version: 1,
          lastProcessed: new Date().toISOString()
        },
        content: {
          words: 0,
          characters: 0,
          pages: 1,
          language: 'Unknown',
          readingTime: 1
        },
        knowledgeGraph: {
          entities: 0,
          facts: 0,
          relations: 0,
          concepts: 0,
          topics: []
        },
        performance: {
          searchQueries: 0,
          avgResponseTime: 0,
          accuracy: 0,
          lastAccessed: new Date().toISOString()
        }
      };
      setStatistics(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.processing.chunks}</p>
                <p className="text-sm text-gray-600">Chunks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.knowledgeGraph.entities}</p>
                <p className="text-sm text-gray-600">Entities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Link className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.knowledgeGraph.facts}</p>
                <p className="text-sm text-gray-600">Facts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{(statistics.processing.quality * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Processing Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Processing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Quality Score:</span>
                <span className="font-medium">{(statistics.processing.quality * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-medium">{formatDuration(statistics.processing.processingTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">v{statistics.processing.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Processed:</span>
                <span className="font-medium">{new Date(statistics.processing.lastProcessed).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Words:</span>
                <span className="font-medium">{formatNumber(statistics.content.words)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Characters:</span>
                <span className="font-medium">{formatNumber(statistics.content.characters)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium">{statistics.content.pages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reading Time:</span>
                <span className="font-medium">{statistics.content.readingTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Language:</span>
                <span className="font-medium">{statistics.content.language}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Graph Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Knowledge Graph</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Entities:</span>
                <span className="font-medium">{statistics.knowledgeGraph.entities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Facts:</span>
                <span className="font-medium">{statistics.knowledgeGraph.facts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Relations:</span>
                <span className="font-medium">{statistics.knowledgeGraph.relations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Concepts:</span>
                <span className="font-medium">{statistics.knowledgeGraph.concepts}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {statistics.knowledgeGraph.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Search Queries:</span>
                <span className="font-medium">{formatNumber(statistics.performance.searchQueries)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time:</span>
                <span className="font-medium">{statistics.performance.avgResponseTime}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium">{(statistics.performance.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Accessed:</span>
                <span className="font-medium">{new Date(statistics.performance.lastAccessed).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
