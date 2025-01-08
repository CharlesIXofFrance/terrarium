/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Community Job Board
 * User Types: COMMUNITY_OWNER
 *
 * Settings page for community owners to configure their job board.
 * Controls job posting rules and RecruitCRM integration.
 *
 * Location: /src/pages/community/
 * - Part of community settings
 * - Affects job board functionality
 *
 * Responsibilities:
 * - Configure job posting rules
 * - Manage RecruitCRM integration
 * - Set approval workflows
 * - Define job categories
 *
 * Design Constraints:
 * - Must use shared UI components
 * - Must validate integration settings
 * - Must preserve existing jobs
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { RecruitCRMSettings } from '@/components/features/settings/RecruitCRMSettings';
import { Button } from '@/components/ui/atoms/Button';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { Section } from '@/components/ui/molecules/Section';

export function JobBoardSettings() {
  const { slug } = useParams();

  if (!slug) {
    return <div>Invalid community</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Job Board Settings"
        subtitle="Configure your community job board"
      />

      <Section title="RecruitCRM Integration">
        <RecruitCRMSettings communityId={slug} />
      </Section>

      <Section title="Job Board Rules">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6"></div>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
