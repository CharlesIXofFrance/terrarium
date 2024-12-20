import React from 'react';
import { cn } from '../../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn('h-2 bg-gray-200 rounded-full overflow-hidden', className)}
    >
      <div
        className={cn(
          'h-full transition-all duration-500 ease-out',
          barClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
