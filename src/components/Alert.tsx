import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

interface AlertProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

const alertStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
    iconColor: 'text-red-400',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconColor: 'text-blue-400',
  },
};

export const Alert = ({ alert, onDismiss }: AlertProps) => {
  const { container, icon: Icon, iconColor } = alertStyles[alert.type];
  const { id, title, message, duration = 5000, dismissible = true } = alert;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div
      className={`border rounded-lg p-4 flex items-start space-x-3 ${container}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />

      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-medium mb-1">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>

      {dismissible && (
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
