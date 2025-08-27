import type { Meta, StoryObj } from '@storybook/react';
import { TemplateSelector } from '../components/ui/processing/template-selector';
import { ProcessingTemplate, ProcessingTemplateService } from '../lib/processing/templates';
import { useState } from 'react';

const meta: Meta<typeof TemplateSelector> = {
  title: 'Components/TemplateSelector',
  component: TemplateSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Template selector component for choosing predefined document processing templates. Includes search, filtering, and file type recommendations.',
      },
    },
  },
  argTypes: {
    selectedTemplate: {
      control: false,
      description: 'Currently selected template',
    },
    onTemplateSelect: {
      action: 'onTemplateSelect',
      description: 'Callback when a template is selected',
    },
    fileType: {
      control: 'select',
      options: ['pdf', 'docx', 'txt', 'mp3', 'mp4', 'url', 'youtube'],
      description: 'File type for template recommendations',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TemplateSelector>;

// Interactive wrapper component
const InteractiveTemplateSelector = (args: any) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessingTemplate | undefined>(args.selectedTemplate);

  const handleTemplateSelect = (template: ProcessingTemplate) => {
    setSelectedTemplate(template);
    args.onTemplateSelect?.(template);
  };

  return (
    <TemplateSelector
      {...args}
      selectedTemplate={selectedTemplate}
      onTemplateSelect={handleTemplateSelect}
    />
  );
};

export const Default: Story = {
  args: {
    onTemplateSelect: (template: ProcessingTemplate) => console.log('Selected template:', template.name),
  },
  render: (args) => <InteractiveTemplateSelector {...args} />,
};

export const WithPDFRecommendations: Story = {
  args: {
    fileType: 'pdf',
    onTemplateSelect: (template: ProcessingTemplate) => console.log('Selected template:', template.name),
  },
  render: (args) => <InteractiveTemplateSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Template selector with PDF file type, showing recommended templates for PDF documents.',
      },
    },
  },
};

export const WithAudioRecommendations: Story = {
  args: {
    fileType: 'mp3',
    onTemplateSelect: (template: ProcessingTemplate) => console.log('Selected template:', template.name),
  },
  render: (args) => <InteractiveTemplateSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Template selector with audio file type, showing media transcription templates.',
      },
    },
  },
};

export const WithVideoRecommendations: Story = {
  args: {
    fileType: 'mp4',
    onTemplateSelect: (template: ProcessingTemplate) => console.log('Selected template:', template.name),
  },
  render: (args) => <InteractiveTemplateSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Template selector with video file type, showing media transcription templates.',
      },
    },
  },
};

export const WithURLRecommendations: Story = {
  args: {
    fileType: 'url',
    onTemplateSelect: (template: ProcessingTemplate) => console.log('Selected template:', template.name),
  },
  render: (args) => <InteractiveTemplateSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Template selector with URL content type, showing web content processing templates.',
      },
    },
  },
};

export const WithPreselectedTemplate: Story = {
  args: {
    selectedTemplate: ProcessingTemplateService.getTemplateById('high-quality'),
    fileType: 'pdf',
    onTemplateSelect: (template: ProcessingTemplate) => console.log('Selected template:', template.name),
  },
  render: (args) => <InteractiveTemplateSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Template selector with a pre-selected template (High Quality).',
      },
    },
  },
};

export const CompactView: Story = {
  args: {
    className: 'max-w-2xl',
    onTemplateSelect: (template: ProcessingTemplate) => console.log('Selected template:', template.name),
  },
  render: (args) => <InteractiveTemplateSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Template selector in a more compact layout, suitable for smaller containers.',
      },
    },
  },
};
