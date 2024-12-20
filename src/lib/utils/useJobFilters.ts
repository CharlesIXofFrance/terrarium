import { useState, useCallback } from 'react';
import { filterJobs, filterJobsBySearchTerm } from '../utils/jobs';
import type { Job } from '../types/jobs';

export function useJobFilters(initialJobs: Job[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    types: string[];
    locations: string[];
    salaryRange?: { min?: number; max?: number };
    sisterScore?: number;
    isEarlyApplicant?: boolean;
  }>({
    types: [],
    locations: [],
  });

  const filteredJobs = useCallback(() => {
    let result = [...initialJobs];

    // Apply search term filter
    result = filterJobsBySearchTerm(result, searchTerm);

    // Apply other filters
    result = filterJobs(result, filters);

    return result;
  }, [initialJobs, searchTerm, filters]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ types: [], locations: [] });
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    clearFilters,
    filteredJobs: filteredJobs(),
  };
}
