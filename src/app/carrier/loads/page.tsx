'use client';

import { useState, useEffect } from 'react';

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
  volume?: number;
  cargoType: string;
  quantity: number;
  specialRequirements?: string;
  createdAt: string;
  bids?: { totalPrice: number }[];
  shipper?: {
    companyName?: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

// Traduzioni italiano
const CARGO_TYPES_IT: Record<string, string> = {
  'GENERAL': 'Generale',
  'FRAGILE': 'Fragile',
  'PERISHABLE': 'Deperibile',
  'REFRIGERATED': 'Refrigerato',
  'HAZMAT': 'Pericoloso (ADR)',
  'HEAVY': 'Pesante',
  'OVERSIZED': 'Fuori sagoma'
};

export default function BrowseLoadsPage() {
  const [loads, setLoads] = useState<Shipment[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoad, setSelectedLoad] = useState<Shipment | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidPickupDate, setBidPickupDate] = useState('');
  const [bidDeliveryDate, setBidDeliveryDate] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    pickupCountry: '',
    deliveryCountry: '',
    cargoType: '',
    minWeight: '',
    maxWeight: '',
    sortBy: 'newest'
  });

  const cargoTypes = ['GENERAL', 'FRAGILE', 'PERISHABLE', 'REFRIGERATED', 'HAZMAT', 'HEAVY', 'OVERSIZED'];
  const countries = ['Albania', 'Kosovo', 'Italia', 'Germania', 'Grecia', 'Macedonia del Nord', 'Montenegro', 'Serbia', 'Croazia', 'Slovenia', 'Austria', 'Svizzera', 'Francia', 'Belgio', 'Paesi Bassi'];

  useEffect(() => {
    fetchLoads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [loads, filters]);

  const fetchLoads = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const availableLoads = data.shipments?.filter(
          (s: Shipment) => s.status === 'OPEN' || s.status === 'BIDDING'
        ) || [];
        setLoads(availableLoads);
      }
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...loads];

    if (filters.pickupCountry) {
      result = result.filter(l => l.pickupCountry.toLowerCase().includes(filters.pickupCountry.toLowerCase()));
    }

    if (filters.deliveryCountry) {
      result = result.filter(l => l.deliveryCountry.toLowerCase().includes(filters.deliveryCountry.toLowerCase()));
    }

    if (filters.cargoType) {
      result = result.filter(l => l.cargoType === filters.cargoType);
    }

    if (filters.minWeight) {
      result = result.filter(l => l.weight >= parseFloat(filters.minWeight));
    }

    if (filters.maxWeight) {
      result = result.filter(l => l.weight <= parseFloat(filters.maxWeight));
    }

    // Sort
    if (filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filters.sortBy === 'weight-asc') {
      result.sort((a, b) => a.weight - b.weight);
    } else if (filters.sortBy === 'weight-desc') {
      result.sort((a, b) => b.weight - a.weight);
    }

    setFilteredLoads(result);
  };

  const handleBid = async () => {
    if (!selectedLoad || !bidAmount || !bidPickupDate || !bidDeliveryDate) {
      setBidError('Inserisci prezzo, data ritiro e data consegna');
      return;
    }

    // Validate dates
    if (new Date(bidPickupDate) > new Date(bidDeliveryDate)) {
      setBidError('La data di ritiro deve essere prima o uguale alla data di consegna');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    setBidError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipmentId: selectedLoad.id,
          totalPrice: parseFloat(bidAmount),
          pickupDate: new Date(bidPickupDate).toISOString(),
          deliveryDate: new Date(bidDeliveryDate).toISOString(),
          vehicleType: 'TRUCK',
          notes: bidNotes
        })
      });

      const data = await response.json();

      if (response.ok) {
        setBidSuccess(true);
        setBidAmount('');
        setBidPickupDate('');
        setBidDeliveryDate('');
        setBidNotes('');
        fetchLoads();
        setTimeout(() => {
          setShowBidModal(false);
          setBidSuccess(false);
        }, 2000);
      } else {
        setBidError(data.error || data.message || 'Errore durante l\'invio dell\'offerta');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidError('Errore di rete. Riprova più tardi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinBid = (load: Shipment) => {
    if (!load.bids || load.bids.length === 0) return null;
    return Math.min(...load.bids.map(b => b.totalPrice));
  };

  const resetFilters = () => {
    setFilters({
      pickupCountry: '',
      deliveryCountry: '',
      cargoType: '',
      minWeight: '',
      maxWeight: '',
      sortBy: 'newest'
    });
  };

  const getCargoTypeLabel = (type: string) => {
    return CARGO_TYPES_IT[type] || type;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cerca Carichi</h1>
        <p className="text-gray-600">Trova e fai offerte sulle spedizioni disponibili</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtri</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Resetta Filtri
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Paese Ritiro</label>
            <select
              value={filters.pickupCountry}
              onChange={(e) => setFilters({ ...filters, pickupCountry: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Tutti</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Paese Consegna</label>
            <select
              value={filters.deliveryCountry}
              onChange={(e) => setFilters({ ...filters, deliveryCountry: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Tutti</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Merce</label>
            <select
              value={filters.cargoType}
              onChange={(e) => setFilters({ ...filters, cargoType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Tutti</option>
              {cargoTypes.map(t => (
                <option key={t} value={t}>{getCargoTypeLabel(t)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Peso Min (kg)</label>
            <input
              type="number"
              value={filters.minWeight}
              onChange={(e) => setFilters({ ...filters, minWeight: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Peso Max (kg)</label>
            <input
              type="number"
              value={filters.maxWeight}
              onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value })}
              placeholder="Qualsiasi"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ordina Per</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="newest">Più Recenti</option>
              <option value="oldest">Meno Recenti</option>
              <option value="weight-asc">Peso: Crescente</option>
              <option value="weight-desc">Peso: Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Visualizzando <span className="font-semibold">{filteredLoads.length}</span> carichi disponibili
        </p>
      </div>

      {/* Loads Grid */}
      {filteredLoads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">Nessun carico trovato</h3>
          <p className="text-gray-500 mt-2">Prova a modificare i filtri o ricontrolla più tardi</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoads.map(load => (
            <div key={load.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    load.cargoType === 'REFRIGERATED' ? 'bg-blue-100 text-blue-800' :
                    load.cargoType === 'HAZMAT' ? 'bg-red-100 text-red-800' :
                    load.cargoType === 'FRAGILE' ? 'bg-yellow-100 text-yellow-800' :
                    load.cargoType === 'HEAVY' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getCargoTypeLabel(load.cargoType)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(load.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {load.cargoDescription || 'Spedizione Merce'}
                </h3>
              </div>

              {/* Route */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{load.pickupCity}</p>
                        <p className="text-xs text-gray-500">{load.pickupCountry}</p>
                      </div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{load.deliveryCity}</p>
                        <p className="text-xs text-gray-500">{load.deliveryCountry}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Peso</p>
                    <p className="font-semibold text-sm">{load.weight} kg</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Quantità</p>
                    <p className="font-semibold text-sm">{load.quantity} pz</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Offerte</p>
                    <p className="font-semibold text-sm">{load.bids?.length || 0}</p>
                  </div>
                </div>

                {/* Min Bid */}
                {getMinBid(load) && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">Offerta più bassa attuale</p>
                    <p className="text-lg font-bold text-green-600">€{getMinBid(load)}</p>
                  </div>
                )}

                {/* Shipper Info */}
                {load.shipper && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{load.shipper.companyName || `${load.shipper.user.firstName} ${load.shipper.user.lastName}`}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setSelectedLoad(load);
                    setShowBidModal(true);
                    setBidError('');
                    setBidSuccess(false);
                  }}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Fai Offerta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && selectedLoad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Fai un&apos;Offerta</h2>
                <button
                  onClick={() => setShowBidModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Load Details */}
            <div className="p-6 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedLoad.cargoDescription}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{selectedLoad.pickupCity}, {selectedLoad.pickupCountry}</span>
                <span>→</span>
                <span>{selectedLoad.deliveryCity}, {selectedLoad.deliveryCountry}</span>
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-gray-600">Peso: <strong>{selectedLoad.weight} kg</strong></span>
                <span className="text-gray-600">Tipo: <strong>{getCargoTypeLabel(selectedLoad.cargoType)}</strong></span>
              </div>
              {getMinBid(selectedLoad) && (
                <p className="mt-2 text-sm text-green-600">
                  Offerta più bassa attuale: <strong>€{getMinBid(selectedLoad)}</strong>
                </p>
              )}
            </div>

            {/* Bid Form */}
            <div className="p-6">
              {bidSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Offerta Inviata!</h3>
                  <p className="text-gray-600 mt-2">Il mittente esaminerà la tua offerta.</p>
                </div>
              ) : (
                <>
                  {bidError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {bidError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prezzo (EUR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Inserisci il prezzo"
                          className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data Ritiro *
                        </label>
                        <input
                          type="date"
                          value={bidPickupDate}
                          onChange={(e) => setBidPickupDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data Consegna *
                        </label>
                        <input
                          type="date"
                          value={bidDeliveryDate}
                          onChange={(e) => setBidDeliveryDate(e.target.value)}
                          min={bidPickupDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note (Opzionale)
                      </label>
                      <textarea
                        value={bidNotes}
                        onChange={(e) => setBidNotes(e.target.value)}
                        placeholder="Aggiungi eventuali note per il mittente..."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={handleBid}
                      disabled={!bidAmount || !bidPickupDate || !bidDeliveryDate || submitting}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Invio in corso...' : 'Invia Offerta'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
