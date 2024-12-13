import type { ApiResponse, Community, Job, User, Company } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// Community Management
export const communityApi = {
  getCommunity: (slug: string) => 
    fetchApi<Community>(`/communities/${slug}`),

  updateSettings: (communityId: string, settings: Partial<Community>) =>
    fetchApi<Community>(`/communities/${communityId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    }),

  getMembers: (communityId: string) =>
    fetchApi<User[]>(`/communities/${communityId}/members`),

  inviteMember: (communityId: string, email: string, role: string) =>
    fetchApi<void>(`/communities/${communityId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
};

// Job Board Management
export const jobsApi = {
  getJobs: (communityId: string, filters?: Record<string, any>) =>
    fetchApi<Job[]>(`/communities/${communityId}/jobs`, {
      method: 'GET',
      body: JSON.stringify(filters),
    }),

  createJob: (communityId: string, job: Partial<Job>) =>
    fetchApi<Job>(`/communities/${communityId}/jobs`, {
      method: 'POST',
      body: JSON.stringify(job),
    }),

  updateJob: (communityId: string, jobId: string, updates: Partial<Job>) =>
    fetchApi<Job>(`/communities/${communityId}/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
};

// Employer Management
export const employersApi = {
  getCompanies: (communityId: string) =>
    fetchApi<Company[]>(`/communities/${communityId}/companies`),

  approveCompany: (communityId: string, companyId: string) =>
    fetchApi<void>(`/communities/${communityId}/companies/${companyId}/approve`, {
      method: 'POST',
    }),

  updateCompanyStatus: (communityId: string, companyId: string, status: string) =>
    fetchApi<Company>(`/communities/${communityId}/companies/${companyId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};