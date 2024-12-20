import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Palette,
  Type,
  Layout,
  Moon,
  Grid,
} from 'lucide-react';
import { Input } from '../ui/atoms/Input';
import { FONTS } from '../../lib/hooks/useStyles';

interface StyleEditorProps {
  styles: any;
  onChange: (category: string, property: string, value: any) => void;
  expandedSection: string | null;
  setExpandedSection: (section: string | null) => void;
}

const sections = [
  {
    id: 'colors',
    name: 'Global Colors',
    icon: Palette,
    description: "Define your community's color scheme",
    fields: [
      { key: 'primary', label: 'Primary Color' },
      { key: 'secondary', label: 'Secondary Color' },
      { key: 'background', label: 'Background Color' },
      { key: 'surface', label: 'Surface Color' },
      { key: 'text', label: 'Text Color' },
      { key: 'textSecondary', label: 'Secondary Text' },
      { key: 'accent', label: 'Accent Color' },
    ],
  },
  {
    id: 'typography',
    name: 'Typography',
    icon: Type,
    description: 'Customize fonts and text styles',
    fields: [
      {
        key: 'headingFont',
        label: 'Heading Font',
        type: 'select',
        options: Object.keys(FONTS),
      },
      {
        key: 'bodyFont',
        label: 'Body Font',
        type: 'select',
        options: Object.keys(FONTS),
      },
      {
        key: 'baseSize',
        label: 'Base Size (px)',
        type: 'number',
        min: 12,
        max: 20,
      },
      {
        key: 'scale',
        label: 'Scale Ratio',
        type: 'number',
        step: 0.05,
        min: 1.1,
        max: 1.5,
      },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: Grid,
    description: 'Configure page layout and spacing',
    fields: [
      {
        key: 'maxWidth',
        label: 'Max Width',
        type: 'select',
        options: ['1200px', '1400px', '1600px'],
      },
      {
        key: 'contentPadding',
        label: 'Content Padding',
        type: 'select',
        options: ['16px', '24px', '32px', '48px'],
      },
      {
        key: 'sectionSpacing',
        label: 'Section Spacing',
        type: 'select',
        options: ['24px', '32px', '48px', '64px'],
      },
    ],
  },
  {
    id: 'components',
    name: 'Components',
    icon: Layout,
    description: 'Style individual UI components',
    fields: [
      {
        key: 'cardStyle',
        label: 'Card Style',
        type: 'select',
        options: ['minimal', 'bordered', 'elevated'],
      },
      {
        key: 'buttonStyle',
        label: 'Button Style',
        type: 'select',
        options: ['rounded', 'pill', 'sharp'],
      },
      {
        key: 'inputStyle',
        label: 'Input Style',
        type: 'select',
        options: ['minimal', 'bordered', 'filled'],
      },
    ],
  },
  {
    id: 'effects',
    name: 'Effects',
    icon: Moon,
    description: 'Configure visual effects and animations',
    fields: [
      {
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'select',
        options: ['0px', '4px', '8px', '12px', '16px'],
      },
      {
        key: 'shadowLevel',
        label: 'Shadow Level',
        type: 'select',
        options: ['none', 'light', 'medium', 'heavy'],
      },
      { key: 'transitions', label: 'Enable Transitions', type: 'checkbox' },
      { key: 'animations', label: 'Enable Animations', type: 'checkbox' },
    ],
  },
];

export function StyleEditor({
  styles,
  onChange,
  expandedSection,
  setExpandedSection,
}: StyleEditorProps) {
  const renderField = (section: string, field: any) => {
    const value = styles[section]?.[field.key];

    return (
      <div key={field.key} className="space-y-1">
        <div className="flex justify-between items-start mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          {field.type === 'checkbox' && (
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(section, field.key, e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          )}
        </div>

        {field.type !== 'checkbox' && (
          <div className="mt-1">
            {field.type === 'select' ? (
              <select
                value={value}
                onChange={(e) => onChange(section, field.key, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {field.options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <Input
                type="number"
                value={value}
                onChange={(e) =>
                  onChange(section, field.key, Number(e.target.value))
                }
                min={field.min}
                max={field.max}
                step={field.step || 1}
              />
            ) : section === 'colors' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(section, field.key, e.target.value)}
                  className="h-8 w-8 rounded border border-gray-300"
                />
                <Input
                  value={value}
                  onChange={(e) => onChange(section, field.key, e.target.value)}
                  className="flex-1"
                />
              </div>
            ) : (
              <Input
                value={value}
                onChange={(e) => onChange(section, field.key, e.target.value)}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSection === section.id;

        return (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-gray-700" />
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-900">
                    {section.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {section.description}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {isExpanded && (
              <div className="p-4 space-y-6 bg-white">
                {section.fields.map((field) => renderField(section.id, field))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
