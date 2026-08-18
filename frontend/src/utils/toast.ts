import { toast, ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  position: 'top-center',
  duration: 3000,
  style: {
    background: '#1a202c', // Màu nền tối sang trọng phù hợp TechVie
    color: '#fff',
    borderRadius: '12px',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    padding: '12px 18px',
  },
};

export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...defaultOptions,
    iconTheme: {
      primary: '#10b981', // Màu xanh lục emerald
      secondary: '#fff',
    },
    ...options,
  });
};

export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...defaultOptions,
    iconTheme: {
      primary: '#ef4444', // Màu đỏ rose
      secondary: '#fff',
    },
    ...options,
  });
};

export const showWarning = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...defaultOptions,
    icon: '⚠️',
    ...options,
  });
};
