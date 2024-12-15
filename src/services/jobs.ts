import { api } from './api';

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
    const response = await api.get(`/communities/${communitySlug}/jobs`, {
      params: filters,
    });
    return response.data;
  },

  async getJob(communitySlug: string, jobId: string) {
    const response = await api.get(
      `/communities/${communitySlug}/jobs/${jobId}`
    );
    return response.data;
  },

  async createJob(communitySlug: string, data: CreateJobData) {
    const response = await api.post(
      `/communities/${communitySlug}/jobs`,
      data
    );
    return response.data;
  },

  async updateJob(
    communitySlug: string,
    jobId: string,
    data: UpdateJobData
  ) {
    const response = await api.patch(
      `/communities/${communitySlug}/jobs/${jobId}`,
      data
    );
    return response.data;
  },

  async deleteJob(communitySlug: string, jobId: string) {
    await api.delete(`/communities/${communitySlug}/jobs/${jobId}`);
  },

  async applyToJob(communitySlug: string, jobId: string, data: FormData) {
    const response = await api.post(
      `/communities/${communitySlug}/jobs/${jobId}/apply`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
