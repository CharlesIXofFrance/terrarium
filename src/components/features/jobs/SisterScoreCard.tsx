import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CommunityScoreProps {
  score: {
    overall: number;
    locationFlexibility: number;
    hoursFlexibility: number;
    benefits: number;
    culture: number;
    leadership: number;
  };
  testimonial?: {
    name: string;
    role: string;
    avatar: string;
    quote: string;
  };
  companyName?: string;
  labels?: {
    scoreName?: string;
    testimonialTitle?: string;
  };
}

export function SisterScoreCard({
  score,
  testimonial,
  companyName = '',
  labels = {
    scoreName: 'SisterScore®',
    testimonialTitle: "Your Sisters' Take",
  },
}: CommunityScoreProps) {
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const primaryMetrics = [
    { label: 'Location Flexibility', value: score.locationFlexibility },
    { label: 'Hours Flexibility', value: score.hoursFlexibility },
    { label: 'Benefits', value: score.benefits },
  ];

  const secondaryMetrics = [
    { label: 'Culture', value: score.culture },
    { label: 'Leadership', value: score.leadership },
  ];

  const visibleMetrics = showAllMetrics
    ? [...primaryMetrics, ...secondaryMetrics]
    : primaryMetrics;

  return (
    <div className="bg-[#F3F0FF] rounded-xl p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {labels.testimonialTitle}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          We ask the difficult questions so you don't have to.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Section */}
        <div>
          {/* Overall Score Badge */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <defs>
                  <linearGradient
                    id="scoreGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#9F7AEA" />
                  </linearGradient>
                </defs>
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="5"
                  strokeDasharray={`${score.overall * 1.76} 176`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">
                  {score.overall}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">
                {labels.scoreName}
              </div>
              <div className="text-xs text-gray-600">Overall Rating</div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2.5">
            {visibleMetrics.map((metric) => (
              <div key={metric.label} className="transition-all duration-300">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">
                    {metric.label}
                  </span>
                  <span className="font-bold text-purple-600">
                    {metric.value}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${metric.value}%`,
                      background:
                        'linear-gradient(90deg, #7C3AED 0%, #9F7AEA 100%)',
                    }}
                  />
                </div>
              </div>
            ))}

            {secondaryMetrics.length > 0 && (
              <button
                onClick={() => setShowAllMetrics(!showAllMetrics)}
                className="flex items-center text-xs text-purple-600 hover:text-purple-700 font-medium mt-2"
              >
                <span>Show {showAllMetrics ? 'less' : 'more'} metrics</span>
                <ChevronDown
                  className={`h-3 w-3 ml-1 transition-transform duration-300 ${
                    showAllMetrics ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Testimonial Section */}
        {testimonial && (
          <div className="flex flex-col justify-center h-full">
            <div className="bg-white rounded-xl p-6 relative border border-purple-100 h-full">
              {/* Quote Icon */}
              <div className="absolute top-4 left-4 text-purple-200 text-4xl font-serif leading-none">
                "
              </div>

              {/* Quote Text */}
              <div className="relative z-10 mb-6">
                <p className="text-gray-700 text-base leading-relaxed pt-4">
                  {testimonial.quote}
                </p>
              </div>

              {/* Profile Section */}
              <div className="flex items-center mt-auto">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-100 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                </div>

                <div className="ml-3">
                  <div className="font-bold text-gray-900 text-base">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
