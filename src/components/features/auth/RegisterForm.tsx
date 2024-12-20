import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Button } from '../../ui/atoms/Button';
import { Input } from '../../ui/atoms/Input';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (isRegistering) return;

    try {
      const result = await registerUser(data);
      if (result?.needsEmailVerification) {
        setIsConfirmationSent(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (isConfirmationSent) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Check your email
        </h3>
        <p className="text-gray-600">
          We've sent you a confirmation email. Please click the link in the
          email to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Don't see the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <div className="mt-1">
          <Input
            id="full_name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            {...register('full_name')}
            error={errors.full_name?.message}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <div className="mt-1">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Must be at least 6 characters
        </p>
      </div>

      {registerError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {registerError}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}
