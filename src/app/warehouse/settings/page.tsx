'use client';

import { useState, useEffect } from 'react';

interface WarehouseSettings {
  receivingEnabled: boolean;
  businessHours: {
    monday: { open: string; close: string; enabled: boolean };
    tuesday: { open: string; close: string; enabled: boolean };
    wednesday: { open: string; close: string; enabled: boolean };
    thursday: { open: string; close: string; enabled: boolean };
    friday: { open: string; close: string; enabled: boolean };
    saturday: { open: string; close: string; enabled: boolean };
    sunday: { open: string; close: string; enabled: boolean };
  };
}

const DEFAULT_HOURS = { open: '08:00', close: '18:00', enabled: true };
const WEEKEND_HOURS = { open: '09:00', close: '14:00', enabled: false };

export default function WarehouseSettingsPage() {
  const [settings, setSettings] = useState<WarehouseSettings>({
    receivingEnabled: true,
    businessHours: {
      monday: DEFAULT_HOURS,
      tuesday: DEFAULT_HOURS,
      wednesday: DEFAULT_HOURS,
      thursday: DEFAULT_HOURS,
      friday: DEFAULT_HOURS,
      saturday: WEEKEND_HOURS,
      sunday: WEEKEND_HOURS,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/warehouses/my/profile`, {
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
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();

      // Merge backend settings with defaults
      if (data.warehouse) {
        setSettings({
          receivingEnabled: data.warehouse.receivingEnabled ?? true,
          businessHours: data.warehouse.businessHours || settings.businessHours,
        });
      }
    } catch (err: any) {
      console.error('Settings error:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/warehouses/my/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          receivingEnabled: settings.receivingEnabled,
          businessHours: settings.businessHours,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleReceiving = () => {
    setSettings({ ...settings, receivingEnabled: !settings.receivingEnabled });
  };

  const toggleDayEnabled = (day: keyof WarehouseSettings['businessHours']) => {
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        [day]: {
          ...settings.businessHours[day],
          enabled: !settings.businessHours[day].enabled,
        },
      },
    });
  };

  const updateDayHours = (
    day: keyof WarehouseSettings['businessHours'],
    field: 'open' | 'close',
    value: string
  ) => {
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        [day]: {
          ...settings.businessHours[day],
          [field]: value,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Settings</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Warehouse Settings</h1>
        <p className="text-gray-600 mt-2">Configure operating hours and receiving options</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xl">✓</span>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-xl">✕</span>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Receiving Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Receiving Enabled</h2>
            <p className="text-sm text-gray-600">
              Enable or disable inbound shipment receiving at this warehouse
            </p>
          </div>
          <button
            onClick={toggleReceiving}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              settings.receivingEnabled ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings.receivingEnabled ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {!settings.receivingEnabled && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Receiving is currently disabled. Inbound scans will be rejected.
            </p>
          </div>
        )}
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configure your warehouse operating hours for each day of the week
        </p>

        <div className="space-y-4">
          {days.map((day) => {
            const daySettings = settings.businessHours[day];
            const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

            return (
              <div
                key={day}
                className={`flex items-center gap-4 p-4 border rounded-lg ${
                  daySettings.enabled ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Day Toggle */}
                <div className="flex items-center gap-3 w-32">
                  <input
                    type="checkbox"
                    checked={daySettings.enabled}
                    onChange={() => toggleDayEnabled(day)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">{dayLabel}</span>
                </div>

                {/* Hours */}
                {daySettings.enabled ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Open:</label>
                      <input
                        type="time"
                        value={daySettings.open}
                        onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Close:</label>
                      <input
                        type="time"
                        value={daySettings.close}
                        onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={fetchSettings}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          disabled={saving}
        >
          Reset
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:bg-orange-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">About Business Hours</h3>
            <p className="text-sm text-blue-800">
              Business hours are displayed to carriers and shippers. Scans can still be performed outside
              business hours, but this information helps set expectations for processing times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
