import React from 'react';
import { 
  HeartPulse, 
  Baby, 
  GraduationCap, 
  Plane, 
  Dumbbell, 
  Coffee,
  Home,
  DollarSign
} from 'lucide-react';

interface Benefit {
  icon: string;
  label: string;
  description?: string;
}

interface BenefitsProps {
  benefits: Benefit[];
}

const BENEFIT_ICONS = {
  'health': HeartPulse,
  'parental': Baby,
  'education': GraduationCap,
  'travel': Plane,
  'fitness': Dumbbell,
  'food': Coffee,
  'remote': Home,
  'bonus': DollarSign,
};

export function Benefits({ benefits }: BenefitsProps) {
  const getIcon = (iconName: string) => {
    const Icon = BENEFIT_ICONS[iconName as keyof typeof BENEFIT_ICONS] || Coffee;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4 md:mb-6">Benefits & Perks</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              {getIcon(benefit.icon)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{benefit.label}</div>
              {benefit.description && (
                <div className="text-sm text-gray-500 mt-1">{benefit.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}