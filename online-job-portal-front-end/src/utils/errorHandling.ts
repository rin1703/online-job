/**
 * Centralized Error Handling Utilities
 * Standardizes error message extraction and formatting across the application
 */

/**
 * API Error Structure (from backend)
 */
export interface ApiError {
  data?: {
    message?: string;
    errors?: Array<{ field: string; message: string }>;
    statusCode?: number;
  };
  message?: string;
  status?: number;
}

/**
 * Extract user-friendly error message from various error formats
 * Handles RTK Query errors, Axios errors, and standard Error objects
 *
 * @param error - Error object from API call or catch block
 * @param fallbackMessage - Default message if no specific error found
 * @returns User-friendly error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) {
    return fallbackMessage;
  }

  // RTK Query error format (most common)
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;

    // Check for nested data.message (most API responses)
    if (apiError.data?.message) {
      return apiError.data.message;
    }

    // Check for direct message property
    if (apiError.message) {
      return apiError.message;
    }

    // Check for validation errors array
    if (apiError.data?.errors && Array.isArray(apiError.data.errors) && apiError.data.errors.length > 0) {
      return apiError.data.errors.map(err => err.message).join(', ');
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Unknown error type
  return fallbackMessage;
}

/**
 * Extract field-specific validation errors from API response
 * Used for form validation error display
 *
 * @param error - Error object from API
 * @returns Object mapping field names to error messages
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const apiError = error as ApiError;

  if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
    return apiError.data.errors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {} as Record<string, string>);
  }

  return {};
}

/**
 * Check if error is a network error (no connection)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('fetch');
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.status === 0 || apiError.data?.statusCode === 0;
  }

  return false;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.status === 401 || apiError.data?.statusCode === 401;
  }
  return false;
}

/**
 * Check if error is a forbidden error (403)
 */
export function isForbiddenError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.status === 403 || apiError.data?.statusCode === 403;
  }
  return false;
}

/**
 * Check if error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.status === 404 || apiError.data?.statusCode === 404;
  }
  return false;
}

/**
 * Check if error is a server error (500+)
 */
export function isServerError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    const status = apiError.status || apiError.data?.statusCode || 0;
    return status >= 500;
  }
  return false;
}

/**
 * Format error for logging (includes more details)
 * Use this for console.error or error tracking services like Sentry
 */
export function formatErrorForLogging(error: unknown, context?: string): string {
  const errorMessage = getErrorMessage(error);
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    const status = apiError.status || apiError.data?.statusCode || 'unknown';
    return `${timestamp}${contextStr} - Status: ${status} - ${errorMessage}`;
  }

  return `${timestamp}${contextStr} - ${errorMessage}`;
}

/**
 * ErrorHandler class for consistent error handling in components
 * Usage:
 *   const errorHandler = new ErrorHandler('Profile Update');
 *   errorHandler.handle(error); // Logs and returns user message
 */
export class ErrorHandler {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Handle error: log it and return user-friendly message
   */
  handle(error: unknown, fallbackMessage?: string): string {
    const userMessage = getErrorMessage(error, fallbackMessage || `Failed to ${this.context.toLowerCase()}`);
    const logMessage = formatErrorForLogging(error, this.context);

    console.error(logMessage);

    // In production, send to error tracking service
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: { context: this.context } });
    // }

    return userMessage;
  }

  /**
   * Handle error and show toast notification
   */
  handleWithToast(error: unknown, toast: any, fallbackMessage?: string): void {
    const message = this.handle(error, fallbackMessage);
    toast.error(message);
  }
}
