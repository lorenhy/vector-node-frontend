// ==========================================
// FILE: src/components/layout/Sidebar.tsx
// ==========================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Truck,
  FileText,
  Settings,
  DollarSign,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shipperLinks = [
    { href: '/shipper', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/shipper/shipments', label: 'My Shipments', icon: Package },
    { href: '/shipper/shipments/new', label: 'New Shipment', icon: Package },
    { href: '/shipper/history', label: 'History', icon: FileText },
  ];

  const carrierLinks = [
    { href: '/carrier', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/carrier/loads', label: 'Available Loads', icon: Package },
    { href: '/carrier/bids', label: 'My Bids', icon: DollarSign },
    { href: '/carrier/active', label: 'Active Jobs', icon: Truck },
    { href: '/carrier/history', label: 'History', icon: FileText },
  ];

  const commonLinks = [
    { href: '/profile', label: 'Profile', icon: Settings },
  ];

  if (!mounted) {
    return (
      <aside className="w-64 bg-white border-r min-h-screen">
        <nav className="p-4 space-y-2">
          <div className="animate-pulse space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </nav>
      </aside>
    );
  }

  const links = user?.role === 'SHIPPER' ? shipperLinks : carrierLinks;

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <nav className="p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}

        <div className="pt-4 border-t">
          {commonLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}


