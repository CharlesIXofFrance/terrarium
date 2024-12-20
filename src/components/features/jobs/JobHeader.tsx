import React from 'react';
import { MapPin, Building2, Clock, Euro } from 'lucide-react';
import { useImageLoader } from '../../lib/hooks/useImageLoader';
import { useCompanyColors } from '../../lib/hooks/useCompanyColors';
import type { Job } from '../../lib/types';

interface JobHeaderProps {
  job: Job;
}

function hexToRgba(hex: string, opacity: number): string {
  try {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return 'rgba(124, 58, 237, ' + opacity + ')';
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch (error) {
    console.error('Error converting hex to rgba:', error);
    return 'rgba(124, 58, 237, ' + opacity + ')';
  }
}

export function JobHeader({ job }: JobHeaderProps) {
  const { optimizeImageUrl } = useImageLoader();
  const { data: colorData, isError } = useCompanyColors(job.companyLogo);

  const defaultColor = '#7C3AED';
  const companyColor = colorData?.dominantColor || defaultColor;

  const headerStyle = React.useMemo(
    () => ({
      backgroundColor: colorData?.dominantColor
        ? hexToRgba(colorData.dominantColor, 0.1)
        : '#F3F4F6',
    }),
    [colorData?.dominantColor]
  );

  if (isError) {
    console.error('Error loading company colors for:', job.company);
  }

  return (
    <div
      className="rounded-xl p-4 md:p-6 space-y-4 md:space-y-6 transition-colors duration-300"
      style={headerStyle}
    >
      <div className="flex items-start space-x-4">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
          {job.companyLogo ? (
            <img
              src={optimizeImageUrl(job.companyLogo, { width: 64, height: 64 })}
              alt={job.company}
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
          ) : (
            <Building2 className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
            {job.title}
          </h1>
          <p className="text-gray-700 mt-1">{job.company}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {/* Job Type */}
        <span
          className="inline-flex items-center px-2.5 md:px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: hexToRgba(companyColor, 0.1),
            color: companyColor,
          }}
        >
          <Clock className="h-4 w-4 mr-1" />
          {job.type}
        </span>

        {/* Location */}
        <span
          className="inline-flex items-center px-2.5 md:px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: hexToRgba(companyColor, 0.1),
            color: companyColor,
          }}
        >
          <MapPin className="h-4 w-4 mr-1" />
          {job.location}
        </span>

        {/* Salary */}
        {job.salary && (
          <span
            className="inline-flex items-center px-2.5 md:px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: hexToRgba(companyColor, 0.1),
              color: companyColor,
            }}
          >
            <Euro className="h-4 w-4 mr-1" />
            {job.salary.min / 1000}-{job.salary.max / 1000}k{' '}
            {job.salary.currency}
          </span>
        )}

        {/* Early Applicant Badge */}
        {job.isEarlyApplicant && (
          <span
            className="inline-flex items-center px-2.5 md:px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: hexToRgba(companyColor, 0.1),
              color: companyColor,
            }}
          >
            <Clock className="h-4 w-4 mr-1" />
            Early Applicant
          </span>
        )}
      </div>
    </div>
  );
}
