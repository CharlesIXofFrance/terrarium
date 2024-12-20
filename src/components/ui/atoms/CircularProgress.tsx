import React from 'react';
import { cn } from '../../../lib/utils';

interface CircularProgressProps {
  value: number;
  icon: React.ReactNode;
  className?: string;
  positiveDirection?: 'up' | 'down';
}

export function CircularProgress({
  value,
  icon,
  className,
  positiveDirection = 'up',
}: CircularProgressProps) {
  const normalizedValue = Math.min(Math.max(Math.abs(value), 0), 100);
  const isPositive = positiveDirection === 'up' ? value >= 0 : value < 0;
  const strokeColor = isPositive ? '#059669' : '#DC2626';

  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDasharray = `${(normalizedValue / 100) * circumference} ${circumference}`;

  return (
    <div className={cn('relative w-10 h-10', className)}>
      <svg className="w-10 h-10 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeDasharray={strokeDasharray}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
