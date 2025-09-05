import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'loading', 'minimal'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    actionVariant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    secondaryActionVariant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    compact: {
      control: 'boolean',
    },
    actionDisabled: {
      control: 'boolean',
    },
    secondaryActionDisabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// Icons for the stories
const SearchIcon = () => (
  <svg
    className="h-12 w-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const DocumentIcon = () => (
  <svg
    className="h-12 w-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.150 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
    />
  </svg>
);

const ExclamationIcon = () => (
  <svg
    className="h-12 w-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12V15z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="h-12 w-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

export const Default: Story = {
  args: {
    title: 'No results found',
    description: 'We couldn\'t find any matches for your search. Try adjusting your search terms.',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <SearchIcon />,
    title: 'No search results',
    description: 'We couldn\'t find anything matching your search. Try different keywords or check your spelling.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <DocumentIcon />,
    title: 'No documents yet',
    description: 'Get started by creating your first document.',
    actionText: 'Create Document',
    onAction: () => alert('Creating document...'),
  },
};

export const WithSecondaryAction: Story = {
  args: {
    icon: <SearchIcon />,
    title: 'No results found',
    description: 'We couldn\'t find any matches for your current filters.',
    actionText: 'Create New Item',
    onAction: () => alert('Creating new item...'),
    secondaryActionText: 'Clear Filters',
    onSecondaryAction: () => alert('Clearing filters...'),
  },
};

export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    icon: <ExclamationIcon />,
    title: 'Something went wrong',
    description: 'We encountered an error while loading your data. Please try again.',
    actionText: 'Try Again',
    onAction: () => alert('Retrying...'),
    actionVariant: 'destructive',
  },
};

export const LoadingVariant: Story = {
  args: {
    variant: 'loading',
    title: 'Loading...',
    description: 'Please wait while we fetch your data.',
  },
};

export const MinimalVariant: Story = {
  args: {
    variant: 'minimal',
    title: 'Empty inbox',
    description: 'All caught up! No new messages.',
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    icon: <SearchIcon />,
    title: 'No matches',
    description: 'Try different keywords.',
    actionText: 'Reset',
    onAction: () => alert('Resetting...'),
  },
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    icon: <PlusIcon />,
    title: 'Welcome to your dashboard',
    description: 'This is where your content will appear once you start creating. Get started by adding your first item.',
    actionText: 'Get Started',
    onAction: () => alert('Getting started...'),
    actionVariant: 'default',
  },
};

export const CompactLayout: Story = {
  args: {
    compact: true,
    title: 'No items in this category',
    description: 'Items you add will appear here.',
    actionText: 'Add Item',
    onAction: () => alert('Adding item...'),
    size: 'sm',
  },
};

export const WithCustomContent: Story = {
  args: {
    title: 'Connect your accounts'
  },
  render: (args) => (
    <EmptyState
      {...args}
      title="Connect your accounts"
      icon={<PlusIcon />}
    >
      <div className="mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          To get started, connect one of your accounts:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• GitHub for repository management</li>
          <li>• Slack for team communications</li>
          <li>• Google Drive for file storage</li>
        </ul>
      </div>
    </EmptyState>
  ),
};

export const DisabledActions: Story = {
  args: {
    icon: <DocumentIcon />,
    title: 'Feature coming soon',
    description: 'This feature is currently in development and will be available soon.',
    actionText: 'Get Notified',
    onAction: () => alert('Notification set!'),
    actionDisabled: true,
    secondaryActionText: 'Learn More',
    onSecondaryAction: () => alert('Opening docs...'),
    secondaryActionDisabled: true,
  },
};

export const InteractiveExample: Story = {
  args: {
    title: 'Interactive demo'
  },
  render: () => {
    const [hasItems, setHasItems] = React.useState(false);
    const [items, setItems] = React.useState<string[]>([]);
    
    const addItem = () => {
      const newItem = `Item ${items.length + 1}`;
      setItems(prev => [...prev, newItem]);
      setHasItems(true);
    };
    
    const clearItems = () => {
      setItems([]);
      setHasItems(false);
    };
    
    if (hasItems && items.length > 0) {
      return (
        <div className="space-y-4 max-w-md">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Your Items</h3>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={clearItems}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/80"
          >
            Clear All Items
          </button>
        </div>
      );
    }
    
    return (
      <EmptyState
        icon={<PlusIcon />}
        title="No items yet"
        description="Create your first item to get started with your collection."
        actionText="Add Item"
        onAction={addItem}
        secondaryActionText="Import Items"
        onSecondaryAction={() => alert('Import feature coming soon!')}
        secondaryActionVariant="outline"
      />
    );
  },
};

export const SearchResults: Story = {
  args: {
    title: 'Search demo'
  },
  render: () => {
    const [searchTerm, setSearchTerm] = React.useState('nonexistent-item');
    const [hasSearched, setHasSearched] = React.useState(true);
    
    const clearSearch = () => {
      setSearchTerm('');
      setHasSearched(false);
    };
    
    return (
      <div className="space-y-4 max-w-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-border rounded-md"
            placeholder="Search items..."
          />
          <button
            onClick={() => setHasSearched(true)}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          >
            Search
          </button>
        </div>
        
        {hasSearched && (
          <EmptyState
            icon={<SearchIcon />}
            title="No results found"
            description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.`}
            actionText="Clear Search"
            onAction={clearSearch}
            secondaryActionText="Browse All"
            onSecondaryAction={() => alert('Showing all items...')}
            secondaryActionVariant="outline"
            size="sm"
          />
        )}
      </div>
    );
  },
};