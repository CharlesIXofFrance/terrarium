import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { useAuth } from '@/lib/hooks/useAuth';
import { PlatformRoutes } from '../PlatformRoutes';

// Mock useAuth hook
vi.mock('@/lib/hooks/useAuth');

describe('PlatformRoutes', () => {
  const renderWithRouter = (initialRoute = '/platform') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/platform/*" element={<PlatformRoutes />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to login if user is not a platform owner', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'member' },
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders dashboard for platform owner', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'admin' },
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText('Platform Dashboard')).toBeInTheDocument();
  });

  it('renders communities list for platform owner', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'admin' },
      isLoading: false,
    });

    renderWithRouter('/platform/communities');
    expect(screen.getByText('Communities List')).toBeInTheDocument();
  });

  it('renders users list for platform owner', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'admin' },
      isLoading: false,
    });

    renderWithRouter('/platform/users');
    expect(screen.getByText('Users List')).toBeInTheDocument();
  });

  it('renders settings for platform owner', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'admin' },
      isLoading: false,
    });

    renderWithRouter('/platform/settings');
    expect(screen.getByText('Platform Settings')).toBeInTheDocument();
  });

  it('redirects to dashboard for unknown routes', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'admin' },
      isLoading: false,
    });

    renderWithRouter('/platform/unknown');
    expect(screen.getByText('Platform Dashboard')).toBeInTheDocument();
  });
});
