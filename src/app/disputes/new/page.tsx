'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Types
interface ShipmentUnit {
  id: string
  unitNumber: number
  description: string
  currentStatus: string
  qrToken: string
}

interface Shipment {
  id: string
  cargoDescription: string
  pickupCity: string
  deliveryCity: string
  status: string
  deliveredAt: string | null
  units: ShipmentUnit[]
}

const DISPUTE_TYPES = [
  { value: 'DAMAGE_AT_PICKUP', label: 'Dëmtim në Marrje', icon: '📦', description: 'Malli ishte i dëmtuar kur u mor' },
  { value: 'DAMAGE_AT_WAREHOUSE', label: 'Dëmtim në Magazinë', icon: '🏭', description: 'Malli u dëmtua në magazinë' },
  { value: 'DAMAGE_AT_DELIVERY', label: 'Dëmtim në Dorëzim', icon: '🚛', description: 'Malli u dorëzua i dëmtuar' },
  { value: 'DAMAGE_IN_TRANSIT', label: 'Dëmtim në Transport', icon: '🛣️', description: 'Malli u dëmtua gjatë transportit' },
  { value: 'CLIENT_REPORT', label: 'Raport Pas Dorëzimit', icon: '📝', description: 'Po raportoj dëmtim pas marrjes (brenda 48 orëve)' }
]

function NewDisputeContent() {
  const searchParams = useSearchParams()
  const unitIdFromUrl = searchParams.get('unitId')
  const shipmentIdFromUrl = searchParams.get('shipmentId')
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // State
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Shipment data
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipmentIdFromUrl || '')
  const [selectedUnitId, setSelectedUnitId] = useState(unitIdFromUrl || '')

  // Form data
  const [disputeType, setDisputeType] = useState('')
  const [damageDescription, setDamageDescription] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setUserRole(user.role)
        } catch {
          // Invalid
        }
      }
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch shipments
  const fetchShipments = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/shipments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        // Filter to show only delivered or completed shipments for dispute
        const eligibleShipments = (data.shipments || []).filter(
          (s: Shipment) => s.status === 'DELIVERED' || s.status === 'COMPLETED' || s.status === 'IN_TRANSIT'
        )
        setShipments(eligibleShipments)

        // Pre-select if URL params
        if (shipmentIdFromUrl && eligibleShipments.find((s: Shipment) => s.id === shipmentIdFromUrl)) {
          setSelectedShipmentId(shipmentIdFromUrl)
        }
      }
    } catch {
      setError('Gabim gjatë marrjes së dërgesave')
    } finally {
      setLoading(false)
    }
  }, [API_URL, isAuthenticated, shipmentIdFromUrl])

  useEffect(() => {
    if (isAuthenticated) {
      fetchShipments()
    }
  }, [isAuthenticated, fetchShipments])

  // Get selected shipment
  const selectedShipment = shipments.find(s => s.id === selectedShipmentId)

  // Photo handling
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos(prev => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Submit
  const handleSubmit = async () => {
    // Validations
    if (!selectedShipmentId) {
      setError('Zgjidh dërgesën')
      return
    }
    if (!selectedUnitId) {
      setError('Zgjidh njësinë')
      return
    }
    if (!disputeType) {
      setError('Zgjidh llojin e dispute-it')
      return
    }
    if (!damageDescription.trim()) {
      setError('Përshkruaj dëmtimin')
      return
    }
    if (photos.length === 0) {
      setError('Shto të paktën një foto të dëmtimit')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')

      // First upload photos
      for (const photo of photos) {
        const unit = selectedShipment?.units.find(u => u.id === selectedUnitId)
        if (unit) {
          await fetch(`${API_URL}/api/qr/photo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              token: unit.qrToken,
              type: 'DAMAGE',
              imageData: photo
            })
          })
        }
      }

      // Then create dispute
      const res = await fetch(`${API_URL}/api/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipmentId: selectedShipmentId,
          unitId: selectedUnitId,
          type: disputeType,
          damageDescription,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          isAutoCreated: false
        })
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'DEADLINE_EXPIRED') {
          setError('Afati 48 orësh për raportim ka skaduar')
        } else if (data.code === 'DISPUTE_EXISTS') {
          setError('Ekziston tashmë një dispute për këtë njësi')
        } else if (data.code === 'NO_PHOTOS') {
          setError('Nuk ka foto të ngarkuara për këtë njësi')
        } else {
          setError(data.error || 'Gabim gjatë krijimit të dispute-it')
        }
        return
      }

      const data = await res.json()
      setSuccess(`Dispute u krijua me sukses! ID: ${data.dispute.id}`)

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = `/disputes/${data.dispute.id}`
      }, 2000)

    } catch {
      setError('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  // Not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full border border-slate-700">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Autentikim i Nevojshëm</h1>
          <p className="text-slate-400 mb-6">Hyni në llogari për të krijuar dispute.</p>
          <Link href="/login" className="block w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors">
            Hyr në Llogari
          </Link>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Duke ngarkuar...</p>
        </div>
      </div>
    )
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full border border-green-500/50">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sukses!</h1>
          <p className="text-slate-400 mb-4">{success}</p>
          <p className="text-slate-500 text-sm">Duke ridrejtuar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/disputes" className="text-slate-400 hover:text-white">
            ← Kthehu
          </Link>
          <h1 className="text-lg font-bold text-white">Krijo Dispute të Re</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Step 1: Select Shipment */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-white font-semibold mb-4">1. Zgjidh Dërgesën</h2>
            {shipments.length === 0 ? (
              <p className="text-slate-400">Nuk keni dërgesa të disponueshme për dispute.</p>
            ) : (
              <select
                value={selectedShipmentId}
                onChange={(e) => { setSelectedShipmentId(e.target.value); setSelectedUnitId(''); }}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
              >
                <option value="">-- Zgjidh dërgesën --</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.cargoDescription} • {s.pickupCity} → {s.deliveryCity}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Select Unit */}
          {selectedShipment && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold mb-4">2. Zgjidh Njësinë</h2>
              <div className="space-y-2">
                {selectedShipment.units?.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnitId(unit.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedUnitId === unit.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Njësia #{unit.unitNumber}</p>
                        <p className="text-slate-400 text-sm">{unit.description}</p>
                      </div>
                      <span className="text-slate-500 text-sm">{unit.currentStatus}</span>
                    </div>
                  </button>
                )) || (
                  <p className="text-slate-400">Nuk ka njësi të disponueshme</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Dispute Type */}
          {selectedUnitId && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold mb-4">3. Lloji i Dispute-it</h2>
              <div className="space-y-2">
                {DISPUTE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDisputeType(type.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      disputeType === type.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <p className="text-white font-medium">{type.label}</p>
                        <p className="text-slate-400 text-sm">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Damage Description */}
          {disputeType && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold mb-4">4. Përshkrimi i Dëmtimit</h2>
              <textarea
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                placeholder="Përshkruani në detaje dëmtimin e vërejtur..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none mb-4"
                rows={4}
              />

              <div>
                <label className="block text-sm text-slate-400 mb-2">Vlera e Vlerësuar (EUR) - opsionale</label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {/* Step 5: Photos */}
          {damageDescription && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold mb-4">
                5. Fotot e Dëmtimit <span className="text-red-400">*</span>
              </h2>

              {/* Photo grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-700">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Capture button */}
              <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors">
                <span className="text-2xl">📷</span>
                <span className="text-slate-300">Shto Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </label>

              <p className="text-slate-500 text-sm mt-2">
                Të paktën një foto është e detyrueshme për të krijuar dispute.
              </p>
            </div>
          )}

          {/* Submit */}
          {photos.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Duke procesuar...
                </>
              ) : (
                <>
                  <span>⚠️</span>
                  Krijo Dispute
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Duke ngarkuar...</p>
      </div>
    </div>
  )
}

// Main export with Suspense wrapper
export default function NewDisputePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewDisputeContent />
    </Suspense>
  )
}
