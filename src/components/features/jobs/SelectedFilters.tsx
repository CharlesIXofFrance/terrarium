import React from 'react';
import { X } from 'lucide-react';

interface SelectedFiltersProps {
  filters: string[];
  labels: Record<string, string>;
  onRemove: (filterId: string) => void;
  primaryColor?: string;
}

export function SelectedFilters({
  filters,
  labels,
  onRemove,
  primaryColor = '#E86C3A',
}: SelectedFiltersProps) {
  if (filters.length === 0) return null;

  // Calculate lighter background color (20% opacity)
  const bgColor = `${primaryColor}33`;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filterId) => (
        <button
          key={filterId}
          onClick={() => onRemove(filterId)}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors"
          style={{
            backgroundColor: bgColor,
            color: primaryColor,
          }}
        >
          <span>{labels[filterId] || filterId}</span>
          <X className="h-4 w-4 ml-1.5" style={{ color: primaryColor }} />
        </button>
      ))}
    </div>
  );
}
