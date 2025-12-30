'use client';

import { useState, useEffect } from 'react';

interface Vehicle {
  id: string;
  vehicleType: string;
  licensePlate: string;
  maxWeight: number;
  maxVolume: number;
  available: boolean;
  createdAt: string;
}

const vehicleTypes = [
  { value: 'VAN', label: 'Van', icon: '🚐', maxWeight: 1500 },
  { value: 'TRUCK_SMALL', label: 'Small Truck (<3.5t)', icon: '🚚', maxWeight: 3500 },
  { value: 'TRUCK_MEDIUM', label: 'Medium Truck (3.5-12t)', icon: '🚛', maxWeight: 12000 },
  { value: 'TRUCK_LARGE', label: 'Large Truck (12-24t)', icon: '🚛', maxWeight: 24000 },
  { value: 'TRUCK_HEAVY', label: 'Heavy Truck (24t+)', icon: '🚛', maxWeight: 40000 },
  { value: 'REFRIGERATED', label: 'Refrigerated', icon: '❄️', maxWeight: 20000 },
  { value: 'TANKER', label: 'Tanker', icon: '🛢️', maxWeight: 30000 }
];

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    vehicleType: 'TRUCK_MEDIUM',
    licensePlate: '',
    maxWeight: '',
    maxVolume: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!formData.licensePlate || !formData.maxWeight) {
      setFormError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const url = editingVehicle
        ? `${process.env.NEXT_PUBLIC_API_URL}/carriers/vehicles/${editingVehicle.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/carriers/vehicles`;

      const response = await fetch(url, {
        method: editingVehicle ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          maxWeight: parseFloat(formData.maxWeight),
          maxVolume: formData.maxVolume ? parseFloat(formData.maxVolume) : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setEditingVehicle(null);
        resetForm();
        fetchVehicles();
      } else {
        setFormError(data.error || data.message || 'Failed to save vehicle');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const toggleAvailability = async (vehicle: Vehicle) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/vehicles/${vehicle.id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: !vehicle.available })
      });
      fetchVehicles();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleType: 'TRUCK_MEDIUM',
      licensePlate: '',
      maxWeight: '',
      maxVolume: ''
    });
    setFormError('');
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleType: vehicle.vehicleType,
      licensePlate: vehicle.licensePlate,
      maxWeight: vehicle.maxWeight.toString(),
      maxVolume: vehicle.maxVolume?.toString() || ''
    });
    setShowAddModal(true);
  };

  const getVehicleInfo = (type: string) => {
    return vehicleTypes.find(v => v.value === type) || { label: type, icon: '🚛' };
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
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Manage your company&apos;s vehicles</p>
        </div>
        <button
          onClick={() => {
            setEditingVehicle(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.available).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">In Use</p>
          <p className="text-2xl font-bold text-blue-600">{vehicles.filter(v => !v.available).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Capacity</p>
          <p className="text-2xl font-bold text-purple-600">
            {(vehicles.reduce((acc, v) => acc + v.maxWeight, 0) / 1000).toFixed(1)}t
          </p>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🚛</div>
          <h3 className="text-lg font-semibold text-gray-700">No vehicles yet</h3>
          <p className="text-gray-500 mt-2">Add your first vehicle to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(vehicle => {
            const info = getVehicleInfo(vehicle.vehicleType);
            return (
              <div key={vehicle.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{info.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{info.label}</h3>
                        <p className="text-lg font-bold text-blue-600">{vehicle.licensePlate}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAvailability(vehicle)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {vehicle.available ? 'Available' : 'In Use'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Max Weight</p>
                      <p className="font-semibold text-gray-900">
                        {vehicle.maxWeight >= 1000
                          ? `${(vehicle.maxWeight / 1000).toFixed(1)}t`
                          : `${vehicle.maxWeight} kg`
                        }
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Max Volume</p>
                      <p className="font-semibold text-gray-900">
                        {vehicle.maxVolume ? `${vehicle.maxVolume} m³` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(vehicle)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVehicle(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g., AA 123 BB"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Weight (kg) *</label>
                    <input
                      type="number"
                      value={formData.maxWeight}
                      onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
                      placeholder="e.g., 12000"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Volume (m³)</label>
                    <input
                      type="number"
                      value={formData.maxVolume}
                      onChange={(e) => setFormData({ ...formData, maxVolume: e.target.value })}
                      placeholder="e.g., 50"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingVehicle ? 'Save Changes' : 'Add Vehicle')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
