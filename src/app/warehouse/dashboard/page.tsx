'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  todayInbound: number;
  todayOutbound: number;
  currentInventory: number;
  totalProcessed: number;
}

interface RecentScan {
  id: string;
  action: string;
  unitNumber: string;
  trackingNumber: string;
  timestamp: string;
  scannedBy: string;
}

export default function WarehouseDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayInbound: 0,
    todayOutbound: 0,
    currentInventory: 0,
    totalProcessed: 0,
  });
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/warehouses/my/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!statsRes.ok) {
        if (statsRes.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch stats');
      }

      const statsData = await statsRes.json();
      setStats({
        todayInbound: statsData.todayInbound || 0,
        todayOutbound: statsData.todayOutbound || 0,
        currentInventory: statsData.currentInventory || 0,
        totalProcessed: statsData.totalProcessed || 0,
      });

      // Fetch recent scans
      const historyRes = await fetch('http://localhost:5000/api/warehouses/my/history?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentScans(historyData.history || []);
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📦 Warehouse Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time warehouse operations overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today Inbound</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todayInbound}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-3xl">📥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Units received today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today Outbound</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todayOutbound}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-3xl">📤</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Units shipped today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">In Warehouse</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.currentInventory}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-3xl">📦</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Currently stored</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Processed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProcessed}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-3xl">📊</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All-time units</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/warehouse/scans"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <span className="text-4xl">📱</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">QR Scanner</h3>
              <p className="text-sm text-gray-600">Scan inbound/outbound</p>
            </div>
          </div>
        </Link>

        <Link
          href="/warehouse/shipments"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
        >
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-full">
              <span className="text-4xl">📦</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">View Inventory</h3>
              <p className="text-sm text-gray-600">Current shipments</p>
            </div>
          </div>
        </Link>

        <Link
          href="/warehouse/profile"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-full">
              <span className="text-4xl">⚙️</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Settings</h3>
              <p className="text-sm text-gray-600">Warehouse profile</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Scans</h2>
          <Link
            href="/warehouse/shipments"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </Link>
        </div>

        {recentScans.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-lg font-medium text-gray-900">No scans yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Start scanning shipments to see activity here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Scanned By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        scan.action === 'INBOUND'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {scan.action === 'INBOUND' ? '📥 Inbound' : '📤 Outbound'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{scan.unitNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{scan.trackingNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatTime(scan.timestamp)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{scan.scannedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
