'use client';

import { useState, useEffect } from 'react';

interface EarningRecord {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  cargoDescription: string;
  amount: number;
  escrowStatus: 'HELD' | 'RELEASED' | 'REFUNDED';
  deliveredAt: string;
  releasedAt?: string;
  pickupCity: string;
  deliveryCity: string;
}

interface EarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  releasedEarnings: number;
  shipmentsDelivered: number;
  averagePerShipment: number;
}

export default function CarrierEarningsPage() {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    pendingEarnings: 0,
    releasedEarnings: 0,
    shipmentsDelivered: 0,
    averagePerShipment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'released' | 'pending'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    fetchEarnings();
  }, [filter, dateRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);

      // Fetch shipments with payment data
      const response = await fetch('http://localhost:5000/api/shipments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch earnings');

      const data = await response.json();

      // Filter only delivered shipments with selected bid
      const deliveredShipments = data.data.filter((s: any) =>
        s.status === 'DELIVERED' || s.status === 'COMPLETED'
      );

      // Calculate earnings
      const earningsData: EarningRecord[] = deliveredShipments.map((s: any) => ({
        id: s.id,
        shipmentId: s.id,
        trackingNumber: s.trackingNumber,
        cargoDescription: s.cargoDescription,
        amount: s.selectedBid?.price || 0,
        escrowStatus: s.selectedBid?.escrowStatus || 'HELD',
        deliveredAt: s.updatedAt,
        releasedAt: s.selectedBid?.escrowReleasedAt,
        pickupCity: s.pickupCity,
        deliveryCity: s.deliveryCity,
      }));

      // Calculate summary
      const totalEarnings = earningsData.reduce((sum, e) => sum + e.amount, 0);
      const releasedEarnings = earningsData
        .filter(e => e.escrowStatus === 'RELEASED')
        .reduce((sum, e) => sum + e.amount, 0);
      const pendingEarnings = earningsData
        .filter(e => e.escrowStatus === 'HELD')
        .reduce((sum, e) => sum + e.amount, 0);

      setSummary({
        totalEarnings,
        pendingEarnings,
        releasedEarnings,
        shipmentsDelivered: earningsData.length,
        averagePerShipment: earningsData.length > 0 ? totalEarnings / earningsData.length : 0,
      });

      // Apply filter
      let filteredEarnings = earningsData;
      if (filter === 'released') {
        filteredEarnings = earningsData.filter(e => e.escrowStatus === 'RELEASED');
      } else if (filter === 'pending') {
        filteredEarnings = earningsData.filter(e => e.escrowStatus === 'HELD');
      }

      setEarnings(filteredEarnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      HELD: 'bg-yellow-100 text-yellow-800',
      RELEASED: 'bg-green-100 text-green-800',
      REFUNDED: 'bg-red-100 text-red-800',
    };

    const labels = {
      HELD: '🕐 Pending',
      RELEASED: '✅ Released',
      REFUNDED: '↩️ Refunded',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">💰 Earnings</h1>
        <p className="text-gray-600 mt-2">Track your completed shipments and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalEarnings)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">💵</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Released</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summary.releasedEarnings)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(summary.pendingEarnings)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">🕐</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg per Shipment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.averagePerShipment)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary.shipmentsDelivered} shipments delivered
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Earnings
            </button>
            <button
              onClick={() => setFilter('released')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'released'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Released
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
          </div>

          <div className="flex gap-2">
            {['week', 'month', 'year', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Shipment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Delivered
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Released
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {earnings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <p className="text-4xl mb-2">📭</p>
                      <p className="text-lg font-medium">No earnings yet</p>
                      <p className="text-sm mt-1">
                        Complete deliveries to start earning
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                earnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {earning.trackingNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {earning.cargoDescription.substring(0, 40)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{earning.pickupCity}</p>
                        <p className="text-gray-500">↓</p>
                        <p className="text-gray-900">{earning.deliveryCity}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-lg text-gray-900">
                        {formatCurrency(earning.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(earning.escrowStatus)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(earning.deliveredAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {earning.releasedAt ? formatDate(earning.releasedAt) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">About Payment Release</h3>
            <p className="text-sm text-blue-800">
              Payments are held in escrow when you arrive at the warehouse, and automatically
              released after successful delivery confirmation. Pending payments typically clear
              within 1-2 business days after delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
