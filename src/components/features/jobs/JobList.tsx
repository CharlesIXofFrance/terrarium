import React, { useState } from 'react';
import { JobCard } from './JobCard';
import type { Job } from '../../lib/types';

interface JobListProps {
  jobs: Job[];
  onApply: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  className?: string;
}

export function JobList({
  jobs,
  onApply,
  onSave,
  className = '',
}: JobListProps) {
  const [displayCount, setDisplayCount] = useState(6); // Show 2 rows initially (3 jobs per row)
  const hasMoreJobs = displayCount < jobs.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 6, jobs.length)); // Load 2 more rows
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No jobs found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search filters or check back later for new
          opportunities
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 pb-8 ${className}`}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.slice(0, displayCount).map((job) => (
          <JobCard key={job.id} job={job} onApply={onApply} onSave={onSave} />
        ))}
      </div>
      
      {hasMoreJobs && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Load More Jobs
          </button>
        </div>
      )}
    </div>
  );
}
