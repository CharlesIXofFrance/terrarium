import { useAtom } from 'jotai';
import { jobsStateAtom, filteredJobsAtom } from '../stores/jobs';
import type { Job } from '../types/jobs';

export function useJobs(communitySlug?: string) {
  const [{ jobs, isLoading, error }] = useAtom(jobsStateAtom);
  const [filteredJobs] = useAtom(filteredJobsAtom);

  // For now, we'll just use 'women-in-fintech' for mock data
  // TODO: Update this when we have real community-specific jobs
  const communityJobs = jobs;
  const communityFilteredJobs = filteredJobs;

  return {
    jobs: communityJobs,
    filteredJobs: communityFilteredJobs,
    totalJobs: communityJobs.length,
    isLoading,
    error,
  };
}
