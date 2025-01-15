import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { useAuth } from '@/lib/hooks/useAuth';
import { PublicOnlyRoute } from '../PublicOnlyRoute';

// Mock useAuth hook
vi.mock('@/lib/hooks/useAuth');

const TestComponent = () => <div>Test Component</div>;

describe('PublicOnlyRoute', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <TestComponent />
              </PublicOnlyRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/onboarding" element={<div>Onboarding</div>} />
          <Route
            path="/c/:slug/dashboard"
            element={<div>Community Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('redirects to dashboard when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '123',
        role: 'member',
        onboardingComplete: true,
      },
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });

  it('redirects to onboarding when user has not completed onboarding', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '123',
        role: 'member',
        onboardingComplete: false,
      },
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });

  it('redirects to community dashboard when user has a community', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '123',
        role: 'member',
        onboardingComplete: true,
        community_slug: 'test-community',
      },
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText('Community Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });
});
