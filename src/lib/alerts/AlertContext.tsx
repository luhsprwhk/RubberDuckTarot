import type { Alert } from '@/src/components/Alert';
import { createContext } from 'react';

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  showSuccess: (
    message: string,
    title?: string,
    options?: Partial<Alert>
  ) => void;
  showError: (
    message: string,
    title?: string,
    options?: Partial<Alert>
  ) => void;
  showWarning: (
    message: string,
    title?: string,
    options?: Partial<Alert>
  ) => void;
  showInfo: (message: string, title?: string, options?: Partial<Alert>) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export default AlertContext;
