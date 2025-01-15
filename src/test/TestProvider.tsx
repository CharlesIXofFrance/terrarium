import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

interface TestProviderProps {
  children: React.ReactNode;
  initialRoute?: string;
}

export const TestProvider: React.FC<TestProviderProps> = ({
  children,
  initialRoute = '/',
}) => {
  // Set initial route
  window.history.pushState({}, 'Test page', initialRoute);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

export const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => <TestProvider>{children}</TestProvider>,
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react';
