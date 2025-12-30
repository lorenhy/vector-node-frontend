'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface Shipment {
  id: string;
  cargoDescription: string;
  status: string;
  pickupCity: string;
  pickupCountry: string;
  deliveryCity: string;
  deliveryCountry: string;
  weight: number;
  cargoType: string;
  createdAt: string;
}

export default function ShipperDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchShipments(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchShipments = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments || []);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!mounted || loading) {
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
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Shipper Dashboard</h2>
          <p className="text-gray-600 mt-2">Manage your shipments and track deliveries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Shipments</p>
            <p className="text-3xl font-bold text-gray-900">{shipments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-blue-600">
              {shipments.filter(s => s.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">In Transit</p>
            <p className="text-3xl font-bold text-yellow-600">
              {shipments.filter(s => s.status === 'IN_TRANSIT').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-3xl font-bold text-green-600">
              {shipments.filter(s => s.status === 'DELIVERED').length}
            </p>
          </div>
        </div>

        {/* Create Shipment Button */}
        <div className="mb-6">
          <Link
            href="/shipper/shipments/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Create New Shipment
          </Link>
        </div>

        {/* Shipments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Your Shipments</h3>
          </div>

          {shipments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No shipments yet. Create your first shipment to get started!</p>
            </div>
          ) : (
            <div className="divide-y">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {shipment.cargoDescription || 'Shipment'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {shipment.pickupCity}, {shipment.pickupCountry} → {shipment.deliveryCity}, {shipment.deliveryCountry}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {shipment.weight} kg • {shipment.cargoType}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      shipment.status === 'IN_TRANSIT' ? 'bg-yellow-100 text-yellow-800' :
                      shipment.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
