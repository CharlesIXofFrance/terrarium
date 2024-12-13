import React from 'react';

interface CareerConsultProps {
  consultant: {
    name: string;
    avatar: string;
  };
  className?: string;
}

export function CareerConsult({ consultant, className = '' }: CareerConsultProps) {
  return (
    <div className={`bg-white rounded-xl p-4 md:p-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Consultant Image */}
        <div className="relative flex-shrink-0">
          <img
            src={consultant.avatar}
            alt={consultant.name}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-gray-100"
            loading="lazy"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
            ✓
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
            Let's discuss this opportunity
          </h3>
          <p className="text-gray-600 text-sm md:text-base mb-4">
            Book a free career consultation with {consultant.name}
          </p>
          <button className="w-full md:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors text-sm">
            Schedule Consultation
          </button>
        </div>
      </div>
    </div>
  );
}