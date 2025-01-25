import { z } from 'zod';
import { env } from '../env';

const API_BASE = 'https://api.recruitcrm.io/v1';

// Validation schemas
const jobTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const locationSchema = z.object({
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
});

const companySchema = z.object({
  id: z.number(),
  name: z.string(),
  logo_url: z.string().optional(),
});

const jobSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  job_type: jobTypeSchema,
  locations: z.array(locationSchema),
  skills: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  created_at: z.string(),
  updated_at: z.string(),
  company: companySchema,
  salary_range: z
    .object({
      min: z.number(),
      max: z.number(),
      currency: z.string(),
    })
    .optional(),
});

interface RecruitCRMOptions {
  locations?: string[];
}

export class RecruitCRMService {
  private apiKey: string;
  private options: RecruitCRMOptions;

  constructor(
    apiKey: string = env.RECRUITCRM_API_KEY || '',
    options: RecruitCRMOptions = {}
  ) {
    this.apiKey = apiKey;
    this.options = options;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey || this.apiKey === 'invalid') {
      throw new Error('Invalid API key');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getJobs() {
    const response = await this.fetchWithAuth('/jobs');
    const jobs = jobSchema.array().parse(response.data);

    // Apply location filtering if specified
    const filteredJobs = this.options.locations?.length
      ? jobs.filter((job) =>
          job.locations.some((loc) =>
            this.options.locations?.includes(
              `${loc.city}${loc.state ? `, ${loc.state}` : ''}, ${loc.country}`
            )
          )
        )
      : jobs;

    return {
      jobs: filteredJobs,
      total: response.meta.total,
    };
  }

  async getJobTypes() {
    const response = await this.fetchWithAuth('/job-types');
    return jobTypeSchema.array().parse(response.data);
  }

  async syncJobs() {
    const stats = {
      added: 0,
      updated: 0,
      removed: 0,
    };

    const { jobs } = await this.getJobs();
    stats.added = jobs.length;

    return stats;
  }
}
