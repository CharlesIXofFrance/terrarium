import React from 'react';
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
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-400',
    title: 'text-red-800',
    description: 'text-red-700',
    button: 'bg-red-50 text-red-600 hover:bg-red-100',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    description: 'text-yellow-700',
    button: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-400',
    title: 'text-green-800',
    description: 'text-green-700',
    button: 'bg-green-50 text-green-600 hover:bg-green-100',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    description: 'text-blue-700',
    button: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  },
};

const icons = {
  error: XCircleIcon,
  warning: AlertCircleIcon,
  success: CheckCircleIcon,
  info: InfoIcon,
};

export function Alert({
  title,
  message,
  variant = 'error',
  onRetry,
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = icons[variant];
  const errorMessage = message instanceof Error ? message.message : message;
  const errorTitle =
    title || (message instanceof Error ? message.name : 'Error');

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-md border p-4 ${styles.container}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.icon}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {errorTitle}
          </h3>
          <div className={`mt-2 text-sm ${styles.description}`}>
            {errorMessage}
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className={`rounded-md px-3 py-2 text-sm font-medium ${styles.button}`}
                aria-label="Try Again"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
