import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { mapAuthError } from '@/lib/utils/errors';
import { AuthError } from '@supabase/supabase-js';

const PlatformRegister: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setEmailError('');
    setPasswordError('');
    setFirstNameError('');
    setLastNameError('');

    // Validate first name
    if (firstName.length < 2) {
      setFirstNameError('First name must be at least 2 characters');
      setIsLoading(false);
      return;
    }

    // Validate last name
    if (lastName.length < 2) {
      setLastNameError('Last name must be at least 2 characters');
      setIsLoading(false);
      return;
    }

    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      setIsLoading(false);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role: 'owner',
          },
        },
      });

      if (error) {
        const errorMessage = mapAuthError(error);
        if (
          errorMessage.toLowerCase().includes('email') ||
          (error instanceof AuthError && error.status === 422)
        ) {
          setEmailError('An account with this email already exists');
        } else {
          setError(errorMessage);
        }
        setIsLoading(false);
        return;
      }

      // Successful registration - redirect to verification page
      setVerificationSent(true);
      navigate('/auth/verify', { replace: true });
    } catch (err) {
      const errorMessage = mapAuthError(err as Error);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" data-testid="platform-register">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="firstName"
            data-testid="firstName-input"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {firstNameError && (
            <div
              role="alert"
              data-testid="firstName-error"
              className="text-red-500 text-sm mt-1"
            >
              {firstNameError}
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="lastName"
            data-testid="lastName-input"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {lastNameError && (
            <div
              role="alert"
              data-testid="lastName-error"
              className="text-red-500 text-sm mt-1"
            >
              {lastNameError}
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            data-testid="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {emailError && (
            <div
              role="alert"
              data-testid="email-error"
              className="text-red-500 text-sm mt-1"
            >
              {emailError}
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            data-testid="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            data-testid="confirmPassword-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {passwordError && (
            <div
              role="alert"
              data-testid="password-error"
              className="text-red-500 text-sm mt-1"
            >
              {passwordError}
            </div>
          )}
        </div>
        {error && (
          <div
            role="alert"
            data-testid="error-message"
            className="text-red-500 text-sm"
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          data-testid="submit-button"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
};

export default PlatformRegister;
