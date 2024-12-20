import React from 'react';
import { JOB_TESTIMONIALS } from '../../../lib/data/mockJobs';
import type { Job } from '../../../lib/types/jobs';

interface WorkingAtCompanyProps {
  companyName: string;
  photos: Array<{
    url: string;
    category?: 'collaboration' | 'culture' | 'office';
    size?: 'large' | 'medium' | 'small';
  }>;
  jobTitle?: string;
}

export function WorkingAtCompany({
  companyName,
  photos,
  jobTitle,
}: WorkingAtCompanyProps) {
  const testimonials = useMemo(() => {
    if (!jobTitle || !JOB_TESTIMONIALS) return [];
    return JOB_TESTIMONIALS[jobTitle] || [];
  }, [jobTitle]);

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Working at {companyName}</h2>

      <div className="grid md:grid-cols-12 gap-6">
        {photos.map((photo, index) => {
          const testimonial = testimonials[index % testimonials.length];
          const isFullWidth = index % 3 === 0;

          return (
            <React.Fragment key={index}>
              {/* Photo */}
              <div
                className={`relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] ${
                  isFullWidth
                    ? 'md:col-span-12 aspect-[21/9]'
                    : 'md:col-span-6 aspect-square'
                }`}
              >
                <img
                  src={photo.url}
                  alt={`Working at ${companyName}`}
                  className="w-full h-full object-cover"
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              </div>

              {/* Testimonial */}
              {testimonial && (
                <div
                  className={`bg-gray-50 rounded-lg p-6 flex flex-col justify-center ${
                    isFullWidth ? 'md:col-span-12' : 'md:col-span-6'
                  }`}
                >
                  <blockquote className="relative">
                    <p className="text-lg font-medium text-gray-900 leading-8 mb-4">
                      "{testimonial.quote}"
                    </p>
                    <footer className="mt-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={testimonial.avatar}
                            alt={testimonial.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-medium text-gray-900">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
