/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Community Management
 * User Types: COMMUNITY_OWNER
 *
 * Settings page for community owners to manage their personal profile.
 * Controls owner-specific settings and preferences.
 *
 * Location: /src/pages/community/
 * - Part of community settings
 * - Owner-specific settings
 *
 * Responsibilities:
 * - Manage owner profile
 * - Set notification preferences
 * - Configure access controls
 * - Update contact info
 *
 * Design Constraints:
 * - Must use shared UI components
 * - Must validate sensitive changes
 * - Must handle role permissions
 */

import { Plus } from 'lucide-react';
import { useAtom } from 'jotai';
import { useState } from 'react';

import { Button } from '@/components/ui/atoms/Button';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { Section } from '@/components/ui/molecules/Section';
import { MemberFieldsSettings } from '@/components/features/community/settings/MemberFieldsSettings';
import { currentCommunityAtom } from '@/lib/stores/community';

export function DataSettings() {
  const [currentCommunity] = useAtom(currentCommunityAtom);
  const [isAddingField, setIsAddingField] = useState(false);

  if (!currentCommunity) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Data Settings"
        subtitle="Configure member and employer data fields to collect the information you need"
        actions={
          <Button
            onClick={() => setIsAddingField(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </Button>
        }
      />

      <Section title="Member Fields">
        <MemberFieldsSettings
          communityId={currentCommunity.id}
          isAddingField={isAddingField}
          onAddField={() => setIsAddingField(true)}
          onSave={() => setIsAddingField(false)}
        />
      </Section>
    </div>
  );
}
