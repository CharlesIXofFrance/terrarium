// Copy content from /lib/utils/api/recruitcrm.ts
import { supabase } from '../supabase';
import type { Job } from '../../types/domain/jobs';

export interface RecruitCRMConfig {
  apiKey: string;
  subdomain: string;
}

export interface RecruitCRMJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  posted_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'draft';
  company_logo?: string;
  company_description?: string;
  apply_url?: string;
  skills?: string[];
  benefits?: string[];
}

export class RecruitCRMAPI {
  private apiKey: string;
  private subdomain: string;
  private baseUrl: string;

  constructor(config: RecruitCRMConfig) {
    this.apiKey = config.apiKey;
    this.subdomain = config.subdomain;
    this.baseUrl = `https://${this.subdomain}.recruitcrm.io/api/v1`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`RecruitCRM API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getJobs(): Promise<Job[]> {
    const response = await this.request<{ data: RecruitCRMJob[] }>('/jobs');
    return response.data.map(this.transformJob);
  }

  async getJob(id: string): Promise<Job> {
    const response = await this.request<{ data: RecruitCRMJob }>(`/jobs/${id}`);
    return this.transformJob(response.data);
  }

  private transformJob(job: RecruitCRMJob): Job {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      salary_range: job.salary_range,
      posted_at: job.posted_at,
      expires_at: job.expires_at,
      status: job.status,
      company_logo: job.company_logo,
      company_description: job.company_description,
      apply_url: job.apply_url,
      skills: job.skills,
      benefits: job.benefits,
    };
  }
}
