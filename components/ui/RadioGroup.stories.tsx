import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { Label } from './Label';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const NoDefault: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup orientation="horizontal" defaultValue="option2">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1-h" />
        <Label htmlFor="option1-h">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2-h" />
        <Label htmlFor="option2-h">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3-h" />
        <Label htmlFor="option3-h">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup disabled defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1-disabled" />
        <Label htmlFor="option1-disabled">Option 1 (Selected & Disabled)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2-disabled" />
        <Label htmlFor="option2-disabled">Option 2 (Disabled)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3-disabled" />
        <Label htmlFor="option3-disabled">Option 3 (Disabled)</Label>
      </div>
    </RadioGroup>
  ),
};

export const PartiallyDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1-partial" />
        <Label htmlFor="option1-partial">Option 1 (Enabled)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2-partial" disabled />
        <Label htmlFor="option2-partial" className="text-muted-foreground">
          Option 2 (Disabled)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3-partial" />
        <Label htmlFor="option3-partial">Option 3 (Enabled)</Label>
      </div>
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Small</h3>
        <RadioGroup defaultValue="sm-option1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sm-option1" id="sm-option1" size="sm" />
            <Label htmlFor="sm-option1" className="text-sm">
              Small radio button
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sm-option2" id="sm-option2" size="sm" />
            <Label htmlFor="sm-option2" className="text-sm">
              Another small option
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-3">Default</h3>
        <RadioGroup defaultValue="default-option1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default-option1" id="default-option1" />
            <Label htmlFor="default-option1">Default size radio button</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default-option2" id="default-option2" />
            <Label htmlFor="default-option2">Another default option</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-3">Large</h3>
        <RadioGroup defaultValue="lg-option1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lg-option1" id="lg-option1" size="lg" />
            <Label htmlFor="lg-option1" className="text-base">
              Large radio button
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lg-option2" id="lg-option2" size="lg" />
            <Label htmlFor="lg-option2" className="text-base">
              Another large option
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Default</h3>
        <RadioGroup defaultValue="default-variant1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default-variant1" id="default-variant1" variant="default" />
            <Label htmlFor="default-variant1">Default variant</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default-variant2" id="default-variant2" variant="default" />
            <Label htmlFor="default-variant2">Another default option</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-3">Destructive</h3>
        <RadioGroup defaultValue="destructive-variant1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="destructive-variant1" id="destructive-variant1" variant="destructive" />
            <Label htmlFor="destructive-variant1">Delete permanently</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="destructive-variant2" id="destructive-variant2" variant="destructive" />
            <Label htmlFor="destructive-variant2">Remove all data</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-3">Success</h3>
        <RadioGroup defaultValue="success-variant1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="success-variant1" id="success-variant1" variant="success" />
            <Label htmlFor="success-variant1">Approve changes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="success-variant2" id="success-variant2" variant="success" />
            <Label htmlFor="success-variant2">Accept request</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="plan1">
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <RadioGroupItem value="plan1" id="plan1" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="plan1" className="text-sm font-medium">
              Basic Plan
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Perfect for individuals just getting started. Includes basic features and 5GB storage.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <RadioGroupItem value="plan2" id="plan2" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="plan2" className="text-sm font-medium">
              Pro Plan
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              For growing businesses. Includes advanced features, 50GB storage, and priority support.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <RadioGroupItem value="plan3" id="plan3" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="plan3" className="text-sm font-medium">
              Enterprise Plan
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              For large organizations. Unlimited storage, custom integrations, and dedicated support.
            </p>
          </div>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState('option2');
    
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Selected value: {value}</Label>
        </div>
        
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="controlled-option1" />
            <Label htmlFor="controlled-option1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="controlled-option2" />
            <Label htmlFor="controlled-option2">Option 2</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option3" id="controlled-option3" />
            <Label htmlFor="controlled-option3">Option 3</Label>
          </div>
        </RadioGroup>
        
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded"
            onClick={() => setValue('option1')}
          >
            Select Option 1
          </button>
          <button
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded"
            onClick={() => setValue('option2')}
          >
            Select Option 2
          </button>
          <button
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded"
            onClick={() => setValue('option3')}
          >
            Select Option 3
          </button>
        </div>
      </div>
    );
  },
};

export const InForm: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      notification: 'email',
      privacy: 'private',
    });
    
    return (
      <form className="space-y-6 max-w-md">
        <div>
          <Label className="text-sm font-semibold">Notification Preferences</Label>
          <RadioGroup
            value={formData.notification}
            onValueChange={(value) => setFormData(prev => ({ ...prev, notification: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="notification-email" />
              <Label htmlFor="notification-email">Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sms" id="notification-sms" />
              <Label htmlFor="notification-sms">SMS notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="push" id="notification-push" />
              <Label htmlFor="notification-push">Push notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="notification-none" />
              <Label htmlFor="notification-none">No notifications</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <Label className="text-sm font-semibold">Profile Visibility</Label>
          <RadioGroup
            value={formData.privacy}
            onValueChange={(value) => setFormData(prev => ({ ...prev, privacy: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="privacy-public" />
              <Label htmlFor="privacy-public">Public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="privacy-private" />
              <Label htmlFor="privacy-private">Private</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friends" id="privacy-friends" />
              <Label htmlFor="privacy-friends">Friends only</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="p-3 bg-muted rounded text-sm">
          <strong>Form Data:</strong>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      </form>
    );
  },
};