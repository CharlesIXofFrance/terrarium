import { z } from 'zod';
import { env } from './env';

const API_BASE = 'https://api.recruitcrm.io/v1';
const IS_MOCK = !env.RECRUITCRM_API_KEY;

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

export class RecruitCRMService {
  private apiKey: string;
  private communityId: string;
  private filters?: {
    status?: string[];
    jobTypes?: string[];
    locations?: string[];
  };

  constructor({
    apiKey,
    communityId,
    filters,
  }: {
    apiKey?: string;
    communityId: string;
    filters?: {
      status?: string[];
      jobTypes?: string[];
      locations?: string[];
    };
  }) {
    this.apiKey = apiKey || env.RECRUITCRM_API_KEY;
    this.communityId = communityId;
    this.filters = filters;
  }

  async testConnection(): Promise<boolean> {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!this.apiKey) {
        throw new Error('API key is required');
      }

      if (this.apiKey === 'invalid') {
        throw new Error('Invalid API key');
      }

      return true;
    }

    try {
      console.log('🔄 Testing RecruitCRM API connection...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE}/jobs?page=1&per_page=1`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('❌ API connection failed:', data.message);
        throw new Error(data.message || 'API connection failed');
      }

      console.log('✅ RecruitCRM API connection successful');
      return true;
    } catch (error) {
      console.error('❌ API connection error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Connection timed out');
      } else if (error instanceof Error) {
        throw new Error(`Connection failed: ${error.message}`);
      }
      throw new Error('Connection failed');
    }
  }

  async getJobTypes() {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!this.apiKey || this.apiKey === 'invalid') {
        throw new Error('Invalid API key');
      }

      return [
        { id: 1, name: 'Full Time' },
        { id: 2, name: 'Part Time' },
        { id: 3, name: 'Contract' },
        { id: 4, name: 'Freelance' },
      ];
    }

    const response = await fetch(`${API_BASE}/job-types`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job types');
    }

    const data = await response.json();
    return data.data;
  }

  async getJobs() {
    if (IS_MOCK) {
      const response = await this.mockFetch<{
        data: z.infer<typeof jobSchema>[];
        meta: {
          total: number;
          per_page: number;
          current_page: number;
          last_page: number;
        };
      }>('/jobs?page=1&per_page=25');

      return {
        jobs: response.data,
        total: response.meta.total,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE}/jobs?page=1&per_page=25`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid API key');
      }

      const data = await response.json();
      return {
        jobs: jobSchema.array().parse(data.data),
        total: data.meta.total,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  async syncJobs() {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!this.apiKey || this.apiKey === 'invalid') {
        throw new Error('Invalid API key');
      }

      return {
        added: 1,
        updated: 1,
        removed: 0,
        errors: [],
      };
    }

    try {
      console.log('🔄 Starting job sync...');
      let hasMore = true;
      let page = 1;
      const stats = { added: 0, updated: 0, removed: 0, errors: [] };
      const existingJobs = new Set();

      while (hasMore) {
        const response = await fetch(
          `${API_BASE}/jobs?page=${page}&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ message: 'Failed to fetch jobs' }));
          throw new Error(error.message || 'Failed to sync jobs');
        }

        const { data, meta } = await response.json();

        if (!data || data.length === 0) {
          hasMore = false;
          break;
        }

        for (const job of data) {
          try {
            const jobId = `recruitcrm_${job.id}`;
            existingJobs.add(jobId);

            // Apply filters if configured
            if (this.filters) {
              if (
                this.filters.status?.length &&
                !this.filters.status.includes(job.status)
              ) {
                continue;
              }
              if (
                this.filters.jobTypes?.length &&
                !this.filters.jobTypes.includes(job.job_type.name)
              ) {
                continue;
              }
              if (
                this.filters.locations?.length &&
                !job.locations.some((loc) =>
                  this.filters?.locations?.includes(loc.city)
                )
              ) {
                continue;
              }
            }

            // Track sync stats
            stats[existingJobs.has(jobId) ? 'updated' : 'added']++;
          } catch (error) {
            console.error('Failed to sync job:', error);
            stats.errors.push({
              jobId: job.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        page++;
      }

      console.log('✅ Job sync completed:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Job sync failed:', error);
      throw error;
    }
  }

  private async mockFetch<T>(endpoint: string): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!this.apiKey || this.apiKey === 'invalid') {
      throw new Error('Invalid API key');
    }

    if (endpoint.startsWith('/job-types')) {
      return {
        data: [
          { id: 1, name: 'Full Time' },
          { id: 2, name: 'Part Time' },
          { id: 3, name: 'Contract' },
          { id: 4, name: 'Freelance' },
        ],
      } as T;
    }

    if (endpoint.startsWith('/jobs')) {
      let filteredJobs = [...MOCK_JOBS];

      if (this.filters) {
        if (this.filters.status?.length) {
          filteredJobs = filteredJobs.filter((job) =>
            this.filters?.status?.includes(job.status)
          );
        }

        if (this.filters.jobTypes?.length) {
          filteredJobs = filteredJobs.filter((job) =>
            this.filters?.jobTypes?.includes(job.job_type.name)
          );
        }

        if (this.filters.locations?.length) {
          filteredJobs = filteredJobs.filter((job) =>
            job.locations.some((loc) =>
              this.filters?.locations?.includes(loc.city)
            )
          );
        }
      }

      return {
        data: filteredJobs,
        meta: {
          total: filteredJobs.length,
          per_page: 25,
          current_page: 1,
          last_page: 1,
        },
      } as T;
    }

    throw new Error('Mock endpoint not implemented');
  }
}

// Mock data
const MOCK_JOBS = [
  {
    id: 12345,
    slug: 'senior-product-manager-fintech',
    name: 'Senior Product Manager - Fintech',
    description:
      'Leading fintech company seeking an experienced Product Manager to drive innovation in our payment solutions...',
    status: 'active',
    job_type: { id: 1, name: 'Full Time' },
    locations: [
      { city: 'London', state: 'England', country: 'United Kingdom' },
    ],
    skills: [
      { id: 1, name: 'Product Management' },
      { id: 2, name: 'Fintech' },
      { id: 3, name: 'Agile' },
      { id: 4, name: 'Payment Systems' },
    ],
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z',
    company: {
      id: 789,
      name: 'PayTech Solutions',
      logo_url: 'https://example.com/paytech-logo.png',
    },
    salary_range: {
      min: 85000,
      max: 120000,
      currency: 'GBP',
    },
  },
  {
    id: 12346,
    slug: 'blockchain-developer',
    name: 'Senior Blockchain Developer',
    description:
      'Join our Web3 team to build next-generation decentralized applications...',
    status: 'active',
    job_type: { id: 1, name: 'Full Time' },
    locations: [{ city: 'Remote', country: 'Worldwide' }],
    skills: [
      { id: 5, name: 'Solidity' },
      { id: 6, name: 'Ethereum' },
      { id: 7, name: 'Smart Contracts' },
      { id: 8, name: 'Web3.js' },
    ],
    created_at: '2024-03-14T15:45:00Z',
    updated_at: '2024-03-14T15:45:00Z',
    company: {
      id: 790,
      name: 'BlockChain Innovations Ltd',
      logo_url: 'https://example.com/bci-logo.png',
    },
    salary_range: {
      min: 100000,
      max: 150000,
      currency: 'USD',
    },
  },
];
