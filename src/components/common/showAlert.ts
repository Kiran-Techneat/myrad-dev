import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

export type AlertStatus = 'success' | 'error' | 'info' | 'warning';

interface ShowAlertOptions {
  message: string;
  status: AlertStatus;
  autoClose?: number | false; // false = never auto close
}

export const showAlert = ({ message, status, autoClose = 3000 }: ShowAlertOptions): void => {
  const options: ToastOptions = {
    autoClose: autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  switch (status) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    case 'info':
    default:
      toast.info(message, options);
      break;
  }
};
