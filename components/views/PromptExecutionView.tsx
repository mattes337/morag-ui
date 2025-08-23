'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Search, 
  Brain, 
  FileText, 
  Clock,
  Copy,
  Download,
  Sparkles,
  History,
  Settings,
  Zap
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
  type: 'document' | 'chunk' | 'entity' | 'fact';
  metadata: {
    documentId?: string;
    chunkId?: string;
    source?: string;
    createdAt?: string;
  };
  content?: string;
}

interface PromptResponse {
  id: string;
  query: string;
  response: string;
  searchResults: SearchResult[];
  executionTime: number;
  timestamp: string;
  type: 'search' | 'qa' | 'summary' | 'analysis';
}

interface PromptExecutionViewProps {
  realmId: string;
  realmName: string;
}

export function PromptExecutionView({ realmId, realmName }: PromptExecutionViewProps) {
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responses, setResponses] = useState<PromptResponse[]>([]);
  const [searchType, setSearchType] = useState<'semantic' | 'keyword' | 'hybrid'>('semantic');
  const [includeContent, setIncludeContent] = useState(false);
  const [maxResults, setMaxResults] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load previous queries from localStorage
    const savedResponses = localStorage.getItem(`prompt-history-${realmId}`);
    if (savedResponses) {
      try {
        setResponses(JSON.parse(savedResponses));
      } catch (error) {
        console.error('Failed to load prompt history:', error);
      }
    }
  }, [realmId]);

  useEffect(() => {
    // Save responses to localStorage
    if (responses.length > 0) {
      localStorage.setItem(`prompt-history-${realmId}`, JSON.stringify(responses.slice(0, 50))); // Keep last 50
    }
  }, [responses, realmId]);

  const handleExecutePrompt = async () => {
    if (!query.trim()) return;

    try {
      setIsExecuting(true);
      
      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          type: searchType,
          limit: maxResults,
          includeContent,
          includeMetadata: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute prompt');
      }

      const data = await response.json();
      
      // Create prompt response
      const promptResponse: PromptResponse = {
        id: Date.now().toString(),
        query: query.trim(),
        response: generateResponse(data.results),
        searchResults: data.results || [],
        executionTime: data.executionTime || 0,
        timestamp: new Date().toISOString(),
        type: detectQueryType(query.trim()),
      };

      setResponses(prev => [promptResponse, ...prev]);
      setQuery('');
    } catch (error) {
      console.error('Failed to execute prompt:', error);
      alert('Failed to execute prompt. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  const generateResponse = (results: SearchResult[]): string => {
    if (!results || results.length === 0) {
      return "I couldn't find any relevant information for your query. Please try rephrasing your question or check if there are documents in this realm.";
    }

    const topResults = results.slice(0, 3);
    let response = `Based on the information in your realm, here's what I found:\n\n`;
    
    topResults.forEach((result, index) => {
      response += `${index + 1}. **${result.title}**\n`;
      response += `   ${result.snippet}\n`;
      if (result.metadata.source) {
        response += `   *Source: ${result.metadata.source}*\n`;
      }
      response += `\n`;
    });

    if (results.length > 3) {
      response += `\nI found ${results.length - 3} additional relevant results. You can explore them below.`;
    }

    return response;
  };

  const detectQueryType = (query: string): PromptResponse['type'] => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
      return 'summary';
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis')) {
      return 'analysis';
    } else if (lowerQuery.includes('what') || lowerQuery.includes('how') || lowerQuery.includes('why')) {
      return 'qa';
    } else {
      return 'search';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecutePrompt();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTypeIcon = (type: PromptResponse['type']) => {
    switch (type) {
      case 'search':
        return <Search className="w-4 h-4" />;
      case 'qa':
        return <Brain className="w-4 h-4" />;
      case 'summary':
        return <FileText className="w-4 h-4" />;
      case 'analysis':
        return <Zap className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: PromptResponse['type']) => {
    switch (type) {
      case 'search':
        return 'bg-blue-100 text-blue-800';
      case 'qa':
        return 'bg-purple-100 text-purple-800';
      case 'summary':
        return 'bg-green-100 text-green-800';
      case 'analysis':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Search</h1>
          <p className="text-gray-600">Search and query your realm: {realmName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Search Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="semantic">Semantic (AI-powered)</option>
                  <option value="keyword">Keyword (Exact match)</option>
                  <option value="hybrid">Hybrid (Best of both)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Results
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 results</option>
                  <option value={10}>10 results</option>
                  <option value={20}>20 results</option>
                  <option value={50}>50 results</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="includeContent"
                  checked={includeContent}
                  onChange={(e) => setIncludeContent(e.target.checked)}
                  className="text-blue-600"
                />
                <label htmlFor="includeContent" className="text-sm text-gray-700">
                  Include full content
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Input */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask a question or search your knowledge base
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What would you like to know? (Press Enter to search, Shift+Enter for new line)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <div className="absolute bottom-3 right-3">
                  <Button
                    onClick={handleExecutePrompt}
                    disabled={!query.trim() || isExecuting}
                    size="sm"
                  >
                    {isExecuting ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Try:</span>
              {[
                "Summarize the main topics",
                "What are the key findings?",
                "How does X relate to Y?",
                "Show me documents about..."
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      <div className="space-y-6">
        {responses.map((response) => (
          <Card key={response.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(response.type)}>
                    {getTypeIcon(response.type)}
                    <span className="ml-1 capitalize">{response.type}</span>
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {new Date(response.timestamp).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {response.executionTime.toFixed(3)}s
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(response.response)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{response.query}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* AI Response */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{response.response}</div>
                </div>

                {/* Search Results */}
                {response.searchResults.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">
                      Search Results ({response.searchResults.length})
                    </h4>
                    <div className="space-y-2">
                      {response.searchResults.map((result) => (
                        <div key={result.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{result.title}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {(result.score * 100).toFixed(1)}% match
                              </Badge>
                              <Badge variant="secondary">
                                {result.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{result.snippet}</p>
                          {result.metadata.source && (
                            <p className="text-xs text-gray-500">
                              Source: {result.metadata.source}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {responses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to explore your knowledge
              </h3>
              <p className="text-gray-600">
                Ask questions, search for information, or request summaries from your documents.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
