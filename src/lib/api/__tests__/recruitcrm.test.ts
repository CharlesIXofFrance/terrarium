import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecruitCRMService } from '../recruitcrm';
import { env } from '../../env';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockJob = {
  id: 1,
  slug: 'senior-react-developer',
  name: 'Senior React Developer',
  description: 'We are looking for a Senior React Developer...',
  status: 'active',
  job_type: {
    id: 1,
    name: 'Full Time',
  },
  remote_type: 'hybrid',
  experience: {
    min: 5,
    max: 8,
  },
  salary: {
    min: 100000,
    max: 150000,
    currency: 'USD',
    period: 'yearly',
  },
  locations: [
    {
      city: 'New York',
      state: 'NY',
      country: 'United States',
    },
  ],
  skills: [
    { id: 1, name: 'React' },
    { id: 2, name: 'TypeScript' },
  ],
  created_at: '2024-03-14T00:00:00Z',
  updated_at: '2024-03-14T00:00:00Z',
  company: {
    id: 1,
    name: 'Tech Corp',
    logo_url: 'https://example.com/logo.png',
  },
  department: {
    id: 1,
    name: 'Engineering',
  },
};

describe('RecruitCRMService', () => {
  let service: RecruitCRMService;

  beforeEach(() => {
    service = new RecruitCRMService({
      communityId: 'test-community',
    });
    mockFetch.mockClear();
  });

  it('should fetch jobs with correct authentication and pagination', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockJob],
        meta: {
          total: 1,
          per_page: 25,
          current_page: 1,
        },
      }),
    });

    const { jobs, total } = await service.getJobs();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.recruitcrm.io/v1/jobs?page=1&per_page=25',
      expect.objectContaining({
        headers: {
          'Authorization': `Bearer ${env.RECRUITCRM_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
    );

    expect(jobs).toHaveLength(1);
    expect(total).toBe(1);
    expect(jobs[0]).toMatchObject({
      id: 1,
      name: 'Senior React Developer',
    });
  });

  it('should handle location filtering correctly', async () => {
    const filteredService = new RecruitCRMService({
      apiKey: 'test-api-key',
      communityId: 'test-community',
      filters: {
        locations: ['New York'],
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockJob],
        meta: { total: 1, per_page: 25, current_page: 1 },
      }),
    });

    const { jobs } = await filteredService.getJobs();
    expect(jobs).toHaveLength(1);
  });

  it('should filter out jobs that dont match location criteria', async () => {
    const filteredService = new RecruitCRMService({
      apiKey: 'test-api-key',
      communityId: 'test-community',
      filters: {
        locations: ['London'],
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockJob],
        meta: { total: 1, per_page: 25, current_page: 1 },
      }),
    });

    const { jobs } = await filteredService.getJobs();
    expect(jobs).toHaveLength(0);
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Invalid API key' }),
    });

    await expect(service.getJobs()).rejects.toThrow('Invalid API key');
  });

  it('should sync jobs with proper status tracking', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [mockJob],
          meta: { total: 1, per_page: 25, current_page: 1 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          meta: { total: 1, per_page: 25, current_page: 2 },
        }),
      });

    const stats = await service.syncJobs();

    expect(stats.added).toBe(1);
    expect(stats.errors).toHaveLength(0);
  });

  it('should fetch additional metadata correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: 1, name: 'Full Time' },
          { id: 2, name: 'Part Time' },
        ],
      }),
    });

    const jobTypes = await service.getJobTypes();
    expect(jobTypes).toHaveLength(2);
    expect(jobTypes[0]).toMatchObject({
      id: 1,
      name: 'Full Time',
    });
  });
});