import React, { useState } from 'react';
import { 
  Check, Star, Heart, Users, Briefcase, MapPin, DollarSign, Coffee, 
  Home, Award, ChevronDown, ChevronUp, GraduationCap, Plane, Baby, 
  Dumbbell, HeartPulse, Globe, Bitcoin, Clock, FileText, Building2
} from 'lucide-react';
import { Button } from '../ui/Button';

interface JobFiltersProps {
  selectedFilters: string[];
  onFilterChange: (filterId: string) => void;
  onClearFilters: () => void;
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
    filterGroups.flatMap(group => 
      group.options.map(option => [option.id, option.label])
    )
  ),
  ...Object.fromEntries(
    benefitsGroup.options.map(option => [option.id, option.label])
  ),
};

export function JobFilters({ selectedFilters, onFilterChange, onClearFilters }: JobFiltersProps) {
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  
  const visibleBenefits = showAllBenefits 
    ? benefitsGroup.options 
    : benefitsGroup.options.slice(0, 4);

  return (
    <aside className="fixed left-0 top-[120px] bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Scrollable Filter Options */}
      <div className="flex-1 overflow-y-auto pt-4">
        <div className="p-6 space-y-8">
          {/* Regular filter groups */}
          {filterGroups.map((group) => (
            <div key={group.title} className="pb-6 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {group.title}
              </h3>
              {group.description && (
                <p className="text-sm text-gray-500 mb-4">{group.description}</p>
              )}
              <div className="space-y-2">
                {group.options.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedFilters.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      onClick={() => onFilterChange(option.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-200 border ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${
                          isSelected ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Benefits filter group with show more/less */}
          <div className="pb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {benefitsGroup.title}
            </h3>
            {benefitsGroup.description && (
              <p className="text-sm text-gray-500 mb-4">{benefitsGroup.description}</p>
            )}
            <div className="space-y-2">
              {visibleBenefits.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFilters.includes(option.id);

                return (
                  <button
                    key={option.id}
                    onClick={() => onFilterChange(option.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-200 border ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${
                        isSelected ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </button>
                );
              })}

              {benefitsGroup.options.length > 4 && (
                <button
                  onClick={() => setShowAllBenefits(!showAllBenefits)}
                  className="w-full flex items-center justify-center p-3 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {showAllBenefits ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span>Show More</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Clear Filters Button */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={onClearFilters}
        >
          Clear All Filters
        </Button>
      </div>
    </aside>
  );
}