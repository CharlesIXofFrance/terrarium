/**
 * Progress component for showing completion status
 */

import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className = '' }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}
    >
      <div
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
