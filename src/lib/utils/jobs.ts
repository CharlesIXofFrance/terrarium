import { api } from '../api';
import type {
  Job,
  CreateJobData,
  UpdateJobData,
  JobFilters,
} from '../types/domain/jobs';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationUrl?: string;
  createdAt: string;
  updatedAt: string;
  communityId: string;
  status: 'draft' | 'published' | 'closed';
  customFields?: Record<string, any>;
}

interface CreateJobData {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationUrl?: string;
  customFields?: Record<string, any>;
}

interface UpdateJobData extends Partial<CreateJobData> {
  status?: Job['status'];
}

interface JobFilters {
  type?: string;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
  };
  status?: Job['status'];
}

export const jobService = {
  async getJobs(communitySlug: string, filters?: JobFilters) {
    return api.get(`/communities/${communitySlug}/jobs`, { params: filters });
  },

  async getJob(communitySlug: string, jobId: string) {
    return api.get(`/communities/${communitySlug}/jobs/${jobId}`);
  },

  async createJob(communitySlug: string, data: CreateJobData) {
    return api.post(`/communities/${communitySlug}/jobs`, data);
  },

  async updateJob(communitySlug: string, jobId: string, data: UpdateJobData) {
    return api.patch(`/communities/${communitySlug}/jobs/${jobId}`, data);
  },

  async deleteJob(communitySlug: string, jobId: string) {
    return api.delete(`/communities/${communitySlug}/jobs/${jobId}`);
  },

  async applyToJob(communitySlug: string, jobId: string, data: FormData) {
    return api.post(`/communities/${communitySlug}/jobs/${jobId}/apply`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Helper function to get related jobs based on job title and type
export function getRelatedJobs(
  jobs: Job[],
  currentJobId: string,
  limit = 5
): Job[] {
  const currentJob = jobs.find((job) => job.id === currentJobId);
  if (!currentJob) return [];

  // Get jobs with similar title or type, excluding the current job
  return jobs
    .filter(
      (job) =>
        job.id !== currentJobId &&
        (job.type === currentJob.type ||
          job.title.toLowerCase().includes(currentJob.title.toLowerCase()) ||
          currentJob.title.toLowerCase().includes(job.title.toLowerCase()))
    )
    .slice(0, limit);
}
