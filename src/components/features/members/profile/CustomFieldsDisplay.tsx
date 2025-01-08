import React from 'react';
import type { FieldDefinition } from '@/lib/types/profile';
import { formatFieldValue } from '@/lib/utils/fieldDefinitions';

interface CustomFieldsDisplayProps {
  fieldDefinitions: FieldDefinition[];
  values: Record<string, any>;
  className?: string;
}

export function CustomFieldsDisplay({
  fieldDefinitions,
  values,
  className = '',
}: CustomFieldsDisplayProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {fieldDefinitions
        .sort((a, b) => a.display_order - b.display_order)
        .map((field) => (
          <div key={field.name} className="space-y-1">
            <dt className="text-sm font-medium text-gray-500">{field.name}</dt>
            <dd
              className="text-sm text-gray-900"
              data-testid={`field-value-${field.name}`}
            >
              {formatFieldValue(values[field.name], field) || '—'}
            </dd>
            {field.help_text && (
              <p className="text-xs text-gray-500">{field.help_text}</p>
            )}
          </div>
        ))}
    </div>
  );
}
