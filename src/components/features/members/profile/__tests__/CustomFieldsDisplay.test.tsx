import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { CustomFieldsDisplay } from '../CustomFieldsDisplay';
import type { FieldDefinition } from '@/lib/types/profile';

describe('CustomFieldsDisplay', () => {
  const mockFieldDefinitions: FieldDefinition[] = [
    {
      name: 'Text Field',
      type: 'text',
      required: true,
      help_text: 'This is a text field',
      display_order: 1,
    },
    {
      name: 'Number Field',
      type: 'number',
      required: false,
      help_text: 'This is a number field',
      display_order: 2,
    },
    {
      name: 'Select Field',
      type: 'select',
      required: true,
      help_text: 'This is a select field',
      display_order: 3,
      options: ['Option 1', 'Option 2'],
    },
  ];

  const mockValues = {
    'Text Field': 'Sample text',
    'Number Field': 42,
    'Select Field': 'Option 1',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders field labels and values correctly', () => {
    render(
      <CustomFieldsDisplay
        fieldDefinitions={mockFieldDefinitions}
        values={mockValues}
      />
    );

    mockFieldDefinitions.forEach((field) => {
      expect(screen.getByText(field.name)).toBeInTheDocument();
    });

    expect(screen.getByText('Sample text')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders help text when provided', () => {
    render(
      <CustomFieldsDisplay
        fieldDefinitions={mockFieldDefinitions}
        values={mockValues}
      />
    );

    mockFieldDefinitions.forEach((field) => {
      expect(screen.getByText(field.help_text)).toBeInTheDocument();
    });
  });

  it('displays em dash for missing values', () => {
    const incompleteValues = {
      'Text Field': 'Sample text',
    };

    render(
      <CustomFieldsDisplay
        fieldDefinitions={mockFieldDefinitions}
        values={incompleteValues}
      />
    );

    expect(screen.getByTestId('field-value-Text Field')).toHaveTextContent(
      'Sample text'
    );
    expect(screen.getByTestId('field-value-Number Field')).toHaveTextContent(
      '—'
    );
    expect(screen.getByTestId('field-value-Select Field')).toHaveTextContent(
      '—'
    );
  });

  it('respects display order of fields', () => {
    const unorderedFields = [
      { ...mockFieldDefinitions[2], display_order: 3 },
      { ...mockFieldDefinitions[0], display_order: 1 },
      { ...mockFieldDefinitions[1], display_order: 2 },
    ];

    render(
      <CustomFieldsDisplay
        fieldDefinitions={unorderedFields}
        values={mockValues}
      />
    );

    const fieldLabels = screen.getAllByRole('term');
    expect(fieldLabels[0]).toHaveTextContent('Text Field');
    expect(fieldLabels[1]).toHaveTextContent('Number Field');
    expect(fieldLabels[2]).toHaveTextContent('Select Field');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <CustomFieldsDisplay
        fieldDefinitions={mockFieldDefinitions}
        values={mockValues}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
