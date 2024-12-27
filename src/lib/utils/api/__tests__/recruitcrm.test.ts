import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecruitCRMService } from '../recruitcrm';

// Mock environment variables
vi.mock('../../env', () => ({
  env: {
    RECRUITCRM_API_KEY: 'test-api-key',
  },
}));

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
    mockFetch.mockReset();
    service = new RecruitCRMService('test-api-key');
  });

  it('should fetch jobs with correct authentication and pagination', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockJob],
        meta: {
          total: 1,
        },
      }),
    });

    const { jobs, total } = await service.getJobs();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/jobs'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-API-KEY': 'test-api-key',
        }),
      })
    );
    expect(jobs).toHaveLength(1);
    expect(total).toBe(1);
  });

  it('should handle location filtering correctly', async () => {
    const filteredService = new RecruitCRMService('test-api-key', {
      locations: ['New York, NY, United States'],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockJob],
        meta: {
          total: 1,
        },
      }),
    });

    const { jobs } = await filteredService.getJobs();
    expect(jobs).toHaveLength(1);
  });

  it('should filter out jobs that dont match location criteria', async () => {
    const filteredService = new RecruitCRMService('test-api-key', {
      locations: ['London, UK'],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockJob],
        meta: {
          total: 1,
        },
      }),
    });

    const { jobs } = await filteredService.getJobs();
    expect(jobs).toHaveLength(0);
  });

  it('should handle API errors gracefully', async () => {
    service = new RecruitCRMService('invalid');
    await expect(service.getJobs()).rejects.toThrow('Invalid API key');
  });

  it('should sync jobs with proper status tracking', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [mockJob],
          meta: { total: 1 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

    const stats = await service.syncJobs();

    expect(stats.added).toBe(1);
    expect(stats.updated).toBe(0);
    expect(stats.removed).toBe(0);
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
