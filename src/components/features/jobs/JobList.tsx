import React from 'react';
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
    <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onApply={onApply} onSave={onSave} />
      ))}
    </div>
  );
}
