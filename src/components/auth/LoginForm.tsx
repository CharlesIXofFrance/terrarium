import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../lib/hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
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

  return (
    <form 
      id={formId}
      onSubmit={handleSubmit((data) => login(data))}
      className="space-y-4"
    >
      <div>
        <Input
          type="email"
          label="Email"
          id={`${formId}-email`}
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>
      <div>
        <Input
          type="password"
          label="Password"
          id={`${formId}-password`}
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>
      {loginError && (
        <p className="text-red-500 text-sm" role="alert">
          {loginError}
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        isLoading={isLoggingIn}
      >
        Sign In
      </Button>
      <div className="text-sm text-gray-600 text-center space-y-1">
        <p>Demo accounts (any password):</p>
        <p>Member: member@test.com</p>
        <p>Admin: admin@test.com</p>
      </div>
    </form>
  );
}