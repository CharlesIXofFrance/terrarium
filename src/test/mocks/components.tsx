import React from 'react';
import { vi } from 'vitest';

// Mock UI components
export const Progress = vi.fn(
  ({ value, className = '' }: { value: number; className?: string }) => (
    <div
      data-testid="progress"
      data-value={value}
      className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}
    >
      <div
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
);

export const Button = vi.fn(
  ({
    children,
    isLoading,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    [key: string]: any;
  }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-[6px] ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <span data-testid="loading-spinner" />}
      {children}
    </button>
  )
);

export const Input = vi.fn(
  ({
    label,
    error,
    className = '',
    id,
    'aria-label': ariaLabel,
    placeholder,
    name,
    ...props
  }: {
    label?: string;
    error?: string;
    className?: string;
    id?: string;
    'aria-label'?: string;
    placeholder?: string;
    name?: string;
    [key: string]: any;
  }) => {
    const inputId = id || name;
    const accessibleLabel = ariaLabel || label || placeholder;

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          name={name}
          aria-label={accessibleLabel}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

export const Select = vi.fn(
  ({
    label,
    error,
    className = '',
    id,
    children,
    ...props
  }: {
    label?: string;
    error?: string;
    className?: string;
    id?: string;
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div className="relative">
      {label && (
        <label
          htmlFor={id || props.name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={id || props.name}
        className={`mt-1 block w-full rounded-md ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
);

// Mock component paths
vi.mock('@/components/ui/atoms/Progress', () => ({ Progress }));
vi.mock('@/components/ui/atoms/Button', () => ({ Button }));
vi.mock('@/components/ui/atoms/Input', () => ({
  Input: ({ 'aria-label': ariaLabel, ...props }: any) => (
    <input
      data-testid="mock-input"
      aria-label={ariaLabel || props.placeholder}
      {...props}
    />
  ),
}));
vi.mock('@/components/ui/atoms/Select', () => ({ Select }));
