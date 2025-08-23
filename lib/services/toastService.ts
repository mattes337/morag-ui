import { toast } from 'sonner';

export interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastService {
  /**
   * Show success toast
   */
  static success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Show error toast
   */
  static error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: options?.duration || 5000, // Longer duration for errors
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Show warning toast
   */
  static warning(message: string, options?: ToastOptions) {
    return toast.warning(message, {
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Show info toast
   */
  static info(message: string, options?: ToastOptions) {
    return toast.info(message, {
      duration: options?.duration,
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Show loading toast
   */
  static loading(message: string, options?: Omit<ToastOptions, 'action'>) {
    return toast.loading(message, {
      duration: options?.duration,
      description: options?.description,
    });
  }

  /**
   * Show promise toast (for async operations)
   */
  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return toast.promise(promise, messages);
  }

  /**
   * Dismiss a specific toast
   */
  static dismiss(toastId?: string | number) {
    return toast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll() {
    return toast.dismiss();
  }

  /**
   * Common error handler for API responses
   */
  static async handleApiError(response: Response, defaultMessage = 'An error occurred') {
    try {
      const errorData = await response.json();
      const message = errorData.error || errorData.message || defaultMessage;
      this.error(message);
      return message;
    } catch {
      this.error(defaultMessage);
      return defaultMessage;
    }
  }

  /**
   * Handle async operation with toast feedback
   */
  static async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    }
  ): Promise<T> {
    const loadingToast = this.loading(messages.loading);
    
    try {
      const result = await operation();
      this.dismiss(loadingToast);
      
      const successMessage = typeof messages.success === 'function' 
        ? messages.success(result) 
        : messages.success;
      this.success(successMessage);
      
      return result;
    } catch (error) {
      this.dismiss(loadingToast);
      
      const errorMessage = messages.error 
        ? (typeof messages.error === 'function' ? messages.error(error) : messages.error)
        : (error instanceof Error ? error.message : 'Operation failed');
      this.error(errorMessage);
      
      throw error;
    }
  }
}

// Export convenience methods
export const showToast = ToastService;
export default ToastService;
