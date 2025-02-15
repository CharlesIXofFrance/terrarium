import { useEffect } from 'react';
import { enableAllLogs } from '@/lib/utils/logger';

/**
 * Development-only component that enables enhanced debugging features
 * This component will only be included in development builds
 */
export function DevTools() {
  useEffect(() => {
    // Enable all logs when component mounts
    enableAllLogs();
    
    // Expose logger controls to window for easy console access
    if (window) {
      (window as any).__DEBUG__ = {
        enableAllLogs,
        disableAllLogs: () => import('@/lib/utils/logger').then(m => m.disableAllLogs()),
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
