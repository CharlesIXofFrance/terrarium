import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useSignedUrl = (path: string | null) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!path) {
        setSignedUrl(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from('community-assets')
          .createSignedUrl(path, 3600);

        if (error) throw error;
        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error('Error getting signed URL:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [path]);

  return { signedUrl, loading, error };
};
