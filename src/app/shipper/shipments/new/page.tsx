'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewShipmentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Pickup
    pickupAddress: '',
    pickupCity: '',
    pickupCountry: '',
    pickupPostalCode: '',
    // Delivery
    deliveryAddress: '',
    deliveryCity: '',
    deliveryCountry: '',
    deliveryPostalCode: '',
    // Cargo
    cargoType: 'GENERAL',
    cargoDescription: '',
    weight: '',
    volume: '',
    quantity: '1',
    // Schedule
    pickupDate: '',
    deliveryDeadline: ''
  });

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pickupAddress: formData.pickupAddress,
          pickupCity: formData.pickupCity,
          pickupCountry: formData.pickupCountry,
          pickupPostalCode: formData.pickupPostalCode || undefined,
          pickupLatitude: 43.6158, // Default coordinates for Ancona
          pickupLongitude: 13.5189,
          deliveryAddress: formData.deliveryAddress,
          deliveryCity: formData.deliveryCity,
          deliveryCountry: formData.deliveryCountry,
          deliveryPostalCode: formData.deliveryPostalCode || undefined,
          deliveryLatitude: 43.6158,
          deliveryLongitude: 13.5189,
          cargoType: formData.cargoType,
          cargoDescription: formData.cargoDescription,
          weight: parseFloat(formData.weight) || 1,
          volume: parseFloat(formData.volume) || undefined,
          quantity: parseInt(formData.quantity) || 1,
          pickupDate: formData.pickupDate ? new Date(formData.pickupDate).toISOString() : undefined,
          deliveryDeadline: formData.deliveryDeadline ? new Date(formData.deliveryDeadline).toISOString() : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || JSON.stringify(data.errors) || 'Failed to create shipment');
      }

      router.push('/shipper');
    } catch (err: any) {
      setError(err.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-blue-600">VectorNode</h1>
            <Link href="/shipper" className="text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Shipment</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pickup Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="Address *"
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  required
                  type="text"
                  placeholder="City *"
                  value={formData.pickupCity}
                  onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  required
                  type="text"
                  placeholder="Country *"
                  value={formData.pickupCountry}
                  onChange={(e) => setFormData({ ...formData, pickupCountry: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={formData.pickupPostalCode}
                  onChange={(e) => setFormData({ ...formData, pickupPostalCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Delivery Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="Address *"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  required
                  type="text"
                  placeholder="City *"
                  value={formData.deliveryCity}
                  onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  required
                  type="text"
                  placeholder="Country *"
                  value={formData.deliveryCountry}
                  onChange={(e) => setFormData({ ...formData, deliveryCountry: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={formData.deliveryPostalCode}
                  onChange={(e) => setFormData({ ...formData, deliveryPostalCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cargo Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cargo Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    required
                    value={formData.cargoType}
                    onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GENERAL">General Cargo</option>
                    <option value="FRAGILE">Fragile</option>
                    <option value="PERISHABLE">Perishable</option>
                    <option value="REFRIGERATED">Refrigerated</option>
                    <option value="HAZMAT">Hazardous Materials</option>
                    <option value="HEAVY">Heavy Load</option>
                    <option value="OVERSIZED">Oversized</option>
                  </select>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Weight (kg) *"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  required
                  placeholder="Cargo Description *"
                  value={formData.cargoDescription}
                  onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Volume (m³) - optional"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pickup Date</label>
                  <input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Delivery Deadline</label>
                  <input
                    type="date"
                    value={formData.deliveryDeadline}
                    onChange={(e) => setFormData({ ...formData, deliveryDeadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Shipment'}
              </button>
              <Link
                href="/shipper"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
