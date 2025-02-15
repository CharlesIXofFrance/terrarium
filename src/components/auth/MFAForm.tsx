import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { mapAuthError } from '@/lib/utils/errors';

interface MFAFormProps {
  onSuccess: () => void;
}

const MFAForm: React.FC<MFAFormProps> = ({ onSuccess }) => {
  const { verifyMFA } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await verifyMFA(code);

      if (error) {
        setError(mapAuthError(error));
        return;
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? mapAuthError(err)
          : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="mfa-code"
          className="block text-sm font-medium text-gray-700"
        >
          Authentication Code
        </label>
        <input
          id="mfa-code"
          data-testid="mfa-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter 6-digit code"
        />
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
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  );
};

export default MFAForm;
