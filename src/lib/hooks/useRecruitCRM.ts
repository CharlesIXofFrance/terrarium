import { useState } from 'react';
import { useAtom } from 'jotai';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communitySettingsAtom } from '../stores/settings';
import { RecruitCRMService } from '../api/recruitcrm';
import type { RecruitCRMSettings } from '../stores/settings';

export function useRecruitCRM(communityId: string) {
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [settings, setSettings] = useAtom(communitySettingsAtom);
  const queryClient = useQueryClient();

  const communitySettings = settings[communityId] || {
    recruitCRM: {
      enabled: false,
      apiKey: '',
      filters: {
        status: ['active'],
        jobTypes: [],
        locations: [],
      },
      syncInterval: 60,
    },
  };

  const service = new RecruitCRMService({
    apiKey: communitySettings.recruitCRM.apiKey,
    communityId,
    filters: communitySettings.recruitCRM.filters,
  });

  const { data: jobTypes, isLoading: isLoadingJobTypes } = useQuery({
    queryKey: ['recruitcrm', 'jobTypes', communityId],
    queryFn: () => service.getJobTypes(),
    enabled: !!communitySettings.recruitCRM.enabled && !!communitySettings.recruitCRM.apiKey,
  });

  const syncMutation = useMutation({
    mutationFn: () => service.syncJobs(),
    onSuccess: () => {
      console.log('✅ Job sync mutation completed');
      setSettings((prev) => ({
        ...prev,
        [communityId]: {
          ...prev[communityId],
          recruitCRM: {
            ...prev[communityId].recruitCRM,
            lastSyncedAt: new Date().toISOString(),
          },
        },
      }));
      // Invalidate jobs query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => {
      console.error('❌ Job sync mutation failed:', error);
    },
  });

  const testApiConnection = async (apiKey: string): Promise<boolean> => {
    setIsTestingApi(true);
    try {
      const testService = new RecruitCRMService({
        apiKey,
        communityId,
      });
      return await testService.testConnection();
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    } finally {
      setIsTestingApi(false);
    }
  };

  const updateSettings = (newSettings: Partial<RecruitCRMSettings>) => {
    setSettings((prev) => ({
      ...prev,
      [communityId]: {
        ...prev[communityId],
        recruitCRM: {
          ...prev[communityId]?.recruitCRM,
          ...newSettings,
        },
      },
    }));
  };

  return {
    settings: communitySettings.recruitCRM,
    updateSettings,
    jobTypes,
    isLoadingJobTypes,
    syncJobs: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    syncStats: syncMutation.data,
    testApiConnection,
    isTestingApi,
  };
}