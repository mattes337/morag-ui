'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, Tag, CheckCircle } from 'lucide-react';
import { ProcessingTemplate, ProcessingTemplateService } from '@/lib/processing/templates';

interface TemplateSelectorProps {
  selectedTemplate?: ProcessingTemplate;
  onTemplateSelect: (template: ProcessingTemplate) => void;
  fileType?: string;
  className?: string;
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  fileType,
  className = ''
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<ProcessingTemplate[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<ProcessingTemplate[]>([]);

  useEffect(() => {
    const allTemplates = ProcessingTemplateService.getAllTemplates();
    setTemplates(allTemplates);

    if (fileType) {
      const recommended = ProcessingTemplateService.getRecommendedTemplates(fileType);
      setRecommendedTemplates(recommended);
    }
  }, [fileType]);

  const filteredTemplates = React.useMemo(() => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = ProcessingTemplateService.searchTemplates(searchQuery);
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(template => template.category === activeCategory);
    }

    return filtered;
  }, [templates, searchQuery, activeCategory]);

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'quick', name: 'Quick', count: templates.filter(t => t.category === 'quick').length },
    { id: 'quality', name: 'Quality', count: templates.filter(t => t.category === 'quality').length },
    { id: 'specialized', name: 'Specialized', count: templates.filter(t => t.category === 'specialized').length },
    { id: 'media', name: 'Media', count: templates.filter(t => t.category === 'media').length },
  ];

  const TemplateCard = ({ template }: { template: ProcessingTemplate }) => {
    const isSelected = selectedTemplate?.id === template.id;
    const isRecommended = recommendedTemplates.some(t => t.id === template.id);

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        } ${isRecommended ? 'border-green-500' : ''}`}
        onClick={() => onTemplateSelect(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {template.name}
                  {isSelected && <CheckCircle className="h-4 w-4 text-blue-500" />}
                  {isRecommended && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {template.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{template.estimatedTime}</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-1">Stages:</div>
              <div className="text-gray-600">
                {template.stages.map((stage, index) => (
                  <span key={stage}>
                    {stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {index < template.stages.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-1">Best for:</div>
              <div className="text-gray-600">
                {template.recommendedFor.slice(0, 2).join(', ')}
                {template.recommendedFor.length > 2 && '...'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Recommended Templates */}
      {fileType && recommendedTemplates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600" />
            <Label className="text-base font-medium text-green-700">
              Recommended for {fileType.toUpperCase()} files
            </Label>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          {activeCategory === 'all' ? 'All Templates' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Templates`}
          {searchQuery && ` (${filteredTemplates.length} results)`}
        </Label>
        
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No templates found matching your criteria.</p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
