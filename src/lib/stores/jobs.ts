import { atom } from 'jotai';
import type { Job } from '../types/jobs';
import { MOCK_JOBS } from '../mocks/mockJobs';

// Base atoms
const _jobsAtom = atom<Job[]>(MOCK_JOBS);
const _jobsLoadingAtom = atom<boolean>(false);
const _jobsErrorAtom = atom<string | null>(null);

// Derived read-write atoms with logging
export const jobsAtom = atom(
  (get) => get(_jobsAtom),
  (get, set, jobs: Job[]) => {
    console.log('Setting jobs in store:', jobs);
    set(_jobsAtom, jobs);
  }
);

export const jobsLoadingAtom = atom(
  (get) => get(_jobsLoadingAtom),
  (get, set, loading: boolean) => {
    console.log('Setting jobs loading state:', loading);
    set(_jobsLoadingAtom, loading);
  }
);

export const jobsErrorAtom = atom(
  (get) => get(_jobsErrorAtom),
  (get, set, error: string | null) => {
    console.log('Setting jobs error:', error);
    set(_jobsErrorAtom, error);
  }
);

// Filtered jobs atom
export const filteredJobsAtom = atom((get) => {
  const jobs = get(jobsAtom);
  console.log('Filtered jobs:', jobs);
  return jobs;
});

// Combined jobs state atom
export const jobsStateAtom = atom((get) => {
  const state = {
    jobs: get(jobsAtom),
    filteredJobs: get(filteredJobsAtom),
    isLoading: get(jobsLoadingAtom),
    error: get(jobsErrorAtom),
  };
  console.log('Current jobs state:', state);
  return state;
});
