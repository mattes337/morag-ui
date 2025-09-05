import type { Meta, StoryObj } from '@storybook/react';
import {
  ThemeToggle,
  ThemeSelector,
  ThemeSwitch,
  ThemeSegmentedControl,
  ThemeIndicator,
} from './theme-toggle';

const meta = {
  title: 'Theme/Theme Controls',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A collection of theme switching components with light/dark mode support.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Theme Toggle Stories
export const Toggle: Story = {
  name: 'Theme Toggle',
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Simple toggle button that switches between light and dark themes.',
      },
    },
  },
};

export const ToggleWithLabels: Story = {
  name: 'Toggle with Labels',
  args: {
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Toggle button with text labels showing the current theme.',
      },
    },
  },
};

export const ToggleSizes: Story = {
  name: 'Toggle Sizes',
  render: () => (
    <div className="flex items-center gap-4">
      <ThemeToggle iconSize="sm" />
      <ThemeToggle iconSize="md" />
      <ThemeToggle iconSize="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of theme toggle buttons.',
      },
    },
  },
};

// Theme Selector Stories
export const Selector: Story = {
  name: 'Theme Selector',
  render: () => <ThemeSelector />,
  parameters: {
    docs: {
      description: {
        story: 'Dropdown selector with light, dark, and system theme options.',
      },
    },
  },
};

export const SelectorWithoutSystem: Story = {
  name: 'Selector without System',
  render: () => <ThemeSelector includeSystem={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Theme selector without the system theme option.',
      },
    },
  },
};

// Theme Switch Stories
export const Switch: Story = {
  name: 'Theme Switch',
  render: () => <ThemeSwitch />,
  parameters: {
    docs: {
      description: {
        story: 'Toggle switch style theme control with labels.',
      },
    },
  },
};

export const SwitchVertical: Story = {
  name: 'Switch Vertical',
  render: () => <ThemeSwitch direction="vertical" />,
  parameters: {
    docs: {
      description: {
        story: 'Vertical layout theme switch.',
      },
    },
  },
};

export const SwitchWithoutLabels: Story = {
  name: 'Switch without Labels',
  render: () => <ThemeSwitch showLabels={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Theme switch without text labels.',
      },
    },
  },
};

// Theme Segmented Control Stories
export const SegmentedControl: Story = {
  name: 'Segmented Control',
  render: () => <ThemeSegmentedControl />,
  parameters: {
    docs: {
      description: {
        story: 'Segmented control with light, dark, and system options.',
      },
    },
  },
};

export const SegmentedControlSizes: Story = {
  name: 'Segmented Control Sizes',
  render: () => (
    <div className="space-y-4">
      <ThemeSegmentedControl size="sm" />
      <ThemeSegmentedControl size="md" />
      <ThemeSegmentedControl size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of segmented theme controls.',
      },
    },
  },
};

export const SegmentedControlWithoutSystem: Story = {
  name: 'Segmented Control without System',
  render: () => <ThemeSegmentedControl includeSystem={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Segmented control without the system theme option.',
      },
    },
  },
};

// Theme Indicator Stories
export const Indicator: Story = {
  name: 'Theme Indicator',
  render: () => <ThemeIndicator />,
  parameters: {
    docs: {
      description: {
        story: 'Read-only indicator showing the current theme.',
      },
    },
  },
};

export const IndicatorSizes: Story = {
  name: 'Indicator Sizes',
  render: () => (
    <div className="flex items-center gap-4">
      <ThemeIndicator size="sm" />
      <ThemeIndicator size="md" />
      <ThemeIndicator size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of theme indicators.',
      },
    },
  },
};

export const IndicatorWithoutName: Story = {
  name: 'Indicator without Name',
  render: () => <ThemeIndicator showName={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Theme indicator showing only the icon.',
      },
    },
  },
};

// Showcase All Components
export const AllComponents: Story = {
  name: 'All Theme Components',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-lg border">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme Toggle</h3>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ThemeToggle showLabels />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme Selector</h3>
        <div className="flex items-center gap-4">
          <ThemeSelector />
          <ThemeSelector includeSystem={false} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme Switch</h3>
        <div className="flex items-center gap-8">
          <ThemeSwitch />
          <ThemeSwitch direction="vertical" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Segmented Control</h3>
        <div className="space-y-2">
          <ThemeSegmentedControl />
          <ThemeSegmentedControl includeSystem={false} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme Indicator</h3>
        <div className="flex items-center gap-4">
          <ThemeIndicator />
          <ThemeIndicator showName={false} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Showcase of all theme control components available in the system.',
      },
    },
  },
};