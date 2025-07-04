import { Bounce, toast, ToastPosition, TypeOptions } from 'react-toastify';

const showToast = (message: string, type: TypeOptions, position: ToastPosition = 'top-right') => {
  toast(message, {
    position: position,
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark',
    transition: Bounce,
    type: type,
    progressClassName: 'custom-progress', // Ensure this class is defined if used
  });
};

export const toastWithCustomMessages = {
  showSuccess: (message: string, position?: ToastPosition) => {
    showToast(message, 'success', position);
  },
  showError: (message: string, position?: ToastPosition) => {
    showToast(message, 'error', position);
  },
  showInfo: (message: string, position?: ToastPosition) => {
    showToast(message, 'info', position);
  },
  showWarning: (message: string, position?: ToastPosition) => {
    showToast(message, 'warning', position);
  },
};