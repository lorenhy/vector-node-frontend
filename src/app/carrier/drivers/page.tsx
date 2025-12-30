'use client';

import { useState, useEffect } from 'react';

interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry?: string;
  available: boolean;
  currentLocation?: { lat: number; lng: number };
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
  };
  assignedShipments?: {
    id: string;
    status: string;
  }[];
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    licenseExpiry: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/drivers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.licenseNumber) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!editingDriver && !formData.password) {
      setFormError('Password is required for new drivers');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const url = editingDriver
        ? `${process.env.NEXT_PUBLIC_API_URL}/carriers/drivers/${editingDriver.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/carriers/drivers`;

      const response = await fetch(url, {
        method: editingDriver ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setEditingDriver(null);
        resetForm();
        fetchDrivers();
      } else {
        setFormError(data.error || data.message || 'Failed to save driver');
      }
    } catch (error) {
      console.error('Error saving driver:', error);
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (driverId: string) => {
    if (!confirm('Are you sure you want to remove this driver?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/drivers/${driverId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  const toggleAvailability = async (driver: Driver) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/drivers/${driver.id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: !driver.available })
      });
      fetchDrivers();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      licenseNumber: '',
      licenseExpiry: ''
    });
    setFormError('');
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.user.firstName,
      lastName: driver.user.lastName,
      email: driver.user.email,
      phone: driver.user.phone || '',
      password: '',
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : ''
    });
    setShowAddModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-gray-600">Manage your company&apos;s drivers</p>
        </div>
        <button
          onClick={() => {
            setEditingDriver(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Driver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Drivers</p>
          <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-green-600">{drivers.filter(d => d.available).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">On Duty</p>
          <p className="text-2xl font-bold text-blue-600">
            {drivers.filter(d => d.assignedShipments && d.assignedShipments.length > 0).length}
          </p>
        </div>
      </div>

      {/* Drivers List */}
      {drivers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No drivers yet</h3>
          <p className="text-gray-500 mt-2">Add your first driver to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Driver
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Task</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {driver.user.firstName.charAt(0)}{driver.user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {driver.user.firstName} {driver.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{driver.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{driver.licenseNumber}</p>
                    {driver.licenseExpiry && (
                      <p className={`text-xs ${
                        new Date(driver.licenseExpiry) < new Date() ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAvailability(driver)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        driver.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {driver.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {driver.assignedShipments && driver.assignedShipments.length > 0 ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {driver.assignedShipments.length} active
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No tasks</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(driver)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDriver(null);
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {!editingDriver && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                    <input
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingDriver ? 'Save Changes' : 'Add Driver')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
