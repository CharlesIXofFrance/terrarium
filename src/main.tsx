import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSetAtom } from 'jotai';
import { userAtom, sessionAtom, profileAtom, isLoadingAtom, userCommunityAtom, currentCommunityAtom } from './lib/stores/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import { initAuth } from './lib/stores/auth';
import { ErrorBoundary } from '@/components/layout/molecules/ErrorBoundary';

// Import only the primary font weights needed
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import './index.css';

// Configure React Query client with optimal settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Add global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  // Render error UI if root exists
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div data-testid="mount-error" style="padding: 20px; color: red;">
        Application failed to load. Please check console for errors.
      </div>
    `;
  }
};

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Fatal: #root element not found in the document');
  throw new Error('Root element not found');
}

// Create root and ensure element is visible
const root = createRoot(rootElement);
rootElement.style.display = 'block';
rootElement.style.visibility = 'visible';
rootElement.style.opacity = '1';
rootElement.style.height = '100%';

try {
  console.log('Attempting to render React app...');
  
  // Initialize auth in the background
  function AuthInitializer() {
    const setUser = useSetAtom(userAtom);
    const setSession = useSetAtom(sessionAtom);
    const setProfile = useSetAtom(profileAtom);
    const setIsLoading = useSetAtom(isLoadingAtom);
    const setUserCommunity = useSetAtom(userCommunityAtom);
    const setCurrentCommunity = useSetAtom(currentCommunityAtom);
    
    useEffect(() => {
      const set = {
        setUser,
        setSession,
        setProfile,
        setIsLoading,
        setUserCommunity,
        setCurrentCommunity
      };

      initAuth(set)
        .then(({ user, profile, session }) => {
          console.log('Auth initialized successfully', { 
            hasUser: !!user,
            hasProfile: !!profile, 
            hasSession: !!session 
          });
        })
        .catch(error => {
          console.error('Failed to initialize auth:', error);
        });
    }, [setUser, setSession, setProfile, setIsLoading, setUserCommunity, setCurrentCommunity]);
    
    return null;
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider>
          <QueryClientProvider client={queryClient}>
            <AuthInitializer />
            <App />
            {import.meta.env.DEV && <ReactQueryDevtools />}
          </QueryClientProvider>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render React app:', error);
  rootElement.innerHTML = `
    <div data-testid="mount-error" style="padding: 20px; color: red;">
      Application failed to load. Please check console for errors.
    </div>
  `;
  throw error;
}
