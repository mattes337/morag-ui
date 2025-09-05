import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('should render with title and description', () => {
    render(
      <EmptyState
        title="No results found"
        description="Try adjusting your search criteria"
      />
    );
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const MockIcon = () => <svg data-testid="mock-icon">Icon</svg>;
    
    render(
      <EmptyState
        icon={<MockIcon />}
        title="No data"
        description="No data available"
      />
    );
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render with action button', async () => {
    const user = userEvent.setup();
    const handleAction = jest.fn();
    
    render(
      <EmptyState
        title="No items"
        description="Get started by creating your first item"
        actionText="Create Item"
        onAction={handleAction}
      />
    );
    
    const actionButton = screen.getByText('Create Item');
    expect(actionButton).toBeInTheDocument();
    
    await user.click(actionButton);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should render with secondary action', async () => {
    const user = userEvent.setup();
    const handleSecondaryAction = jest.fn();
    
    render(
      <EmptyState
        title="No results"
        description="No matches found"
        actionText="Try again"
        onAction={() => {}}
        secondaryActionText="Clear filters"
        onSecondaryAction={handleSecondaryAction}
      />
    );
    
    const secondaryButton = screen.getByText('Clear filters');
    expect(secondaryButton).toBeInTheDocument();
    
    await user.click(secondaryButton);
    expect(handleSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('should apply different sizes', () => {
    const { rerender } = render(
      <EmptyState
        title="Small empty state"
        description="This is small"
        size="sm"
        data-testid="empty-state"
      />
    );
    
    expect(screen.getByTestId('empty-state')).toHaveClass('max-w-xs');
    
    rerender(
      <EmptyState
        title="Large empty state"
        description="This is large"
        size="lg"
        data-testid="empty-state"
      />
    );
    
    expect(screen.getByTestId('empty-state')).toHaveClass('max-w-xl');
  });

  it('should apply different variants', () => {
    const { rerender } = render(
      <EmptyState
        title="Default state"
        description="Default variant"
        variant="default"
        data-testid="empty-state"
      />
    );
    
    // Default variant has no special border styling
    expect(screen.getByTestId('empty-state')).not.toHaveClass('border-destructive');
    
    rerender(
      <EmptyState
        title="Error state"
        description="Something went wrong"
        variant="error"
        data-testid="empty-state"
      />
    );
    
    expect(screen.getByTestId('empty-state')).toHaveClass('border-destructive/20');
  });

  it('should render with custom children instead of description', () => {
    render(
      <EmptyState title="Custom content">
        <div data-testid="custom-content">
          <p>This is custom content</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </EmptyState>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('This is custom content')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should support custom className', () => {
    render(
      <EmptyState
        title="Test"
        description="Test description"
        className="custom-class"
        data-testid="empty-state"
      />
    );
    
    expect(screen.getByTestId('empty-state')).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(
      <EmptyState
        ref={ref}
        title="Test"
        description="Test description"
      />
    );
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have proper accessibility attributes', () => {
    render(
      <EmptyState
        title="No data"
        description="No data available"
        data-testid="empty-state"
      />
    );
    
    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toHaveAttribute('role', 'region');
    expect(emptyState).toHaveAttribute('aria-label', 'Empty state');
  });

  it('should render without description when only title provided', () => {
    render(
      <EmptyState title="Just a title" data-testid="empty-state" />
    );
    
    expect(screen.getByText('Just a title')).toBeInTheDocument();
    // Should not render empty description element
    expect(screen.getByTestId('empty-state').querySelector('p')).not.toBeInTheDocument();
  });

  it('should render loading variant with animation', () => {
    render(
      <EmptyState
        title="Loading..."
        description="Please wait"
        variant="loading"
        data-testid="empty-state"
      />
    );
    
    expect(screen.getByTestId('empty-state')).toHaveClass('animate-pulse');
  });

  it('should not render action buttons when no handlers provided', () => {
    render(
      <EmptyState
        title="No actions"
        description="No action handlers"
        actionText="Should not appear"
        secondaryActionText="Also should not appear"
      />
    );
    
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
    expect(screen.queryByText('Also should not appear')).not.toBeInTheDocument();
  });

  it('should handle action button variants', () => {
    render(
      <EmptyState
        title="Actions"
        description="Different action variants"
        actionText="Primary Action"
        onAction={() => {}}
        actionVariant="default"
        secondaryActionText="Secondary Action"
        onSecondaryAction={() => {}}
        secondaryActionVariant="outline"
      />
    );
    
    const primaryButton = screen.getByText('Primary Action');
    const secondaryButton = screen.getByText('Secondary Action');
    
    expect(primaryButton).toHaveClass('bg-primary');
    expect(secondaryButton).toHaveClass('border');
  });

  it('should support icon with different sizes', () => {
    const MockIcon = () => <svg data-testid="icon" className="h-12 w-12">Icon</svg>;
    
    render(
      <EmptyState
        icon={<MockIcon />}
        title="With Icon"
        description="Icon test"
        size="lg"
      />
    );
    
    const icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-12', 'w-12');
  });

  it('should render compact layout', () => {
    render(
      <EmptyState
        title="Compact"
        description="Compact layout"
        compact
        data-testid="empty-state"
      />
    );
    
    expect(screen.getByTestId('empty-state')).toHaveClass('py-4');
  });

  it('should support disabled action buttons', () => {
    render(
      <EmptyState
        title="Disabled Actions"
        description="Actions are disabled"
        actionText="Disabled Action"
        onAction={() => {}}
        actionDisabled
        secondaryActionText="Also Disabled"
        onSecondaryAction={() => {}}
        secondaryActionDisabled
      />
    );
    
    expect(screen.getByText('Disabled Action')).toBeDisabled();
    expect(screen.getByText('Also Disabled')).toBeDisabled();
  });
});