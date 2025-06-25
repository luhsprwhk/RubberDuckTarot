import { Alert } from './Alert';
import useAlert from '@/src/hooks/useAlert';

export const AlertContainer = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {alerts.map((alert) => (
        <Alert key={alert.id} alert={alert} onDismiss={removeAlert} />
      ))}
    </div>
  );
};
