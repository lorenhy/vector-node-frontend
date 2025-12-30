'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Bid {
  id: string;
  totalPrice: number;
  status: string;
  vehicleType: string;
  notes?: string;
  createdAt: string;
  estimatedPickup: string;
  estimatedDelivery: string;
  shipment: {
    id: string;
    cargoDescription: string;
    pickupCity: string;
    pickupCountry: string;
    deliveryCity: string;
    deliveryCountry: string;
    weight: number;
    cargoType: string;
    status: string;
  };
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBids();
  }, []);

  useEffect(() => {
    filterBids();
  }, [bids, statusFilter]);

  const fetchBids = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids/my-bids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBids(data.bids || []);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBids = () => {
    if (statusFilter === 'all') {
      setFilteredBids(bids);
    } else {
      setFilteredBids(bids.filter(b => b.status === statusFilter));
    }
  };

  const withdrawBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setWithdrawingId(bidId);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids/${bidId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchBids();
      }
    } catch (error) {
      console.error('Error withdrawing bid:', error);
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === 'PENDING').length,
    accepted: bids.filter(b => b.status === 'ACCEPTED').length,
    rejected: bids.filter(b => b.status === 'REJECTED').length
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600">Track and manage your offers</p>
        </div>
        <Link
          href="/carrier/loads"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse More Loads
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Bids</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Won</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
        {[
          { value: 'all', label: 'All' },
          { value: 'PENDING', label: 'Pending' },
          { value: 'ACCEPTED', label: 'Won' },
          { value: 'REJECTED', label: 'Rejected' },
          { value: 'WITHDRAWN', label: 'Withdrawn' }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No bids found</h3>
          <p className="text-gray-500 mt-2">
            {statusFilter === 'all'
              ? 'Start browsing loads to place your first bid'
              : `No ${statusFilter.toLowerCase()} bids`
            }
          </p>
          <Link
            href="/carrier/loads"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Loads
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBids.map(bid => (
            <div key={bid.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {bid.shipment.cargoDescription || 'Shipment'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        bid.shipment.cargoType === 'REFRIGERATED' ? 'bg-blue-100 text-blue-800' :
                        bid.shipment.cargoType === 'HAZMAT' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bid.shipment.cargoType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {bid.shipment.pickupCity}, {bid.shipment.pickupCountry}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        {bid.shipment.deliveryCity}, {bid.shipment.deliveryCountry}
                      </span>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <span className="text-gray-500">
                        Weight: <span className="font-medium text-gray-900">{bid.shipment.weight} kg</span>
                      </span>
                      <span className="text-gray-500">
                        Vehicle: <span className="font-medium text-gray-900">{bid.vehicleType}</span>
                      </span>
                      <span className="text-gray-500">
                        Submitted: <span className="font-medium text-gray-900">{new Date(bid.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {bid.notes && (
                      <p className="mt-2 text-sm text-gray-500 italic">
                        Note: {bid.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-500">Your Bid</p>
                    <p className="text-2xl font-bold text-green-600">€{bid.totalPrice}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Est. Pickup: {new Date(bid.estimatedPickup).toLocaleDateString()}
                  {' • '}
                  Est. Delivery: {new Date(bid.estimatedDelivery).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {bid.status === 'ACCEPTED' && (
                    <Link
                      href={`/carrier/shipments/${bid.shipment.id}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      View Shipment
                    </Link>
                  )}
                  {bid.status === 'PENDING' && (
                    <button
                      onClick={() => withdrawBid(bid.id)}
                      disabled={withdrawingId === bid.id}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {withdrawingId === bid.id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
