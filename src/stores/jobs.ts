import { atom } from 'jotai';
import type { Job } from '../lib/types/jobs';
import { MOCK_JOBS } from '../data/mockJobs';

// Jobs store atom
export const jobsAtom = atom<Job[]>(MOCK_JOBS);

// Selected job atom
export const selectedJobAtom = atom<Job | null>(null);

// Filtered jobs atom with derived state
export const filteredJobsAtom = atom(
  (get) => get(jobsAtom)
);

// Jobs loading state
export const jobsLoadingAtom = atom(false);

// Jobs error state
export const jobsErrorAtom = atom<Error | null>(null);