import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../lib/hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
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
      name: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      setIsConfirmationSent(true);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (isConfirmationSent) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
        <p className="text-gray-600">
          We've sent you a confirmation email. Please click the link in the email to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Don't see the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <Input
          type="text"
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>
      <div>
        <Input
          type="email"
          label="Email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>
      <div>
        <Input
          type="password"
          label="Password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>
      {registerError && (
        <p className="text-red-500 text-sm" role="alert">
          {registerError}
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        isLoading={isRegistering}
      >
        Create Account
      </Button>
    </form>
  );
}