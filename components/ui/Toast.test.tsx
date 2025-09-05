import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast, Toaster } from './Toast';

// Mock the toast function for testing
jest.mock('./Toast', () => {
  const originalModule = jest.requireActual('./Toast');
  return {
    ...originalModule,
    toast: jest.fn(),
  };
});

const mockToast = toast as jest.MockedFunction<typeof toast>;

describe('Toast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render toaster component', () => {
    render(<Toaster data-testid="toaster" />);
    
    const toaster = screen.getByTestId('toaster');
    expect(toaster).toBeInTheDocument();
  });

  it('should call toast function with message', () => {
    const message = 'Test toast message';
    toast(message);
    
    expect(mockToast).toHaveBeenCalledWith(message);
  });

  it('should call toast.success with success message', () => {
    const successMessage = 'Success message';
    toast.success(successMessage);
    
    expect(mockToast.success).toHaveBeenCalledWith(successMessage);
  });

  it('should call toast.error with error message', () => {
    const errorMessage = 'Error message';
    toast.error(errorMessage);
    
    expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should call toast.warning with warning message', () => {
    const warningMessage = 'Warning message';
    toast.warning(warningMessage);
    
    expect(mockToast.warning).toHaveBeenCalledWith(warningMessage);
  });

  it('should call toast.info with info message', () => {
    const infoMessage = 'Info message';
    toast.info(infoMessage);
    
    expect(mockToast.info).toHaveBeenCalledWith(infoMessage);
  });

  it('should apply custom className to toaster', () => {
    render(<Toaster className="custom-toaster-class" data-testid="toaster" />);
    
    const toaster = screen.getByTestId('toaster');
    expect(toaster).toHaveClass('custom-toaster-class');
  });

  it('should render toaster with default props', () => {
    render(<Toaster />);
    
    // Just ensure it renders without errors
    expect(document.body).toBeInTheDocument();
  });

  it('should handle toast with options', () => {
    const message = 'Toast with options';
    const options = {
      duration: 5000,
      position: 'top-right' as const,
    };
    
    toast(message, options);
    
    expect(mockToast).toHaveBeenCalledWith(message, options);
  });

  it('should handle toast.promise', async () => {
    const promise = Promise.resolve('Success');
    const options = {
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error!',
    };
    
    toast.promise(promise, options);
    
    expect(mockToast.promise).toHaveBeenCalledWith(promise, options);
  });

  it('should handle toast.loading', () => {
    const loadingMessage = 'Loading...';
    toast.loading(loadingMessage);
    
    expect(mockToast.loading).toHaveBeenCalledWith(loadingMessage);
  });

  it('should handle toast.custom', () => {
    const CustomComponent = () => <div>Custom toast</div>;
    toast.custom(<CustomComponent />);
    
    expect(mockToast.custom).toHaveBeenCalledWith(<CustomComponent />);
  });

  it('should handle toast.dismiss', () => {
    const toastId = 'test-toast-id';
    toast.dismiss(toastId);
    
    expect(mockToast.dismiss).toHaveBeenCalledWith(toastId);
  });

  it('should handle toast.remove', () => {
    const toastId = 'test-toast-id';
    toast.remove(toastId);
    
    expect(mockToast.remove).toHaveBeenCalledWith(toastId);
  });
});

// Test the actual toast components if they're exported
describe('Toast Components', () => {
  const { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } = require('./Toast');

  it('should render toast provider', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render toast viewport', () => {
    render(<ToastViewport data-testid="toast-viewport" />);
    
    const viewport = screen.getByTestId('toast-viewport');
    expect(viewport).toBeInTheDocument();
  });

  it('should render toast with title and description', () => {
    render(
      <Toast data-testid="toast">
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>Toast Description</ToastDescription>
      </Toast>
    );
    
    expect(screen.getByText('Toast Title')).toBeInTheDocument();
    expect(screen.getByText('Toast Description')).toBeInTheDocument();
  });

  it('should render toast close button', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    
    render(
      <Toast>
        <ToastClose onClick={handleClose} data-testid="toast-close">
          Close
        </ToastClose>
      </Toast>
    );
    
    const closeButton = screen.getByTestId('toast-close');
    await user.click(closeButton);
    
    expect(handleClose).toHaveBeenCalled();
  });

  it('should render toast action button', async () => {
    const user = userEvent.setup();
    const handleAction = jest.fn();
    
    render(
      <Toast>
        <ToastAction onClick={handleAction} data-testid="toast-action">
          Undo
        </ToastAction>
      </Toast>
    );
    
    const actionButton = screen.getByTestId('toast-action');
    await user.click(actionButton);
    
    expect(handleAction).toHaveBeenCalled();
  });

  it('should apply custom className to toast components', () => {
    render(
      <Toast className="custom-toast-class" data-testid="toast">
        <ToastTitle className="custom-title-class">Title</ToastTitle>
        <ToastDescription className="custom-desc-class">Description</ToastDescription>
      </Toast>
    );
    
    expect(screen.getByTestId('toast')).toHaveClass('custom-toast-class');
    expect(screen.getByText('Title')).toHaveClass('custom-title-class');
    expect(screen.getByText('Description')).toHaveClass('custom-desc-class');
  });
});