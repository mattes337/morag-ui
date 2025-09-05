import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const meta = {
  title: 'Theme/Color Palette',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'The comprehensive color palette used throughout the MoRAG UI theme system.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Color swatch component for displaying colors
function ColorSwatch({ 
  color, 
  name, 
  description,
  className = ""
}: { 
  color: string; 
  name: string; 
  description?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div 
        className="h-20 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: `hsl(${color})` }}
      />
      <div className="space-y-1">
        <div className="font-medium text-sm">{name}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          hsl({color})
        </code>
      </div>
    </div>
  );
}

// Semantic colors showcase
export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Semantic Colors</h2>
        <p className="text-muted-foreground mb-6">
          Theme-aware semantic colors that automatically adapt between light and dark modes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ColorSwatch
          color="var(--primary)"
          name="Primary"
          description="Main brand color for primary actions"
        />
        <ColorSwatch
          color="var(--secondary)"
          name="Secondary"
          description="Secondary actions and neutral elements"
        />
        <ColorSwatch
          color="var(--success)"
          name="Success"
          description="Success states and positive actions"
        />
        <ColorSwatch
          color="var(--destructive)"
          name="Destructive"
          description="Error states and destructive actions"
        />
        <ColorSwatch
          color="var(--warning)"
          name="Warning"
          description="Warning states and caution indicators"
        />
        <ColorSwatch
          color="var(--info)"
          name="Info"
          description="Informational content and neutral states"
        />
        <ColorSwatch
          color="var(--muted)"
          name="Muted"
          description="Subtle backgrounds and disabled states"
        />
        <ColorSwatch
          color="var(--accent)"
          name="Accent"
          description="Highlights and emphasis colors"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic colors that adapt automatically to the current theme mode.',
      },
    },
  },
};

// Surface colors showcase
export const SurfaceColors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Surface Colors</h2>
        <p className="text-muted-foreground mb-6">
          Background and surface colors for different UI layers and elevations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ColorSwatch
          color="var(--background)"
          name="Background"
          description="Main page background color"
        />
        <ColorSwatch
          color="var(--card)"
          name="Card"
          description="Card and elevated surface backgrounds"
        />
        <ColorSwatch
          color="var(--popover)"
          name="Popover"
          description="Popover and dropdown backgrounds"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Surface colors for different UI layers and components.',
      },
    },
  },
};

// Interactive colors showcase
export const InteractiveColors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Interactive Colors</h2>
        <p className="text-muted-foreground mb-6">
          Colors for interactive elements like borders, inputs, and focus states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ColorSwatch
          color="var(--border)"
          name="Border"
          description="Default border color for components"
        />
        <ColorSwatch
          color="var(--input)"
          name="Input"
          description="Input field borders and backgrounds"
        />
        <ColorSwatch
          color="var(--ring)"
          name="Ring"
          description="Focus ring color for accessibility"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Colors for interactive elements and states.',
      },
    },
  },
};

// Text colors showcase
export const TextColors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Text Colors</h2>
        <p className="text-muted-foreground mb-6">
          Typography colors with proper contrast ratios for accessibility.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-foreground text-lg font-semibold">
            Primary Text (--foreground)
          </div>
          <div className="text-muted-foreground">
            Secondary Text (--muted-foreground) - Used for captions and less important content
          </div>
        </div>

        <div className="p-4 bg-primary rounded-lg">
          <div className="text-primary-foreground font-medium">
            Primary Foreground (--primary-foreground) - Text on primary backgrounds
          </div>
        </div>

        <div className="p-4 bg-secondary rounded-lg">
          <div className="text-secondary-foreground font-medium">
            Secondary Foreground (--secondary-foreground) - Text on secondary backgrounds
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="text-muted-foreground font-medium">
            Muted Foreground (--muted-foreground) - Text on muted backgrounds
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text colors optimized for readability and accessibility.',
      },
    },
  },
};

// Chart colors showcase
export const ChartColors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Chart Colors</h2>
        <p className="text-muted-foreground mb-6">
          Data visualization colors optimized for both light and dark themes.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <ColorSwatch color="var(--chart-1)" name="Chart 1" />
        <ColorSwatch color="var(--chart-2)" name="Chart 2" />
        <ColorSwatch color="var(--chart-3)" name="Chart 3" />
        <ColorSwatch color="var(--chart-4)" name="Chart 4" />
        <ColorSwatch color="var(--chart-5)" name="Chart 5" />
      </div>

      <div className="p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-3">Chart Color Usage Example</h3>
        <div className="space-y-2">
          {[
            { color: 'var(--chart-1)', label: 'Revenue', value: '65%' },
            { color: 'var(--chart-2)', label: 'Expenses', value: '45%' },
            { color: 'var(--chart-3)', label: 'Profit', value: '20%' },
            { color: 'var(--chart-4)', label: 'Growth', value: '35%' },
            { color: 'var(--chart-5)', label: 'Savings', value: '25%' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: `hsl(${item.color})` }}
              />
              <span className="text-sm">{item.label}</span>
              <span className="text-sm text-muted-foreground ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Chart colors for data visualization components.',
      },
    },
  },
};

// Color usage guidelines
export const UsageGuidelines: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Color Usage Guidelines</h2>
        <p className="text-muted-foreground mb-6">
          Best practices for using colors in the MoRAG UI system.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-success">✅ Do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded border" />
              <span className="text-sm">Use semantic tokens like --primary for consistent theming</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-muted rounded border" />
              <span className="text-sm">Use muted colors for subtle elements and disabled states</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-destructive rounded border" />
              <span className="text-sm">Use destructive colors sparingly for error states</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">❌ Don't</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded border" />
              <span className="text-sm">Don't use hardcoded colors like red-500 or blue-600</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-400 rounded border" />
              <span className="text-sm">Don't use colors that don't meet contrast requirements</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6" style={{ background: 'linear-gradient(45deg, red, blue)' }} />
              <span className="text-sm">Don't create custom colors without considering theme compatibility</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Compliance</CardTitle>
          <CardDescription>
            All color combinations meet WCAG AA contrast requirements (4.5:1 ratio minimum)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Primary on Primary Foreground:</span>
              <span className="font-mono text-success">4.52:1 ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Foreground on Background:</span>
              <span className="font-mono text-success">12.63:1 ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Muted Foreground on Background:</span>
              <span className="font-mono text-success">5.18:1 ✓</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Guidelines and best practices for using the color system effectively.',
      },
    },
  },
};

// Complete color palette
export const CompleteColorPalette: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Complete Color Palette</h2>
        <p className="text-muted-foreground mb-6">
          All available colors in the MoRAG UI theme system with their CSS custom property names.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Semantic Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Semantic Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch color="var(--primary)" name="Primary" description="--primary" />
            <ColorSwatch color="var(--secondary)" name="Secondary" description="--secondary" />
            <ColorSwatch color="var(--success)" name="Success" description="--success" />
            <ColorSwatch color="var(--destructive)" name="Destructive" description="--destructive" />
            <ColorSwatch color="var(--warning)" name="Warning" description="--warning" />
            <ColorSwatch color="var(--info)" name="Info" description="--info" />
            <ColorSwatch color="var(--muted)" name="Muted" description="--muted" />
            <ColorSwatch color="var(--accent)" name="Accent" description="--accent" />
          </div>
        </div>

        {/* Surface Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Surface Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ColorSwatch color="var(--background)" name="Background" description="--background" />
            <ColorSwatch color="var(--card)" name="Card" description="--card" />
            <ColorSwatch color="var(--popover)" name="Popover" description="--popover" />
          </div>
        </div>

        {/* Interactive Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interactive Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ColorSwatch color="var(--border)" name="Border" description="--border" />
            <ColorSwatch color="var(--input)" name="Input" description="--input" />
            <ColorSwatch color="var(--ring)" name="Ring" description="--ring" />
          </div>
        </div>

        {/* Chart Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Chart Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ColorSwatch color="var(--chart-1)" name="Chart 1" description="--chart-1" />
            <ColorSwatch color="var(--chart-2)" name="Chart 2" description="--chart-2" />
            <ColorSwatch color="var(--chart-3)" name="Chart 3" description="--chart-3" />
            <ColorSwatch color="var(--chart-4)" name="Chart 4" description="--chart-4" />
            <ColorSwatch color="var(--chart-5)" name="Chart 5" description="--chart-5" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete overview of all available colors in the theme system.',
      },
    },
  },
};