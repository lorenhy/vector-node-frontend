'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface CarrierProfile {
  companyName: string;
  subscriptionTier: string;
  verified: boolean;
  rating: number;
}

// Italian translations
const TRANSLATIONS = {
  dashboard: 'Dashboard',
  browseLoads: 'Cerca Carichi',
  myBids: 'Le Mie Offerte',
  activeShipments: 'Spedizioni Attive',
  fleet: 'Flotta',
  drivers: 'Autisti',
  earnings: 'Guadagni',
  subscription: 'Abbonamento',
  companyProfile: 'Profilo Azienda',
  carrierPortal: 'Portale Trasportatore',
  verified: 'Verificato',
  logout: 'Esci',
  yourRating: 'La tua valutazione',
  loading: 'Caricamento...',
  trialDaysLeft: 'giorni rimasti',
};

const TIER_NAMES: Record<string, string> = {
  'FREE': 'Gratuito',
  'FREE_TRIAL': 'Prova Gratuita',
  'STARTER': 'Starter',
  'SMALL_FLEET': 'Piccola Flotta',
  'MEDIUM_FLEET': 'Media Flotta',
  'LARGE_FLEET': 'Grande Flotta',
  'BUSINESS': 'Business',
  'ENTERPRISE': 'Enterprise',
  'FLEX': 'Flex',
};

export default function CarrierLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [carrier, setCarrier] = useState<CarrierProfile | null>(null);

  // Sidebar states
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load sidebar preference from localStorage and handle resize
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== 'CARRIER') {
        router.push('/login');
        return;
      }
      setUser(userData);
      fetchCarrierProfile(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [router]);

  // Save sidebar preference
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    }
  }, [collapsed, mounted]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const fetchCarrierProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCarrier(data.carrier);
      }
    } catch (error) {
      console.error('Error fetching carrier profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleSidebar = () => {
    // On mobile, toggle mobile overlay
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      // On desktop, collapse/expand
      setCollapsed(!collapsed);
    }
  };

  const navItems = [
    { href: '/carrier', label: TRANSLATIONS.dashboard, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/carrier/loads', label: TRANSLATIONS.browseLoads, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { href: '/carrier/bids', label: TRANSLATIONS.myBids, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { href: '/carrier/shipments', label: TRANSLATIONS.activeShipments, icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
    { href: '/carrier/fleet', label: TRANSLATIONS.fleet, icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { href: '/carrier/drivers', label: TRANSLATIONS.drivers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { href: '/carrier/earnings', label: TRANSLATIONS.earnings, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: '/carrier/subscription', label: TRANSLATIONS.subscription, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { href: '/carrier/profile', label: TRANSLATIONS.companyProfile, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">{TRANSLATIONS.loading}</div>
      </div>
    );
  }

  const tierName = TIER_NAMES[carrier?.subscriptionTier || 'FREE'] || carrier?.subscriptionTier || 'Gratuito';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Top Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="text-xl font-bold text-blue-600">VectorNode</Link>
            <span className="text-sm text-gray-500 hidden md:block">{TRANSLATIONS.carrierPortal}</span>
          </div>

          <div className="flex items-center gap-3">
            {carrier?.verified && (
              <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">{TRANSLATIONS.verified}</span>
              </span>
            )}

            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              carrier?.subscriptionTier === 'FREE' || carrier?.subscriptionTier === 'FREE_TRIAL'
                ? 'bg-gray-100 text-gray-800'
                : carrier?.subscriptionTier === 'SMALL_FLEET' || carrier?.subscriptionTier === 'STARTER'
                ? 'bg-blue-100 text-blue-800'
                : carrier?.subscriptionTier === 'MEDIUM_FLEET' || carrier?.subscriptionTier === 'BUSINESS'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {tierName}
            </span>

            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{carrier?.companyName}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm font-medium hidden sm:block"
            >
              {TRANSLATIONS.logout}
            </button>
            {/* Mobile logout icon */}
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg sm:hidden"
              aria-label="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop: collapsible, Mobile: off-canvas overlay */}
      <aside
        className="fixed top-16 h-[calc(100vh-4rem)] bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out z-40"
        style={{
          left: isMobile ? (mobileOpen ? 0 : '-18rem') : 0,
          width: isMobile ? '18rem' : (collapsed ? '5rem' : '16rem')
        }}
      >
        <nav className="p-3 space-y-1 overflow-y-auto h-full pb-32">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {/* Show label on mobile always, on desktop only when not collapsed */}
                <span className={`text-sm font-medium whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Rating Display - Bottom of sidebar */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100 ${collapsed ? 'md:hidden' : ''}`}>
          {carrier && (
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= Math.floor(carrier.rating || 0) ? 'fill-current' : 'fill-gray-200'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-800">{(carrier.rating || 0).toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-500">{TRANSLATIONS.yourRating}</p>
            </div>
          )}
        </div>

        {/* Collapsed state - just show rating number */}
        {collapsed && carrier && (
          <div className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-200">
              <span className="text-sm font-bold text-yellow-700">{(carrier.rating || 0).toFixed(1)}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content - adjusts based on sidebar state */}
      <main
        className="pt-16 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? '5rem' : '16rem')
        }}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
