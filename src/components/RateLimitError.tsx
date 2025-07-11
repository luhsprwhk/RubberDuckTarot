import React from 'react';
import { RateLimitError as RateLimitErrorType } from '../lib/rate-limiter';

interface RateLimitErrorProps {
  error: RateLimitErrorType;
  onRetry?: () => void;
  className?: string;
}

export const RateLimitError: React.FC<RateLimitErrorProps> = ({
  error,
  onRetry,
  className = '',
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const formatResetTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Usage Limit Reached
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{error.message}</p>
            {error.retryAfter > 0 && (
              <p className="mt-1">
                You can try again in {formatTime(error.retryAfter)}.
              </p>
            )}
            {error.resetTime && (
              <p className="mt-1">
                Your usage limit resets at {formatResetTime(error.resetTime)}.
              </p>
            )}
            {error.remainingRequests > 0 && (
              <p className="mt-1">
                You have {error.remainingRequests} request
                {error.remainingRequests !== 1 ? 's' : ''} remaining.
              </p>
            )}
          </div>
          {onRetry && error.retryAfter > 0 && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface RateLimitInfoProps {
  remainingRequests: number;
  resetTime: number;
  operationName: string;
  className?: string;
}

export const RateLimitInfo: React.FC<RateLimitInfoProps> = ({
  remainingRequests,
  resetTime,
  operationName,
  className = '',
}) => {
  const formatResetTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (remaining: number): string => {
    if (remaining > 10) return 'text-green-600';
    if (remaining > 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className={`text-xs ${getStatusColor(remainingRequests)} ${className}`}
    >
      {remainingRequests} {operationName} remaining until{' '}
      {formatResetTime(resetTime)}
    </div>
  );
};

export default RateLimitError;
