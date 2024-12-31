import React, { useState, useRef } from 'react';
import {
  Check,
  Star,
  Heart,
  Users,
  Briefcase,
  MapPin,
  DollarSign,
  Coffee,
  Home,
  Award,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Plane,
  Baby,
  Dumbbell,
  HeartPulse,
  Globe,
  Bitcoin,
  Clock,
  FileText,
  Building2,
} from 'lucide-react';
import { Button } from '../../ui/atoms/Button';

interface JobFiltersProps {
  selectedFilters: string[];
  onFilterChange: (filterId: string) => void;
  onClearFilters: () => void;
  primaryColor?: string;
}

const filterGroups = [
  {
    title: 'Top SisterScore',
    description: 'Filter by our unique diversity and inclusion metrics',
    options: [
      { id: 'score_85plus', label: '85+ Overall Score', icon: Star },
      { id: 'score_culture', label: 'Culture Score', icon: Heart },
      { id: 'score_leadership', label: 'Leadership Score', icon: Users },
      { id: 'score_worklife', label: 'Work-Life Balance', icon: Home },
    ],
  },
  {
    title: 'Job Type',
    description: 'Filter by employment type',
    options: [
      { id: 'type_fulltime', label: 'Full-Time', icon: Briefcase },
      { id: 'type_parttime', label: 'Part-Time', icon: Clock },
      { id: 'type_contract', label: 'Contract', icon: FileText },
      { id: 'type_internship', label: 'Internship', icon: GraduationCap },
    ],
  },
  {
    title: 'Location',
    description: 'Filter by work location',
    options: [
      { id: 'location_remote', label: 'Remote', icon: Globe },
      { id: 'location_hybrid', label: 'Hybrid', icon: Building2 },
      { id: 'location_office', label: 'Office', icon: MapPin },
    ],
  },
  {
    title: 'Salary Range',
    description: 'Filter by annual salary range',
    options: [
      { id: 'salary_30k', label: '€0-30k', icon: DollarSign },
      { id: 'salary_60k', label: '€30-60k', icon: DollarSign },
      { id: 'salary_90k', label: '€60-90k', icon: DollarSign },
      { id: 'salary_90kplus', label: '€90k+', icon: DollarSign },
    ],
  },
];

const benefitsGroup = {
  title: 'Benefits',
  description: 'Filter by company benefits',
  options: [
    { id: 'benefit_health', label: 'Health Insurance', icon: HeartPulse },
    { id: 'benefit_remote', label: 'Remote Work', icon: Home },
    { id: 'benefit_education', label: 'Learning Budget', icon: GraduationCap },
    { id: 'benefit_travel', label: 'Travel Benefits', icon: Plane },
    { id: 'benefit_parental', label: 'Parental Leave', icon: Baby },
    { id: 'benefit_fitness', label: 'Fitness Benefits', icon: Dumbbell },
    { id: 'benefit_food', label: 'Food & Drinks', icon: Coffee },
    { id: 'benefit_crypto', label: 'Crypto Benefits', icon: Bitcoin },
  ],
};

// Create a map of all filter IDs to their labels
export const filterLabels = {
  ...Object.fromEntries(
    filterGroups.flatMap((group) =>
      group.options.map((option) => [option.id, option.label])
    )
  ),
  ...Object.fromEntries(
    benefitsGroup.options.map((option) => [option.id, option.label])
  ),
};

export function JobFilters({
  selectedFilters,
  onFilterChange,
  onClearFilters,
  isMobile,
  primaryColor = '#E86C3A',
}: JobFiltersProps & { isMobile?: boolean }) {
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const visibleBenefits = showAllBenefits
    ? benefitsGroup.options
    : benefitsGroup.options.slice(0, 4);

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Filters Area */}
      <div className="filters-scroll-area flex-1 overflow-y-auto pt-6">
        <div className="space-y-6 divide-y divide-gray-200 pb-32">
          {filterGroups.map((group) => (
            <div key={group.title} className="pt-6 first:pt-0 px-4 last:pb-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.title}
                </h3>
                {group.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {group.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedFilters.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      onClick={() => onFilterChange(option.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg text-sm transition-all duration-200 ${
                        isSelected
                          ? 'bg-white shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      style={isSelected ? { borderColor: primaryColor, borderWidth: '1px', borderStyle: 'solid' } : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className="h-5 w-5"
                          style={{ color: isSelected ? primaryColor : '#9CA3AF' }}
                        />
                        <span style={{ color: isSelected ? primaryColor : '#4B5563' }}>
                          {option.label}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4" style={{ color: primaryColor }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Benefits filter group */}
          <div className="space-y-4 pt-6 px-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {benefitsGroup.title}
              </h3>
              {benefitsGroup.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {benefitsGroup.description}
                </p>
              )}
            </div>
            <div className="space-y-2">
              {visibleBenefits.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFilters.includes(option.id);

                return (
                  <button
                    key={option.id}
                    onClick={() => onFilterChange(option.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg text-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-white shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={isSelected ? { borderColor: primaryColor, borderWidth: '1px', borderStyle: 'solid' } : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className="h-5 w-5"
                        style={{ color: isSelected ? primaryColor : '#9CA3AF' }}
                      />
                      <span style={{ color: isSelected ? primaryColor : '#4B5563' }}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4" style={{ color: primaryColor }} />
                    )}
                  </button>
                );
              })}
            </div>

            {benefitsGroup.options.length > 4 && (
              <button
                onClick={() => setShowAllBenefits(!showAllBenefits)}
                className="flex items-center space-x-2 text-sm font-medium mt-2"
                style={{ color: primaryColor }}
              >
                <span>{showAllBenefits ? 'Show Less' : 'Show All'}</span>
                {showAllBenefits ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="w-full"
          style={{ 
            borderColor: primaryColor,
            color: primaryColor,
          }}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
