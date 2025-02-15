import { useSearchParams } from 'react-router-dom';
import LoginForm from './LoginForm';
import { authLogger } from '@/lib/utils/logger';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const isPlatform = searchParams.get('subdomain') === 'platform';

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="login-page-container"
      role="main"
      aria-label="Login page"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1
          className="text-2xl font-semibold text-gray-900 text-center mt-6"
          data-testid="page-heading"
        >
          {isPlatform ? 'Platform Login' : 'Community Login'}
        </h1>
      </div>
      <LoginForm
        onSuccess={() => {
          authLogger.debug('[LoginPage] Login successful, redirecting...');
        }}
        type={isPlatform ? 'platform' : 'community'}
      />
    </div>
  );
}
