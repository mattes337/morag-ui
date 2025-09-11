import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const toasts: Toast[] = [];
let toastId = 0;

export function useToast() {
  const [, forceUpdate] = useState({});

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
      const id = (toastId++).toString();
      const newToast: Toast = { id, title, description, variant, duration };
      
      toasts.push(newToast);
      forceUpdate({});

      // Auto-remove toast after duration
      setTimeout(() => {
        const index = toasts.findIndex(t => t.id === id);
        if (index > -1) {
          toasts.splice(index, 1);
          forceUpdate({});
        }
      }, duration);

      return newToast;
    },
    []
  );

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      const index = toasts.findIndex(t => t.id === toastId);
      if (index > -1) {
        toasts.splice(index, 1);
        forceUpdate({});
      }
    } else {
      toasts.length = 0;
      forceUpdate({});
    }
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
}