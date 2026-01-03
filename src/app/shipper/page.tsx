'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vector-node-backend.onrender.com/api';

// Italian translations
const T = {
  dashboard: 'Dashboard Mittente',
  subtitle: 'Gestisci le tue spedizioni e monitora le consegne',
  totalShipments: 'Totale Spedizioni',
  open: 'Aperte',
  inTransit: 'In Transito',
  delivered: 'Consegnate',
  createShipment: '+ Crea Nuova Spedizione',
  yourShipments: 'Le Tue Spedizioni',
  noShipments: 'Nessuna spedizione ancora. Crea la tua prima spedizione!',
  cancelPublication: 'Annulla Pubblicazione',
  cancelling: 'Annullamento...',
  cancelled: 'ANNULLATA',
  viewBids: 'Vedi Offerte',
  profile: 'Profilo',
  company: 'Azienda',
  private: 'Privato',
  vatNumber: 'Partita IVA',
  verified: 'Verificato',
  pending: 'In Attesa',
  logout: 'Esci',
  loading: 'Caricamento...'
};

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface ShipperProfile {
  id: string;
  type: 'COMPANY' | 'PRIVATE';
  companyName?: string;
  vatNumber?: string;
  firstName?: string;
  lastName?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  totalShipments: number;
  averageRating: number;
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
  transportType?: string;
  createdAt: string;
  _count?: { bids: number };
}

export default function ShipperDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [shipperProfile, setShipperProfile] = useState<ShipperProfile | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
      fetchShipperProfile(token);
      fetchShipments(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  // Fetch shipper profile (company/private info)
  const fetchShipperProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/shippers/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShipperProfile(data.shipper);
      }
    } catch (error) {
      console.error('Error fetching shipper profile:', error);
    }
  };

  const fetchShipments = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/shipments`, {
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

  // Cancel shipment publication
  const handleCancelShipment = async (shipmentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setCancellingId(shipmentId);
    try {
      const response = await fetch(`${API_URL}/shipments/${shipmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setShipments(prev => prev.map(s =>
          s.id === shipmentId ? { ...s, status: 'CANCELLED' } : s
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Errore durante l\'annullamento');
      }
    } catch (error) {
      console.error('Error cancelling shipment:', error);
      alert('Errore di connessione');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Get display name based on shipper type
  const getDisplayName = () => {
    if (shipperProfile) {
      if (shipperProfile.type === 'COMPANY' && shipperProfile.companyName) {
        return shipperProfile.companyName;
      }
      return `${shipperProfile.firstName || user?.firstName || ''} ${shipperProfile.lastName || user?.lastName || ''}`.trim();
    }
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email;
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">{T.loading}</div>
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
              {/* Profile Badge */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500">
                    {shipperProfile?.type === 'COMPANY' ? T.company : T.private}
                    {shipperProfile?.verificationStatus === 'VERIFIED' && (
                      <span className="ml-1 text-green-600">• {T.verified}</span>
                    )}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  shipperProfile?.type === 'COMPANY' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {shipperProfile?.type === 'COMPANY' ? (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                {T.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        {shipperProfile && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  shipperProfile.type === 'COMPANY' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {shipperProfile.type === 'COMPANY' ? (
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{getDisplayName()}</h3>
                  <p className="text-sm text-gray-500">
                    {shipperProfile.type === 'COMPANY' ? T.company : T.private}
                    {shipperProfile.type === 'COMPANY' && shipperProfile.vatNumber && (
                      <span className="ml-2">• {T.vatNumber}: {shipperProfile.vatNumber}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  shipperProfile.verificationStatus === 'VERIFIED'
                    ? 'bg-green-100 text-green-800'
                    : shipperProfile.verificationStatus === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {shipperProfile.verificationStatus === 'VERIFIED' ? T.verified : T.pending}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{T.dashboard}</h2>
          <p className="text-gray-600 mt-2">{T.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{T.totalShipments}</p>
            <p className="text-3xl font-bold text-gray-900">{shipments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{T.open}</p>
            <p className="text-3xl font-bold text-blue-600">
              {shipments.filter(s => s.status === 'OPEN' || s.status === 'BIDDING').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{T.inTransit}</p>
            <p className="text-3xl font-bold text-yellow-600">
              {shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'ASSIGNED').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{T.delivered}</p>
            <p className="text-3xl font-bold text-green-600">
              {shipments.filter(s => s.status === 'DELIVERED' || s.status === 'COMPLETED').length}
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
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {shipment.cargoDescription || 'Shipment'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {shipment.pickupCity}, {shipment.pickupCountry} → {shipment.deliveryCity}, {shipment.deliveryCountry}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {shipment.weight} kg • {shipment.cargoType}
                        {shipment.transportType && ` • ${shipment.transportType}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        shipment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        shipment.status === 'DELIVERED' || shipment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        shipment.status === 'IN_TRANSIT' ? 'bg-yellow-100 text-yellow-800' :
                        shipment.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        shipment.status === 'OPEN' || shipment.status === 'BIDDING' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {shipment.status === 'CANCELLED' ? T.cancelled : shipment.status}
                      </span>

                      {/* Bids count for OPEN/BIDDING shipments */}
                      {(shipment.status === 'OPEN' || shipment.status === 'BIDDING') && shipment._count?.bids !== undefined && (
                        <Link
                          href={`/shipper/shipments/${shipment.id}/bids`}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100"
                        >
                          {T.viewBids} ({shipment._count.bids})
                        </Link>
                      )}

                      {/* Cancel button for OPEN/BIDDING shipments */}
                      {(shipment.status === 'OPEN' || shipment.status === 'BIDDING') && (
                        <button
                          onClick={() => handleCancelShipment(shipment.id)}
                          disabled={cancellingId === shipment.id}
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            cancellingId === shipment.id
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {cancellingId === shipment.id ? T.cancelling : T.cancelPublication}
                        </button>
                      )}
                    </div>
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
