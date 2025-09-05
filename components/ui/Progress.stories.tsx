import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A progress bar component with multiple sizes, variants, and customizable labels. Built on Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The progress value (0-100)',
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'The maximum value (defaults to 100)',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the progress bar',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'destructive'],
      description: 'The color variant of the progress bar',
    },
    showValue: {
      control: 'boolean',
      description: 'Whether to show the percentage value',
    },
    label: {
      control: 'text',
      description: 'Custom label for the progress',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
    size: 'default',
    variant: 'default',
  },
};

export const WithValue: Story = {
  args: {
    value: 75,
    showValue: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with percentage value displayed.',
      },
    },
  },
};

export const WithLabel: Story = {
  args: {
    value: 45,
    label: 'Upload Progress',
    showValue: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with custom label and percentage value.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    label: 'Not Started',
    showValue: true,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    label: 'Complete',
    showValue: true,
    variant: 'success',
  },
};

export const Small: Story = {
  args: {
    value: 30,
    size: 'sm',
    label: 'Small progress',
  },
};

export const Large: Story = {
  args: {
    value: 80,
    size: 'lg',
    label: 'Large progress',
    showValue: true,
  },
};

export const Success: Story = {
  args: {
    value: 100,
    variant: 'success',
    label: 'Task Completed',
    showValue: true,
  },
};

export const Warning: Story = {
  args: {
    value: 25,
    variant: 'warning',
    label: 'Low Storage',
    showValue: true,
  },
};

export const Destructive: Story = {
  args: {
    value: 90,
    variant: 'destructive',
    label: 'Critical Usage',
    showValue: true,
  },
};

export const CustomMax: Story = {
  args: {
    value: 150,
    max: 200,
    label: 'Custom Scale',
    showValue: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with custom maximum value (150 out of 200).',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Progress Sizes</h3>
        <div className="space-y-4">
          <Progress size="sm" value={40} label="Small" showValue />
          <Progress size="default" value={60} label="Default" showValue />
          <Progress size="lg" value={80} label="Large" showValue />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available progress bar sizes.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Progress Variants</h3>
        <div className="space-y-4">
          <Progress variant="default" value={40} label="Default" showValue />
          <Progress variant="success" value={100} label="Success" showValue />
          <Progress variant="warning" value={25} label="Warning" showValue />
          <Progress variant="destructive" value={85} label="Critical" showValue />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available progress bar color variants.',
      },
    },
  },
};

export const FileUploadExample: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">File Upload Progress</h3>
      <div className="space-y-4">
        <Progress 
          value={100} 
          variant="success" 
          label="document.pdf" 
          showValue 
        />
        <Progress 
          value={67} 
          label="image.jpg" 
          showValue 
        />
        <Progress 
          value={23} 
          label="video.mp4" 
          showValue 
        />
        <Progress 
          value={0} 
          label="archive.zip" 
          showValue 
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'File upload progress showing multiple files in different states.',
      },
    },
  },
};

export const SystemResourcesExample: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <h3 className="text-lg font-semibold">System Resources</h3>
      <div className="space-y-4">
        <Progress 
          value={45} 
          label="CPU Usage" 
          showValue 
        />
        <Progress 
          value={78} 
          variant="warning" 
          label="Memory Usage" 
          showValue 
        />
        <Progress 
          value={23} 
          variant="success" 
          label="Disk Usage" 
          showValue 
        />
        <Progress 
          value={92} 
          variant="destructive" 
          label="Network Usage" 
          showValue 
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'System resource monitoring with appropriate color coding.',
      },
    },
  },
};

export const TaskProgressExample: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">Project Tasks</h3>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg space-y-3">
          <div>
            <h4 className="font-medium">Frontend Development</h4>
            <Progress value={85} variant="success" showValue />
          </div>
          <div className="text-xs text-muted-foreground">
            17 of 20 components completed
          </div>
        </div>
        
        <div className="p-4 border rounded-lg space-y-3">
          <div>
            <h4 className="font-medium">Backend API</h4>
            <Progress value={60} showValue />
          </div>
          <div className="text-xs text-muted-foreground">
            12 of 20 endpoints implemented
          </div>
        </div>
        
        <div className="p-4 border rounded-lg space-y-3">
          <div>
            <h4 className="font-medium">Documentation</h4>
            <Progress value={30} variant="warning" showValue />
          </div>
          <div className="text-xs text-muted-foreground">
            Behind schedule - 6 of 20 pages written
          </div>
        </div>
        
        <div className="p-4 border rounded-lg space-y-3">
          <div>
            <h4 className="font-medium">Testing</h4>
            <Progress value={10} showValue />
          </div>
          <div className="text-xs text-muted-foreground">
            Just started - 2 of 20 test suites written
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Project task tracking with detailed context and progress indicators.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const progressValues = [
      { label: 'Step 1: Setup', value: 100, variant: 'success' as const },
      { label: 'Step 2: Configuration', value: 100, variant: 'success' as const },
      { label: 'Step 3: Implementation', value: 75, variant: 'default' as const },
      { label: 'Step 4: Testing', value: 30, variant: 'warning' as const },
      { label: 'Step 5: Deployment', value: 0, variant: 'default' as const },
    ];
    
    const overallProgress = progressValues.reduce((sum, step) => sum + step.value, 0) / progressValues.length;
    
    return (
      <div className="space-y-6 w-96">
        <div>
          <h3 className="text-lg font-semibold mb-4">Deployment Pipeline</h3>
          <Progress 
            value={Math.round(overallProgress)} 
            size="lg"
            variant={overallProgress === 100 ? 'success' : overallProgress > 50 ? 'default' : 'warning'}
            label="Overall Progress" 
            showValue 
          />
        </div>
        
        <div className="space-y-3">
          {progressValues.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium">
                {step.value === 100 ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <Progress 
                  value={step.value} 
                  variant={step.variant}
                  label={step.label}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Multi-step process with overall progress and individual step tracking.',
      },
    },
  },
};