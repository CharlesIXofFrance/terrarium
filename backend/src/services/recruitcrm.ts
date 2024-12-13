import axios from 'axios';
import { prisma } from '../lib/prisma';
import { env } from '../env';

export class RecruitCRMService {
  private readonly api = axios.create({
    baseURL: 'https://api.recruitcrm.io/v1',
    headers: {
      'Authorization': `Bearer ${env.RECRUITCRM_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  async syncJobs(communityId: string) {
    try {
      let page = 1;
      const stats = { added: 0, updated: 0, removed: 0, errors: [] };
      const existingJobs = new Set();

      while (true) {
        const { data } = await this.api.get('/jobs', {
          params: { page, per_page: 100 },
        });

        for (const job of data.data) {
          try {
            const jobId = `recruitcrm_${job.id}`;
            existingJobs.add(jobId);

            await prisma.job.upsert({
              where: { externalId: jobId },
              create: {
                externalId: jobId,
                title: job.name,
                description: job.description,
                status: job.status,
                type: job.job_type.name,
                location: job.locations[0]?.city || 'Remote',
                salary: job.salary_range,
                requirements: job.skills.map(s => s.name),
                company: {
                  connectOrCreate: {
                    where: { externalId: `recruitcrm_${job.company.id}` },
                    create: {
                      externalId: `recruitcrm_${job.company.id}`,
                      name: job.company.name,
                      logoUrl: job.company.logo_url,
                    },
                  },
                },
                community: { connect: { id: communityId } },
                source: 'recruitcrm',
                rawData: job,
              },
              update: {
                title: job.name,
                description: job.description,
                status: job.status,
                salary: job.salary_range,
                rawData: job,
              },
            });

            stats[existingJobs.has(jobId) ? 'updated' : 'added']++;
          } catch (error) {
            console.error('Failed to sync job:', error);
            stats.errors.push({
              jobId: job.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        if (page >= data.meta.last_page) break;
        page++;
      }

      // Remove jobs that no longer exist in RecruitCRM
      const removed = await prisma.job.deleteMany({
        where: {
          communityId,
          source: 'recruitcrm',
          externalId: { notIn: Array.from(existingJobs) },
        },
      });

      stats.removed = removed.count;

      await prisma.community.update({
        where: { id: communityId },
        data: { lastJobSync: new Date() },
      });

      return stats;
    } catch (error) {
      console.error('Job sync failed:', error);
      throw new Error('Failed to sync jobs with RecruitCRM');
    }
  }
}