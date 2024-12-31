import React from 'react';
import { MapPin, Building2, Clock, Euro, BriefcaseIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import type { Job } from '../../../types/domain/jobs';
import { useImageLoader } from '../../../lib/hooks/useImageLoader';
import { scrollToTop } from '../../../lib/utils/scroll';
import { renderLogo } from '../../../lib/utils/renderLogo';

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  variant?: 'default' | 'compact' | 'carousel';
  labels?: {
    scoreName: string;
  };
  className?: string;
}

const TYPE_COLORS = {
  'Full-Time': {
    bg: 'bg-[#FFE9C8]',
    text: 'text-[#B76E00]',
  },
  'Part-Time': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  Contract: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
  },
  Internship: {
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
} as const;

export function JobCard({
  job,
  onApply,
  onSave,
  variant = 'default',
  labels = {
    scoreName: 'SisterScore®',
  },
  className = '',
}: JobCardProps) {
  const { communitySlug } = useParams();
  const { optimizeImageUrl } = useImageLoader();

  const typeColors =
    TYPE_COLORS[job.type as keyof typeof TYPE_COLORS] ||
    TYPE_COLORS['Full-Time'];

  return (
    <Link
      to={`/m/${communitySlug}/jobs/${job.id}`}
      onClick={scrollToTop}
      className={`block h-full max-w-[372px] ${className}`}
    >
      <div className="relative min-w-[286px] bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Cover Image */}
        {job.coverImage && variant !== 'compact' && (
          <div className="w-full h-48 relative">
            <img
              src={optimizeImageUrl(job.coverImage, { width: 800, height: 400 })}
              alt={`${job.company} team`}
              className="w-full h-full object-cover rounded-t-xl"
            />
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          {/* Company Logo and Job Type */}
          <div className="flex items-center justify-between -mt-12 mb-4 relative z-[5]">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm p-2">
                {job.companyLogo ? (
                  <img
                    src={optimizeImageUrl(job.companyLogo, {
                      width: 64,
                      height: 64,
                    })}
                    alt={job.company}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  renderLogo({
                    brandName: job.company,
                    size: 32,
                    color: '#6B7280',
                    className: 'w-12 h-12',
                    fallbackType: 'initials',
                  })
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="badge bg-[#e7f8ec] text-[#166534] hover:bg-[#dcf5e3]">
                  {job.type}
                </span>
                {job.isEarlyApplicant && (
                  <span className="badge inline-flex items-center bg-[#D9F1D9] text-[#2E7D32] hover:bg-[#ceeace]">
                    <Clock className="w-4 h-4 mr-1" />
                    Early applicant
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Job Title and Company */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
          </div>

          {/* Job Details */}
          <div className="space-y-3 flex-1">
            {/* Location */}
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{job.location}</span>
            </div>

            {/* Experience */}
            {job.experience && (
              <div className="flex items-center text-gray-600">
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                <span>{job.experience}</span>
              </div>
            )}

            {/* Salary */}
            {job.salary && (
              <div className="flex items-center text-gray-600">
                <Euro className="h-5 w-5 mr-2" />
                <span>
                  {job.salary.min / 1000}-{job.salary.max / 1000}k{' '}
                  {job.salary.currency}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            {/* Sister Score */}
            {job.sisterScore && (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="4"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="4"
                      strokeDasharray={`${(job.sisterScore / 100) * 125.6} 125.6`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-purple-600">
                    {job.sisterScore}%
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Overall</div>
                  <div className="text-gray-500">{labels.scoreName}</div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onSave?.(job.id);
              }}
              className="px-2 py-2 bg-gradient-to-r from-[#7B68EE] to-[#6A5ACD] text-white rounded-full hover:opacity-90 transition-all duration-300"
            >
              Save Job
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
