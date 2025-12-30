'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  availableLoads: number;
  pendingBids: number;
  wonBids: number;
  activeShipments: number;
  totalEarnings: number;
  monthlyEarnings: number;
  completedDeliveries: number;
  rating: number;
}

interface RecentBid {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  shipment: {
    cargoDescription: string;
    pickupCity: string;
    deliveryCity: string;
  };
}

interface ActiveShipment {
  id: string;
  status: string;
  pickupCity: string;
  deliveryCity: string;
  cargoDescription: string;
  pickupDate?: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
}

export default function CarrierDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    availableLoads: 0,
    pendingBids: 0,
    wonBids: 0,
    activeShipments: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedDeliveries: 0,
    rating: 0
  });
  const [recentBids, setRecentBids] = useState<RecentBid[]>([]);
  const [activeShipments, setActiveShipments] = useState<ActiveShipment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch available loads count
      const loadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch my bids
      const bidsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids/my-bids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (loadsRes.ok) {
        const loadsData = await loadsRes.json();
        const availableLoads = loadsData.shipments?.filter(
          (s: any) => s.status === 'OPEN' || s.status === 'BIDDING'
        ) || [];

        setStats(prev => ({
          ...prev,
          availableLoads: availableLoads.length
        }));

        // Get active shipments (assigned to this carrier)
        const active = loadsData.shipments?.filter(
          (s: any) => ['ASSIGNED', 'PICKUP_SCHEDULED', 'IN_TRANSIT'].includes(s.status)
        ) || [];
        setActiveShipments(active.slice(0, 5));
        setStats(prev => ({ ...prev, activeShipments: active.length }));
      }

      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        const bids = bidsData.bids || [];

        setRecentBids(bids.slice(0, 5));

        const pending = bids.filter((b: any) => b.status === 'PENDING').length;
        const won = bids.filter((b: any) => b.status === 'ACCEPTED').length;

        setStats(prev => ({
          ...prev,
          pendingBids: pending,
          wonBids: won
        }));
      }

      // Set demo alerts
      setAlerts([
        {
          id: '1',
          type: 'info',
          title: 'New loads available',
          message: 'There are new shipments matching your preferences'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s your overview.</p>
        </div>
        <Link
          href="/carrier/loads"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Browse Loads
        </Link>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg flex items-start gap-3 ${
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <svg className={`w-5 h-5 flex-shrink-0 ${
                alert.type === 'warning' ? 'text-yellow-600' :
                alert.type === 'error' ? 'text-red-600' :
                alert.type === 'success' ? 'text-green-600' :
                'text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{alert.title}</p>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/carrier/loads" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Loads</p>
              <p className="text-3xl font-bold text-blue-600">{stats.availableLoads}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/carrier/bids" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Bids</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingBids}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/carrier/bids?status=won" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Won Bids</p>
              <p className="text-3xl font-bold text-green-600">{stats.wonBids}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/carrier/shipments" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Shipments</p>
              <p className="text-3xl font-bold text-purple-600">{stats.activeShipments}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/carrier/loads" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Browse Loads</span>
          </Link>

          <Link href="/carrier/bids" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">My Offers</span>
          </Link>

          <Link href="/carrier/fleet" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Fleet</span>
          </Link>

          <Link href="/carrier/drivers" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Drivers</span>
          </Link>

          <Link href="/carrier/earnings" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Earnings</span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Bids */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bids</h2>
            <Link href="/carrier/bids" className="text-sm text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          {recentBids.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No bids yet. Start browsing loads!</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentBids.map(bid => (
                <div key={bid.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {bid.shipment?.cargoDescription || 'Shipment'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bid.shipment?.pickupCity} → {bid.shipment?.deliveryCity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{bid.totalPrice}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        bid.status === 'WITHDRAWN' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bid.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Shipments */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Active Shipments</h2>
            <Link href="/carrier/shipments" className="text-sm text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          {activeShipments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No active shipments. Win some bids!</p>
            </div>
          ) : (
            <div className="divide-y">
              {activeShipments.map(shipment => (
                <Link
                  key={shipment.id}
                  href={`/carrier/shipments/${shipment.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {shipment.cargoDescription || 'Shipment'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {shipment.pickupCity} → {shipment.deliveryCity}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      shipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                      shipment.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.completedDeliveries}</div>
            <p className="text-sm text-gray-500">Completed Deliveries</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.rating.toFixed(1)}</div>
            <p className="text-sm text-gray-500">Rating</p>
            <div className="flex justify-center mt-1">
              <span className="text-yellow-500">
                {'★'.repeat(Math.floor(stats.rating))}
                {'☆'.repeat(5 - Math.floor(stats.rating))}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">€{stats.monthlyEarnings}</div>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">€{stats.totalEarnings}</div>
            <p className="text-sm text-gray-500">Total Earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
