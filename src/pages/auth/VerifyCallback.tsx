import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/atoms/Spinner';

export function VerifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters using URLSearchParams
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');
        const redirectTo = urlParams.get('redirect_to');

        console.log('Verify Callback - URL Parameters:', {
          token,
          type,
          redirectTo,
          fullUrl: window.location.href,
          searchParams: Object.fromEntries(urlParams.entries()),
        });

        if (!token || !type) {
          throw new Error('Missing token or type in URL');
        }

        // Let Supabase handle the verification and redirect
        const { error } = await supabase.auth.verifyOtp({
          type: type as 'recovery',
          token,
          email: null,
          options: {
            redirectTo
          }
        });

        if (error) {
          throw error;
        }

        // Check if session was created
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        // Redirect based on type
        if (type === 'recovery') {
          navigate('/reset-password');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Verify Callback - Error:', error);
        navigate('/login', { state: { error: 'Invalid or expired verification link' } });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Spinner />
      <p className="mt-4 text-gray-600">Verifying your reset link...</p>
    </div>
  );
}
