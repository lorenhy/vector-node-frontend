'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Shipment {
  id: string;
  cargoDescription: string;
  status: string;
  pickupCity: string;
  pickupCountry: string;
  pickupAddress: string;
  pickupDate?: string;
  deliveryCity: string;
  deliveryCountry: string;
  deliveryAddress: string;
  deliveryDeadline?: string;
  weight: number;
  cargoType: string;
  qrCode?: string;
  selectedBid?: {
    price: number;
  };
  shipper?: {
    companyName?: string;
    user: {
      firstName: string;
      lastName: string;
      phone?: string;
      email: string;
    };
  };
}

const statusSteps = [
  { status: 'ASSIGNED', label: 'Assigned', icon: '📋' },
  { status: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', icon: '📅' },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: '🚛' },
  { status: 'DELIVERED', label: 'Delivered', icon: '📦' },
  { status: 'COMPLETED', label: 'Completed', icon: '✅' }
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter shipments that have been assigned (won bids)
        const assignedShipments = data.shipments?.filter(
          (s: Shipment) => ['ASSIGNED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(s.status)
        ) || [];
        setShipments(assignedShipments);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredShipments = () => {
    if (statusFilter === 'active') {
      return shipments.filter(s => ['ASSIGNED', 'PICKUP_SCHEDULED', 'IN_TRANSIT'].includes(s.status));
    } else if (statusFilter === 'completed') {
      return shipments.filter(s => ['DELIVERED', 'COMPLETED'].includes(s.status));
    }
    return shipments;
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'PICKUP_SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredShipments = getFilteredShipments();

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
          <h1 className="text-2xl font-bold text-gray-900">My Shipments</h1>
          <p className="text-gray-600">Manage your active and completed shipments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-blue-600">
            {shipments.filter(s => ['ASSIGNED', 'PICKUP_SCHEDULED', 'IN_TRANSIT'].includes(s.status)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">In Transit</p>
          <p className="text-2xl font-bold text-yellow-600">
            {shipments.filter(s => s.status === 'IN_TRANSIT').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {shipments.filter(s => s.status === 'DELIVERED' || s.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">
            €{shipments.reduce((acc, s) => acc + (s.selectedBid?.price || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
        {[
          { value: 'active', label: 'Active' },
          { value: 'completed', label: 'Completed' },
          { value: 'all', label: 'All' }
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

      {/* Shipments List */}
      {filteredShipments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No shipments found</h3>
          <p className="text-gray-500 mt-2">Win some bids to get shipments</p>
          <Link
            href="/carrier/loads"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Loads
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map(shipment => (
            <div key={shipment.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {shipment.cargoDescription || 'Shipment'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">ID: {shipment.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Contract Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      €{shipment.selectedBid?.price || '-'}
                    </p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-500">PICKUP</span>
                    </div>
                    <p className="font-semibold text-gray-900">{shipment.pickupCity}, {shipment.pickupCountry}</p>
                    <p className="text-sm text-gray-500 mt-1">{shipment.pickupAddress}</p>
                    {shipment.pickupDate && (
                      <p className="text-sm text-blue-600 mt-1">
                        {new Date(shipment.pickupDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-500">DELIVERY</span>
                    </div>
                    <p className="font-semibold text-gray-900">{shipment.deliveryCity}, {shipment.deliveryCountry}</p>
                    <p className="text-sm text-gray-500 mt-1">{shipment.deliveryAddress}</p>
                    {shipment.deliveryDeadline && (
                      <p className="text-sm text-red-600 mt-1">
                        Deadline: {new Date(shipment.deliveryDeadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Progress</p>
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getStatusIndex(shipment.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div key={step.status} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              isCompleted
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                            } ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                              {step.icon}
                            </div>
                            <span className={`text-xs mt-1 ${
                              isCompleted ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`w-12 h-1 mx-2 rounded ${
                              index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipper Contact */}
                {shipment.shipper && (
                  <div className="border-t mt-4 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Shipper Contact</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                        {shipment.shipper.user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {shipment.shipper.companyName || `${shipment.shipper.user.firstName} ${shipment.shipper.user.lastName}`}
                        </p>
                        <p className="text-sm text-gray-500">{shipment.shipper.user.email}</p>
                      </div>
                      {shipment.shipper.user.phone && (
                        <a
                          href={`tel:${shipment.shipper.user.phone}`}
                          className="ml-auto px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                        >
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Weight: <strong>{shipment.weight} kg</strong></span>
                  <span>Type: <strong>{shipment.cargoType}</strong></span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/carrier/shipments/${shipment.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
