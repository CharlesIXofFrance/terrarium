import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Button } from '../../ui/atoms/Button';
import { Input } from '../../ui/atoms/Input';

interface LoginFormProps {
  onSuccess?: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({ onSuccess }: LoginFormProps) {
  const formId = useId();
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data);
      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(handleLogin)}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor={`${formId}-email`}
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <div className="mt-1">
          <Input
            type="email"
            id={`${formId}-email`}
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${formId}-password`}
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <Input
            type="password"
            id={`${formId}-password`}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>
      </div>

      {loginError && (
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
              <p className="text-sm font-medium text-red-800">{loginError}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <Button type="submit" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
      <div className="text-sm text-gray-600 text-center space-y-1">
        <p>Demo accounts (any password):</p>
        <p>Member: member@test.com</p>
        <p>Admin: admin@test.com</p>
      </div>
    </form>
  );
}
