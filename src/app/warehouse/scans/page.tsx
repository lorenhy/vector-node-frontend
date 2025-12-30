'use client';

import { useState } from 'react';

interface ScanResult {
  success: boolean;
  message: string;
  scan?: {
    id: string;
    action: string;
    unitNumber: string;
    trackingNumber: string;
    newToken?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function WarehouseScansPage() {
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleScan = async (action: 'INBOUND' | 'OUTBOUND') => {
    if (!qrInput.trim()) {
      setResult({
        success: false,
        message: 'Please enter a QR code',
        error: { code: 'EMPTY_INPUT', message: 'QR code cannot be empty' },
      });
      return;
    }

    try {
      setScanning(true);
      setResult(null);

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Parse QR code format: unitId/token or just token
      const [unitId, qrToken] = qrInput.includes('/')
        ? qrInput.split('/')
        : [null, qrInput];

      const endpoint = action === 'INBOUND'
        ? 'http://localhost:5000/api/scan/warehouse/inbound'
        : 'http://localhost:5000/api/scan/warehouse/outbound';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          unitId: unitId || undefined,
          token: qrToken,
          latitude: null, // Could use geolocation API
          longitude: null,
          notes: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes from backend
        const errorCode = data.code || 'UNKNOWN_ERROR';
        const errorMessage = data.error || 'Scan failed';

        setResult({
          success: false,
          message: errorMessage,
          error: {
            code: errorCode,
            message: getErrorDescription(errorCode, errorMessage),
          },
        });

        // Add to history
        setScanHistory(prev => [{
          success: false,
          message: errorMessage,
          error: { code: errorCode, message: errorMessage },
        }, ...prev.slice(0, 9)]);

        return;
      }

      // Success
      const scanResult: ScanResult = {
        success: true,
        message: `${action} scan successful`,
        scan: {
          id: data.scan.id,
          action: data.scan.action,
          unitNumber: data.scan.shipmentUnit?.unitNumber || 'N/A',
          trackingNumber: data.scan.shipmentUnit?.shipment?.trackingNumber || 'N/A',
          newToken: data.scan.newToken || data.newToken,
        },
      };

      setResult(scanResult);
      setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]);

      // Clear input after successful scan
      setQrInput('');
    } catch (err: any) {
      console.error('Scan error:', err);
      setResult({
        success: false,
        message: 'Network error',
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Failed to connect to server',
        },
      });
    } finally {
      setScanning(false);
    }
  };

  const getErrorDescription = (code: string, defaultMessage: string): string => {
    const descriptions: Record<string, string> = {
      'INVALID_QR_TOKEN': 'The QR code is invalid or has expired. Request a new QR code.',
      'UNAUTHORIZED_ROLE': 'You do not have permission to perform this scan. Contact administrator.',
      'INVALID_SEQUENCE': 'This scan cannot be performed at this time. Check shipment status.',
      'TOKEN_EXPIRED': 'This QR code has expired. Request a new one.',
      'TOKEN_ALREADY_USED': 'This QR code has already been used. Each code can only be scanned once.',
      'UNIT_NOT_FOUND': 'Shipment unit not found. Verify the QR code.',
      'NOT_PICKED_UP': 'Unit must be picked up before warehouse scan.',
      'ALREADY_DELIVERED': 'This unit has already been delivered.',
      'NETWORK_ERROR': 'Network connection failed. Check your internet connection.',
    };

    return descriptions[code] || defaultMessage;
  };

  const getErrorIcon = (code: string): string => {
    const icons: Record<string, string> = {
      'INVALID_QR_TOKEN': '🔒',
      'UNAUTHORIZED_ROLE': '⛔',
      'INVALID_SEQUENCE': '🔄',
      'TOKEN_EXPIRED': '⏰',
      'TOKEN_ALREADY_USED': '✓',
      'UNIT_NOT_FOUND': '❓',
      'NETWORK_ERROR': '📡',
    };

    return icons[code] || '❌';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📱 QR Code Scanner</h1>
        <p className="text-gray-600 mt-2">Scan shipment QR codes for inbound and outbound processing</p>
      </div>

      {/* Scanner Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="max-w-xl mx-auto">
          {/* QR Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code or Token
            </label>
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !scanning && handleScan('INBOUND')}
              placeholder="Scan QR code or enter token manually"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              disabled={scanning}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Format: <code className="bg-gray-100 px-1 rounded">unitId/token</code> or just <code className="bg-gray-100 px-1 rounded">token</code>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleScan('INBOUND')}
              disabled={scanning || !qrInput.trim()}
              className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {scanning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scanning...
                </span>
              ) : (
                '📥 Scan Inbound'
              )}
            </button>

            <button
              onClick={() => handleScan('OUTBOUND')}
              disabled={scanning || !qrInput.trim()}
              className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {scanning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scanning...
                </span>
              ) : (
                '📤 Scan Outbound'
              )}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`rounded-lg p-6 ${
              result.success
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">
                  {result.success ? '✅' : getErrorIcon(result.error?.code || '')}
                </span>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-2 ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Scan Successful!' : 'Scan Failed'}
                  </h3>

                  {result.success && result.scan ? (
                    <div className="space-y-2">
                      <p className="text-green-800">
                        <strong>Action:</strong> {result.scan.action}
                      </p>
                      <p className="text-green-800">
                        <strong>Unit:</strong> {result.scan.unitNumber}
                      </p>
                      <p className="text-green-800">
                        <strong>Tracking:</strong> {result.scan.trackingNumber}
                      </p>
                      {result.scan.newToken && (
                        <div className="mt-4 p-3 bg-white rounded border border-green-300">
                          <p className="text-sm font-medium text-gray-700 mb-1">New QR Token:</p>
                          <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                            {result.scan.newToken}
                          </code>
                          <p className="text-xs text-gray-600 mt-2">
                            ⚠️ Use this token for the next scan operation
                          </p>
                        </div>
                      )}
                    </div>
                  ) : result.error ? (
                    <div className="space-y-2">
                      <p className="text-red-800 font-medium">
                        Error Code: {result.error.code}
                      </p>
                      <p className="text-red-700">
                        {result.error.message}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">📋 How to Use</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
          <li>Enter or scan the QR code from the shipment unit</li>
          <li>Click <strong>Inbound</strong> when shipment arrives at warehouse</li>
          <li>Click <strong>Outbound</strong> when shipment leaves warehouse</li>
          <li>Each QR code can only be used once (one-time security)</li>
          <li>A new token will be generated after each successful scan</li>
        </ol>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Scans (This Session)</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {scanHistory.map((item, index) => (
              <div key={index} className="px-6 py-4 flex items-start gap-3">
                <span className="text-2xl">
                  {item.success ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <p className={`font-medium ${
                    item.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {item.success ? item.scan?.action : item.error?.code}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.success
                      ? `${item.scan?.unitNumber} - ${item.scan?.trackingNumber}`
                      : item.message
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
