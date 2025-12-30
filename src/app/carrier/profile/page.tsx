'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CarrierProfile {
  id: string;
  companyName: string;
  vatNumber?: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  fleetSize: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionEndsAt?: string;
  verified: boolean;
  rating: number;
  vehicleTypes?: string[];
  certifications?: string[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export default function CarrierProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CarrierProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'fleet' | 'documents' | 'account'>('company');
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    companyName: '',
    vatNumber: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    fleetSize: 0,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);

      // Fetch carrier profile
      const response = await fetch('http://localhost:5000/api/carriers/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data.carrier);

      // Set form data
      setFormData({
        companyName: data.carrier.companyName || '',
        vatNumber: data.carrier.vatNumber || '',
        country: data.carrier.country || '',
        city: data.carrier.city || '',
        address: data.carrier.address || '',
        phone: data.carrier.phone || '',
        fleetSize: data.carrier.fleetSize || 0,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/carriers/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();
      setProfile(data.carrier);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🏢 Company Profile</h1>
        <p className="text-gray-600 mt-2">Manage your company information and settings</p>
      </div>

      {/* Verification Status Banner */}
      {!profile?.verified && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Account Not Verified</h3>
              <p className="text-sm text-yellow-800">
                Your account is pending verification. Some features may be limited until verification is complete.
                Please ensure all required documents are uploaded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'company', label: '🏢 Company Info', icon: 'company' },
              { id: 'fleet', label: '🚛 Fleet', icon: 'fleet' },
              { id: 'documents', label: '📄 Documents', icon: 'documents' },
              { id: 'account', label: '🔒 Account', icon: 'account' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Company Info Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Company Information</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT Number / Partita IVA
                  </label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="IT12345678901"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Albania, Kosovo, Italy..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Tirana, Pristina..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Street, Number, Postal Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    disabled={!editMode}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="+355 69 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Subscription Tier</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {profile?.subscriptionTier || 'FREE'}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Rating</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ⭐ {(profile?.rating || 0).toFixed(1)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium">Fleet Size</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {profile?.fleetSize || 0} vehicles
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fleet Tab */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Fleet Management</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Fleet Size
                </label>
                <input
                  type="number"
                  disabled={!editMode}
                  value={formData.fleetSize}
                  onChange={(e) => setFormData({ ...formData, fleetSize: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  min="0"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Vehicle Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Van', 'Truck', 'Trailer', 'Refrigerated'].map((type) => (
                    <div key={type} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <p className="text-2xl mb-2">🚛</p>
                      <p className="text-sm font-medium">{type}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Detailed fleet management coming soon. You'll be able to add individual vehicles with specifications.
                </p>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Documents & Certifications</h2>

              <div className="space-y-4">
                {[
                  { name: 'Transport License', status: profile?.verified ? 'approved' : 'pending', required: true },
                  { name: 'Insurance Certificate', status: 'pending', required: true },
                  { name: 'Company Registration', status: profile?.verified ? 'approved' : 'pending', required: true },
                  { name: 'ISO Certification', status: 'not_uploaded', required: false },
                ].map((doc) => (
                  <div key={doc.name} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{doc.name}</h3>
                          {doc.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {doc.status === 'approved' && '✅ Verified'}
                          {doc.status === 'pending' && '🕐 Pending verification'}
                          {doc.status === 'not_uploaded' && 'Not uploaded'}
                        </p>
                      </div>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        {doc.status === 'not_uploaded' ? 'Upload' : 'Replace'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  📄 Documents are reviewed within 1-2 business days. Make sure all documents are clear and valid.
                </p>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.firstName || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.lastName || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">Logout from this device</p>
                    <p className="text-sm text-red-700">You will need to login again</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
