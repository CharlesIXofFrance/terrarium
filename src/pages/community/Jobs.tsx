import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { JobList } from '../../components/jobs/JobList';
import { useJobs } from '../../lib/hooks/useJobs';

export function Jobs() {
  const { communitySlug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    jobs,
    isLoading,
    error,
    totalJobs,
    syncedFromRecruitCRM,
  } = useJobs(communitySlug!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load jobs: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalJobs} total jobs
            {syncedFromRecruitCRM && ` • Synced from RecruitCRM`}
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Post Job</span>
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<Search className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </Button>
      </div>

      {filteredJobs?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Post your first job or sync with RecruitCRM to get started'}
          </p>
        </div>
      ) : (
        <JobList jobs={filteredJobs || []} onApply={(jobId) => console.log('Apply to job:', jobId)} />
      )}
    </div>
  );
}