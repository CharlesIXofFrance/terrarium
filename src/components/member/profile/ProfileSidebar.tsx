import React from 'react';
import { CheckCircle, AlertCircle, ExternalLink, Briefcase, GraduationCap, Code, Globe } from 'lucide-react';

interface ProfileSidebarProps {
  completionSteps: Array<{
    id: string;
    label: string;
    completed: boolean;
    icon: string;
  }>;
}

const icons = {
  Briefcase,
  GraduationCap,
  Code,
  Globe
};

export function ProfileSidebar({ completionSteps }: ProfileSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Completion Steps */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Profile</h2>
        <div className="space-y-4">
          {completionSteps.map((step) => {
            const Icon = icons[step.icon as keyof typeof icons];
            return (
              <div 
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  step.completed ? 'bg-indigo-50' : 'bg-amber-50'
                }`}
              >
                <div className="flex-shrink-0">
                  <Icon className={`w-5 h-5 ${step.completed ? 'text-indigo-500' : 'text-amber-500'}`} />
                </div>
                <span className={`${step.completed ? 'text-indigo-700' : 'text-amber-700'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Guide */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
        <a 
          href="#" 
          className="flex items-center text-indigo-600 hover:text-indigo-700 gap-2 p-3 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <span>Strong Profile Guide</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}