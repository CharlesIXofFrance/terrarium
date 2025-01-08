import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useJobs } from '@/lib/hooks/useJobs';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { Section } from '@/components/ui/molecules/Section';
import type { Job } from '@/lib/types';

/**
 * AI Context: Community Job Board
 * User Types: COMMUNITY_OWNER
 *
 * Job board management page for community owners to manage their job listings.
 * Provides functionality to post, search, and manage job opportunities.
 *
 * Location: /src/pages/community/
 * - Part of community owner dashboard
 * - Separate from member view of job board
 *
 * Responsibilities:
 * - Display job listings with search
 * - Enable job posting
 * - Show RecruitCRM sync status
 * - Provide job management actions
 *
 * Design Constraints:
 * - Must use shared UI components
 * - Must maintain consistent table layout
 * - Must preserve accessibility
 */
export function Jobs() {
  const { communitySlug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  const { jobs, isLoading, error, totalJobs, syncedFromRecruitCRM } = useJobs(
    communitySlug!
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load jobs:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const filteredJobs = jobs?.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Jobs"
        subtitle={`${totalJobs} total jobs${
          syncedFromRecruitCRM ? ' • Synced from RecruitCRM' : ''
        }`}
        actions={
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Post Job</span>
          </Button>
        }
      />

      <Section title="All Jobs">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs?.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </div>
  );
}
