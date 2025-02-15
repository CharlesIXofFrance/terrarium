import React from 'react';
import { supabase } from '@/lib/supabase';
import { authLogger } from '@/lib/utils/logger';

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = React.useState<any>({
    session: null,
    lastEvent: null,
    lastError: null,
    timestamp: null
  });

  React.useEffect(() => {
    let mounted = true;

    const updateDebugInfo = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted) {
          setDebugInfo(prev => ({
            ...prev,
            session: session ? {
              id: session.user?.id,
              email: session.user?.email,
              role: session.user?.role,
              metadata: session.user?.user_metadata
            } : null,
            lastError: error,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        authLogger.error('Debug info fetch error:', error);
      }
    };

    // Update initially
    updateDebugInfo();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setDebugInfo(prev => ({
          ...prev,
          lastEvent: event,
          session: session ? {
            id: session.user?.id,
            email: session.user?.email,
            role: session.user?.role,
            metadata: session.user?.user_metadata
          } : null,
          timestamp: new Date().toISOString()
        }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div
      data-testid="auth-debug"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        background: '#f0f0f0',
        padding: '10px',
        maxWidth: '300px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        border: '1px solid #ccc'
      }}
    >
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}
