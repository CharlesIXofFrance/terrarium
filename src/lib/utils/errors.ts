/**
 * Auth error messages and handling utilities
 */

export const AUTH_ERRORS = {
  SERVER_ERROR: 'An unexpected error occurred',
  INVALID_CREDENTIALS: 'Invalid email or password',
  RATE_LIMITED: 'Too many attempts. Please try again in 15 minutes.',
  USER_EXISTS: 'An account with this email already exists',
  EMAIL_NOT_CONFIRMED: 'Please verify your email first',
  INVALID_LINK: 'Invalid or expired login link',
  COMMUNITY_NOT_FOUND: 'Community not found',
  UNAUTHORIZED: 'Unauthorized access. Please check your permissions.',
  INVALID_MFA: 'Invalid MFA code',
  MFA_REQUIRED: 'MFA verification required',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  INVALID_RESET_LINK: 'Invalid or expired password reset link',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password does not meet security requirements',
} as const;

export type AuthErrorType = keyof typeof AUTH_ERRORS;

export interface AuthError {
  message: AuthErrorType | string;
  status?: number;
  code?: string;
  details?: string;
  originalError?: Error;
}

export const createAuthError = (
  message: AuthErrorType | string,
  originalError?: Error,
  status?: number,
  code?: string,
  details?: string
): AuthError => ({
  message,
  status,
  code,
  details,
  originalError,
});

export const isAuthError = (error: unknown): error is AuthError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
};

export const mapAuthError = (error: Error | AuthError | unknown): string => {
  // If it's already an AuthError, use its message
  if (isAuthError(error)) {
    return AUTH_ERRORS[error.message as AuthErrorType] || error.message;
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (
      message.includes('invalid login credentials') ||
      message.includes('invalid email or password')
    ) {
      return AUTH_ERRORS.INVALID_CREDENTIALS;
    }

    if (message.includes('too many attempts')) {
      return AUTH_ERRORS.RATE_LIMITED;
    }

    if (message.includes('email already exists')) {
      return AUTH_ERRORS.USER_EXISTS;
    }

    if (message.includes('mfa required')) {
      return AUTH_ERRORS.MFA_REQUIRED;
    }

    if (message.includes('network') || message.includes('failed to fetch')) {
      return AUTH_ERRORS.NETWORK_ERROR;
    }

    if (
      message.includes('session expired') ||
      message.includes('invalid session')
    ) {
      return AUTH_ERRORS.SESSION_EXPIRED;
    }

    // Handle HTTP errors
    if (message.includes('http error')) {
      const statusMatch = message.match(/\d{3}/);
      if (statusMatch) {
        const status = parseInt(statusMatch[0]);
        switch (status) {
          case 400:
            return AUTH_ERRORS.INVALID_CREDENTIALS;
          case 401:
            return AUTH_ERRORS.UNAUTHORIZED;
          case 403:
            return AUTH_ERRORS.UNAUTHORIZED;
          case 404:
            return AUTH_ERRORS.COMMUNITY_NOT_FOUND;
          case 422:
            return AUTH_ERRORS.USER_EXISTS;
          case 429:
            return AUTH_ERRORS.RATE_LIMITED;
          default:
            return AUTH_ERRORS.SERVER_ERROR;
        }
      }
    }

    // Password-related errors
    if (message.includes('password') && message.includes('match')) {
      return AUTH_ERRORS.PASSWORD_MISMATCH;
    }

    if (
      message.includes('password') &&
      (message.includes('weak') || message.includes('requirements'))
    ) {
      return AUTH_ERRORS.WEAK_PASSWORD;
    }

    // Return the original error message if no specific mapping
    return error.message;
  }

  // For unknown error types
  return AUTH_ERRORS.SERVER_ERROR;
};

export const handleAuthError = (
  error: Error | AuthError | unknown
): AuthError => {
  if (isAuthError(error)) {
    return error;
  }

  const mappedMessage = mapAuthError(error);
  return createAuthError(
    mappedMessage,
    error instanceof Error ? error : undefined
  );
};

// Helper to determine if an error is retryable
export const isRetryableError = (
  error: Error | AuthError | unknown
): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('failed to fetch') ||
    message.includes('connection') ||
    (isAuthError(error) && error.status
      ? [500, 502, 503, 504].includes(error.status)
      : false)
  );
};

// Helper to determine if an error is related to rate limiting
export const isRateLimitError = (
  error: Error | AuthError | unknown
): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('too many attempts') ||
    message.includes('rate limit') ||
    (isAuthError(error) && error.status === 429)
  );
};
