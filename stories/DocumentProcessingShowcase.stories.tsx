import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProcessingTemplateService } from '../lib/processing/templates';
import { Sparkles, Settings, FileText, Zap, Target, Film, Scale } from 'lucide-react';

const meta: Meta = {
  title: 'Overview/DocumentProcessingShowcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive showcase of the new document processing features including easy mode, expert mode, and processing templates.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  features, 
  color = 'blue' 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  color?: 'blue' | 'purple' | 'green' | 'orange';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
  };

  return (
    <Card className={`h-full ${colorClasses[color]}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const DocumentProcessingShowcase = () => {
  const templates = ProcessingTemplateService.getAllTemplates();
  const templatesByCategory = {
    quick: templates.filter(t => t.category === 'quick'),
    quality: templates.filter(t => t.category === 'quality'),
    specialized: templates.filter(t => t.category === 'specialized'),
    media: templates.filter(t => t.category === 'media'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Document Processing Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful document processing with both easy template-based workflows and expert-level configuration control. 
            Process any type of content with optimized settings for your specific use case.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modes">Processing Modes</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<Sparkles />}
                title="Easy Mode"
                description="Template-based processing for quick results"
                color="blue"
                features={[
                  "Choose from 6 predefined templates",
                  "Automatic file type detection",
                  "Smart template recommendations",
                  "2-step upload process",
                  "Switch to expert mode anytime"
                ]}
              />
              <FeatureCard
                icon={<Settings />}
                title="Expert Mode"
                description="Full control over all processing parameters"
                color="purple"
                features={[
                  "Configure 5 processing stages individually",
                  "150+ configurable options",
                  "Real-time validation",
                  "Import/export configurations",
                  "Detailed review process"
                ]}
              />
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 text-center">Supported Content Types</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-medium mb-2">Documents</h3>
                  <p className="text-sm text-gray-600">PDF, Word, Text, Markdown</p>
                </div>
                <div className="text-center">
                  <Film className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-medium mb-2">Media</h3>
                  <p className="text-sm text-gray-600">Audio, Video, YouTube</p>
                </div>
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h3 className="font-medium mb-2">Web Content</h3>
                  <p className="text-sm text-gray-600">Websites, Articles, Blogs</p>
                </div>
                <div className="text-center">
                  <Scale className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                  <h3 className="font-medium mb-2">Specialized</h3>
                  <p className="text-sm text-gray-600">Legal, Academic, Technical</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modes" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Sparkles className="h-5 w-5" />
                    Easy Mode
                  </CardTitle>
                  <CardDescription>Perfect for users who want quick, reliable results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">How it works:</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">1</Badge>
                        Upload your document or enter a URL
                      </li>
                      <li className="flex gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">2</Badge>
                        Choose from recommended templates
                      </li>
                      <li className="flex gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">3</Badge>
                        Processing starts automatically
                      </li>
                    </ol>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Best for:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• First-time users</li>
                      <li>• Quick prototyping</li>
                      <li>• Standard document types</li>
                      <li>• Batch processing</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Settings className="h-5 w-5" />
                    Expert Mode
                  </CardTitle>
                  <CardDescription>Full control for advanced users and specific requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">How it works:</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">1</Badge>
                        Upload your document or enter a URL
                      </li>
                      <li className="flex gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">2</Badge>
                        Configure each processing stage
                      </li>
                      <li className="flex gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">3</Badge>
                        Review and validate settings
                      </li>
                      <li className="flex gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">4</Badge>
                        Start custom processing pipeline
                      </li>
                    </ol>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Best for:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Advanced users</li>
                      <li>• Custom requirements</li>
                      <li>• Research projects</li>
                      <li>• Performance optimization</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">Processing Templates</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Predefined configurations optimized for different content types and use cases. 
                Each template contains only the differences from default values.
              </p>
            </div>

            <div className="grid gap-8">
              {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
                    {category === 'quick' && <Zap className="h-5 w-5 text-yellow-500" />}
                    {category === 'quality' && <Sparkles className="h-5 w-5 text-blue-500" />}
                    {category === 'specialized' && <Target className="h-5 w-5 text-green-500" />}
                    {category === 'media' && <Film className="h-5 w-5 text-purple-500" />}
                    {category} Templates
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTemplates.map((template) => (
                      <Card key={template.id} className="h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <CardDescription className="text-sm">{template.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time:</span>
                              <span>{template.estimatedTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Stages:</span>
                              <span>{template.stages.length}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Best for:</span>
                              <p className="text-xs mt-1">{template.recommendedFor[0]}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Zap />}
                title="Smart Recommendations"
                description="AI-powered template suggestions"
                color="orange"
                features={[
                  "File type detection",
                  "Content analysis",
                  "Use case matching",
                  "Performance optimization"
                ]}
              />
              <FeatureCard
                icon={<Settings />}
                title="Advanced Configuration"
                description="Granular control over processing"
                color="purple"
                features={[
                  "Stage-by-stage configuration",
                  "Real-time validation",
                  "Configuration templates",
                  "Import/export settings"
                ]}
              />
              <FeatureCard
                icon={<Target />}
                title="Quality Assurance"
                description="Built-in validation and optimization"
                color="green"
                features={[
                  "Configuration validation",
                  "Error prevention",
                  "Quality metrics",
                  "Performance monitoring"
                ]}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export const FullShowcase: Story = {
  render: () => <DocumentProcessingShowcase />,
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of the document processing platform featuring easy mode, expert mode, processing templates, and all key features.',
      },
    },
  },
};
