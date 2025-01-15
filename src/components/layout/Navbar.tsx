import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/atoms/Button';

interface NavbarProps {
  onDashboardClick?: () => void;
}

export function Navbar({ onDashboardClick }: NavbarProps) {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'platform_owner' ? '/platform' : '/m/dashboard';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                Terrarium
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link to={getDashboardLink()}>
                <Button
                  onClick={onDashboardClick}
                  variant="default"
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="default"
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
