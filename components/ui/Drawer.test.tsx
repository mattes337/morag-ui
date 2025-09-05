import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('Drawer', () => {
  it('should not show drawer initially when closed', () => {
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    expect(screen.queryByText('Drawer Title')).not.toBeInTheDocument();
  });

  it('should show drawer when opened', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>This is a drawer description</DrawerDescription>
        </DrawerContent>
      </Drawer>
    );
    
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('This is a drawer description')).toBeInTheDocument();
  });

  it('should close drawer when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerClose asChild>
            <button>Close</button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
    
    // Open drawer
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    });
    
    // Close drawer
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Drawer Title')).not.toBeInTheDocument();
    });
  });

  it('should call onOpenChange when drawer state changes', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    
    render(
      <Drawer onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should support controlled state', async () => {
    const ControlledDrawer = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <>
          <button onClick={() => setOpen(true)}>External Open</button>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <button>Open Drawer</button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerTitle>Drawer Title</DrawerTitle>
            </DrawerContent>
          </Drawer>
        </>
      );
    };
    
    const user = userEvent.setup();
    render(<ControlledDrawer />);
    
    // Open via external button
    const externalButton = screen.getByText('External Open');
    await user.click(externalButton);
    
    await waitFor(() => {
      expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    });
  });

  it('should apply different side positions', () => {
    const { rerender } = render(
      <Drawer open={true}>
        <DrawerContent side="left" data-testid="drawer-content">
          <DrawerTitle>Test</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    expect(screen.getByTestId('drawer-content')).toHaveClass('left-0');
    
    rerender(
      <Drawer open={true}>
        <DrawerContent side="right" data-testid="drawer-content">
          <DrawerTitle>Test</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    expect(screen.getByTestId('drawer-content')).toHaveClass('right-0');
    
    rerender(
      <Drawer open={true}>
        <DrawerContent side="top" data-testid="drawer-content">
          <DrawerTitle>Test</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    expect(screen.getByTestId('drawer-content')).toHaveClass('top-0');
    
    rerender(
      <Drawer open={true}>
        <DrawerContent side="bottom" data-testid="drawer-content">
          <DrawerTitle>Test</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    expect(screen.getByTestId('drawer-content')).toHaveClass('bottom-0');
  });

  it('should support different sizes', () => {
    render(
      <Drawer open={true}>
        <DrawerContent side="right" size="sm" data-testid="drawer-content">
          <DrawerTitle>Small Drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    expect(screen.getByTestId('drawer-content')).toHaveClass('w-80');
  });

  it('should close drawer on overlay click by default', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    // Open drawer
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    });
    
    // Click overlay
    const overlay = screen.getByTestId('drawer-overlay');
    await user.click(overlay);
    
    await waitFor(() => {
      expect(screen.queryByText('Drawer Title')).not.toBeInTheDocument();
    });
  });

  it('should prevent closing on overlay click when modal=false', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent modal={false}>
          <DrawerTitle>Non-modal Drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    // Open drawer
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Non-modal Drawer')).toBeInTheDocument();
    });
    
    // No overlay should exist in non-modal
    expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();
  });

  it('should handle escape key to close drawer', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    // Open drawer
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    });
    
    // Press escape
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('Drawer Title')).not.toBeInTheDocument();
    });
  });

  it('should support custom className', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent className="custom-drawer" data-testid="drawer-content">
          <DrawerTitle>Custom Drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toHaveClass('custom-drawer');
    });
  });

  it('should have proper accessibility attributes', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>This is a drawer description</DrawerDescription>
        </DrawerContent>
      </Drawer>
    );
    
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();
      expect(drawer).toHaveAttribute('aria-describedby');
      expect(drawer).toHaveAttribute('aria-labelledby');
    });
  });

  it('should render with structured content', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Structured Drawer</DrawerTitle>
            <DrawerDescription>With header, body, and footer</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p>Content goes here</p>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <button>Close</button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
    
    const trigger = screen.getByText('Open Drawer');
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Structured Drawer')).toBeInTheDocument();
      expect(screen.getByText('With header, body, and footer')).toBeInTheDocument();
      expect(screen.getByText('Content goes here')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  it('should forward ref correctly', async () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(
      <Drawer open={true}>
        <DrawerContent ref={ref}>
          <DrawerTitle>Test</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
    
    // Wait for the content to render
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});