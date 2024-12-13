import type { Job } from '../types/jobs';

/**
 * Filter jobs by search term across multiple fields
 */
export function filterJobsBySearchTerm(jobs: Job[], searchTerm: string): Job[] {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return jobs;

  return jobs.filter(job => 
    job.title.toLowerCase().includes(term) ||
    job.company.toLowerCase().includes(term) ||
    job.location.toLowerCase().includes(term) ||
    job.description.toLowerCase().includes(term) ||
    job.requirements.some(req => req.toLowerCase().includes(term))
  );
}

/**
 * Filter jobs by multiple criteria
 */
export function filterJobs(
  jobs: Job[],
  filters: {
    types?: string[];
    locations?: string[];
    salaryRange?: { min?: number; max?: number };
    sisterScore?: number;
    benefits?: string[];
    scores?: {
      culture?: number;
      leadership?: number;
      workLife?: number;
    };
    isEarlyApplicant?: boolean;
  }
): Job[] {
  return jobs.filter(job => {
    // Job Type Filters
    if (filters.types?.length && !filters.types.some(type => 
      type === `type_${job.type.toLowerCase().replace('-', '')}`
    )) {
      return false;
    }
    
    // Location Filters
    if (filters.locations?.length) {
      const locationMatch = filters.locations.some(loc => {
        if (loc === 'location_remote' && job.location.toLowerCase().includes('remote')) return true;
        if (loc === 'location_hybrid' && job.location.toLowerCase().includes('hybrid')) return true;
        if (loc === 'location_office' && !job.location.toLowerCase().includes('remote') && 
            !job.location.toLowerCase().includes('hybrid')) return true;
        return false;
      });
      if (!locationMatch) return false;
      return false;
    }
    
    // Salary Range Filters
    if (filters.salaryRange?.min && (!job.salary || job.salary.min < filters.salaryRange.min)) {
      return false;
    }
    
    if (filters.salaryRange?.max && (!job.salary || job.salary.max > filters.salaryRange.max)) {
      return false;
    }
    
    // SisterScore Filters
    if (filters.sisterScore && (!job.sisterScore || job.sisterScore < filters.sisterScore)) {
      return false;
    }
    
    // Benefits Filters
    if (filters.benefits?.length && job.benefits) {
      const hasAllBenefits = filters.benefits.every(benefit => {
        const benefitType = benefit.replace('benefit_', '');
        return job.benefits?.some(b => 
          b.icon.toLowerCase().includes(benefitType)
        );
      });
      if (!hasAllBenefits) return false;
    }

    // Score Filters
    if (filters.scores?.culture && (!job.scores?.culture || 
        job.scores.culture < filters.scores.culture)) {
      return false;
    }
    if (filters.scores?.leadership && (!job.scores?.leadership || 
        job.scores.leadership < filters.scores.leadership)) {
      return false;
    }
    if (filters.scores?.workLife && (!job.scores?.workLife || 
        job.scores.workLife < filters.scores.workLife)) {
      return false;
    }
    
    if (filters.isEarlyApplicant && !job.isEarlyApplicant) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get related jobs based on current job
 */
export function getRelatedJobs(currentJob: Job, allJobs: Job[], limit = 3): Job[] {
  return allJobs
    .filter(job => 
      job.id !== currentJob.id && 
      (job.type === currentJob.type || 
       job.company === currentJob.company ||
       job.requirements.some(req => currentJob.requirements.includes(req)))
    )
    .slice(0, limit);
}

/**
 * Format salary range for display
 */
export function formatSalaryRange(salary?: Job['salary']): string {
  if (!salary) return 'Salary not specified';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: salary.currency,
    maximumFractionDigits: 0,
  });
  
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
}