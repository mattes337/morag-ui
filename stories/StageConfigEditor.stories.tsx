import type { Meta, StoryObj } from '@storybook/react';
import { StageConfigEditor } from '../components/ui/processing/stage-config-editor';
import { StageConfig } from '../lib/services/moragService';
import { DEFAULT_STAGE_CONFIGS } from '../lib/processing/templates';
import { useState } from 'react';

const meta: Meta<typeof StageConfigEditor> = {
  title: 'Components/StageConfigEditor',
  component: StageConfigEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Stage configuration editor for individual processing stages. Provides detailed control over stage parameters with validation and default values.',
      },
    },
  },
  argTypes: {
    stageName: {
      control: 'select',
      options: ['markdown-conversion', 'markdown-optimizer', 'chunker', 'fact-generator', 'ingestor'],
      description: 'Name of the processing stage',
    },
    config: {
      control: false,
      description: 'Current stage configuration',
    },
    onConfigChange: {
      action: 'onConfigChange',
      description: 'Callback when configuration changes',
    },
    isEnabled: {
      control: 'boolean',
      description: 'Whether the stage is enabled',
    },
    onEnabledChange: {
      action: 'onEnabledChange',
      description: 'Callback when enabled state changes',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StageConfigEditor>;

// Interactive wrapper component
const InteractiveStageConfigEditor = (args: any) => {
  const [config, setConfig] = useState<StageConfig>(args.config);
  const [isEnabled, setIsEnabled] = useState<boolean>(args.isEnabled);

  const handleConfigChange = (newConfig: StageConfig) => {
    setConfig(newConfig);
    args.onConfigChange?.(newConfig);
  };

  const handleEnabledChange = (enabled: boolean) => {
    setIsEnabled(enabled);
    args.onEnabledChange?.(enabled);
  };

  return (
    <StageConfigEditor
      {...args}
      config={config}
      onConfigChange={handleConfigChange}
      isEnabled={isEnabled}
      onEnabledChange={handleEnabledChange}
    />
  );
};

export const MarkdownConversionEnabled: Story = {
  args: {
    stageName: 'markdown-conversion',
    config: DEFAULT_STAGE_CONFIGS['markdown-conversion'],
    isEnabled: true,
    onConfigChange: (config: StageConfig) => console.log('Config changed:', config),
    onEnabledChange: (enabled: boolean) => console.log('Enabled changed:', enabled),
  },
  render: (args) => <InteractiveStageConfigEditor {...args} />,
};

export const MarkdownConversionDisabled: Story = {
  args: {
    stageName: 'markdown-conversion',
    config: DEFAULT_STAGE_CONFIGS['markdown-conversion'],
    isEnabled: false,
    onConfigChange: (config: StageConfig) => console.log('Config changed:', config),
    onEnabledChange: (enabled: boolean) => console.log('Enabled changed:', enabled),
  },
  render: (args) => <InteractiveStageConfigEditor {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Disabled markdown conversion stage showing the collapsed state.',
      },
    },
  },
};

export const MarkdownOptimizer: Story = {
  args: {
    stageName: 'markdown-optimizer',
    config: DEFAULT_STAGE_CONFIGS['markdown-optimizer'],
    isEnabled: true,
    onConfigChange: (config: StageConfig) => console.log('Config changed:', config),
    onEnabledChange: (enabled: boolean) => console.log('Enabled changed:', enabled),
  },
  render: (args) => <InteractiveStageConfigEditor {...args} />,
};

export const Chunker: Story = {
  args: {
    stageName: 'chunker',
    config: DEFAULT_STAGE_CONFIGS['chunker'],
    isEnabled: true,
    onConfigChange: (config: StageConfig) => console.log('Config changed:', config),
    onEnabledChange: (enabled: boolean) => console.log('Enabled changed:', enabled),
  },
  render: (args) => <InteractiveStageConfigEditor {...args} />,
};

export const FactGenerator: Story = {
  args: {
    stageName: 'fact-generator',
    config: DEFAULT_STAGE_CONFIGS['fact-generator'],
    isEnabled: true,
    onConfigChange: (config: StageConfig) => console.log('Config changed:', config),
    onEnabledChange: (enabled: boolean) => console.log('Enabled changed:', enabled),
  },
  render: (args) => <InteractiveStageConfigEditor {...args} />,
};

export const Ingestor: Story = {
  args: {
    stageName: 'ingestor',
    config: DEFAULT_STAGE_CONFIGS['ingestor'],
    isEnabled: true,
    onConfigChange: (config: StageConfig) => console.log('Config changed:', config),
    onEnabledChange: (enabled: boolean) => console.log('Enabled changed:', enabled),
  },
  render: (args) => <InteractiveStageConfigEditor {...args} />,
};

export const CustomConfiguration: Story = {
  args: {
    stageName: 'chunker',
    config: {
      ...DEFAULT_STAGE_CONFIGS['chunker'],
      chunk_strategy: 'semantic',
      chunk_size: 6000,
      overlap: 300,
      generate_summary: true,
    },
    isEnabled: true,
    onConfigChange: (config: StageConfig) => console.log('Config changed:', config),
    onEnabledChange: (enabled: boolean) => console.log('Enabled changed:', enabled),
  },
  render: (args) => <InteractiveStageConfigEditor {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Chunker stage with custom configuration values different from defaults.',
      },
    },
  },
};
