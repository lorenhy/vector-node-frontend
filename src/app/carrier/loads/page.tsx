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
  const countries = ['Albania', 'Kosovo', 'Italy', 'Germany', 'Greece', 'North Macedonia', 'Montenegro', 'Serbia', 'Croatia', 'Slovenia', 'Austria', 'Switzerland', 'France', 'Belgium', 'Netherlands'];

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
      setBidError('Please fill in price, pickup date, and delivery date');
      return;
    }

    // Validate dates
    if (new Date(bidPickupDate) > new Date(bidDeliveryDate)) {
      setBidError('Pickup date must be before or equal to delivery date');
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
        setBidError(data.error || data.message || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidError('Network error. Please try again.');
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
        <h1 className="text-2xl font-bold text-gray-900">Browse Loads</h1>
        <p className="text-gray-600">Find and bid on available shipments</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Country</label>
            <select
              value={filters.pickupCountry}
              onChange={(e) => setFilters({ ...filters, pickupCountry: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Country</label>
            <select
              value={filters.deliveryCountry}
              onChange={(e) => setFilters({ ...filters, deliveryCountry: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cargo Type</label>
            <select
              value={filters.cargoType}
              onChange={(e) => setFilters({ ...filters, cargoType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All</option>
              {cargoTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Weight (kg)</label>
            <input
              type="number"
              value={filters.minWeight}
              onChange={(e) => setFilters({ ...filters, minWeight: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Weight (kg)</label>
            <input
              type="number"
              value={filters.maxWeight}
              onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value })}
              placeholder="Any"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="weight-asc">Weight: Low to High</option>
              <option value="weight-desc">Weight: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredLoads.length}</span> available loads
        </p>
      </div>

      {/* Loads Grid */}
      {filteredLoads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No loads found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or check back later</p>
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
                    {load.cargoType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(load.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {load.cargoDescription || 'Cargo Shipment'}
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
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="font-semibold text-sm">{load.weight} kg</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-sm">{load.quantity} pcs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Bids</p>
                    <p className="font-semibold text-sm">{load.bids?.length || 0}</p>
                  </div>
                </div>

                {/* Min Bid */}
                {getMinBid(load) && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">Current lowest bid</p>
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
                  Make Offer
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
                <h2 className="text-xl font-bold text-gray-900">Make an Offer</h2>
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
                <span className="text-gray-600">Weight: <strong>{selectedLoad.weight} kg</strong></span>
                <span className="text-gray-600">Type: <strong>{selectedLoad.cargoType}</strong></span>
              </div>
              {getMinBid(selectedLoad) && (
                <p className="mt-2 text-sm text-green-600">
                  Current lowest bid: <strong>€{getMinBid(selectedLoad)}</strong>
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
                  <h3 className="text-lg font-semibold text-gray-900">Offer Submitted!</h3>
                  <p className="text-gray-600 mt-2">The shipper will review your offer.</p>
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
                        Your Price (EUR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Enter your price"
                          className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pickup Date *
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
                          Delivery Date *
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
                        Notes (Optional)
                      </label>
                      <textarea
                        value={bidNotes}
                        onChange={(e) => setBidNotes(e.target.value)}
                        placeholder="Add any notes for the shipper..."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={handleBid}
                      disabled={!bidAmount || !bidPickupDate || !bidDeliveryDate || submitting}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Offer'}
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
