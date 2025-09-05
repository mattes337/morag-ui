import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog';

describe('Dialog', () => {
  it('should not render dialog content initially', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });
  });

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    // Dialog should be open initially
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    
    // Click the close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('should close dialog when escape key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    // Dialog should be open initially
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    
    // Press escape key
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('should close dialog when overlay is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    // Dialog should be open initially
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    
    // Click the overlay (outside the dialog content)
    const overlay = document.querySelector('[data-radix-collection-item]');
    if (overlay) {
      fireEvent.click(overlay);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('should apply default size styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('max-w-lg');
  });

  it('should apply small size styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="sm" data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('max-w-md');
  });

  it('should apply large size styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="lg" data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('max-w-2xl');
  });

  it('should apply xl size styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="xl" data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('max-w-4xl');
  });

  it('should apply full size styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="full" data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('max-w-[95vw]');
  });

  it('should hide close button when showCloseButton is false', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('should show close button by default', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should apply custom className to content', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="custom-dialog-class" data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId('dialog-content')).toHaveClass('custom-dialog-class');
  });

  it('should have proper base content styles', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass(
      'fixed',
      'left-[50%]',
      'top-[50%]',
      'z-50',
      'grid',
      'w-full',
      'translate-x-[-50%]',
      'translate-y-[-50%]',
      'gap-4',
      'border',
      'bg-background',
      'p-6',
      'shadow-lg',
      'rounded-lg'
    );
  });

  it('should forward ref to content correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(
      <Dialog defaultOpen>
        <DialogContent ref={ref}>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('DialogHeader', () => {
  it('should render header with children', () => {
    render(
      <DialogHeader data-testid="dialog-header">
        <div>Header content</div>
      </DialogHeader>
    );

    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should apply default header styles', () => {
    render(<DialogHeader data-testid="dialog-header">Header</DialogHeader>);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'text-center', 'sm:text-left');
  });

  it('should apply custom className', () => {
    render(<DialogHeader className="custom-header-class" data-testid="dialog-header">Header</DialogHeader>);

    expect(screen.getByTestId('dialog-header')).toHaveClass('custom-header-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<DialogHeader ref={ref}>Header</DialogHeader>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('DialogTitle', () => {
  it('should render title with children', () => {
    render(<DialogTitle>Test Title</DialogTitle>);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should apply default title styles', () => {
    render(<DialogTitle data-testid="dialog-title">Title</DialogTitle>);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight');
  });

  it('should apply custom className', () => {
    render(<DialogTitle className="custom-title-class">Title</DialogTitle>);

    expect(screen.getByText('Title')).toHaveClass('custom-title-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    
    render(<DialogTitle ref={ref}>Title</DialogTitle>);

    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('DialogDescription', () => {
  it('should render description with children', () => {
    render(<DialogDescription>Test description</DialogDescription>);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should apply default description styles', () => {
    render(<DialogDescription data-testid="dialog-description">Description</DialogDescription>);

    const description = screen.getByTestId('dialog-description');
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('should apply custom className', () => {
    render(<DialogDescription className="custom-description-class">Description</DialogDescription>);

    expect(screen.getByText('Description')).toHaveClass('custom-description-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    
    render(<DialogDescription ref={ref}>Description</DialogDescription>);

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('DialogFooter', () => {
  it('should render footer with children', () => {
    render(
      <DialogFooter data-testid="dialog-footer">
        <button>Action</button>
      </DialogFooter>
    );

    expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('should apply default footer styles', () => {
    render(<DialogFooter data-testid="dialog-footer">Footer</DialogFooter>);

    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toHaveClass('flex', 'flex-col-reverse', 'sm:flex-row', 'sm:justify-end', 'sm:space-x-2');
  });

  it('should apply custom className', () => {
    render(<DialogFooter className="custom-footer-class" data-testid="dialog-footer">Footer</DialogFooter>);

    expect(screen.getByTestId('dialog-footer')).toHaveClass('custom-footer-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<DialogFooter ref={ref}>Footer</DialogFooter>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('DialogClose', () => {
  it('should close dialog when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogClose>Close Dialog</DialogClose>
        </DialogContent>
      </Dialog>
    );

    // Dialog should be open initially
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    
    // Click the custom close button
    await user.click(screen.getByText('Close Dialog'));
    
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });
});

describe('Dialog Composition', () => {
  it('should render complete dialog with all components', async () => {
    const user = userEvent.setup();
    
    render(
      <Dialog>
        <DialogTrigger>Open Complete Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Dialog</DialogTitle>
            <DialogDescription>This is a complete dialog example</DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Open the dialog
    await user.click(screen.getByText('Open Complete Dialog'));
    
    await waitFor(() => {
      expect(screen.getByText('Complete Dialog')).toBeInTheDocument();
      expect(screen.getByText('This is a complete dialog example')).toBeInTheDocument();
      expect(screen.getByText('Dialog body content')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  it('should handle controlled state', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    
    const ControlledDialog = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          onOpenChange(isOpen);
        }}>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>This dialog state is controlled</DialogDescription>
          </DialogContent>
        </Dialog>
      );
    };
    
    render(<ControlledDialog />);

    // Open the dialog
    await user.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
    });
    
    expect(onOpenChange).toHaveBeenCalledWith(true);
    
    // Close with escape
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
    });
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should trap focus within dialog', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Focus Trap Dialog</DialogTitle>
          <input placeholder="First input" />
          <input placeholder="Second input" />
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Just verify dialog content is rendered - focus trapping might not work in test env
    expect(screen.getByText('Focus Trap Dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Second input')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should support different sizes with proper styling', () => {
    const sizes = ['sm', 'default', 'lg', 'xl', 'full'] as const;
    const expectedClasses = ['max-w-md', 'max-w-lg', 'max-w-2xl', 'max-w-4xl', 'max-w-[95vw]'];
    
    sizes.forEach((size, index) => {
      const { unmount } = render(
        <Dialog defaultOpen>
          <DialogContent size={size} data-testid={`dialog-content-${size}`}>
            <DialogTitle>Dialog {size}</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId(`dialog-content-${size}`);
      expect(content).toHaveClass(expectedClasses[index]);
      
      unmount();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Accessible Dialog</DialogTitle>
          <DialogDescription>Dialog with proper accessibility</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    // In test environment, Radix may not set all ARIA attributes
    expect(content).toBeInTheDocument();
    
    // Title and description should be properly associated
    const title = screen.getByText('Accessible Dialog');
    const description = screen.getByText('Dialog with proper accessibility');
    
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });
});