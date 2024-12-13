import React from 'react';
import { useParams } from 'react-router-dom';
import { RecruitCRMSettings } from '../../components/settings/RecruitCRMSettings';
import { Button } from '../../components/ui/Button';

export function JobBoardSettings() {
  const { communitySlug } = useParams();

  if (!communitySlug) {
    return <div>Invalid community</div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Job Board Settings
      </h1>

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <RecruitCRMSettings communityId={communitySlug} />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}