import type { Meta, StoryObj } from '@storybook/react';
import { ProcessingTemplateService, ProcessingTemplate } from '../lib/processing/templates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Clock, Tag, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const meta: Meta = {
  title: 'Components/ProcessingTemplates',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Showcase of all available processing templates with their configurations and use cases.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Template showcase component
const TemplateShowcase = ({ template }: { template: ProcessingTemplate }) => {
  const [showConfig, setShowConfig] = useState(false);
  const mergedConfig = ProcessingTemplateService.mergeWithDefaults(template);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{template.icon}</span>
            <div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="mt-1">{template.description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{template.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{template.stages.length} stages</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Processing Pipeline</h4>
          <div className="flex flex-wrap gap-1">
            {template.stages.map((stage, index) => (
              <div key={stage} className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                {index < template.stages.length - 1 && <ArrowRight className="h-3 w-3 text-gray-400" />}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Best For</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {template.recommendedFor.map((use, index) => (
              <li key={index}>• {use}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowConfig(!showConfig)}
          className="w-full"
        >
          {showConfig ? 'Hide' : 'Show'} Configuration
        </Button>

        {showConfig && (
          <div className="bg-gray-50 p-4 rounded-lg text-xs">
            <h5 className="font-medium mb-2">Stage Configurations</h5>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {JSON.stringify(mergedConfig.stageConfigs, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AllTemplatesShowcase = () => {
  const templates = ProcessingTemplateService.getAllTemplates();
  const categories = ['quick', 'quality', 'specialized', 'media'] as const;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Processing Templates</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Predefined processing configurations optimized for different types of content and use cases. 
          Each template contains only the differences from default values, making them lightweight and efficient.
        </p>
      </div>

      {categories.map((category) => {
        const categoryTemplates = ProcessingTemplateService.getTemplatesByCategory(category);
        if (categoryTemplates.length === 0) return null;

        return (
          <div key={category}>
            <h2 className="text-2xl font-semibold mb-4 capitalize flex items-center gap-2">
              {category === 'quick' && '⚡'}
              {category === 'quality' && '💎'}
              {category === 'specialized' && '🎯'}
              {category === 'media' && '🎬'}
              {category} Templates
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryTemplates.map((template) => (
                <TemplateShowcase key={template.id} template={template} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const AllTemplates: Story = {
  render: () => <AllTemplatesShowcase />,
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all available processing templates organized by category.',
      },
    },
  },
};

export const QuickProcessingTemplate: Story = {
  render: () => {
    const template = ProcessingTemplateService.getTemplateById('quick-processing')!;
    return (
      <div className="max-w-2xl mx-auto">
        <TemplateShowcase template={template} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Quick Processing template - optimized for speed with minimal processing stages.',
      },
    },
  },
};

export const HighQualityTemplate: Story = {
  render: () => {
    const template = ProcessingTemplateService.getTemplateById('high-quality')!;
    return (
      <div className="max-w-2xl mx-auto">
        <TemplateShowcase template={template} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'High Quality template - comprehensive processing with optimization and fact extraction.',
      },
    },
  },
};

export const AcademicResearchTemplate: Story = {
  render: () => {
    const template = ProcessingTemplateService.getTemplateById('academic-research')!;
    return (
      <div className="max-w-2xl mx-auto">
        <TemplateShowcase template={template} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Academic Research template - specialized for academic papers and research documents.',
      },
    },
  },
};

export const MediaTranscriptionTemplate: Story = {
  render: () => {
    const template = ProcessingTemplateService.getTemplateById('media-transcription')!;
    return (
      <div className="max-w-2xl mx-auto">
        <TemplateShowcase template={template} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Media Transcription template - optimized for audio and video content with speaker identification.',
      },
    },
  },
};

export const LegalDocumentsTemplate: Story = {
  render: () => {
    const template = ProcessingTemplateService.getTemplateById('legal-documents')!;
    return (
      <div className="max-w-2xl mx-auto">
        <TemplateShowcase template={template} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Legal Documents template - specialized for legal and regulatory documents with high precision.',
      },
    },
  },
};

// Template comparison
const TemplateComparison = () => {
  const templates = [
    ProcessingTemplateService.getTemplateById('quick-processing')!,
    ProcessingTemplateService.getTemplateById('high-quality')!,
    ProcessingTemplateService.getTemplateById('academic-research')!,
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Template Comparison</h1>
        <p className="text-gray-600">
          Compare different templates to understand their trade-offs between speed and quality.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateShowcase key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
};

export const CompareTemplates: Story = {
  render: () => <TemplateComparison />,
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of different templates showing the trade-offs between processing speed and quality.',
      },
    },
  },
};
