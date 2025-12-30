'use client';

import { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  unitNumber: string;
  trackingNumber: string;
  cargoDescription: string;
  weight: number;
  arrivedAt: string;
  status: string;
  shipper?: {
    companyName?: string;
  };
  carrier?: {
    companyName?: string;
  };
}

export default function WarehouseShipmentsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, searchQuery]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/warehouses/my/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (err: any) {
      console.error('Inventory error:', err);
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.unitNumber.toLowerCase().includes(query) ||
          item.trackingNumber.toLowerCase().includes(query) ||
          item.cargoDescription.toLowerCase().includes(query)
      );
    }

    setFilteredInventory(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'IN_WAREHOUSE': 'bg-yellow-100 text-yellow-800',
      'READY_FOR_DISPATCH': 'bg-green-100 text-green-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
    };

    const labels: Record<string, string> = {
      'IN_WAREHOUSE': '📦 In Warehouse',
      'READY_FOR_DISPATCH': '✅ Ready',
      'PROCESSING': '🔄 Processing',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Inventory</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchInventory}
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
        <h1 className="text-3xl font-bold text-gray-900">📦 Warehouse Inventory</h1>
        <p className="text-gray-600 mt-2">
          Shipments currently in warehouse • {inventory.length} total units
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by unit number, tracking number, or cargo description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            🔄 Refresh
          </button>
        </div>

        {searchQuery && (
          <p className="mt-4 text-sm text-gray-600">
            Showing {filteredInventory.length} of {inventory.length} units
          </p>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Unit Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tracking Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Cargo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Weight
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Arrived At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Shipper/Carrier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      {searchQuery ? (
                        <>
                          <p className="text-4xl mb-2">🔍</p>
                          <p className="text-lg font-medium">No results found</p>
                          <p className="text-sm mt-1">
                            Try adjusting your search query
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-4xl mb-2">📭</p>
                          <p className="text-lg font-medium">Warehouse is empty</p>
                          <p className="text-sm mt-1">
                            No shipments currently in warehouse
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{item.unitNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{item.trackingNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 max-w-xs truncate">
                        {item.cargoDescription}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{item.weight} kg</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(item.arrivedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">
                          {item.shipper?.companyName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ↓ {item.carrier?.companyName || 'N/A'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {filteredInventory.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total Units</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {filteredInventory.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Total Weight</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {filteredInventory.reduce((sum, item) => sum + item.weight, 0).toLocaleString()} kg
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Avg. Weight</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {(filteredInventory.reduce((sum, item) => sum + item.weight, 0) / filteredInventory.length).toFixed(1)} kg
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
