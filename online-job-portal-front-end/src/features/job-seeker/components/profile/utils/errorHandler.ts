/**
 * Error handling utilities for profile API calls
 */

interface ApiError {
  status?: number | string;
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
    error?: string;
  };
}

interface SerializedError {
  message?: string;
  code?: string;
}

/**
 * Extract user-friendly error message from API error
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'An error occurred'
): string {
  // Check if it's an RTK Query error with data
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;

    // Network error
    if (apiError.status === 'FETCH_ERROR') {
      return 'Network error. Please check your connection.';
    }

    // Parse error data
    if (apiError.data) {
      // Custom error message from BE
      if (apiError.data.message) {
        return apiError.data.message;
      }

      // Validation errors from BE
      if (apiError.data.errors) {
        const errorMessages = Object.entries(apiError.data.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .join('\n');

        return errorMessages || defaultMessage;
      }

      // Generic error field
      if (apiError.data.error) {
        return apiError.data.error;
      }
    }

    // HTTP status errors
    if (apiError.status) {
      switch (apiError.status) {
        case 400:
          return 'Invalid request. Please check your data.';
        case 401:
          return 'Unauthorized. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'Resource not found.';
        case 409:
          return 'Conflict. This data already exists.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `Error ${apiError.status}: ${defaultMessage}`;
      }
    }
  }

  // Check if it's a serialized error
  if (error && typeof error === 'object' && 'message' in error) {
    const serializedError = error as SerializedError;
    return serializedError.message || defaultMessage;
  }

  // Fallback
  return defaultMessage;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return apiError.status === 'FETCH_ERROR';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return apiError.status === 401 || apiError.status === 403;
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return apiError.status === 422 || apiError.status === 400;
  }
  return false;
}
