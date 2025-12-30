// ==========================================
// FILE: src/components/layout/Navbar.tsx
// ==========================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              VectorNode
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            {mounted && user && (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


