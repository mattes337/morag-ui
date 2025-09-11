import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from './dialog';
import { Button } from './Button';
import { Input } from './input';
import { Label } from './Label';
import { Separator } from './Separator';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal dialog component built on Radix UI primitives with multiple sizes and customizable content areas.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls whether the dialog is open',
    },
  },
  args: {
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title and description. You can put any content here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">Dialog content goes here. This can include forms, information, or any other UI elements.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" placeholder="Tell us about yourself..." />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog containing a form with input fields.',
      },
    },
  },
};

export const Confirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Confirmation dialog for destructive actions.',
      },
    },
  },
};

export const SmallSize: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Small Dialog</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Small Dialog</DialogTitle>
          <DialogDescription>This is a compact dialog with limited content.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">This dialog uses the small size variant.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LargeSize: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Large Dialog</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Large Dialog</DialogTitle>
          <DialogDescription>This dialog has more space for extensive content.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Column 1</h4>
              <p className="text-sm text-muted-foreground">
                This is the first column with some content. Large dialogs are useful when you need to display more information or complex forms.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Column 2</h4>
              <p className="text-sm text-muted-foreground">
                This is the second column. You can organize content in multiple columns when using larger dialog sizes.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ExtraLargeSize: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Extra Large Dialog</Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Extra Large Dialog</DialogTitle>
          <DialogDescription>This dialog provides maximum space for complex interfaces.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Section 1</h4>
              <div className="space-y-2">
                <Label>Field 1</Label>
                <Input placeholder="Enter value..." />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Section 2</h4>
              <div className="space-y-2">
                <Label>Field 2</Label>
                <Input placeholder="Enter value..." />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Section 3</h4>
              <div className="space-y-2">
                <Label>Field 3</Label>
                <Input placeholder="Enter value..." />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Modal</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Important Notice</DialogTitle>
          <DialogDescription>
            This dialog doesn't have a close button in the top-right corner. Users must use the action buttons.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">You must make a choice to continue.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog without the close button, forcing users to use action buttons.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Small</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Small Dialog</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm">Compact dialog for simple interactions.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Default</Button>
        </DialogTrigger>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Default Dialog</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm">Standard dialog size for most use cases.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Large</Button>
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Large Dialog</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm">Larger dialog for more content or complex forms.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">XL</Button>
        </DialogTrigger>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Extra Large Dialog</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm">Extra large dialog for complex interfaces.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Full</Button>
        </DialogTrigger>
        <DialogContent size="full">
          <DialogHeader>
            <DialogTitle>Full Width Dialog</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm">Full width dialog that takes up most of the viewport.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available dialog sizes for comparison.',
      },
    },
  },
};

export const ComplexForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Project</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project. All fields marked with an asterisk are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" required>Project Name</Label>
              <Input id="project-name" placeholder="My Awesome Project" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Input id="project-type" placeholder="Web Application" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Brief description of your project..." />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Project Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Input id="visibility" defaultValue="Private" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Input id="template" placeholder="Choose template..." />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Team Access</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Enable team collaboration</div>
                  <div className="text-xs text-muted-foreground">Allow team members to access this project</div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Allow external contributors</div>
                  <div className="text-xs text-muted-foreground">Let people outside your organization contribute</div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex form dialog with multiple sections and field types.',
      },
    },
  },
};

export const InformationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Information</DialogTitle>
          <DialogDescription>Detailed information about this product</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Product ID:</span>
              <div className="text-muted-foreground">PRD-001234</div>
            </div>
            <div>
              <span className="font-medium">Category:</span>
              <div className="text-muted-foreground">Electronics</div>
            </div>
            <div>
              <span className="font-medium">Stock:</span>
              <div className="text-green-600">42 units available</div>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <div className="text-green-600">Active</div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              This is a high-quality product designed for professional use. It features advanced capabilities and is built to last. Perfect for both beginners and experienced users.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Specifications</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Weight: 2.5 kg</li>
              <li>• Dimensions: 30 x 20 x 10 cm</li>
              <li>• Material: Premium aluminum</li>
              <li>• Warranty: 2 years</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Information-only dialog displaying structured data.',
      },
    },
  },
};