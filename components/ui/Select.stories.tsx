import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  SelectLabel, 
  SelectSeparator,
  SelectGroup 
} from './select';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable select dropdown component built on Radix UI primitives with multiple sizes and comprehensive keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    defaultValue: {
      control: 'text',
      description: 'The default selected value',
    },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
  args: {
    defaultValue: '',
  },
};

export const WithDefaultValue: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
  args: {
    defaultValue: 'option2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Select with a pre-selected default value.',
      },
    },
  },
};

export const WithGroups: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Choose your role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Developers</SelectLabel>
          <SelectItem value="frontend">Frontend Developer</SelectItem>
          <SelectItem value="backend">Backend Developer</SelectItem>
          <SelectItem value="fullstack">Full Stack Developer</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Designers</SelectLabel>
          <SelectItem value="ux">UX Designer</SelectItem>
          <SelectItem value="ui">UI Designer</SelectItem>
          <SelectItem value="product">Product Designer</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Management</SelectLabel>
          <SelectItem value="pm">Product Manager</SelectItem>
          <SelectItem value="em">Engineering Manager</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with grouped options and separators for better organization.',
      },
    },
  },
};

export const WithDisabledOption: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free Plan</SelectItem>
        <SelectItem value="pro">Pro Plan</SelectItem>
        <SelectItem value="enterprise" disabled>
          Enterprise Plan (Coming Soon)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with one disabled option that cannot be selected.',
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => (
    <Select {...args} disabled>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Completely disabled select that cannot be opened or interacted with.',
      },
    },
  },
};

export const SmallSize: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger size="sm" className="w-44">
        <SelectValue placeholder="Small select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="small">Small option</SelectItem>
        <SelectItem value="compact">Compact option</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Smaller select for compact layouts.',
      },
    },
  },
};

export const LargeSize: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger size="lg" className="w-52">
        <SelectValue placeholder="Large select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="large">Large option</SelectItem>
        <SelectItem value="spacious">Spacious option</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Larger select with more padding and prominent appearance.',
      },
    },
  },
};

export const CountrySelector: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select your country" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="us"><span role="img" aria-label="United States flag">🇺🇸</span> United States</SelectItem>
          <SelectItem value="ca"><span role="img" aria-label="Canada flag">🇨🇦</span> Canada</SelectItem>
          <SelectItem value="mx"><span role="img" aria-label="Mexico flag">🇲🇽</span> Mexico</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="uk"><span role="img" aria-label="United Kingdom flag">🇬🇧</span> United Kingdom</SelectItem>
          <SelectItem value="de"><span role="img" aria-label="Germany flag">🇩🇪</span> Germany</SelectItem>
          <SelectItem value="fr"><span role="img" aria-label="France flag">🇫🇷</span> France</SelectItem>
          <SelectItem value="es"><span role="img" aria-label="Spain flag">🇪🇸</span> Spain</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Asia Pacific</SelectLabel>
          <SelectItem value="jp"><span role="img" aria-label="Japan flag">🇯🇵</span> Japan</SelectItem>
          <SelectItem value="au"><span role="img" aria-label="Australia flag">🇦🇺</span> Australia</SelectItem>
          <SelectItem value="sg"><span role="img" aria-label="Singapore flag">🇸🇬</span> Singapore</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Country selector with flags and regional groupings.',
      },
    },
  },
};

export const StatusSelector: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Active
          </div>
        </SelectItem>
        <SelectItem value="pending">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Pending
          </div>
        </SelectItem>
        <SelectItem value="inactive">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Inactive
          </div>
        </SelectItem>
        <SelectItem value="draft">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            Draft
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status selector with colored indicators for visual distinction.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Sizes</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Small</label>
            <Select>
              <SelectTrigger size="sm" className="w-44">
                <SelectValue placeholder="Small select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small option</SelectItem>
                <SelectItem value="compact">Compact option</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Default</label>
            <Select>
              <SelectTrigger size="default" className="w-48">
                <SelectValue placeholder="Default select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default option</SelectItem>
                <SelectItem value="standard">Standard option</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Large</label>
            <Select>
              <SelectTrigger size="lg" className="w-52">
                <SelectValue placeholder="Large select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large">Large option</SelectItem>
                <SelectItem value="spacious">Spacious option</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All available select sizes with labels.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <h3 className="text-lg font-semibold">User Profile Form</h3>
      <form className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Country</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-1">Job Title</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Engineering</SelectLabel>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="backend">Backend Developer</SelectItem>
                <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                <SelectItem value="devops">DevOps Engineer</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Design</SelectLabel>
                <SelectItem value="ux">UX Designer</SelectItem>
                <SelectItem value="ui">UI Designer</SelectItem>
                <SelectItem value="product-design">Product Designer</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Other</SelectLabel>
                <SelectItem value="pm">Product Manager</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-1">Experience Level</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Junior (0-2 years)</SelectItem>
              <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
              <SelectItem value="senior">Senior (5-8 years)</SelectItem>
              <SelectItem value="lead">Lead (8+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-1">Preferred Contact Time</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select time preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
              <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
              <SelectItem value="anytime">Anytime</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Complete form example showing various select configurations in context.',
      },
    },
  },
};