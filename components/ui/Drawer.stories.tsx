import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from './Button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from './Drawer';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    modal: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Enter your name"
                defaultValue="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Enter your email"
                defaultValue="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md"
                rows={3}
                placeholder="Tell us about yourself"
                defaultValue="Software developer passionate about creating great user experiences."
              />
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const RightSide: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Right Drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Configure your application settings.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Appearance</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="theme" defaultChecked />
                  <span className="text-sm">Light theme</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="theme" />
                  <span className="text-sm">Dark theme</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="theme" />
                  <span className="text-sm">System</span>
                </label>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Notifications</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Push notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Marketing emails</span>
                </label>
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button>Save Settings</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Left Drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="left">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>
            Browse through the application sections.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <nav className="space-y-2">
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Dashboard
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Projects
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Tasks
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Reports
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Settings
            </a>
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
};

export const TopSide: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Top Drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="top">
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>
            Recent notifications and updates.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 border border-border rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New message received</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 border border-border rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Task completed</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 border border-border rounded-lg">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">System update available</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button>Mark All as Read</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const BottomSide: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Bottom Drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="bottom">
        <DrawerHeader>
          <DrawerTitle>Quick Actions</DrawerTitle>
          <DrawerDescription>
            Frequently used actions and shortcuts.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-lg mb-1">📄</span>
              <span className="text-xs">New Document</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-lg mb-1">📁</span>
              <span className="text-xs">New Folder</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-lg mb-1">📷</span>
              <span className="text-xs">Upload Photo</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-lg mb-1">📊</span>
              <span className="text-xs">Create Chart</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-lg mb-1">📅</span>
              <span className="text-xs">Schedule Event</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-lg mb-1">👥</span>
              <span className="text-xs">Invite User</span>
            </Button>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Small Drawer</Button>
      </DrawerTrigger>
      <DrawerContent size="sm">
        <DrawerHeader>
          <DrawerTitle>Quick Note</DrawerTitle>
          <DrawerDescription>
            Add a quick note or reminder.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md"
            rows={4}
            placeholder="Enter your note here..."
          />
        </DrawerBody>
        <DrawerFooter>
          <Button>Save Note</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const LargeSize: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Large Drawer</Button>
      </DrawerTrigger>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>Project Details</DrawerTitle>
          <DrawerDescription>
            Comprehensive project information and settings.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-md"
                  defaultValue="Website Redesign"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select className="w-full px-3 py-2 border border-border rounded-md">
                  <option>In Progress</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md"
                rows={4}
                defaultValue="Complete redesign of the company website with modern UI/UX principles and responsive design."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded-md"
                  defaultValue="2024-01-15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded-md"
                  defaultValue="2024-06-30"
                />
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button>Update Project</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const NonModal: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Non-modal drawers don't have an overlay and don't block interaction with the page content.
      </p>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open Non-Modal Drawer</Button>
        </DrawerTrigger>
        <DrawerContent modal={false}>
          <DrawerHeader>
            <DrawerTitle>Non-Modal Panel</DrawerTitle>
            <DrawerDescription>
              This drawer doesn't block page interaction.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <div className="space-y-4">
              <p className="text-sm">
                You can still interact with elements behind this drawer.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Input</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="Type something..."
                />
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Simple Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Simple Title Only</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-sm text-muted-foreground">
            This drawer only has a title, no description.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Open Drawer</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Close Drawer</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Drawer is currently: {open ? 'Open' : 'Closed'}
        </p>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Controlled Drawer</DrawerTitle>
              <DrawerDescription>
                This drawer's state is controlled by external buttons.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p className="text-sm">
                The drawer state is managed externally. You can open and close it
                using the buttons outside the drawer.
              </p>
            </DrawerBody>
            <DrawerFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [items, setItems] = React.useState(['Item 1', 'Item 2', 'Item 3']);
    const [newItem, setNewItem] = React.useState('');
    
    const addItem = () => {
      if (newItem.trim()) {
        setItems([...items, newItem]);
        setNewItem('');
      }
    };
    
    const removeItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    };
    
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Manage Items</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Item Manager</DrawerTitle>
            <DrawerDescription>
              Add, remove, and manage your items.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md"
                  placeholder="Enter new item..."
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <Button onClick={addItem}>Add</Button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Items ({items.length})</h4>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items yet</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li key={index} className="flex items-center justify-between p-2 border border-border rounded">
                        <span className="text-sm">{item}</span>
                        <Button variant="outline" size="sm" onClick={() => removeItem(index)}>
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button onClick={() => setItems([])}>Clear All</Button>
            <DrawerClose asChild>
              <Button variant="outline">Done</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};