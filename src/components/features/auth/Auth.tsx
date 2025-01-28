import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { ownerAuth } from '@/services/auth';
import { z } from 'zod';
import { UserRole } from '@/lib/utils/types';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.nativeEnum(UserRole),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function Auth() {
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const signUpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signUpSchema>) => {
      const result = await ownerAuth.signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to sign up');
      }
      return result;
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signInSchema>) => {
      const result = await ownerAuth.signIn({
        email: data.email,
        password: data.password,
      });
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to sign in');
      }
      return result;
    },
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUpMutation.mutateAsync({
        email,
        password,
        firstName,
        lastName,
        role: UserRole.ADMIN,
      });
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInMutation.mutateAsync({
        email,
        password,
      });
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
        </div>
      ) : (
        <div>
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button type="submit">Sign In</button>
          </form>
          <form onSubmit={handleSignUp}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>
      )}
    </div>
  );
}
