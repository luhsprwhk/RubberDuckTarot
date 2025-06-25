import { useState } from 'react';
import type { Alert } from '@/src/components/Alert';
import type { ReactNode } from 'react';
import AlertContext from './AlertContext';

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addAlert = (alertData: Omit<Alert, 'id'>) => {
    const alert: Alert = {
      id: generateId(),
      ...alertData,
    };
    setAlerts((prev) => [...prev, alert]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const showSuccess = (
    message: string,
    title?: string,
    options?: Partial<Alert>
  ) => {
    addAlert({
      type: 'success',
      message,
      title,
      duration: 5000,
      dismissible: true,
      ...options,
    });
  };

  const showError = (
    message: string,
    title?: string,
    options?: Partial<Alert>
  ) => {
    addAlert({
      type: 'error',
      message,
      title,
      duration: 0, // Errors don't auto-dismiss by default
      dismissible: true,
      ...options,
    });
  };

  const showWarning = (
    message: string,
    title?: string,
    options?: Partial<Alert>
  ) => {
    addAlert({
      type: 'warning',
      message,
      title,
      duration: 7000,
      dismissible: true,
      ...options,
    });
  };

  const showInfo = (
    message: string,
    title?: string,
    options?: Partial<Alert>
  ) => {
    addAlert({
      type: 'info',
      message,
      title,
      duration: 5000,
      dismissible: true,
      ...options,
    });
  };

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
