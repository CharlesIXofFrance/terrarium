import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';
import { useAuth } from '@/lib/hooks/useAuth';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the useAuth hook
vi.mock('@/lib/hooks/useAuth');

describe('Navigation Components', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Navbar', () => {
    it('should show platform dashboard link for platform owners', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'admin' },
        logout: vi.fn(),
      });

      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });
      const dashboardLink = dashboardButton.closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/platform');
    });

    it('should show member dashboard link for community owners', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'owner' },
        logout: vi.fn(),
      });

      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });
      const dashboardLink = dashboardButton.closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/m/dashboard');
    });
  });

  describe('Sidebar', () => {
    it('should show platform navigation for platform owners', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'admin' },
      });

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Communities')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should show community navigation for community owners', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'owner' },
      });

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Members')).toBeInTheDocument();
      expect(screen.getByText('Jobs')).toBeInTheDocument();
      expect(screen.getByText('Employers')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
