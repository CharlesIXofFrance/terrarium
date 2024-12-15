import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useSetAtom } from 'jotai';
import { userAtom } from '../../lib/auth';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Starting email confirmation...');
        
        // Get the current URL and hash
        const currentUrl = window.location.href;
        const hash = window.location.hash;
        console.log('Current URL:', currentUrl);
        console.log('URL Hash:', hash);

        // Parse the hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('Hash params:', { 
          type,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken 
        });

        if (type === 'email_confirmation' || (accessToken && refreshToken)) {
          console.log('Setting session with tokens...');
          // Set the session with the tokens
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          console.log('Session established:', !!session);

          // Get the user data
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('User error:', userError);
            throw userError;
          }

          if (!user) {
            throw new Error('No user found after confirmation');
          }

          console.log('User found:', { 
            id: user.id,
            email: user.email,
            emailConfirmed: !!user.email_confirmed_at 
          });

          // Get the user's profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            throw profileError;
          }

          // Update the user atom using setUser
          setUser(profile);
          
          console.log('Email confirmed successfully, redirecting to onboarding...');
          navigate('/onboarding', { replace: true });
          return;
        }

        // If we get here without tokens, try to get the current session
        console.log('No tokens found, checking current session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session) {
          throw new Error('No active session found');
        }

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('User error:', userError);
          throw userError;
        }

        if (!user?.email_confirmed_at) {
          throw new Error('Email not yet confirmed');
        }

        // Get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          throw profileError;
        }

        // Update the user atom using setUser
        setUser(profile);

        console.log('Session verified, redirecting to onboarding...');
        navigate('/onboarding', { replace: true });
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during verification');
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-4 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we confirm your email address.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
