import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { NotionService } from '../lib/notion/notion-service';
import { NotionOperations } from '../lib/notion/notion-operations';
import { useAlerts } from '../lib/alerts/AlertContext';

export default function NotionCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Exchange code for token
        const integration = await NotionService.exchangeCodeForToken(code);

        // Save integration to database
        await NotionOperations.saveNotionIntegration(user.id, integration);

        setStatus('success');
        addAlert('success', 'Successfully connected to Notion!');

        // Redirect back to the page they came from or insights
        setTimeout(() => {
          navigate('/insights', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('Notion callback error:', error);
        setStatus('error');
        addAlert('error', 'Failed to connect to Notion. Please try again.');

        setTimeout(() => {
          navigate('/insights', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, user, navigate, addAlert]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-surface rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Connecting to Notion...
              </h2>
              <p className="text-secondary">
                Please wait while we set up your Notion integration.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Successfully Connected!
              </h2>
              <p className="text-secondary">
                Your Notion workspace is now connected. You can now export your
                tarot readings to Notion.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-500 text-5xl mb-4">✗</div>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Connection Failed
              </h2>
              <p className="text-secondary">
                We couldn't connect to your Notion workspace. Please try again.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
