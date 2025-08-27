import type { Meta, StoryObj } from '@storybook/react';
import { AddDocumentDialog } from '../components/dialogs/AddDocumentDialog';
import { withMockAppProvider } from './MockAppProvider';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { Button } from '../components/ui/button';

const meta: Meta = {
  title: 'Workflows/AddDocument',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete add document workflow showcasing both easy and expert modes with various scenarios and file types.',
      },
    },
  },
  decorators: [withMockAppProvider],
};

export default meta;
type Story = StoryObj;

// Interactive workflow component
const AddDocumentWorkflow = ({ initialMode = 'easy' }: { initialMode?: 'easy' | 'expert' }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<'easy' | 'expert'>(initialMode);

  return (
    <>
      <div className="p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Add Document Workflow</h1>
          <p className="text-gray-600 mb-8">
            Test the complete document upload experience with both easy and expert modes.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => {
              setMode('easy');
              setIsDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🚀 Start Easy Mode
          </Button>
          <Button 
            onClick={() => {
              setMode('expert');
              setIsDialogOpen(true);
            }}
            variant="outline"
          >
            ⚙️ Start Expert Mode
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Easy Mode Features</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>✨ Template-based processing</li>
              <li>📄 Automatic file type detection</li>
              <li>🎯 Smart recommendations</li>
              <li>⚡ Quick 2-step process</li>
              <li>🔄 Switch to expert mode anytime</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-800">Expert Mode Features</h3>
            <ul className="space-y-2 text-sm text-purple-700">
              <li>⚙️ Full stage configuration</li>
              <li>🎛️ 150+ configurable options</li>
              <li>📊 Configuration validation</li>
              <li>💾 Import/export settings</li>
              <li>🔍 Detailed review process</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-3">Supported File Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Documents</strong>
              <ul className="mt-1 text-gray-600">
                <li>📄 PDF</li>
                <li>📝 Word (DOCX)</li>
                <li>📋 Text (TXT)</li>
                <li>📑 Markdown (MD)</li>
              </ul>
            </div>
            <div>
              <strong>Media</strong>
              <ul className="mt-1 text-gray-600">
                <li>🎵 Audio (MP3, WAV)</li>
                <li>🎬 Video (MP4, AVI)</li>
                <li>📺 YouTube URLs</li>
              </ul>
            </div>
            <div>
              <strong>Web Content</strong>
              <ul className="mt-1 text-gray-600">
                <li>🌐 Websites</li>
                <li>📰 Articles</li>
                <li>📚 Documentation</li>
              </ul>
            </div>
            <div>
              <strong>Images</strong>
              <ul className="mt-1 text-gray-600">
                <li>🖼️ JPEG, PNG</li>
                <li>📸 Screenshots</li>
                <li>📊 Charts/Diagrams</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AddDocumentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialMode={mode}
      />
      <Toaster position="top-right" richColors />
    </>
  );
};

export const EasyModeWorkflow: Story = {
  render: () => <AddDocumentWorkflow initialMode="easy" />,
  parameters: {
    docs: {
      description: {
        story: 'Complete easy mode workflow starting with template selection. Perfect for users who want a quick, guided experience.',
      },
    },
  },
};

export const ExpertModeWorkflow: Story = {
  render: () => <AddDocumentWorkflow initialMode="expert" />,
  parameters: {
    docs: {
      description: {
        story: 'Complete expert mode workflow with full configuration control. Ideal for advanced users who need precise control over processing parameters.',
      },
    },
  },
};

export const ComparisonWorkflow: Story = {
  render: () => <AddDocumentWorkflow />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive comparison allowing you to test both easy and expert modes side by side. Use this to understand the differences and choose the right mode for your use case.',
      },
    },
  },
};

// Scenario-specific workflows
const ScenarioWorkflow = ({ 
  title, 
  description, 
  fileType, 
  mode 
}: { 
  title: string; 
  description: string; 
  fileType: string; 
  mode: 'easy' | 'expert';
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        <Button onClick={() => setIsDialogOpen(true)}>
          Upload {fileType} File
        </Button>
      </div>

      <AddDocumentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialMode={mode}
      />
      <Toaster position="top-right" richColors />
    </>
  );
};

export const AcademicPaperScenario: Story = {
  render: () => (
    <ScenarioWorkflow
      title="Academic Paper Upload"
      description="Upload and process an academic research paper with optimized settings for scholarly content."
      fileType="PDF"
      mode="easy"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scenario for uploading academic papers. The system will recommend the "Academic Research" template with semantic chunking and comprehensive fact extraction.',
      },
    },
  },
};

export const PodcastTranscriptionScenario: Story = {
  render: () => (
    <ScenarioWorkflow
      title="Podcast Transcription"
      description="Upload and transcribe a podcast with speaker identification and topic segmentation."
      fileType="Audio"
      mode="easy"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scenario for podcast transcription. The system will recommend the "Media Transcription" template with speaker diarization and timestamp preservation.',
      },
    },
  },
};

export const LegalDocumentScenario: Story = {
  render: () => (
    <ScenarioWorkflow
      title="Legal Document Processing"
      description="Process legal documents with high precision and specialized entity extraction."
      fileType="PDF"
      mode="expert"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scenario for legal document processing. Expert mode allows fine-tuning of entity extraction for legal-specific entities and high-precision processing.',
      },
    },
  },
};
