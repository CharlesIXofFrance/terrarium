/**
 * AI Context: MultiSelect Component
 *
 * This is a reusable multi-select component based on Radix UI's Select primitive.
 * It allows users to select multiple options from a dropdown list.
 *
 * Location: /src/components/ui/atoms/MultiSelect
 * - Part of the atomic design system
 * - Used across various features for multiple selection
 *
 * Responsibilities:
 * - Handle multiple selection
 * - Display selected items as tags
 * - Allow removing selected items
 * - Support keyboard navigation
 * - Maintain accessibility
 */

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = 'Select options...',
      error,
      disabled,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    };

    const removeValue = (optionValue: string) => {
      onChange(value.filter((v) => v !== optionValue));
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <SelectPrimitive.Root open={open} onOpenChange={setOpen}>
            <SelectPrimitive.Trigger
              ref={ref}
              className={cn(
                'w-full flex min-h-[2.5rem] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-red-500 focus:ring-red-500',
                className
              )}
              disabled={disabled}
            >
              <div className="flex flex-wrap gap-1">
                {value.length > 0 ? (
                  value.map((v) => {
                    const option = options.find((o) => o.value === v);
                    return (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs"
                      >
                        {option?.label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeValue(v);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-gray-400">{placeholder}</span>
                )}
              </div>
              <SelectPrimitive.Icon className="ml-2">
                <svg
                  className="h-4 w-4 opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-700 shadow-md animate-in fade-in-80"
                position="popper"
                sideOffset={5}
              >
                <SelectPrimitive.Viewport className="p-1">
                  {options.map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                        value.includes(option.value) && 'font-semibold'
                      )}
                      onSelect={(event) => {
                        event.preventDefault();
                        handleSelect(option.value);
                      }}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {value.includes(option.value) && (
                          <Check className="h-4 w-4" />
                        )}
                      </span>
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
