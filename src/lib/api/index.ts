export * from './auth';
export * from './recruitcrm';
export * from './api';
export * from './jobs';

// Combine all APIs into a single object for convenience
import { communityApi, jobsApi, employersApi } from './api';

export const api = {
  ...communityApi,
  ...jobsApi,
  ...employersApi,
};
