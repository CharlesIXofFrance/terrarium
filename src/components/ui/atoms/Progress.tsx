import React from 'react';
import * as RadixProgress from '@radix-ui/react-progress';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
}) => {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <RadixProgress.Root
      className={`relative overflow-hidden bg-gray-200 rounded-full w-full h-2.5 ${className}`}
      value={percentage}
    >
      <RadixProgress.Indicator
        className="bg-primary h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </RadixProgress.Root>
  );
};
