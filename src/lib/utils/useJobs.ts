import { useAtom } from 'jotai';
import { jobsAtom, filteredJobsAtom } from '../../stores/jobs';
import type { Job } from '../types';

export function useJobs(communityId?: string) {
  const [jobs] = useAtom(jobsAtom);
  const [filteredJobs] = useAtom(filteredJobsAtom);

  const communityJobs = communityId
    ? jobs.filter((job) => job.communityId === communityId)
    : jobs;

  return {
    jobs: communityJobs,
    filteredJobs,
    totalJobs: communityJobs.length,
  };
}
