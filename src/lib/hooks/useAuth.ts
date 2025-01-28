/**
 * AI Context:
 * This hook provides React components with access to Terrarium's auth system.
 * It handles both password-based (owners/admins) and passwordless (members/employers)
 * authentication flows.
 *
 * Features:
 * 1. Role-based auth flows
 * 2. Community context management
 * 3. Automatic redirects
 * 4. Loading and error states
 *
 * Usage:
 * const { user, signOut, isAuthenticated } = useAuth();
 */

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom, isLoadingAtom } from '../stores/auth';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      if (session?.user) {
        setUser(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading]);

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    signOut,
    isAuthenticated: !!user,
  };
}
