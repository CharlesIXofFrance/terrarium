/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Community Job Board
 * User Types: COMMUNITY_OWNER
 *
 * Management page for community owners to oversee employers.
 * Controls employer access and job posting permissions.
 *
 * Location: /src/pages/community/
 * - Part of job board management
 * - Affects employer experience
 *
 * Responsibilities:
 * - Manage employer accounts
 * - Review job posting access
 * - Track employer activity
 * - Handle employer requests
 *
 * Design Constraints:
 * - Must use shared UI components
 * - Must handle bulk actions
 * - Must preserve job history
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, CheckCircle, XCircle } from 'lucide-react';
import { useCommunity } from '../../lib/hooks/useCommunity';
import { employersApi } from '../../lib/api';
import { Button } from '../../components/ui/atoms/Button';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '../../lib/stores/community';
import type { Company } from '../../lib/types';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { Section } from '@/components/ui/molecules/Section';

export function Employers() {
  const [community] = useAtom(currentCommunityAtom);

  const { data: companies, isLoading } = useQuery({
    queryKey: ['employers', community?.id],
    queryFn: () => (community ? employersApi.getCompanies(community.id) : null),
    enabled: !!community,
  });

  const handleApprove = async (companyId: string) => {
    if (!community) return;
    await employersApi.approveCompany(community.id, companyId);
  };

  const handleAddEmployer = () => {
    // Add employer logic here
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Employers"
        subtitle="Manage employers and job posting access"
        actions={
          <Button
            onClick={handleAddEmployer}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Employer
          </Button>
        }
      />

      <Section>
        <div className="space-y-6">
          {companies?.data?.map((company: Company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-500">{company.industry}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {company.locations.length} locations · {company.size}{' '}
                  employees
                </div>

                {company.status === 'pending' ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleApprove(company.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Approved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
