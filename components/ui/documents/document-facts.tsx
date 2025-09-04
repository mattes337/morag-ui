import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Badge } from '../badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { 
  Brain, 
  TrendingUp, 
  Filter, 
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  Link as LinkIcon,
  User,
  Tag
} from 'lucide-react';
import { Button } from '../button';
import { Input } from '../input';

interface Fact {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  source: string;
  metadata?: string;
  createdAt: string;
  entity?: {
    id: string;
    name: string;
    type: string;
    description?: string;
  };
  chunk?: {
    id: string;
    chunkIndex: number;
    content: string;
  };
}

interface FactsData {
  facts: Fact[];
  groupedFacts: {
    high: Fact[];
    medium: Fact[];
    low: Fact[];
  };
  stats: {
    total: number;
    high: number;
    medium: number;
    low: number;
    averageConfidence: number;
    uniqueSubjects: number;
    uniquePredicates: number;
    uniqueObjects: number;
  };
}

interface DocumentFactsProps {
  documentId: string;
}

export function DocumentFacts({ documentId }: DocumentFactsProps) {
  const [factsData, setFactsData] = useState<FactsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfidenceLevel, setSelectedConfidenceLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedFacts, setExpandedFacts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFacts();
  }, [documentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}/facts`);
      if (!response.ok) {
        throw new Error('Failed to fetch facts');
      }
      const data = await response.json();
      setFactsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch facts');
    } finally {
      setLoading(false);
    }
  };

  const toggleFactExpansion = (factId: string) => {
    const newExpanded = new Set(expandedFacts);
    if (newExpanded.has(factId)) {
      newExpanded.delete(factId);
    } else {
      newExpanded.add(factId);
    }
    setExpandedFacts(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const filterFacts = (facts: Fact[]) => {
    let filtered = facts;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(fact =>
        fact.subject.toLowerCase().includes(term) ||
        fact.predicate.toLowerCase().includes(term) ||
        fact.object.toLowerCase().includes(term)
      );
    }

    // Filter by confidence level
    if (selectedConfidenceLevel !== 'all') {
      filtered = filtered.filter(fact => {
        if (selectedConfidenceLevel === 'high') return fact.confidence >= 0.8;
        if (selectedConfidenceLevel === 'medium') return fact.confidence >= 0.5 && fact.confidence < 0.8;
        if (selectedConfidenceLevel === 'low') return fact.confidence < 0.5;
        return true;
      });
    }

    return filtered;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading facts...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Brain className="w-12 h-12 mx-auto mb-4 text-red-300" />
            <p>Failed to load facts</p>
            <p className="text-sm mt-2">{error}</p>
            <Button onClick={fetchFacts} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!factsData || factsData.facts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No facts extracted yet</p>
            <p className="text-sm mt-2">Facts will appear here after the document is processed through the fact generation stage</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredFacts = filterFacts(factsData.facts);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Facts</p>
                <p className="text-2xl font-bold">{factsData.stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Avg. Confidence</p>
                <p className="text-2xl font-bold">{Math.round(factsData.stats.averageConfidence * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Entities</p>
                <p className="text-2xl font-bold">{factsData.stats.uniqueSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Relations</p>
                <p className="text-2xl font-bold">{factsData.stats.uniquePredicates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search facts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedConfidenceLevel === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedConfidenceLevel('all')}
              >
                All ({factsData.stats.total})
              </Button>
              <Button
                variant={selectedConfidenceLevel === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedConfidenceLevel('high')}
              >
                High ({factsData.stats.high})
              </Button>
              <Button
                variant={selectedConfidenceLevel === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedConfidenceLevel('medium')}
              >
                Medium ({factsData.stats.medium})
              </Button>
              <Button
                variant={selectedConfidenceLevel === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedConfidenceLevel('low')}
              >
                Low ({factsData.stats.low})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Extracted Facts ({filteredFacts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFacts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No facts match your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFacts.map((fact) => (
                <div key={fact.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getConfidenceColor(fact.confidence)}>
                          {getConfidenceLabel(fact.confidence)} ({Math.round(fact.confidence * 100)}%)
                        </Badge>
                        {fact.entity && (
                          <Badge variant="outline">
                            <Tag className="w-3 h-3 mr-1" />
                            {fact.entity.type}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-blue-600">{fact.subject}</span>
                          <span className="text-gray-500">{fact.predicate}</span>
                          <span className="font-medium text-green-600">{fact.object}</span>
                        </div>
                        
                        {expandedFacts.has(fact.id) && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <div className="text-xs text-gray-500">
                              <strong>Source:</strong> {fact.source}
                            </div>
                            {fact.chunk && (
                              <div className="text-xs text-gray-500">
                                <strong>From chunk {fact.chunk.chunkIndex}:</strong>
                                <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                                  {fact.chunk.content.substring(0, 200)}
                                  {fact.chunk.content.length > 200 && '...'}
                                </div>
                              </div>
                            )}
                            {fact.entity?.description && (
                              <div className="text-xs text-gray-500">
                                <strong>Entity description:</strong> {fact.entity.description}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFactExpansion(fact.id)}
                      className="ml-2"
                    >
                      {expandedFacts.has(fact.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
