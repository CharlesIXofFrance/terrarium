import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'jotai';
import { userAtom } from '@/lib/stores/auth';
import { PublicOnlyRoute } from '../PublicOnlyRoute';

// Mock components for testing
const TestComponent = () => <div>Test Component</div>;
const DashboardComponent = () => <div>Dashboard</div>;

describe('PublicOnlyRoute', () => {
  it('renders children when user is not logged in', () => {
    const { getByText } = render(
      <Provider initialValues={[[userAtom, null]]}>
        <MemoryRouter>
          <PublicOnlyRoute>
            <TestComponent />
          </PublicOnlyRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(getByText('Test Component')).toBeInTheDocument();
  });

  it('redirects to dashboard when user is logged in', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      onboarding_completed: true,
    };

    const { queryByText } = render(
      <Provider initialValues={[[userAtom, mockUser]]}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <TestComponent />
                </PublicOnlyRoute>
              }
            />
            <Route path="/dashboard" element={<DashboardComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(queryByText('Test Component')).not.toBeInTheDocument();
      expect(queryByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('redirects to onboarding when user has not completed onboarding', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      onboarding_completed: false,
    };

    const { queryByText } = render(
      <Provider initialValues={[[userAtom, mockUser]]}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <TestComponent />
                </PublicOnlyRoute>
              }
            />
            <Route path="/onboarding" element={<div>Onboarding</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(queryByText('Test Component')).not.toBeInTheDocument();
      expect(queryByText('Onboarding')).toBeInTheDocument();
    });
  });

  it('redirects to community dashboard when user has a community', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      onboarding_completed: true,
      community_slug: 'test-community',
    };

    const { queryByText } = render(
      <Provider initialValues={[[userAtom, mockUser]]}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <TestComponent />
                </PublicOnlyRoute>
              }
            />
            <Route path="/c/:slug/dashboard" element={<div>Community Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(queryByText('Test Component')).not.toBeInTheDocument();
      expect(queryByText('Community Dashboard')).toBeInTheDocument();
    });
  });
});
