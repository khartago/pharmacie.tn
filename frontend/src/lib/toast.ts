// Simple toast notification system
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: ((toasts: Toast[]) => void)[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(message: string, type: Toast['type'] = 'info', duration: number = 5000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.push(toast);
    this.notify();

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();

// Convenience functions
export const showToast = (message: string, type: Toast['type'] = 'info', duration?: number) => {
  return toastManager.show(message, type, duration);
};

export const showSuccessToast = (message: string, duration?: number) => {
  return toastManager.show(message, 'success', duration);
};

export const showErrorToast = (message: string, duration?: number) => {
  return toastManager.show(message, 'error', duration);
};

export const showWarningToast = (message: string, duration?: number) => {
  return toastManager.show(message, 'warning', duration);
};

export const showInfoToast = (message: string, duration?: number) => {
  return toastManager.show(message, 'info', duration);
};
