import React from 'react';
import { X } from 'lucide-react';

interface SelectedFiltersProps {
  filters: string[];
  labels: Record<string, string>;
  onRemove: (filterId: string) => void;
}

export function SelectedFilters({
  filters,
  labels,
  onRemove,
}: SelectedFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200">
      {filters.map((filterId) => (
        <button
          key={filterId}
          onClick={() => onRemove(filterId)}
          className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-100 transition-colors"
        >
          <span>{labels[filterId] || filterId}</span>
          <X className="h-4 w-4 ml-1.5 text-indigo-600" />
        </button>
      ))}
    </div>
  );
}
