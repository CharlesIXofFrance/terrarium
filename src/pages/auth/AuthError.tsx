import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export function AuthError() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const error = params.get('error');
  const errorCode = params.get('error_code');
  const errorDescription = params.get('error_description');

  let title = 'Authentication Error';
  let description =
    'There was a problem with authentication. Please try again.';

  if (errorCode === 'otp_expired') {
    title = 'Link Expired';
    description =
      'Your email verification link has expired. Please request a new one.';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          {errorCode && (
            <p className="text-sm text-muted-foreground">
              Error code: {errorCode}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/login')}>Back to Login</Button>
        </div>
      </div>
    </div>
  );
}
