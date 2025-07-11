/**
 * Centralized error handling for AI operations
 * Provides consistent error handling across all AI generation endpoints
 */

import { RateLimitError } from './rate-limiter';

export interface AIErrorHandlerOptions {
  operation: string;
  fallbackMessage?: string;
  userId?: string;
  onError?: (error: AIError) => void;
}

export interface AIError {
  type: 'rate_limit' | 'validation' | 'api' | 'network' | 'unknown';
  message: string;
  retryAfter?: number;
  resetTime?: number;
  remainingRequests?: number;
  originalError?: Error;
}

export class AIErrorHandler {
  static handleError(error: unknown, options: AIErrorHandlerOptions): AIError {
    const { operation, fallbackMessage, userId, onError } = options;

    let aiError: AIError;

    if (error instanceof RateLimitError) {
      aiError = {
        type: 'rate_limit',
        message: error.message,
        retryAfter: error.retryAfter,
        resetTime: error.resetTime,
        remainingRequests: error.remainingRequests,
        originalError: error,
      };
    } else if (error instanceof Error) {
      // Categorize different types of errors
      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        aiError = {
          type: 'network',
          message:
            'Network error occurred. Please check your connection and try again.',
          originalError: error,
        };
      } else if (
        error.message.includes('validation') ||
        error.message.includes('input')
      ) {
        aiError = {
          type: 'validation',
          message:
            'Invalid input provided. Please check your input and try again.',
          originalError: error,
        };
      } else if (
        error.message.includes('API') ||
        error.message.includes('Claude')
      ) {
        aiError = {
          type: 'api',
          message:
            'AI service is temporarily unavailable. Please try again in a moment.',
          originalError: error,
        };
      } else {
        aiError = {
          type: 'unknown',
          message:
            fallbackMessage ||
            'An unexpected error occurred. Please try again.',
          originalError: error,
        };
      }
    } else {
      aiError = {
        type: 'unknown',
        message:
          fallbackMessage || 'An unexpected error occurred. Please try again.',
        originalError:
          error instanceof Error ? error : new Error(String(error)),
      };
    }

    // Log error for monitoring
    console.error(
      `AI Error [${operation}]${userId ? ` for user ${userId}` : ''}:`,
      {
        type: aiError.type,
        message: aiError.message,
        originalError: aiError.originalError,
      }
    );

    // Call error callback if provided
    onError?.(aiError);

    return aiError;
  }

  static getUserFriendlyMessage(error: AIError): string {
    switch (error.type) {
      case 'rate_limit':
        return error.message; // Already user-friendly from rate limiter

      case 'validation':
        return 'Please check your input and try again.';

      case 'network':
        return 'Connection issue detected. Please check your internet and try again.';

      case 'api':
        return 'AI service is temporarily busy. Please try again in a moment.';

      case 'unknown':
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  static shouldRetry(error: AIError): boolean {
    return error.type === 'network' || error.type === 'api';
  }

  static getRetryDelay(error: AIError): number {
    if (error.type === 'rate_limit' && error.retryAfter) {
      return error.retryAfter * 1000; // Convert to milliseconds
    }
    if (error.type === 'network') {
      return 5000; // 5 seconds
    }
    if (error.type === 'api') {
      return 10000; // 10 seconds
    }
    return 0;
  }
}

/**
 * Decorator function to add consistent error handling to AI functions
 */
export function withAIErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: AIErrorHandlerOptions
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const aiError = AIErrorHandler.handleError(error, options);

      // Re-throw as the original error type if it's a rate limit error
      // so calling code can handle it appropriately
      if (
        aiError.type === 'rate_limit' &&
        aiError.originalError instanceof RateLimitError
      ) {
        throw aiError.originalError;
      }

      // For other errors, throw a generic error with user-friendly message
      throw new Error(AIErrorHandler.getUserFriendlyMessage(aiError));
    }
  };
}

/**
 * Utility to create standardized AI operation wrappers
 */
export class AIOperationWrapper {
  private operation: string;
  private fallbackMessage: string;

  constructor(operation: string, fallbackMessage: string) {
    this.operation = operation;
    this.fallbackMessage = fallbackMessage;
  }

  async execute<T>(
    fn: () => Promise<T>,
    userId?: string,
    onError?: (error: AIError) => void
  ): Promise<T> {
    return withAIErrorHandling(fn, {
      operation: this.operation,
      fallbackMessage: this.fallbackMessage,
      userId,
      onError,
    })();
  }

  wrap<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return withAIErrorHandling(fn, {
      operation: this.operation,
      fallbackMessage: this.fallbackMessage,
    });
  }
}

// Pre-configured wrappers for different AI operations
export const insightGenerationWrapper = new AIOperationWrapper(
  'generateInsight',
  'Unable to generate reading. Please try again.'
);

export const adviceGenerationWrapper = new AIOperationWrapper(
  'generateAdviceForUser',
  'Unable to generate advice. Please try again.'
);

export const robsTakeWrapper = new AIOperationWrapper(
  'generateRobsTake',
  "Unable to generate Rob's take. Please try again."
);

export const blockNameWrapper = new AIOperationWrapper(
  'generateUserBlockName',
  'Unable to generate block name. Please try again.'
);
