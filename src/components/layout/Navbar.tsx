import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <Globe2 className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Terrarium</span>
          </div>

          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a
              href="#communities"
              className="text-gray-600 hover:text-gray-900"
            >
              Communities
            </a>
            <a href="#employers" className="text-gray-600 hover:text-gray-900">
              Employers
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={
                    user.role === 'admin' ? '/c/default' : '/m/women-in-fintech'
                  }
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
