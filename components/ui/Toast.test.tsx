import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  Toast, 
  ToastProvider, 
  ToastViewport, 
  ToastTitle, 
  ToastDescription, 
  ToastClose, 
  ToastAction 
} from './Toast';

describe('Toast Components', () => {
  it('should render toast provider', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render toast viewport', () => {
    render(
      <ToastProvider>
        <ToastViewport data-testid="toast-viewport" />
      </ToastProvider>
    );
    
    const viewport = screen.getByTestId('toast-viewport');
    expect(viewport).toBeInTheDocument();
  });

  it('should render toast with title and description', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast">
          <ToastTitle>Toast Title</ToastTitle>
          <ToastDescription>Toast Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    expect(screen.getByText('Toast Title')).toBeInTheDocument();
    expect(screen.getByText('Toast Description')).toBeInTheDocument();
  });

  it('should render toast close button', () => {
    const handleClose = jest.fn();
    
    render(
      <ToastProvider>
        <Toast>
          <ToastClose onClick={handleClose} data-testid="toast-close">
            Close
          </ToastClose>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    const closeButton = screen.getByTestId('toast-close');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('data-testid', 'toast-close');
  });

  it('should render toast action button', () => {
    const handleAction = jest.fn();
    
    render(
      <ToastProvider>
        <Toast>
          <ToastAction onClick={handleAction} altText="Undo action" data-testid="toast-action">
            Undo
          </ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    const actionButton = screen.getByTestId('toast-action');
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveAttribute('data-testid', 'toast-action');
    expect(actionButton).toHaveTextContent('Undo');
  });

  it('should apply custom className to toast components', () => {
    render(
      <ToastProvider>
        <Toast className="custom-toast-class" data-testid="toast">
          <ToastTitle className="custom-title-class">Title</ToastTitle>
          <ToastDescription className="custom-desc-class">Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    expect(screen.getByTestId('toast')).toHaveClass('custom-toast-class');
    expect(screen.getByText('Title')).toHaveClass('custom-title-class');
    expect(screen.getByText('Description')).toHaveClass('custom-desc-class');
  });

  it('should render toast with success variant', () => {
    render(
      <ToastProvider>
        <Toast variant="success" data-testid="toast">
          <ToastTitle>Success</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('border-green-500', 'bg-green-50', 'text-green-900');
  });

  it('should render toast with warning variant', () => {
    render(
      <ToastProvider>
        <Toast variant="warning" data-testid="toast">
          <ToastTitle>Warning</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('border-yellow-500', 'bg-yellow-50', 'text-yellow-900');
  });

  it('should render toast with destructive variant', () => {
    render(
      <ToastProvider>
        <Toast variant="destructive" data-testid="toast">
          <ToastTitle>Error</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('destructive', 'border-destructive', 'bg-destructive');
  });
});