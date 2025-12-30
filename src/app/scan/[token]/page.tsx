'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// Types
interface ScanLog {
  id: string
  action: string
  previousStatus: string
  newStatus: string
  scannedByRole: string
  scannedByName: string
  scannedAt: string
  warehouseName?: string
  hasDamage: boolean
  latitude?: number
  longitude?: number
}

interface Photo {
  id: string
  type: string
  imageUrl: string
  thumbnailUrl?: string
  caption?: string
  uploadedAt: string
}

interface UnitInfo {
  id: string
  unitNumber: number
  totalUnits: number
  currentStatus: string
  description: string
  weight: number
  isExpired: boolean
  scanHistory: ScanLog[]
  photos: Photo[]
}

interface ShipmentInfo {
  id: string
  status: string
  pickupAddress: string
  pickupCity: string
  pickupCountry: string
  deliveryAddress: string
  deliveryCity: string
  deliveryCountry: string
  cargoDescription: string
  cargoType: string
  weight: number
  quantity: number
  pickupDate?: string
  deliveryDeadline?: string
}

type ScanAction = 'PICKUP' | 'INBOUND' | 'OUTBOUND' | 'IN_TRANSIT' | 'DELIVERED' | 'DAMAGE'
type Screen = 'INFO' | 'PICKUP' | 'WAREHOUSE' | 'HANDOVER' | 'DELIVERY' | 'SUCCESS'

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Krijuar',
  PICKED_UP: 'Marrë',
  IN_WAREHOUSE: 'Në magazinë',
  OUT_WAREHOUSE: 'Jashtë magazinës',
  IN_TRANSIT: 'Në transport',
  DELIVERED: 'Dorëzuar'
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-slate-500',
  PICKED_UP: 'bg-blue-500',
  IN_WAREHOUSE: 'bg-purple-500',
  OUT_WAREHOUSE: 'bg-orange-500',
  IN_TRANSIT: 'bg-cyan-500',
  DELIVERED: 'bg-green-500'
}

const ACTION_CONFIG: Record<ScanAction, { label: string; icon: string; color: string; screen: Screen }> = {
  PICKUP: { label: 'Konfirmo Marrjen', icon: '📦', color: 'bg-blue-600', screen: 'PICKUP' },
  INBOUND: { label: 'Hyrje Magazinë', icon: '🏭', color: 'bg-purple-600', screen: 'WAREHOUSE' },
  OUTBOUND: { label: 'Dalje Magazinë', icon: '🚪', color: 'bg-orange-600', screen: 'WAREHOUSE' },
  IN_TRANSIT: { label: 'Nis Transportin', icon: '🚛', color: 'bg-cyan-600', screen: 'HANDOVER' },
  DELIVERED: { label: 'Konfirmo Dorëzimin', icon: '✅', color: 'bg-green-600', screen: 'DELIVERY' },
  DAMAGE: { label: 'Raporto Dëmtim', icon: '⚠️', color: 'bg-red-600', screen: 'INFO' }
}

export default function ScanPage() {
  const params = useParams()
  const token = params.token as string
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // State
  const [unit, setUnit] = useState<UnitInfo | null>(null)
  const [shipment, setShipment] = useState<ShipmentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allowedActions, setAllowedActions] = useState<ScanAction[]>([])
  const [currentScreen, setCurrentScreen] = useState<Screen>('INFO')
  const [selectedAction, setSelectedAction] = useState<ScanAction | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [quantityConfirmed, setQuantityConfirmed] = useState(1)
  const [recipientName, setRecipientName] = useState('')
  const [notes, setNotes] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [hasDamage, setHasDamage] = useState(false)
  const [damageDescription, setDamageDescription] = useState('')
  const [warehouseAction, setWarehouseAction] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND')
  const [photos, setPhotos] = useState<string[]>([])

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)

  // Location
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Auth check
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setIsAuthenticated(true)
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setUserRole(user.role)
        } catch {
          // Invalid user data
        }
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { /* Silently fail */ }
      )
    }
  }, [])

  // Fetch unit info
  const fetchUnitInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/qr/token/${token}`)
      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'QR_EXPIRED') {
          setError('QR_EXPIRED')
        } else {
          setError('INVALID')
        }
        return
      }
      const data = await res.json()
      setUnit(data.unit)
      setShipment(data.shipment)
      setQuantityConfirmed(data.shipment?.quantity || 1)
    } catch {
      setError('CONNECTION')
    } finally {
      setLoading(false)
    }
  }, [API_URL, token])

  // Fetch allowed actions
  const fetchAllowedActions = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/qr/token/${token}/actions`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAllowedActions(data.allowedActions || [])
      }
    } catch {
      // Silently fail
    }
  }, [API_URL, token])

  useEffect(() => {
    if (token) fetchUnitInfo()
  }, [token, fetchUnitInfo])

  useEffect(() => {
    if (isAuthenticated && unit) fetchAllowedActions()
  }, [isAuthenticated, unit, fetchAllowedActions])

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

  // Upload photo to backend
  const uploadPhoto = async (imageData: string, type: string): Promise<boolean> => {
    try {
      const authToken = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/qr/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          type,
          imageData,
          latitude: location?.lat,
          longitude: location?.lng
        })
      })
      return res.ok
    } catch {
      return false
    }
  }

  // Signature canvas handlers
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  useEffect(() => {
    if (currentScreen === 'DELIVERY') {
      setTimeout(initCanvas, 100)
    }
  }, [currentScreen, initCanvas])

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getCanvasCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getCanvasCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'))
    }
  }

  const clearCanvas = () => {
    initCanvas()
    setSignatureData(null)
  }

  // Action handlers
  const handleActionSelect = (action: ScanAction) => {
    setSelectedAction(action)
    const config = ACTION_CONFIG[action]
    if (config) {
      if (action === 'INBOUND' || action === 'OUTBOUND') {
        setWarehouseAction(action)
        setCurrentScreen('WAREHOUSE')
      } else {
        setCurrentScreen(config.screen)
      }
    }
  }

  // Submit handlers
  const handlePickupSubmit = async () => {
    if (!unit) return
    setSubmitting(true)

    try {
      // Upload damage photos if any
      if (hasDamage && photos.length > 0) {
        for (const photo of photos) {
          await uploadPhoto(photo, 'DAMAGE')
        }
      } else if (photos.length > 0) {
        for (const photo of photos) {
          await uploadPhoto(photo, 'ORIGIN')
        }
      }

      const authToken = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/qr/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          action: 'PICKUP',
          latitude: location?.lat,
          longitude: location?.lng,
          quantityConfirmed,
          hasDamage,
          damageDescription: hasDamage ? damageDescription : undefined,
          notes: notes || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë procesimit')
        return
      }

      setCurrentScreen('SUCCESS')
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWarehouseSubmit = async () => {
    if (!unit) return
    setSubmitting(true)

    try {
      // Upload photos
      const photoType = warehouseAction === 'INBOUND' ? 'WAREHOUSE_IN' : 'WAREHOUSE_OUT'
      for (const photo of photos) {
        await uploadPhoto(photo, photoType)
      }

      const authToken = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/qr/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          action: warehouseAction,
          latitude: location?.lat,
          longitude: location?.lng,
          notes: notes || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë procesimit')
        return
      }

      setCurrentScreen('SUCCESS')
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHandoverSubmit = async () => {
    if (!unit) return
    setSubmitting(true)

    try {
      const authToken = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/qr/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          action: 'IN_TRANSIT',
          latitude: location?.lat,
          longitude: location?.lng,
          vehiclePlate: vehiclePlate || undefined,
          notes: notes || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë procesimit')
        return
      }

      setCurrentScreen('SUCCESS')
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeliverySubmit = async () => {
    if (!unit) return

    if (!recipientName.trim()) {
      alert('Emri i marrësit është i detyrueshëm')
      return
    }
    if (!signatureData) {
      alert('Firma është e detyrueshme')
      return
    }
    if (photos.length === 0) {
      alert('Të paktën një foto është e detyrueshme')
      return
    }

    setSubmitting(true)

    try {
      // Upload delivery photos
      for (const photo of photos) {
        await uploadPhoto(photo, 'DELIVERY')
      }

      const authToken = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/qr/signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          recipientName,
          signatureImage: signatureData,
          latitude: location?.lat,
          longitude: location?.lng,
          deliveryNotes: notes || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë dorëzimit')
        return
      }

      setCurrentScreen('SUCCESS')
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDamageReport = async () => {
    if (!unit) return
    if (!damageDescription.trim()) {
      alert('Përshkrimi i dëmtimit është i detyrueshëm')
      return
    }
    if (photos.length === 0) {
      alert('Të paktën një foto është e detyrueshme')
      return
    }

    setSubmitting(true)

    try {
      // Upload damage photos
      for (const photo of photos) {
        await uploadPhoto(photo, 'DAMAGE')
      }

      const authToken = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/qr/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          action: 'DAMAGE',
          latitude: location?.lat,
          longitude: location?.lng,
          hasDamage: true,
          damageDescription,
          notes: notes || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë raportimit')
        return
      }

      setCurrentScreen('SUCCESS')
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAndRefresh = () => {
    setCurrentScreen('INFO')
    setSelectedAction(null)
    setPhotos([])
    setNotes('')
    setHasDamage(false)
    setDamageDescription('')
    setSignatureData(null)
    setRecipientName('')
    setVehiclePlate('')
    fetchUnitInfo()
    fetchAllowedActions()
  }

  // Loading state
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

  // Error states
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full border border-slate-700">
          {error === 'QR_EXPIRED' ? (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Dorëzimi i Kompletuar</h1>
              <p className="text-slate-400 mb-6">Kjo ngarkesë është dorëzuar me sukses.</p>
            </>
          ) : error === 'INVALID' ? (
            <>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">QR i Pavlefshëm</h1>
              <p className="text-slate-400 mb-6">Ky QR code nuk ekziston ose është fshirë.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📡</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Gabim Lidhjeje</h1>
              <p className="text-slate-400 mb-6">Nuk mund të lidhet me serverin. Provoni përsëri.</p>
            </>
          )}
          <Link href="/" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">
            Kthehu në Ballina
          </Link>
        </div>
      </div>
    )
  }

  // Success screen
  if (currentScreen === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full border border-green-500/50">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-5xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sukses!</h1>
          <p className="text-slate-400 mb-8">Veprimi u regjistrua me sukses.</p>
          <button
            onClick={resetAndRefresh}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            Vazhdo
          </button>
        </div>
      </div>
    )
  }

  // Header component
  const Header = () => (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentScreen !== 'INFO' && (
            <button
              onClick={() => {
                setCurrentScreen('INFO')
                setSelectedAction(null)
                setPhotos([])
              }}
              className="p-2 -ml-2 text-slate-400 hover:text-white"
            >
              ←
            </button>
          )}
          <Link href="/" className="text-lg font-bold text-white">
            Vector<span className="text-cyan-400">Node</span>
          </Link>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg">
            <span className="text-lg">
              {userRole === 'DRIVER' && '🚛'}
              {userRole === 'WAREHOUSE' && '🏭'}
              {userRole === 'CARRIER' && '🚚'}
            </span>
            <span className="text-sm text-slate-300">
              {userRole === 'DRIVER' && 'Shofer'}
              {userRole === 'WAREHOUSE' && 'Magazinë'}
              {userRole === 'CARRIER' && 'Transportues'}
            </span>
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors">
            Hyr
          </Link>
        )}
      </div>
    </header>
  )

  // Photo upload component
  const PhotoUpload = ({ required = false }: { required?: boolean }) => (
    <div className="space-y-3">
      <label className="block text-sm text-slate-400">
        Foto {required && <span className="text-red-400">*</span>}
      </label>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
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
    </div>
  )

  // INFO Screen
  if (currentScreen === 'INFO') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {/* Status Card */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            {/* Status header */}
            <div className={`px-6 py-4 ${STATUS_COLORS[unit?.currentStatus || 'CREATED']}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Statusi aktual</p>
                  <p className="text-white text-xl font-bold">
                    {STATUS_LABELS[unit?.currentStatus || ''] || unit?.currentStatus}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Njësia</p>
                  <p className="text-white text-xl font-bold">
                    {unit?.unitNumber}/{unit?.totalUnits}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipment info */}
            <div className="p-6 space-y-4">
              <h2 className="text-white font-semibold">{unit?.description}</h2>

              {/* Route */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span>📍</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Marrja</p>
                    <p className="text-white">{shipment?.pickupCity}, {shipment?.pickupCountry}</p>
                    <p className="text-slate-500 text-sm">{shipment?.pickupAddress}</p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-dashed border-slate-600 h-4"></div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span>🎯</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Dorëzimi</p>
                    <p className="text-white">{shipment?.deliveryCity}, {shipment?.deliveryCountry}</p>
                    <p className="text-slate-500 text-sm">{shipment?.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-400 text-xs">Pesha</p>
                  <p className="text-white font-medium">{shipment?.weight} kg</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Lloji</p>
                  <p className="text-white font-medium">{shipment?.cargoType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAuthenticated && allowedActions.length > 0 && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-4">Veprimet e Disponueshme</h3>
              <div className="space-y-3">
                {allowedActions.map((action) => {
                  const config = ACTION_CONFIG[action]
                  return (
                    <button
                      key={action}
                      onClick={() => handleActionSelect(action)}
                      className={`w-full p-4 ${config.color} hover:opacity-90 rounded-xl text-white font-medium flex items-center gap-4 transition-opacity`}
                    >
                      <span className="text-2xl">{config.icon}</span>
                      <span className="text-lg">{config.label}</span>
                      <span className="ml-auto">→</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Auth prompt */}
          {!isAuthenticated && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
              <p className="text-yellow-200 mb-4">Hyni në llogari për të kryer veprime</p>
              <Link href="/login" className="inline-block px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors">
                Hyr në Llogari
              </Link>
            </div>
          )}

          {/* Scan History */}
          {unit?.scanHistory && unit.scanHistory.length > 0 && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-4">Historia</h3>
              <div className="space-y-4">
                {unit.scanHistory.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-cyan-500' : 'bg-slate-600'}`}></div>
                      {index < unit.scanHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-700 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {ACTION_CONFIG[log.action as ScanAction]?.label || log.action}
                        </span>
                        {log.hasDamage && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Dëmtim</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {log.scannedByName} • {log.scannedByRole}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(log.scannedAt).toLocaleString('sq-AL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // PICKUP Screen
  if (currentScreen === 'PICKUP') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Konfirmo Marrjen</h1>
            <p className="text-slate-400 mt-2">Verifiko sasitë dhe gjendjen e ngarkesës</p>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Sasia e njësive</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantityConfirmed(Math.max(1, quantityConfirmed - 1))}
                  className="w-14 h-14 bg-slate-700 rounded-xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-bold text-white">{quantityConfirmed}</span>
                  <span className="text-slate-400 ml-2">/ {shipment?.quantity}</span>
                </div>
                <button
                  onClick={() => setQuantityConfirmed(Math.min(shipment?.quantity || 99, quantityConfirmed + 1))}
                  className="w-14 h-14 bg-slate-700 rounded-xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Damage toggle */}
            <div>
              <label className="flex items-center justify-between p-4 bg-slate-700 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="text-white font-medium">Ka dëmtime?</span>
                </div>
                <div className={`w-14 h-8 rounded-full transition-colors ${hasDamage ? 'bg-red-500' : 'bg-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={hasDamage}
                    onChange={(e) => setHasDamage(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 bg-white rounded-full mt-1 transition-transform ${hasDamage ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
              </label>
            </div>

            {/* Damage description */}
            {hasDamage && (
              <div className="space-y-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div>
                  <label className="block text-sm text-red-300 mb-2">Përshkrimi i dëmtimit *</label>
                  <textarea
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    placeholder="Përshkruani dëmtimin e vërejtur..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                    rows={3}
                  />
                </div>
                <PhotoUpload required />
              </div>
            )}

            {/* Regular photos */}
            {!hasDamage && <PhotoUpload />}

            {/* Notes */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Shënime (opsionale)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shënime shtesë..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handlePickupSubmit}
            disabled={submitting || (hasDamage && !damageDescription.trim())}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Duke procesuar...
              </>
            ) : (
              <>
                <span>✓</span>
                Konfirmo Marrjen
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // WAREHOUSE Screen
  if (currentScreen === 'WAREHOUSE') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏭</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Skanim Magazina</h1>
            <p className="text-slate-400 mt-2">Regjistroni lëvizjen në magazinë</p>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-6">
            {/* Action toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWarehouseAction('INBOUND')}
                className={`p-4 rounded-xl font-medium transition-colors ${
                  warehouseAction === 'INBOUND'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span className="text-2xl block mb-2">📥</span>
                Hyrje
              </button>
              <button
                onClick={() => setWarehouseAction('OUTBOUND')}
                className={`p-4 rounded-xl font-medium transition-colors ${
                  warehouseAction === 'OUTBOUND'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span className="text-2xl block mb-2">📤</span>
                Dalje
              </button>
            </div>

            {/* Unit info */}
            <div className="p-4 bg-slate-700 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Njësia</p>
                  <p className="text-white font-medium">{unit?.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Status</p>
                  <p className="text-white font-medium">{STATUS_LABELS[unit?.currentStatus || '']}</p>
                </div>
              </div>
            </div>

            {/* Photo upload */}
            <PhotoUpload />

            {/* Notes */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Shënime (opsionale)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shënime shtesë..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleWarehouseSubmit}
            disabled={submitting}
            className={`w-full py-4 ${warehouseAction === 'INBOUND' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-orange-600 hover:bg-orange-500'} disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Duke procesuar...
              </>
            ) : (
              <>
                <span>{warehouseAction === 'INBOUND' ? '📥' : '📤'}</span>
                Konfirmo {warehouseAction === 'INBOUND' ? 'Hyrjen' : 'Daljen'}
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // HANDOVER Screen
  if (currentScreen === 'HANDOVER') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚛</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Nis Transportin</h1>
            <p className="text-slate-400 mt-2">Konfirmo marrjen e ngarkesës për transport</p>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-6">
            {/* Shipment summary */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Detajet e Ngarkesës</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700 rounded-xl">
                  <p className="text-slate-400 text-xs">Nga</p>
                  <p className="text-white font-medium">{shipment?.pickupCity}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-xl">
                  <p className="text-slate-400 text-xs">Për</p>
                  <p className="text-white font-medium">{shipment?.deliveryCity}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-700 rounded-xl">
                <p className="text-slate-400 text-xs">Përshkrimi</p>
                <p className="text-white font-medium">{shipment?.cargoDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700 rounded-xl">
                  <p className="text-slate-400 text-xs">Pesha</p>
                  <p className="text-white font-medium">{shipment?.weight} kg</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-xl">
                  <p className="text-slate-400 text-xs">Njësi</p>
                  <p className="text-white font-medium">{unit?.unitNumber}/{unit?.totalUnits}</p>
                </div>
              </div>
            </div>

            {/* Vehicle plate */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Targa e mjetit (opsionale)</label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="AA 123 BB"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-center text-xl font-mono tracking-wider"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Shënime (opsionale)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shënime shtesë..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleHandoverSubmit}
            disabled={submitting}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Duke procesuar...
              </>
            ) : (
              <>
                <span>🚛</span>
                Nis Transportin
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // DELIVERY Screen
  if (currentScreen === 'DELIVERY') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Konfirmo Dorëzimin</h1>
            <p className="text-slate-400 mt-2">Merr firmën dhe fotografo dorëzimin</p>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-6">
            {/* Delivery address */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-green-300 text-sm">Adresa e dorëzimit</p>
                  <p className="text-white font-medium">{shipment?.deliveryAddress}</p>
                  <p className="text-slate-400">{shipment?.deliveryCity}, {shipment?.deliveryCountry}</p>
                </div>
              </div>
            </div>

            {/* Recipient name */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Emri i marrësit <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Emri dhe mbiemri"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            {/* Signature */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Firma e marrësit <span className="text-red-400">*</span>
              </label>
              <div className="border-2 border-slate-600 rounded-xl overflow-hidden bg-slate-700">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-slate-500 text-sm">Firmos në kutinë e sipërme</p>
                <button
                  onClick={clearCanvas}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Pastro firmën
                </button>
              </div>
            </div>

            {/* Photo upload - required */}
            <PhotoUpload required />

            {/* Notes */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Shënime (opsionale)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shënime shtesë..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleDeliverySubmit}
            disabled={submitting || !recipientName.trim() || !signatureData || photos.length === 0}
            className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Duke procesuar...
              </>
            ) : (
              <>
                <span>✓</span>
                Konfirmo Dorëzimin
              </>
            )}
          </button>

          {/* Validation hints */}
          {(!recipientName.trim() || !signatureData || photos.length === 0) && (
            <div className="text-center text-sm text-slate-500">
              {!recipientName.trim() && <p>• Plotëso emrin e marrësit</p>}
              {!signatureData && <p>• Merr firmën e marrësit</p>}
              {photos.length === 0 && <p>• Shto të paktën një foto</p>}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Fallback
  return null
}
