import React from 'react';
import { forwardRef } from 'react';
import {
  XCircleIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
} from 'lucide-react';

interface AlertProps {
  title?: string;
  message: string | Error;
  variant?: 'error' | 'warning' | 'success' | 'info';
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const icons = {
  error: XCircleIcon,
  warning: AlertCircleIcon,
  success: CheckCircleIcon,
  info: InfoIcon,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { title, message, variant = 'error', onRetry, className, children },
    ref
  ) => {
    const styles = {
      container: 'rounded-md border p-4',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };

    const Icon = icons[variant];
    const errorMessage = message instanceof Error ? message.message : message;
    const errorTitle =
      title || (message instanceof Error ? message.name : 'Error');

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={`${styles.container} ${styles[variant]} ${className || ''}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 text-${variant}`} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium text-${variant}`}>
              {errorTitle}
            </h3>
            <div className={`mt-2 text-sm text-${variant}`}>{errorMessage}</div>
            {onRetry && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onRetry}
                  className={`rounded-md px-3 py-2 text-sm font-medium bg-${variant}-50 text-${variant}-600 hover:bg-${variant}-100`}
                  aria-label="Try Again"
                >
                  Try Again
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  }
);
