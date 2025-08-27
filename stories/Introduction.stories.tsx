import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sparkles, Settings, FileText, Zap, Target, Film, Scale, BookOpen, Users, Code, TestTube } from 'lucide-react';

const meta: Meta = {
  title: 'Introduction',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Welcome to the MoRAG UI Storybook! This interactive documentation showcases our comprehensive document processing platform.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const IntroductionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MoRAG UI Storybook
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Interactive documentation for our comprehensive document processing platform with both easy and expert modes.
            Explore components, workflows, and complete user journeys.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              🚀 Get Started
            </Button>
            <Button variant="outline">
              📚 Browse Stories
            </Button>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Sparkles className="h-6 w-6" />
                Easy Mode
              </CardTitle>
              <CardDescription>Perfect for users who want quick, reliable results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Template Selection: Choose from 6 predefined processing templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Smart Recommendations: Automatic template suggestions based on file type
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  2-Step Process: Upload → Select Template → Done
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  File Type Support: PDF, Word, Audio, Video, Web content, and more
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Settings className="h-6 w-6" />
                Expert Mode
              </CardTitle>
              <CardDescription>Full control for advanced users with specific requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  Stage Configuration: Configure 5 processing stages individually
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  150+ Options: Granular control over all processing parameters
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  Validation: Real-time configuration validation and error prevention
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  Import/Export: Save and share custom configurations
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Story Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Story Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Complete platform overview with all features</p>
                <Badge variant="outline">Document Processing Showcase</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Main application pages with various states</p>
                <div className="space-y-1">
                  <Badge variant="outline" className="mr-1">Realms Page</Badge>
                  <Badge variant="outline">Documents Page</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Dialogs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Interactive dialogs and modals</p>
                <div className="space-y-1">
                  <Badge variant="outline" className="mr-1">Easy Mode</Badge>
                  <Badge variant="outline" className="mr-1">Expert Mode</Badge>
                  <Badge variant="outline">Unified Dialog</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Individual UI components and widgets</p>
                <div className="space-y-1">
                  <Badge variant="outline" className="mr-1">Template Selector</Badge>
                  <Badge variant="outline">Stage Config Editor</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-indigo-600" />
                  Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Complete user journeys and interactions</p>
                <div className="space-y-1">
                  <Badge variant="outline" className="mr-1">Add Document</Badge>
                  <Badge variant="outline">Template Comparison</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-orange-600" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Processing templates and configurations</p>
                <div className="space-y-1">
                  <Badge variant="outline" className="mr-1">Quick</Badge>
                  <Badge variant="outline" className="mr-1">Quality</Badge>
                  <Badge variant="outline">Specialized</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Who This Is For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <CardTitle className="text-lg">Product Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Understand user journeys</li>
                  <li>• Evaluate feature balance</li>
                  <li>• See template effectiveness</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Code className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                <CardTitle className="text-lg">Developers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Component APIs</li>
                  <li>• State handling</li>
                  <li>• Integration patterns</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <CardTitle className="text-lg">Designers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• UI adaptability</li>
                  <li>• Visual hierarchy</li>
                  <li>• Responsive behavior</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TestTube className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                <CardTitle className="text-lg">QA Engineers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• User flow testing</li>
                  <li>• Error handling</li>
                  <li>• Edge case validation</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start with the Document Processing Showcase for a complete overview, or jump into any specific story that interests you!
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              🎯 View Showcase
            </Button>
            <Button variant="outline">
              📋 Browse All Stories
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Welcome: Story = {
  render: () => <IntroductionPage />,
  parameters: {
    docs: {
      description: {
        story: 'Welcome page introducing the MoRAG UI Storybook with overview of features, story categories, and use cases.',
      },
    },
  },
};
