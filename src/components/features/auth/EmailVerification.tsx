import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface EmailVerificationProps {
  email: string;
  onResendSuccess?: () => void;
}

export function EmailVerification({
  email,
  onResendSuccess,
}: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    try {
      setIsResending(true);
      setResendError(null);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      setResendSuccess(true);
      setCountdown(60); // Start 60 second countdown
      onResendSuccess?.();
    } catch (err) {
      setResendError(
        err instanceof Error
          ? err.message
          : 'Failed to resend verification email'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Verify your email
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                We've sent a verification email to{' '}
                <span className="font-medium">{email}</span>.
              </p>
              <p className="mt-1">
                Please check your inbox and click the verification link to
                continue.
              </p>
            </div>
            {resendError && (
              <p className="mt-2 text-sm text-red-600">{resendError}</p>
            )}
            {resendSuccess && (
              <p className="mt-2 text-sm text-green-600">
                Verification email resent successfully!
              </p>
            )}
          </div>
          <div className="mt-4 md:ml-6 md:mt-0">
            <button
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              className={`text-sm font-medium ${
                isResending || countdown > 0
                  ? 'text-blue-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              {isResending
                ? 'Sending...'
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
