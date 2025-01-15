import React from 'react';
import { useAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { currentCommunityAtom } from '@/lib/stores/community';
import { communityApi } from '@/lib/api/community';
import { Button } from '@/components/ui/atoms/Button';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { Section } from '@/components/ui/molecules/Section';
import type { User } from '@/lib/types';

/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Community Management
 * User Types: COMMUNITY_OWNER
 *
 * Member management page for community owners to view and manage their members.
 * Provides functionality to view, invite, and manage community members.
 *
 * Location: /src/pages/community/
 * - Part of community owner dashboard
 * - Separate from member view of community
 *
 * Responsibilities:
 * - Display member list with key information
 * - Enable member invitations
 * - Show member roles and status
 * - Provide member management actions
 *
 * Design Constraints:
 * - Must use shared UI components
 * - Must maintain consistent table layout
 * - Must preserve accessibility
 */
export function Members() {
  const [community] = useAtom(currentCommunityAtom);

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', community?.id],
    queryFn: () => (community ? communityApi.getMembers(community.id) : null),
    enabled: !!community,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Members"
        subtitle={`${members?.length || 0} total members`}
        actions={
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
        }
      />

      <Section title="All Members">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members?.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {member.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={member.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {member.name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
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
      </Section>
    </div>
  );
}
