import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useRecruitCRM } from '../../lib/hooks/useRecruitCRM';
import { env } from '../../lib/env';

const settingsSchema = z.object({
  enabled: z.boolean(),
  apiKey: z.string().optional(),
  syncInterval: z.number().min(15).max(1440),
  filters: z.object({
    status: z.array(z.string()),
    jobTypes: z.array(z.string()),
    locations: z.array(z.string()),
  }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface RecruitCRMSettingsProps {
  communityId: string;
}

export function RecruitCRMSettings({ communityId }: RecruitCRMSettingsProps) {
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  
  const {
    settings,
    updateSettings,
    jobTypes,
    isLoadingJobTypes,
    syncJobs,
    isSyncing,
    syncStats,
    syncError,
    testApiConnection,
  } = useRecruitCRM(communityId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const isEnabled = watch('enabled');
  const apiKey = watch('apiKey');

  const handleTestApi = async () => {
    if (!apiKey && !env.RECRUITCRM_API_KEY) {
      setTestError('No API key provided');
      setTestResult(false);
      return;
    }
    
    setIsTestingApi(true);
    setTestResult(null);
    setTestError(null);
    let timeoutHandle: number;
    
    try {
      // Set a UI timeout that's longer than the API timeout
      timeoutHandle = window.setTimeout(() => {
        setTestError('Connection timed out. Please try again.');
        setTestResult(false);
        setIsTestingApi(false);
      }, 12000);

      const result = await testApiConnection(apiKey || env.RECRUITCRM_API_KEY);
      setTestResult(result);
      if (!result) {
        setTestError('Connection failed. Please check your API key.');
      }
    } catch (error) {
      console.error('API test error:', error);
      setTestResult(false);
      if (error instanceof Error) {
        if (error.message.includes('timed out')) {
          setTestError('Connection timed out. Please try again.');
        } else {
          setTestError(error.message);
        }
      } else {
        setTestError('Connection failed');
      }
    } finally {
      clearTimeout(timeoutHandle);
      setIsTestingApi(false);
    }
  };

  const onSubmit = (data: SettingsFormData) => {
    updateSettings(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            RecruitCRM Integration
          </h3>
          <p className="text-sm text-gray-500">
            Sync jobs from your RecruitCRM account
          </p>
        </div>
        {settings.lastSyncedAt && (
          <p className="text-sm text-gray-500">
            Last synced: {new Date(settings.lastSyncedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Sync Results */}
      {syncStats && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Sync Completed Successfully
              </h3>
              <div className="mt-2 text-sm text-green-700 space-y-1">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>{syncStats.added} jobs added</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>{syncStats.updated} jobs updated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Minus className="h-4 w-4" />
                  <span>{syncStats.removed} jobs removed</span>
                </div>
                {syncStats.errors.length > 0 && (
                  <div className="text-yellow-700">
                    {syncStats.errors.length} errors occurred during sync
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Error */}
      {syncError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Sync Failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{syncError instanceof Error ? syncError.message : 'An error occurred during sync'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Development Mode
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This integration is currently in development mode. Use any non-empty API key
                to test the functionality. The API key "invalid" will simulate an error.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enabled"
            {...register('enabled')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            Enable RecruitCRM Integration
          </label>
        </div>

        {isEnabled && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    {...register('apiKey')}
                    error={errors.apiKey?.message}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestApi}
                    isLoading={isTestingApi}
                  >
                    Test Connection
                  </Button>
                </div>
                {testResult === true && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Connection successful
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sync Interval (minutes)
                </label>
                <Input
                  type="number"
                  {...register('syncInterval', { valueAsNumber: true })}
                  error={errors.syncInterval?.message}
                  min={15}
                  max={1440}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Status Filter
                </label>
                <div className="space-y-2">
                  {['active', 'draft', 'closed'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        value={status}
                        {...register('filters.status')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {!isLoadingJobTypes && jobTypes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Types Filter
                  </label>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <label key={type.id} className="flex items-center">
                        <input
                          type="checkbox"
                          value={type.name}
                          {...register('filters.jobTypes')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {type.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Filter
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add location..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const value = input.value.trim();
                        if (value) {
                          const currentLocations = watch('filters.locations');
                          if (!currentLocations.includes(value)) {
                            updateSettings({
                              filters: {
                                ...settings.filters,
                                locations: [...currentLocations, value],
                              },
                            });
                          }
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {watch('filters.locations').map((location) => (
                    <span
                      key={location}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {location}
                      <button
                        type="button"
                        className="ml-1 text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          const currentLocations = watch('filters.locations');
                          updateSettings({
                            filters: {
                              ...settings.filters,
                              locations: currentLocations.filter(l => l !== location),
                            },
                          });
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => syncJobs()}
                isLoading={isSyncing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sync Now</span>
              </Button>

              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </>
        )}

        {testError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{testError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}