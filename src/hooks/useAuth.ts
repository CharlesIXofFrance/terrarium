import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createClient,
  type User,
  type UserResponse,
} from '@supabase/supabase-js';
import { atom, useAtom } from 'jotai';

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface AuthError {
  message: string;
}

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface ResetPasswordData {
  email: string;
}

interface UpdatePasswordData {
  password: string;
}

// Atoms
export const userAtom = atom<User | null>(null);
export const authErrorAtom = atom<string | null>(null);

// Hook
export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useAtom(userAtom);
  const [authError, setAuthError] = useAtom(authErrorAtom);

  // Get current session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      return session;
    },
  });

  // Get user profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  // Sign Up mutation
  const signUp = useMutation({
    mutationFn: async (data: SignUpData) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });
      if (error) throw error;
      return authData;
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      }
      setAuthError(null);
    },
    onError: (error: AuthError) => {
      setAuthError(error.message);
    },
  });

  // Sign In mutation
  const signIn = useMutation({
    mutationFn: async (data: SignInData) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      return authData;
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      }
      setAuthError(null);
    },
    onError: (error: AuthError) => {
      setAuthError(error.message);
    },
  });

  // Sign Out mutation
  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setAuthError(null);
    },
    onError: (error: AuthError) => {
      setAuthError(error.message);
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (profile: Partial<Profile>) => {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setAuthError(null);
    },
    onError: (error: AuthError) => {
      setAuthError(error.message);
    },
  });

  // Reset password mutation (sends reset email)
  const resetPassword = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setAuthError(null);
    },
    onError: (error: AuthError) => {
      setAuthError(error.message);
    },
  });

  // Update password mutation
  const updatePassword = useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setAuthError(null);
    },
    onError: (error: AuthError) => {
      setAuthError(error.message);
    },
  });

  // Send email verification
  const sendVerificationEmail = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setAuthError(null);
    },
    onError: (error: AuthError) => {
      setAuthError(error.message);
    },
  });

  return {
    user,
    session,
    profile,
    authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    sendVerificationEmail,
    isLoading:
      isSessionLoading ||
      isProfileLoading ||
      signUp.isPending ||
      signIn.isPending ||
      signOut.isPending ||
      updateProfile.isPending ||
      resetPassword.isPending ||
      updatePassword.isPending ||
      sendVerificationEmail.isPending,
    isAuthenticated: !!user,
  };
}
